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

  let isApprovedTutor = false;

  if (user) {
    const { data } = await supabase
      .from("tutors")
      .select("status")
      .eq("student_id", user.id)
      .maybeSingle();
    isApprovedTutor = data?.status === "approved";
  }

  return (
    <main>
      <div className="bg-ink pb-12">
        <ShapeHero
          title1="Find a tutor for"
          title2="your course"
        />

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
            {isApprovedTutor ? "My reviews" : "Become a tutor"}
          </Link>
        </div>
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
