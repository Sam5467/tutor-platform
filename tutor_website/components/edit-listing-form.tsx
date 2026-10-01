"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizePhone } from "@/lib/phone";
import { PHOTO_RULE, buildUploadPath, validateUpload } from "@/lib/uploads";

type EditListingFormProps = {
  tutorId: string;
  initial: {
    year: string;
    courses: string;
    price: number;
    bio: string;
    phone: string;
    photoUrl: string | null;
  };
};

export function EditListingForm({ tutorId, initial }: EditListingFormProps) {
  const router = useRouter();
  const [year, setYear] = useState(initial.year);
  const [courses, setCourses] = useState(initial.courses);
  const [price, setPrice] = useState(String(initial.price));
  const [bio, setBio] = useState(initial.bio);
  const [phone, setPhone] = useState(initial.phone);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initial.photoUrl
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    const problem = file ? validateUpload(file, PHOTO_RULE) : null;
    if (problem) {
      setError(problem);
      e.target.value = "";
      return;
    }
    setError("");
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanedPhone = normalizePhone(phone);
    if (!cleanedPhone) {
      setError(
        "That doesn't look like a valid phone number. Please include your country code, e.g. 96170123456."
      );
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setSaving(false);
      return;
    }

    let newPhotoPath: string | null = null;
    if (photoFile) {
      newPhotoPath = buildUploadPath(user.id, "photo", photoFile, PHOTO_RULE);
      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(newPhotoPath, photoFile, { contentType: photoFile.type });

      if (uploadError) {
        setError("We couldn't upload your photo. Please try again.");
        setSaving(false);
        return;
      }
    }

    const { data: oldPhotoPath, error: saveError } = await supabase.rpc(
      "update_tutor_listing",
      {
        p_year: year,
        p_courses: courses,
        p_price: Number(price),
        p_bio: bio,
        p_phone: cleanedPhone,
        p_profile_picture_path: newPhotoPath,
      }
    );

    if (saveError) {
      // Don't leave the new photo behind if the save failed.
      if (newPhotoPath) {
        await supabase.storage.from("profile-pictures").remove([newPhotoPath]);
      }
      setError(saveError.message);
      setSaving(false);
      return;
    }

    // The save returns the previous photo, which can now be deleted.
    if (oldPhotoPath) {
      await supabase.storage.from("profile-pictures").remove([oldPhotoPath]);
    }

    router.push(`/tutors/${tutorId}`);
    router.refresh();
  };

  return (
    <div className="max-w-lg mx-auto py-16 px-4">
      <h1 className="font-display text-2xl text-ink mb-2 text-center">
        Edit my listing
      </h1>
      <p className="text-sm text-slate text-center mb-8">
        Your name, faculty, major, GPA and transcript can only be changed by an
        admin. Contact us if something there needs updating.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="edit-year" className="text-sm text-slate">
            Year
          </label>
          <input
            id="edit-year"
            type="text"
            required
            maxLength={30}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-courses" className="text-sm text-slate">
            Courses you can tutor (comma-separated)
          </label>
          <textarea
            id="edit-courses"
            required
            maxLength={300}
            value={courses}
            onChange={(e) => setCourses(e.target.value)}
            rows={2}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-price" className="text-sm text-slate">
            Price per session ($)
          </label>
          <input
            id="edit-price"
            type="number"
            required
            min={1}
            max={1000}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-bio" className="text-sm text-slate">
            Bio
          </label>
          <textarea
            id="edit-bio"
            required
            maxLength={1000}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-phone" className="text-sm text-slate">
            Phone / WhatsApp number (with country code)
          </label>
          <input
            id="edit-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-slate">
            Profile picture — JPG, PNG or WebP, max 2 MB
          </p>
          <div className="flex items-center gap-3">
            <label
              htmlFor="edit-photo"
              className="cursor-pointer rounded-full bg-ink text-paper px-5 py-2 text-sm font-medium"
            >
              {photoPreview ? "Change photo" : "Choose file"}
            </label>
            <input
              id="edit-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
            {photoFile && (
              <span className="text-sm text-slate">{photoFile.name}</span>
            )}
          </div>
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Profile preview"
              className="w-20 h-20 rounded-full object-cover mt-2"
            />
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={() => router.push(`/tutors/${tutorId}`)}
            className="flex-1 rounded-full border border-stone px-6 py-3 text-sm text-slate"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-full bg-ink text-paper px-6 py-3 text-sm font-medium disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
