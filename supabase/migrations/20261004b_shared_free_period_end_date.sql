-- Everyone shares one free period: it ends 30 days after the site opens to students.
-- A tutor approved later gets whatever is left of that period (or nothing if it already ended).
-- Run this whole file once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

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
     and new.paid_until is null then
    select students_opened_at + interval '30 days' into v_end
    from public.site_settings
    where students_open;

    if v_end is not null and v_end > now() then
      new.paid_until := v_end;
    end if;
  end if;
  return new;
end;
$$;

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

  -- Opening starts the shared free period for every tutor approved so far
  if p_open then
    select students_opened_at + interval '30 days' into v_end
    from public.site_settings;

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
