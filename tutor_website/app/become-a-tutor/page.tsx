"use client";

import { useEffect, useState } from "react";
import { faculties } from "@/lib/faculties";
import { createClient } from "@/lib/supabase/client";

export default function BecomeATutorPage() {
  const [faculty, setFaculty] = useState("");
  const [subFaculty, setSubFaculty] = useState("");
  const [major, setMajor] = useState("");
  const [name, setName] = useState("");
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
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  useEffect(() => {
    async function checkExisting() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("tutors")
          .select("status")
          .eq("student_id", user.id)
          .maybeSingle();
        setExistingStatus(data?.status ?? null);
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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

    // NOTE: transcriptFile and photoFile are selected in the form but not
    // uploaded yet — real file storage is a separate step we're doing later.
    const { error: insertError } = await supabase.from("tutors").insert({
      student_id: user.id,
      full_name: name,
      faculty,
      major,
      year,
      courses,
      price: Number(price),
      bio,
      phone,
      gpa: Number(gpa),
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

  if (existingStatus && !submitted) {
    const messages: Record<string, string> = {
      pending:
        "Your application is under review. We'll reach out once it's been checked.",
      approved: "Your tutor listing is approved and live on the site.",
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">Full name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

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
            Transcript (proof of GPA) — PDF or image
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
              accept=".pdf,image/*"
              onChange={(e) => setTranscriptFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <span className="text-sm text-slate">
              {transcriptFile ? transcriptFile.name : "No file chosen"}
            </span>
          </div>
          <p className="text-xs text-slate mt-1">
            File upload isn't wired up yet — this is just a placeholder for now.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">
            Profile picture (optional)
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
              accept="image/*"
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
    </div>
  );
}
