-- Insights for the admin: what students search for, how often each tutor's
-- profile is opened, how people heard about Passalong, and a simple funnel.
-- Searches and views are saved without names. Admin visits are not counted.
-- Run this once in the Supabase SQL Editor.

-- 1) Searches
create table if not exists public.search_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  query text,
  field text,
  major text,
  university text,
  session_mode text,
  results integer not null default 0
);
alter table public.search_events enable row level security;
-- No policies: only the functions below can read or write it.

create or replace function public.log_search(
  p_query text,
  p_field text,
  p_major text,
  p_university text,
  p_session_mode text,
  p_results integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and coalesce((select is_admin from public.students where id = auth.uid()), false) then
    return;
  end if;

  insert into public.search_events (query, field, major, university, session_mode, results)
  values (
    nullif(left(trim(coalesce(p_query, '')), 100), ''),
    nullif(left(trim(coalesce(p_field, '')), 100), ''),
    nullif(left(trim(coalesce(p_major, '')), 100), ''),
    nullif(left(trim(coalesce(p_university, '')), 100), ''),
    nullif(left(trim(coalesce(p_session_mode, '')), 20), ''),
    greatest(coalesce(p_results, 0), 0)
  );
end;
$$;

revoke all on function public.log_search(text, text, text, text, text, integer) from public;
grant execute on function public.log_search(text, text, text, text, text, integer) to anon, authenticated;

-- 2) Profile views
create table if not exists public.profile_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  tutor_id uuid not null references public.tutors(id) on delete cascade
);
alter table public.profile_views enable row level security;
create index if not exists profile_views_tutor_id_idx on public.profile_views (tutor_id);

create or replace function public.log_profile_view(p_tutor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and (
    coalesce((select is_admin from public.students where id = auth.uid()), false)
    or exists (select 1 from public.tutors where id = p_tutor_id and student_id = auth.uid())
  ) then
    return;
  end if;

  if exists (select 1 from public.tutors where id = p_tutor_id) then
    insert into public.profile_views (tutor_id) values (p_tutor_id);
  end if;
end;
$$;

revoke all on function public.log_profile_view(uuid) from public;
grant execute on function public.log_profile_view(uuid) to anon, authenticated;

-- 3) Everything the admin dashboard shows, in one call
create or replace function public.admin_insights()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if auth.uid() is null
     or not coalesce((select is_admin from public.students where id = auth.uid()), false) then
    raise exception 'Only admins can do this.';
  end if;

  with student_accounts as (
    select s.id
    from public.students s
    where not s.is_admin
      and not exists (select 1 from public.tutors t where t.student_id = s.id)
  ),
  recent_searches as (
    select * from public.search_events where created_at > now() - interval '30 days'
  )
  select jsonb_build_object(
    'funnel', jsonb_build_object(
      'accounts', (select count(*) from student_accounts),
      'confirmed', (
        select count(*) from student_accounts sa
        join auth.users u on u.id = sa.id
        where u.email_confirmed_at is not null
      ),
      'contacted', (
        select count(distinct c.student_id) from public.contact_requests c
        where c.student_id in (select id from student_accounts)
      ),
      'reviewed', (
        select count(distinct r.student_id) from public.reviews r
        where r.student_id in (select id from student_accounts)
      )
    ),
    'heard_from', coalesce((
      select jsonb_agg(jsonb_build_object('source', source, 'count', n) order by n desc)
      from (
        select coalesce(nullif(u.raw_user_meta_data->>'heard_from', ''), 'Not answered') as source,
               count(*) as n
        from public.students s
        join auth.users u on u.id = s.id
        where not s.is_admin
        group by 1
      ) x
    ), '[]'::jsonb),
    'top_searches', coalesce((
      select jsonb_agg(jsonb_build_object('label', label, 'count', n, 'empty', empty) order by n desc)
      from (
        select lower(query) as label, count(*) as n,
               count(*) filter (where results = 0) as empty
        from recent_searches
        where query is not null
        group by 1
        order by 2 desc
        limit 15
      ) x
    ), '[]'::jsonb),
    'top_majors', coalesce((
      select jsonb_agg(jsonb_build_object('label', label, 'count', n, 'empty', empty) order by n desc)
      from (
        select major as label, count(*) as n,
               count(*) filter (where results = 0) as empty
        from recent_searches
        where query is null and major is not null
        group by 1
        order by 2 desc
        limit 15
      ) x
    ), '[]'::jsonb),
    'no_results', coalesce((
      select jsonb_agg(jsonb_build_object('label', label, 'university', university, 'count', n) order by n desc)
      from (
        select coalesce(lower(query), major) as label, university, count(*) as n
        from recent_searches
        where results = 0
        group by 1, 2
        order by 3 desc
        limit 15
      ) x
    ), '[]'::jsonb),
    'views', coalesce((
      select jsonb_object_agg(tutor_id, jsonb_build_object('total', total, 'week', week))
      from (
        select tutor_id, count(*) as total,
               count(*) filter (where created_at > now() - interval '7 days') as week
        from public.profile_views
        group by 1
      ) x
    ), '{}'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.admin_insights() from public, anon;
grant execute on function public.admin_insights() to authenticated;
