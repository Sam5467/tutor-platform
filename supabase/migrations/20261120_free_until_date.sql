-- The shared free period now ends on a date the admin chooses ("free until"),
-- instead of always 30 days after the site opens. If no date is set, it's
-- still 30 days after opening, as before.
-- Run this once in the Supabase SQL Editor.

alter table public.site_settings add column if not exists free_until timestamptz;

-- When the free period ends: the chosen date, or 30 days after opening.
create or replace function public.free_period_end()
returns timestamptz
language sql
stable
set search_path = public
as $$
  select coalesce(free_until, students_opened_at + interval '30 days')
  from public.site_settings
  limit 1;
$$;

-- A tutor approved while the site is open gets the rest of the free period.
create or replace function public.grant_free_month()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_end timestamptz;
begin
  if new.status = 'approved'
     and old.status is distinct from 'approved'
     and new.paid_until is null
     and coalesce((select students_open from public.site_settings limit 1), false) then
    v_end := public.free_period_end();
    if v_end is not null and v_end > now() then
      new.paid_until := v_end;
    end if;
  end if;
  return new;
end;
$$;

-- Opening starts the shared free period for every tutor approved so far.
create or replace function public.set_students_open(p_open boolean)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  granted integer := 0;
  v_end timestamptz;
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

  if p_open then
    v_end := public.free_period_end();
    if v_end > now() then
      update public.tutors
      set paid_until = v_end
      where status = 'approved' and paid_until is null;
      get diagnostics granted = row_count;
    end if;
  end if;

  return granted;
end;
$$;

-- Admins only: choose (or change) the date the free period ends. If the site
-- is already open, every tutor who is still on the free period moves to the
-- new date; tutors who paid beyond it keep their own date.
create or replace function public.set_free_until(p_date timestamptz)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_old timestamptz;
  moved integer := 0;
begin
  if uid is null
     or not coalesce((select is_admin from public.students where id = uid), false) then
    raise exception 'Only admins can do this.';
  end if;

  if p_date is null or p_date <= now() then
    raise exception 'Please choose a date in the future.';
  end if;

  v_old := public.free_period_end();

  update public.site_settings set free_until = p_date where id = true;

  if coalesce((select students_open from public.site_settings limit 1), false) then
    update public.tutors
    set paid_until = p_date
    where status = 'approved'
      and (paid_until is null or paid_until = v_old);
    get diagnostics moved = row_count;
  end if;

  return moved;
end;
$$;

revoke all on function public.set_free_until(timestamptz) from public, anon;
grant execute on function public.set_free_until(timestamptz) to authenticated;
