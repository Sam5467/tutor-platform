-- Passalong: tutors from any university, and how they teach (online / in person).
-- Run this once in the Supabase SQL Editor.

-- 1) New columns on tutors
alter table public.tutors add column if not exists university text;
alter table public.tutors add column if not exists session_mode text not null default 'both';

-- Rows that already exist (test listings) belong to USEK
update public.tutors set university = 'USEK' where university is null;
alter table public.tutors alter column university set not null;

alter table public.tutors drop constraint if exists tutors_session_mode_check;
alter table public.tutors
  add constraint tutors_session_mode_check
  check (session_mode in ('online', 'in_person', 'both'));

alter table public.tutors drop constraint if exists tutors_university_length;
alter table public.tutors
  add constraint tutors_university_length
  check (char_length(university) between 1 and 100);

-- 2) A tutor can't change their own name, field, major or university (admins can)
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
  elsif new.status is distinct from old.status
     or new.is_paid is distinct from old.is_paid then
    raise exception 'Only admins can change status or payment.';
  elsif new.student_id is distinct from old.student_id
     or new.full_name is distinct from old.full_name
     or new.faculty is distinct from old.faculty
     or new.major is distinct from old.major
     or new.university is distinct from old.university then
    raise exception 'Name, university, field and major can only be changed by an admin.';
  end if;

  return new;
end;
$$;

-- 3) Applying: now takes the university and the way of teaching
drop function if exists public.submit_tutor_application(text, text, text, text, numeric, text, text, numeric, text, text);

create or replace function public.submit_tutor_application(
  p_university text,
  p_faculty text,
  p_major text,
  p_year text,
  p_courses text,
  p_price numeric,
  p_bio text,
  p_phone text,
  p_gpa numeric,
  p_transcript_path text,
  p_profile_picture_path text,
  p_session_mode text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_name text;
  v_id uuid;
begin
  if uid is null then
    raise exception 'You must be logged in to apply.';
  end if;

  select full_name into v_name from public.students where id = uid;
  if v_name is null or length(trim(v_name)) = 0 then
    raise exception 'Your account has no name set.';
  end if;

  if coalesce(length(trim(p_university)), 0) not between 1 and 100
     or coalesce(length(trim(p_faculty)), 0) not between 1 and 100
     or coalesce(length(trim(p_major)), 0) not between 1 and 100
     or coalesce(length(trim(p_year)), 0) not between 1 and 30
     or coalesce(length(trim(p_courses)), 0) not between 1 and 300
     or coalesce(length(p_bio), 0) > 1000 then
    raise exception 'Some fields are missing or too long.';
  end if;

  if p_session_mode is null or p_session_mode not in ('online', 'in_person', 'both') then
    raise exception 'Please choose how you teach.';
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

  if p_transcript_path is null or p_transcript_path not like uid::text || '/%' then
    raise exception 'A transcript is required.';
  end if;

  if p_profile_picture_path is not null
     and p_profile_picture_path not like uid::text || '/%' then
    raise exception 'Invalid profile picture.';
  end if;

  insert into public.tutors (
    student_id, full_name, university, faculty, major, year, courses, price,
    bio, profile_picture_path, session_mode
  )
  values (
    uid, v_name, trim(p_university), trim(p_faculty), trim(p_major), trim(p_year),
    trim(p_courses), p_price, p_bio, p_profile_picture_path, p_session_mode
  )
  returning id into v_id;

  insert into public.tutor_private (tutor_id, phone, gpa, transcript_path)
  values (v_id, p_phone, p_gpa, p_transcript_path);

  return v_id;
end;
$$;

revoke all on function public.submit_tutor_application(text, text, text, text, text, numeric, text, text, numeric, text, text, text) from public, anon;
grant execute on function public.submit_tutor_application(text, text, text, text, text, numeric, text, text, numeric, text, text, text) to authenticated;

-- 4) Editing a listing: the way of teaching can be changed
drop function if exists public.update_tutor_listing(text, text, numeric, text, text, text);

create or replace function public.update_tutor_listing(
  p_year text,
  p_courses text,
  p_price numeric,
  p_bio text,
  p_phone text,
  p_session_mode text,
  p_profile_picture_path text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_id uuid;
  v_old text;
begin
  if uid is null then
    raise exception 'You must be logged in.';
  end if;

  if coalesce(length(trim(p_year)), 0) not between 1 and 30
     or coalesce(length(trim(p_courses)), 0) not between 1 and 300
     or coalesce(length(p_bio), 0) > 1000 then
    raise exception 'Some fields are missing or too long.';
  end if;

  if p_session_mode is null or p_session_mode not in ('online', 'in_person', 'both') then
    raise exception 'Please choose how you teach.';
  end if;

  if p_price is null or p_price < 1 or p_price > 1000 then
    raise exception 'Price must be between 1 and 1000.';
  end if;

  if p_phone is null or p_phone !~ '^[0-9]{8,15}$' then
    raise exception 'Please enter a valid phone number.';
  end if;

  if p_profile_picture_path is not null
     and p_profile_picture_path not like uid::text || '/%' then
    raise exception 'Invalid profile picture.';
  end if;

  select id, profile_picture_path into v_id, v_old
  from public.tutors where student_id = uid;

  if v_id is null then
    raise exception 'You do not have a listing yet.';
  end if;

  update public.tutors
  set year = trim(p_year),
      courses = trim(p_courses),
      price = p_price,
      bio = p_bio,
      session_mode = p_session_mode,
      profile_picture_path = coalesce(p_profile_picture_path, profile_picture_path)
  where id = v_id;

  update public.tutor_private set phone = p_phone where tutor_id = v_id;

  if p_profile_picture_path is not null
     and v_old is distinct from p_profile_picture_path then
    return v_old;
  end if;
  return null;
end;
$$;

revoke all on function public.update_tutor_listing(text, text, numeric, text, text, text, text) from public, anon;
grant execute on function public.update_tutor_listing(text, text, numeric, text, text, text, text) to authenticated;
