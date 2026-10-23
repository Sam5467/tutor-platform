-- Undo the test opening of 19 October 2026, so the shared 30-day free period
-- starts again on the real opening day. Only runs while the site is closed.
-- Run once in the Supabase SQL Editor.

update public.site_settings
set students_opened_at = null
where id = true and students_open = false;

-- The test listings that received the 18 November end date from that opening
update public.tutors
set paid_until = null
where paid_until = '2026-11-18 16:50:51.76827+00';
