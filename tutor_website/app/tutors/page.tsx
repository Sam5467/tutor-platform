import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStudentsOpen } from "@/lib/site-settings";
import { TutorsBrowser } from "@/components/tutors-browser";

export default async function TutorsPage() {
  const studentsOpen = await getStudentsOpen();

  // Admins can still look around before the site opens, to check the page.
  let isAdmin = false;
  if (!studentsOpen) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("students")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      isAdmin = !!data?.is_admin;
    }
  }

  if (!studentsOpen && !isAdmin) {
    return (
      <div className="max-w-lg mx-auto py-24 px-4 text-center">
        <h1 className="font-display text-2xl text-ink mb-4">Coming soon</h1>
        <p className="text-slate mb-6">
          We're getting our first tutors ready. Tutor search will open to
          students very soon.
        </p>
        <Link
          href="/become-a-tutor"
          className="inline-block rounded-full bg-ink text-paper px-8 py-3 text-sm font-medium"
        >
          Become a tutor
        </Link>
      </div>
    );
  }

  return <TutorsBrowser />;
}
