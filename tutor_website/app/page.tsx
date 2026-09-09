import Link from "next/link";
import ShapeHero from "@/components/kokonutui/shape-hero"; // installed via shadcn CLI in setup
import { HowItWorks } from "@/components/how-it-works";
import { TutorSpotlight } from "@/components/tutor-spotlight";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main>
      <ShapeHero
        title1="Find a tutor for"
        title2="your course"
      />

      <div className="flex gap-4 justify-center mt-8">
        <Link
          href="/tutors"
          className="rounded-full bg-ink text-paper px-6 py-3 text-sm font-medium"
        >
          Find a tutor
        </Link>
        <Link
          href="/become-a-tutor"
          className="rounded-full border border-ink px-6 py-3 text-sm font-medium"
        >
          Become a tutor
        </Link>
      </div>

      <HowItWorks />
      <TutorSpotlight />
      <Footer />
    </main>
  );
}