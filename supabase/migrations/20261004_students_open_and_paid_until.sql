-- Tutors-only launch mode + 30-day listing periods.
-- Run this whole file once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- 1. Site-wide switch: is the site open to students yet?
create table public.site_settings (
  id boolean primary key default true check (id),
  students_open boolean not null default false,
  students_opened_at timestamptz
);
insert into public.site_settings default values;

alter table public.site_settings enable row level security;
create policy "anyone can read site settings"
on public.site_settings for select
using (true);

-- 2. When each tutor's listing ends (free month or paid month)
alter table public.tutors add column paid_until timestamptz;

-- 3. A tutor is listed only if approved, inside their free/paid period,
--    and the site is open to students
create or replace function public.tutor_is_listed(p_status text, p_paid_until timestamptz)
returns boolean
language sql
stable
set search_path = public
as $$
  select p_status = 'approved'
    and p_paid_until is not null
    and p_paid_until > now()
    and coalesce((select students_open from public.site_settings), false);
$$;

-- 4. Everyone sees only listed tutors (owners still see their own, admins see all)
drop policy if exists "anyone can view approved tutors" on public.tutors;
create policy "anyone can view listed tutors"
on public.tutors for select
using (
  public.tutor_is_listed(status, paid_until)
  or student_id = (select auth.uid())
);

-- 5. Newly approved tutors get a free month once the site is open
create or replace function public.grant_free_month()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'approved'
     and old.status is distinct from 'approved'
     and new.paid_until is null
     and coalesce((select students_open from public.site_settings), false) then
    new.paid_until := now() + interval '30 days';
  end if;
  return new;
end;
$$;

create trigger grant_free_month
before update on public.tutors
for each row execute function public.grant_free_month();

-- 6. Only admins may change status, payment or listing dates
create or replace function public.protect_tutor_admin_fields()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  caller_is_admin boolean;
begin
  if auth.uid() is null then
    return new;
  end if;

  select coalesce(
    (select is_admin from public.students where id = auth.uid()),
    false
  ) into caller_is_admin;

  if caller_is_admin then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.is_paid := false;
    new.paid_until := null;
  elsif new.status is distinct from old.status
     or new.is_paid is distinct from old.is_paid
     or new.paid_until is distinct from old.paid_until then
    raise exception 'Only admins can change status or payment.';
  elsif new.student_id is distinct from old.student_id
     or new.full_name is distinct from old.full_name
     or new.faculty is distinct from old.faculty
     or new.major is distinct from old.major then
    raise exception 'Name, faculty and major can only be changed by an admin.';
  end if;

  return new;
end;
$$;

-- 7. Contacting a tutor now requires the tutor to be listed
create or replace function public.get_tutor_contact(p_tutor_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_phone text;
begin
  if uid is null then
    raise exception 'You must be logged in.';
  end if;

  if not exists (
    select 1 from public.tutors
    where id = p_tutor_id and public.tutor_is_listed(status, paid_until)
  ) then
    raise exception 'Tutor not found.';
  end if;

  if exists (
    select 1 from public.tutors where id = p_tutor_id and student_id = uid
  ) then
    raise exception 'You cannot contact your own listing.';
  end if;

  if not exists (
    select 1 from public.contact_requests
    where student_id = uid and tutor_id = p_tutor_id
  ) then
    if (
      select count(*) from public.contact_requests
      where student_id = uid and created_at > now() - interval '24 hours'
    ) >= 20 then
      raise exception 'Daily contact limit reached. Please try again tomorrow.';
    end if;

    insert into public.contact_requests (student_id, tutor_id)
    values (uid, p_tutor_id);
  end if;

  select phone into v_phone from public.tutor_private where tutor_id = p_tutor_id;
  return v_phone;
end;
$$;

-- 8. Admin switch: open or close the site to students
create or replace function public.set_students_open(p_open boolean)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  granted integer := 0;
begin
  if uid is null
     or not coalesce((select is_admin from public.students where id = uid), false) then
    raise exception 'Only admins can do this.';
  end if;

  update public.site_settings
  set students_open = p_open,
      students_opened_at = case
        when p_open and students_opened_at is null then now()
        else students_opened_at
      end
  where id = true;

  -- Opening starts the free month for every tutor approved so far
  if p_open then
    update public.tutors
    set paid_until = now() + interval '30 days'
    where status = 'approved' and paid_until is null;
    get diagnostics granted = row_count;
  end if;

  return granted;
end;
$$;

revoke all on function public.set_students_open(boolean) from public, anon;
grant execute on function public.set_students_open(boolean) to authenticated;
