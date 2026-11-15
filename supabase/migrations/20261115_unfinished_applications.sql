-- Admins only: people who created an account to become a tutor but never sent
-- an application, and when we last reminded them by email. Before the site
-- opens to students, everyone who signs up counts (the site is only for
-- tutors then); after that, only people who signed up from "Become a tutor".
-- Run this once in the Supabase SQL Editor.

create table if not exists public.application_reminders (
  student_id uuid primary key references public.students(id) on delete cascade,
  sent_at timestamptz not null default now()
);
alter table public.application_reminders enable row level security;
-- No policies: only the functions below can read or write it.

create or replace function public.admin_unfinished_applicants()
returns table (
  student_id uuid,
  full_name text,
  email text,
  signed_up_at timestamptz,
  confirmed boolean,
  reminded_at timestamptz
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
  select s.id, s.full_name, s.email, s.created_at,
         u.email_confirmed_at is not null,
         r.sent_at
  from public.students s
  join auth.users u on u.id = s.id
  left join public.application_reminders r on r.student_id = s.id
  where not s.is_admin
    and (
      u.raw_user_meta_data->>'return_to' = '/become-a-tutor'
      or s.created_at < coalesce(
        (select students_opened_at from public.site_settings limit 1),
        'infinity'::timestamptz
      )
    )
    and not exists (select 1 from public.tutors t where t.student_id = s.id)
  order by s.created_at desc;
end;
$$;

revoke all on function public.admin_unfinished_applicants() from public, anon;
grant execute on function public.admin_unfinished_applicants() to authenticated;

create or replace function public.admin_mark_reminded(p_student_id uuid)
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

  insert into public.application_reminders (student_id, sent_at)
  values (p_student_id, now())
  on conflict (student_id) do update set sent_at = excluded.sent_at;
end;
$$;

revoke all on function public.admin_mark_reminded(uuid) from public, anon;
grant execute on function public.admin_mark_reminded(uuid) to authenticated;
