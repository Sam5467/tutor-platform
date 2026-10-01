import Link from "next/link";
import ShapeHero from "@/components/kokonutui/shape-hero";
import { HowItWorks } from "@/components/how-it-works";
import { FaqPreview } from "@/components/faq-preview";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let approvedTutorId: string | null = null;

  if (user) {
    const { data } = await supabase
      .from("tutors")
      .select("id, status")
      .eq("student_id", user.id)
      .maybeSingle();
    if (data?.status === "approved") {
      approvedTutorId = data.id;
    }
  }

  return (
    <main>
      <div className="bg-ink pb-12">
        <ShapeHero
          title1="Find a tutor for"
          title2="your course"
        />

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
        ) : (
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
