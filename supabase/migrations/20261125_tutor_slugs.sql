-- Nice tutor links: passalonglb.com/tutors/maria-rahy instead of the long code.
-- Each tutor gets a "slug" made from their name when they apply. It never
-- changes afterwards (even if their name is edited), so shared links keep
-- working. Two tutors with the same name get "-2", "-3"...
-- Run this once in the Supabase SQL Editor.

alter table public.tutors add column if not exists slug text;

create or replace function public.make_tutor_slug(p_name text, p_id uuid)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_base text;
  v_slug text;
  n integer := 1;
begin
  v_base := lower(coalesce(p_name, ''));
  -- Common accented letters become plain ones (é -> e, ç -> c, ...).
  v_base := translate(
    v_base,
    'àáâãäåèéêëìíîïòóôõöùúûüýÿçñ',
    'aaaaaaeeeeiiiiooooouuuuyycn'
  );
  v_base := trim(both '-' from regexp_replace(v_base, '[^a-z0-9]+', '-', 'g'));
  if v_base = '' then
    v_base := 'tutor';
  end if;

  v_slug := v_base;
  while exists (
    select 1 from public.tutors where slug = v_slug and id <> p_id
  ) loop
    n := n + 1;
    v_slug := v_base || '-' || n;
  end loop;
  return v_slug;
end;
$$;

-- New applications get their slug automatically.
create or replace function public.set_tutor_slug()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.make_tutor_slug(new.full_name, new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists set_tutor_slug on public.tutors;
create trigger set_tutor_slug
  before insert on public.tutors
  for each row execute function public.set_tutor_slug();

-- Give every existing tutor a slug (oldest first, so they get the plain name).
do $$
declare
  r record;
begin
  for r in select id, full_name from public.tutors where slug is null order by created_at loop
    update public.tutors set slug = public.make_tutor_slug(r.full_name, r.id) where id = r.id;
  end loop;
end;
$$;

alter table public.tutors alter column slug set not null;
create unique index if not exists tutors_slug_key on public.tutors (slug);
