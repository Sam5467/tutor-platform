-- Delete the test accounts: the 10 @seed.test accounts (8 fake tutors plus
-- upload.test and signup.test) and 2 sign-ups that were never confirmed.
-- Their student profiles, tutor listings, reviews and contact requests are
-- removed with them automatically.
-- Run once in the Supabase SQL Editor.

delete from auth.users
where email like '%@seed.test'
   or (email in ('zoubouwawa@gmail.com', 'megbgtkt@gmail.com')
       and email_confirmed_at is null);
