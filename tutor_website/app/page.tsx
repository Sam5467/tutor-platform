import Link from "next/link";
import ShapeHero from "@/components/kokonutui/shape-hero";
import { HowItWorks } from "@/components/how-it-works";
import { FaqPreview } from "@/components/faq-preview";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { getStudentsOpen } from "@/lib/site-settings";

export default async function Home() {
  const studentsOpen = await getStudentsOpen();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let approvedTutorId: string | null = null;
  let firstName = "";

  if (user) {
    const [{ data }, { data: student }] = await Promise.all([
      supabase
        .from("tutors")
        .select("id, status")
        .eq("student_id", user.id)
        .maybeSingle(),
      supabase.from("students").select("full_name").eq("id", user.id).single(),
    ]);
    if (data?.status === "approved") {
      approvedTutorId = data.id;
      firstName = (student?.full_name ?? "").trim().split(" ")[0];
    }
  }

  return (
    <main>
      <div className="bg-ink pb-12">
        {approvedTutorId ? (
          <ShapeHero
            title1="Welcome back,"
            title2={firstName || "tutor"}
            tagline="Your tutor card is live. Students can find you and reach out."
          />
        ) : studentsOpen ? (
          <ShapeHero title1="Find a tutor for" title2="your course" />
        ) : (
          // Tutors-only launch: invite tutors, no student search yet.
          <ShapeHero
            title1="Tutor your fellow"
            title2="USEK students"
            tagline="Apply now and be one of our first tutors."
          />
        )}

        {approvedTutorId ? (
          // Approved tutors get a single centered button to their own card.
          <div className="flex justify-center">
            <Link
              href={`/tutors/${approvedTutorId}`}
              className="rounded-full bg-brass text-ink px-10 py-4 text-base font-medium"
            >
              View my tutor card
            </Link>
          </div>
        ) : studentsOpen ? (
          <div className="flex gap-4 justify-center text-paper">
            <Link
              href="/tutors"
              className="rounded-full bg-brass text-ink px-10 py-4 text-base font-medium"
            >
              Find a tutor
            </Link>
            <Link
              href="/become-a-tutor"
              className="rounded-full border border-brass text-paper px-10 py-4 text-base font-medium"
            >
              Become a tutor
            </Link>
          </div>
        ) : (
          // Before the site opens to students, "Become a tutor" is the only button.
          <div className="flex justify-center">
            <Link
              href="/become-a-tutor"
              className="rounded-full bg-brass text-ink px-10 py-4 text-base font-medium"
            >
              Become a tutor
            </Link>
          </div>
        )}
      </div>

      <HowItWorks />

      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t-4 border-black" />
      </div>

      <FaqPreview />
      <Footer />
    </main>
  );
}
