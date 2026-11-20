-- Students no longer need an account: anyone can contact a tutor and leave a
-- review. Accounts are only for tutors (to apply and edit their listing).
-- Run this once in the Supabase SQL Editor.

-- 1) Contacts and reviews can come from someone without an account.
alter table public.contact_requests alter column student_id drop not null;
alter table public.reviews alter column student_id drop not null;

-- 2) Contacting: anyone can get a listed tutor's WhatsApp number. Each press
-- is counted (p_count = false when this browser already counted it).
drop function if exists public.get_tutor_contact(uuid);

create or replace function public.get_tutor_contact(
  p_tutor_id uuid,
  p_count boolean default true
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_phone text;
begin
  if not exists (
    select 1 from public.tutors
    where id = p_tutor_id and public.tutor_is_listed(status, paid_until)
  ) then
    raise exception 'Tutor not found.';
  end if;

  if uid is not null and exists (
    select 1 from public.tutors where id = p_tutor_id and student_id = uid
  ) then
    raise exception 'You cannot contact your own listing.';
  end if;

  if uid is not null then
    -- Someone with an account: counted once per tutor.
    if not exists (
      select 1 from public.contact_requests
      where student_id = uid and tutor_id = p_tutor_id
    ) then
      insert into public.contact_requests (student_id, tutor_id)
      values (uid, p_tutor_id);
    end if;
  elsif p_count then
    insert into public.contact_requests (student_id, tutor_id)
    values (null, p_tutor_id);
  end if;

  select phone into v_phone from public.tutor_private where tutor_id = p_tutor_id;
  return v_phone;
end;
$$;

revoke all on function public.get_tutor_contact(uuid, boolean) from public;
grant execute on function public.get_tutor_contact(uuid, boolean) to anon, authenticated;

-- 3) Reviews: anyone can leave one with the name they type. People without
-- an account can leave at most 3 reviews per tutor per day in total, so a
-- tutor can't be flooded. Admins can still delete any review.
create or replace function public.submit_review(
  p_tutor_id uuid,
  p_name text,
  p_rating integer,
  p_comment text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if not exists (
    select 1 from public.tutors
    where id = p_tutor_id and public.tutor_is_listed(status, paid_until)
  ) then
    raise exception 'Tutor not found.';
  end if;

  if uid is not null and exists (
    select 1 from public.tutors where id = p_tutor_id and student_id = uid
  ) then
    raise exception 'You cannot review your own listing.';
  end if;

  if coalesce(length(trim(p_name)), 0) not between 1 and 60 then
    raise exception 'Please write your name (up to 60 characters).';
  end if;

  if p_rating is null or p_rating not between 1 and 5 then
    raise exception 'Please select a star rating.';
  end if;

  if coalesce(length(p_comment), 0) > 500 then
    raise exception 'Your comment is too long (500 characters at most).';
  end if;

  if uid is not null and exists (
    select 1 from public.reviews where student_id = uid and tutor_id = p_tutor_id
  ) then
    raise exception 'You''ve already reviewed this tutor.';
  end if;

  if uid is null and (
    select count(*) from public.reviews
    where tutor_id = p_tutor_id and student_id is null
      and created_at > now() - interval '24 hours'
  ) >= 3 then
    raise exception 'This tutor got several reviews today. Please try again tomorrow.';
  end if;

  insert into public.reviews (student_id, tutor_id, rating, comment, student_name)
  values (
    uid,
    p_tutor_id,
    p_rating,
    nullif(trim(coalesce(p_comment, '')), ''),
    trim(p_name)
  );
end;
$$;

revoke all on function public.submit_review(uuid, text, integer, text) from public;
grant execute on function public.submit_review(uuid, text, integer, text) to anon, authenticated;
