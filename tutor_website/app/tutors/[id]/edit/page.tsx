import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditListingForm } from "@/components/edit-listing-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/tutors/${id}/edit`);
  }

  // Only the owner of this listing can open the edit page.
  const { data: tutor } = await supabase
    .from("tutors")
    .select("id, year, courses, price, bio, profile_picture_path")
    .eq("id", id)
    .eq("student_id", user.id)
    .maybeSingle();

  if (!tutor) {
    notFound();
  }

  const { data: priv } = await supabase
    .from("tutor_private")
    .select("phone")
    .eq("tutor_id", id)
    .maybeSingle();

  const photoUrl = tutor.profile_picture_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${tutor.profile_picture_path}`
    : null;

  return (
    <EditListingForm
      tutorId={tutor.id}
      initial={{
        year: tutor.year,
        courses: tutor.courses,
        price: Number(tutor.price),
        bio: tutor.bio ?? "",
        phone: priv?.phone ?? "",
        photoUrl,
      }}
    />
  );
}
