-- Admins only: every time a student contacted a tutor (one row per student
-- and tutor, from their first contact), newest first.
-- Run this once in the Supabase SQL Editor.
create or replace function public.admin_contact_log()
returns table (
  tutor_id uuid,
  tutor_name text,
  student_name text,
  contacted_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null
     or not coalesce((select is_admin from public.students where id = auth.uid()), false) then
    raise exception 'Only admins can do this.';
  end if;

  return query
  select c.tutor_id, t.full_name, s.full_name, c.created_at
  from public.contact_requests c
  join public.tutors t on t.id = c.tutor_id
  left join public.students s on s.id = c.student_id
  order by c.created_at desc;
end;
$$;

revoke all on function public.admin_contact_log() from public, anon;
grant execute on function public.admin_contact_log() to authenticated;
