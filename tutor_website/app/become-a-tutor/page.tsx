"use client";

import { useEffect, useState } from "react";
import { faculties } from "@/lib/faculties";
import { createClient } from "@/lib/supabase/client";
import { ReviewsSection } from "@/components/reviews-section";
import {
  PHOTO_RULE,
  TRANSCRIPT_RULE,
  buildUploadPath,
  validateUpload,
} from "@/lib/uploads";

export default function BecomeATutorPage() {
  const [faculty, setFaculty] = useState("");
  const [subFaculty, setSubFaculty] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("Senior");
  const [courses, setCourses] = useState("");
  const [price, setPrice] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [gpa, setGpa] = useState("");
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [existingTutorId, setExistingTutorId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    async function checkExisting() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: studentRow } = await supabase
          .from("students")
          .select("full_name")
          .eq("id", user.id)
          .single();
        setStudentName(studentRow?.full_name ?? "");

        const { data } = await supabase
          .from("tutors")
          .select("id, status")
          .eq("student_id", user.id)
          .maybeSingle();
        setExistingStatus(data?.status ?? null);
        setExistingTutorId(data?.id ?? null);
      }
      setCheckingExisting(false);
    }

    checkExisting();
  }, []);

  const facultyData = faculties.find((f) => f.name === faculty);
  const subFaculties = facultyData?.subFaculties ?? [];
  const effectiveSubFaculty =
    subFaculties.length === 1 ? subFaculties[0].name : subFaculty;
  const majors =
    subFaculties.find((s) => s.name === effectiveSubFaculty)?.majors ?? [];

  const handleTranscriptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    const problem = file ? validateUpload(file, TRANSCRIPT_RULE) : null;
    if (problem) {
      setError(problem);
      setTranscriptFile(null);
      e.target.value = "";
      return;
    }
    setError("");
    setTranscriptFile(file);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    const problem = file ? validateUpload(file, PHOTO_RULE) : null;
    if (problem) {
      setError(problem);
      setPhotoFile(null);
      setPhotoPreview(null);
      e.target.value = "";
      return;
    }
    setError("");
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  // Submitting the form first shows a "are you sure?" box with the name and
  // phone number; the real submission happens in submitApplication.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowConfirm(true);
  };

  const submitApplication = async () => {
    setError("");
    setShowConfirm(false);
    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to apply as a tutor.");
      setLoading(false);
      return;
    }

    const { data: studentRow } = await supabase
      .from("students")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (!transcriptFile) {
      setError("Please upload your transcript.");
      setLoading(false);
      return;
    }

    // Re-check here too, in case the state was changed some other way.
    const transcriptProblem = validateUpload(transcriptFile, TRANSCRIPT_RULE);
    const photoProblem = photoFile
      ? validateUpload(photoFile, PHOTO_RULE)
      : null;
    if (transcriptProblem || photoProblem) {
      setError(transcriptProblem ?? photoProblem ?? "");
      setLoading(false);
      return;
    }

    const transcriptPath = buildUploadPath(
      user.id,
      "transcript",
      transcriptFile,
      TRANSCRIPT_RULE
    );
    const { error: transcriptError } = await supabase.storage
      .from("transcripts")
      .upload(transcriptPath, transcriptFile, {
        contentType: transcriptFile.type,
      });

    if (transcriptError) {
      setError("We couldn't upload your transcript. Please try again.");
      setLoading(false);
      return;
    }

    let photoPath: string | null = null;
    if (photoFile) {
      const path = buildUploadPath(user.id, "photo", photoFile, PHOTO_RULE);
      const { error: photoError } = await supabase.storage
        .from("profile-pictures")
        .upload(path, photoFile, { contentType: photoFile.type });

      if (photoError) {
        setError("We couldn't upload your profile picture. Please try again.");
        setLoading(false);
        return;
      }
      photoPath = path;
    }

    const { error: insertError } = await supabase.from("tutors").insert({
      student_id: user.id,
      full_name: studentRow?.full_name ?? "",
      faculty,
      major,
      year,
      courses,
      price: Number(price),
      bio,
      phone,
      gpa: Number(gpa),
      transcript_path: transcriptPath,
      profile_picture_path: photoPath,
    });

    setLoading(false);

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "You've already applied to be a tutor."
          : insertError.message
      );
      return;
    }

    setSubmitted(true);
  };

  if (checkingExisting) {
    return (
      <div className="max-w-lg mx-auto py-24 px-4 text-center">
        <p className="text-slate">Loading...</p>
      </div>
    );
  }

  if (existingStatus === "approved" && existingTutorId && !submitted) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4">
        <h1 className="font-display text-2xl text-ink mb-8 text-center">
          My reviews
        </h1>
        <ReviewsSection tutorId={existingTutorId} hideForm />
      </div>
    );
  }

  if (existingStatus && existingStatus !== "approved" && !submitted) {
    const messages: Record<string, string> = {
      pending:
        "Your application is under review. We'll reach out once it's been checked.",
      rejected:
        "Your application wasn't approved. Please contact us if you think this is a mistake.",
    };
    return (
      <div className="max-w-lg mx-auto py-24 px-4 text-center">
        <h1 className="font-display text-2xl text-ink mb-4">
          You've already applied
        </h1>
        <p className="text-slate">
          {messages[existingStatus] ?? "Your application has been received."}
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-24 px-4 text-center">
        <h1 className="font-display text-2xl text-ink mb-4">
          Thanks for applying!
        </h1>
        <p className="text-slate">
          Your profile has been submitted for review. We'll check your GPA
          and transcript and reach out once your listing is approved.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-16 px-4">
      <h1 className="font-display text-2xl text-ink mb-8 text-center">
        Become a tutor
      </h1>

      <p className="text-sm text-slate text-center mb-6">
        Applying as <span className="text-ink font-medium">{studentName}</span>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">Faculty</label>
          <select
            required
            value={faculty}
            onChange={(e) => {
              setFaculty(e.target.value);
              setSubFaculty("");
              setMajor("");
            }}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          >
            <option value="" disabled>
              Select faculty
            </option>
            {faculties.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {subFaculties.length > 1 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate">Area</label>
            <select
              required
              disabled={!faculty}
              value={subFaculty}
              onChange={(e) => {
                setSubFaculty(e.target.value);
                setMajor("");
              }}
              className="border border-ink/15 rounded-lg py-2 px-4 text-ink disabled:opacity-50"
            >
              <option value="" disabled>
                Select area
              </option>
              {subFaculties.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">Major</label>
          <select
            required
            disabled={!faculty}
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="border border-ink/15 rounded-lg py-2 px-4 text-ink disabled:opacity-50"
          >
            <option value="" disabled>
              Select major
            </option>
            {majors.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">Year</label>
          <input
            type="text"
            required
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">
            Courses you can tutor (comma-separated)
          </label>
          <textarea
            required
            value={courses}
            onChange={(e) => setCourses(e.target.value)}
            placeholder="CSC 210, MATH 201, CSC 330"
            className="border border-stone rounded-lg py-2 px-4 text-ink"
            rows={2}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">Price per session ($)</label>
          <input
            type="number"
            required
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">Bio</label>
          <textarea
            required
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
            rows={4}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">
            Phone / WhatsApp number
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="96170123456"
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">GPA</label>
          <input
            type="number"
            required
            step="0.01"
            min={0}
            max={4}
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">
            Transcript (proof of GPA) — PDF, JPG, PNG or WebP, max 5 MB
          </label>
          <div className="flex items-center gap-3">
            <label
              htmlFor="transcript-upload"
              className="cursor-pointer rounded-full bg-ink text-paper px-5 py-2 text-sm font-medium"
            >
              Choose file
            </label>
            <input
              id="transcript-upload"
              type="file"
              required
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={handleTranscriptChange}
              className="hidden"
            />
            <span className="text-sm text-slate">
              {transcriptFile ? transcriptFile.name : "No file chosen"}
            </span>
          </div>
          <p className="text-xs text-slate mt-1">
            Only you and our admins can see your transcript.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">
            Profile picture (optional) — JPG, PNG or WebP, max 2 MB
          </label>
          <div className="flex items-center gap-3">
            <label
              htmlFor="photo-upload"
              className="cursor-pointer rounded-full bg-ink text-paper px-5 py-2 text-sm font-medium"
            >
              Choose file
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <span className="text-sm text-slate">
              {photoFile ? photoFile.name : "No file chosen"}
            </span>
          </div>
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-20 h-20 rounded-full object-cover mt-2"
            />
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-ink text-paper px-8 py-3 text-sm font-medium mt-4 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit for review"}
        </button>
      </form>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="w-full max-w-sm rounded-xl bg-paper p-6 shadow-lg">
            <h2 id="confirm-title" className="font-display text-xl text-ink mb-2">
              Are you sure about this information?
            </h2>
            <p className="text-sm text-slate mb-4">
              Students will contact you on this number, so please make sure it
              is correct and has WhatsApp.
            </p>
            <dl className="rounded-lg border border-stone p-4 mb-6 text-sm">
              <dt className="text-slate">Full name</dt>
              <dd className="text-ink font-medium mb-3">{studentName}</dd>
              <dt className="text-slate">Phone / WhatsApp number</dt>
              <dd className="text-ink font-medium">{phone}</dd>
            </dl>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-full border border-stone px-4 py-2 text-sm text-slate"
              >
                Go back
              </button>
              <button
                type="button"
                onClick={submitApplication}
                className="flex-1 rounded-full bg-ink text-paper px-4 py-2 text-sm font-medium"
              >
                Yes, submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
