-- Admins only: fix any detail of a tutor's application (name, university,
-- field, major, year, courses, price, bio, way of teaching, phone, GPA).
-- Run this once in the Supabase SQL Editor.
create or replace function public.admin_update_tutor(
  p_tutor_id uuid,
  p_full_name text,
  p_university text,
  p_faculty text,
  p_major text,
  p_year text,
  p_courses text,
  p_price numeric,
  p_bio text,
  p_session_mode text,
  p_phone text,
  p_gpa numeric
)
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

  if coalesce(length(trim(p_full_name)), 0) not between 1 and 100
     or coalesce(length(trim(p_university)), 0) not between 1 and 100
     or coalesce(length(trim(p_faculty)), 0) not between 1 and 100
     or coalesce(length(trim(p_major)), 0) not between 1 and 100
     or coalesce(length(trim(p_year)), 0) not between 1 and 30
     or coalesce(length(trim(p_courses)), 0) not between 1 and 300
     or coalesce(length(p_bio), 0) > 1000 then
    raise exception 'Some fields are missing or too long.';
  end if;

  if p_session_mode is null or p_session_mode not in ('online', 'in_person', 'both') then
    raise exception 'Please choose how they teach.';
  end if;

  if p_price is null or p_price < 1 or p_price > 1000 then
    raise exception 'Price must be between 1 and 1000.';
  end if;

  if p_gpa is null or p_gpa < 0 or p_gpa > 4 then
    raise exception 'GPA must be between 0 and 4.';
  end if;

  if p_phone is null or p_phone !~ '^[0-9]{8,15}$' then
    raise exception 'Please enter a valid phone number.';
  end if;

  update public.tutors
  set full_name = trim(p_full_name),
      university = trim(p_university),
      faculty = trim(p_faculty),
      major = trim(p_major),
      year = trim(p_year),
      courses = trim(p_courses),
      price = p_price,
      bio = p_bio,
      session_mode = p_session_mode
  where id = p_tutor_id;

  if not found then
    raise exception 'This tutor no longer exists.';
  end if;

  update public.tutor_private
  set phone = p_phone, gpa = p_gpa
  where tutor_id = p_tutor_id;
end;
$$;

revoke all on function public.admin_update_tutor(uuid, text, text, text, text, text, text, numeric, text, text, text, numeric) from public, anon;
grant execute on function public.admin_update_tutor(uuid, text, text, text, text, text, text, numeric, text, text, text, numeric) to authenticated;
