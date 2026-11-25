-- Counts presses of the "Message us on WhatsApp" button on the Project /
-- Thesis help page (no names saved). Admin visits are not counted.
-- Run this once in the Supabase SQL Editor.

create table if not exists public.help_clicks (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now()
);
alter table public.help_clicks enable row level security;
-- No policies: only the functions below can read or write it.

create or replace function public.log_help_click()
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
  insert into public.help_clicks default values;
end;
$$;

revoke all on function public.log_help_click() from public;
grant execute on function public.log_help_click() to anon, authenticated;

create or replace function public.admin_help_clicks()
returns table (total bigint, last_7_days bigint)
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
  select count(*),
         count(*) filter (where created_at > now() - interval '7 days')
  from public.help_clicks;
end;
$$;

revoke all on function public.admin_help_clicks() from public, anon;
grant execute on function public.admin_help_clicks() to authenticated;
