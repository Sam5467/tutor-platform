-- Admins only: how many accounts exist, how many signed up in the last 7
-- days, and how many of the accounts are not tutors (students).
-- Run this once in the Supabase SQL Editor.
create or replace function public.admin_signup_stats()
returns table (
  total_accounts bigint,
  accounts_last_7_days bigint,
  student_accounts bigint
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
  select
    count(*),
    count(*) filter (where s.created_at > now() - interval '7 days'),
    count(*) filter (where not exists (
      select 1 from public.tutors t where t.student_id = s.id
    ) and not s.is_admin)
  from public.students s;
end;
$$;

revoke all on function public.admin_signup_stats() from public, anon;
grant execute on function public.admin_signup_stats() to authenticated;
