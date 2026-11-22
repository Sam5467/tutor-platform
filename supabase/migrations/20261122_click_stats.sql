-- Counts clicks on "Find a tutor" (home page button and header link), and
-- shows the admin how often each field is opened (field openings are already
-- saved as searches). No names are saved; admin visits are not counted.
-- Run this once in the Supabase SQL Editor.

create table if not exists public.site_clicks (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null,
  source text
);
alter table public.site_clicks enable row level security;
-- No policies: only the functions below can read or write it.

create or replace function public.log_click(p_kind text, p_source text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kind is null or p_kind not in ('find_tutor') then
    return;
  end if;
  if auth.uid() is not null
     and coalesce((select is_admin from public.students where id = auth.uid()), false) then
    return;
  end if;
  insert into public.site_clicks (kind, source)
  values (p_kind, nullif(left(coalesce(p_source, ''), 20), ''));
end;
$$;

revoke all on function public.log_click(text, text) from public;
grant execute on function public.log_click(text, text) to anon, authenticated;

create or replace function public.admin_click_stats()
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

  select jsonb_build_object(
    'find_tutor', (
      select jsonb_build_object(
        'total', count(*),
        'week', count(*) filter (where created_at > now() - interval '7 days'),
        'hero', count(*) filter (where source = 'hero'),
        'header', count(*) filter (where source = 'header')
      )
      from public.site_clicks where kind = 'find_tutor'
    ),
    -- Opening a field (no search typed, no filter changed yet).
    'fields', coalesce((
      select jsonb_agg(jsonb_build_object('field', field, 'total', total, 'week', week) order by total desc)
      from (
        select field, count(*) as total,
               count(*) filter (where created_at > now() - interval '7 days') as week
        from public.search_events
        where query is null and major is null and field is not null
          and university is null and session_mode is null
        group by field
      ) x
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.admin_click_stats() from public, anon;
grant execute on function public.admin_click_stats() to authenticated;
