-- "Notify me when a tutor joins": when a search finds nobody, a student can
-- leave their WhatsApp number and the course they need. The admin sees the
-- list and messages them once a tutor for that course joins.
-- Run this once in the Supabase SQL Editor.

create table if not exists public.tutor_requests (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  course text not null,
  field text,
  university text,
  name text,
  phone text not null,
  done_at timestamptz
);
alter table public.tutor_requests enable row level security;
-- No policies: only the functions below can read or write it.

create or replace function public.request_tutor(
  p_course text,
  p_field text,
  p_university text,
  p_name text,
  p_phone text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(length(trim(p_course)), 0) not between 1 and 100 then
    raise exception 'Please write the course you need.';
  end if;

  if p_phone is null or p_phone !~ '^[0-9]{8,15}$' then
    raise exception 'Please enter a valid phone number.';
  end if;

  if (
    select count(*) from public.tutor_requests
    where phone = p_phone and created_at > now() - interval '24 hours'
  ) >= 10 then
    raise exception 'You already sent several requests today. We''ll message you soon.';
  end if;

  insert into public.tutor_requests (course, field, university, name, phone)
  values (
    trim(p_course),
    nullif(left(trim(coalesce(p_field, '')), 100), ''),
    nullif(left(trim(coalesce(p_university, '')), 100), ''),
    nullif(left(trim(coalesce(p_name, '')), 60), ''),
    p_phone
  );
end;
$$;

revoke all on function public.request_tutor(text, text, text, text, text) from public;
grant execute on function public.request_tutor(text, text, text, text, text) to anon, authenticated;

-- Admins only: the requests, newest first.
create or replace function public.admin_tutor_requests()
returns setof public.tutor_requests
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null
     or not coalesce((select is_admin from public.students where id = auth.uid()), false) then
    raise exception 'Only admins can do this.';
  end if;

  return query select * from public.tutor_requests order by created_at desc;
end;
$$;

revoke all on function public.admin_tutor_requests() from public, anon;
grant execute on function public.admin_tutor_requests() to authenticated;

-- Admins only: mark a request as handled (or not).
create or replace function public.admin_set_request_done(p_id bigint, p_done boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null
     or not coalesce((select is_admin from public.students where id = auth.uid()), false) then
    raise exception 'Only admins can do this.';
  end if;

  update public.tutor_requests
  set done_at = case when p_done then now() else null end
  where id = p_id;
end;
$$;

revoke all on function public.admin_set_request_done(bigint, boolean) from public, anon;
grant execute on function public.admin_set_request_done(bigint, boolean) to authenticated;
