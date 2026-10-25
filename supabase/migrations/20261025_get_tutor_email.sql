-- Admins only: the email address of a tutor, to tell them about a decision.
-- (Already applied to the live database on 25 October 2026.)
create or replace function public.get_tutor_email(p_tutor_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  if auth.uid() is null
     or not coalesce((select is_admin from public.students where id = auth.uid()), false) then
    raise exception 'Only admins can do this.';
  end if;

  select s.email into v_email
  from public.tutors t
  join public.students s on s.id = t.student_id
  where t.id = p_tutor_id;

  return v_email;
end;
$$;

revoke all on function public.get_tutor_email(uuid) from public, anon;
grant execute on function public.get_tutor_email(uuid) to authenticated;
