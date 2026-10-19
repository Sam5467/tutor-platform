"use client";

import { FormSkeleton } from "@/components/skeleton";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fields } from "@/lib/fields";
import { universities } from "@/lib/universities";
import { sessionModes, type SessionMode } from "@/lib/session-modes";
import { createClient } from "@/lib/supabase/client";
import { ReviewsSection } from "@/components/reviews-section";
import { normalizePhone } from "@/lib/phone";
import { dbErrorMessage } from "@/lib/errors";
import {
  PHOTO_RULE,
  TRANSCRIPT_RULE,
  buildUploadPath,
  validateUpload,
} from "@/lib/uploads";

export default function BecomeATutorPage() {
  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");
  const [major, setMajor] = useState("");
  const [otherMajor, setOtherMajor] = useState("");
  const [sessionMode, setSessionMode] = useState<SessionMode>("both");
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
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [existingTutorId, setExistingTutorId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  // Testing locally while logged out: the form works but nothing is saved.
  const [previewOnly, setPreviewOnly] = useState(false);

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
      } else if (process.env.NODE_ENV === "development") {
        setPreviewOnly(true);
        setStudentName("Test Student");
      }
      setCheckingExisting(false);
    }

    checkExisting();
  }, []);

  const OTHER_MAJOR = "__other";
  const majors = fields.find((f) => f.name === faculty)?.majors ?? [];
  const finalMajor = major === OTHER_MAJOR ? otherMajor.trim() : major;

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

    const cleaned = normalizePhone(phone);
    if (!cleaned) {
      setError(
        "That doesn't look like a valid phone number. Please include your country code, e.g. 96170123456."
      );
      return;
    }

    setNormalizedPhone(cleaned);
    setShowConfirm(true);
  };

  const submitApplication = async () => {
    setError("");
    setShowConfirm(false);

    if (previewOnly) {
      setSubmitted(true);
      return;
    }

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

    // One checked step on the server saves the public listing and the
    // private details (phone, GPA, transcript) together.
    const { error: insertError } = await supabase.rpc(
      "submit_tutor_application",
      {
        p_university: university,
        p_faculty: faculty,
        p_major: finalMajor,
        p_year: year,
        p_courses: courses,
        p_price: Number(price),
        p_bio: bio,
        p_phone: normalizedPhone,
        p_gpa: Number(gpa),
        p_transcript_path: transcriptPath,
        p_profile_picture_path: photoPath,
        p_session_mode: sessionMode,
      }
    );

    setLoading(false);

    if (insertError) {
      setError(
        dbErrorMessage(insertError, {
          "23505": "You've already applied to be a tutor.",
        })
      );
      return;
    }

    setSubmitted(true);
  };

  if (checkingExisting) {
    return <FormSkeleton fields={9} />;
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

      {previewOnly && (
        <p className="text-xs text-ink bg-stone/40 rounded-lg p-3 text-center mb-4">
          Test mode: you&apos;re not logged in, so nothing you submit here is
          saved.
        </p>
      )}

      <p className="text-sm text-slate text-center mb-6">
        Applying as <span className="text-ink font-medium">{studentName}</span>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">University</label>
          <select
            required
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          >
            <option value="" disabled>
              Select university
            </option>
            {universities.map((u) => (
              <option key={u.short} value={u.short}>
                {u.name} ({u.short})
              </option>
            ))}
          </select>
          <p className="text-xs text-slate">
            You can&apos;t change this later, so choose carefully.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">Field</label>
          <select
            required
            value={faculty}
            onChange={(e) => {
              setFaculty(e.target.value);
              setMajor("");
              setOtherMajor("");
            }}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          >
            <option value="" disabled>
              Select field
            </option>
            {fields.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

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
            <option value={OTHER_MAJOR}>My major isn&apos;t listed</option>
          </select>
          {major === OTHER_MAJOR && (
            <>
              <input
                type="text"
                required
                maxLength={100}
                value={otherMajor}
                onChange={(e) => setOtherMajor(e.target.value)}
                placeholder="Type your major"
                className="border border-stone rounded-lg py-2 px-4 text-ink mt-2"
              />
              <p className="text-xs text-slate">
                We&apos;ll check it and add it to the list.
              </p>
            </>
          )}
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
            Courses you can tutor (name or code, comma-separated)
          </label>
          <textarea
            required
            maxLength={300}
            value={courses}
            onChange={(e) => setCourses(e.target.value)}
            placeholder="Calculus II, MATH 202, CSC 210"
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
            max={1000}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">How do you teach?</label>
          <select
            value={sessionMode}
            onChange={(e) => setSessionMode(e.target.value as SessionMode)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          >
            {sessionModes.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">Bio</label>
          <textarea
            required
            maxLength={1000}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
            rows={4}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">
            Phone / WhatsApp number (with country code)
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
            Transcript — PDF, JPG, PNG or WebP, max 5 MB
          </label>
          <p className="text-xs text-ink">
            Your transcript must clearly show your <strong>GPA</strong> and
            your <strong>university student ID</strong>. Applications without both
            can't be approved.
          </p>
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

        <p className="text-xs text-slate text-center">
          By submitting you confirm your information is true and you agree to
          our{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          (including the listing fee) and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
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
              <dt className="text-slate">University</dt>
              <dd className="text-ink font-medium mb-3">{university}</dd>
              <dt className="text-slate">Phone / WhatsApp number</dt>
              <dd className="text-ink font-medium">+{normalizedPhone}</dd>
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
