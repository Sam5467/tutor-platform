-- Whether a tutor can help with projects and with a thesis. Not shown to
-- students yet: the admin uses it to connect students who need project or
-- thesis help with the right tutors (a "Project / Thesis help" section later).
-- Tutors set it themselves (apply form, edit listing); admins can change it.
-- Run this once in the Supabase SQL Editor.
alter table public.tutors add column if not exists can_do_projects boolean not null default false;
alter table public.tutors add column if not exists can_do_thesis boolean not null default false;
