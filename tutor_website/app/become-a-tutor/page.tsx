"use client";

import { useState } from "react";
import { faculties } from "@/lib/faculties";

export default function BecomeATutorPage() {
  const [faculty, setFaculty] = useState("");
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

  const majors = faculties.find((f) => f.name === faculty)?.majors ?? [];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: replace with real submission once backend/storage exist.
    // Should create a Tutor record with status: "pending", upload transcriptFile
    // and photoFile to storage, and notify admin for manual GPA/transcript review.
    console.log("Tutor signup submitted:", {
      name,
      faculty,
      major,
      year,
      courses: courses.split(",").map((c) => c.trim()).filter(Boolean),
      price,
      bio,
      phone,
      gpa,
      transcriptFileName: transcriptFile?.name ?? null,
      photoFileName: photoFile?.name ?? null,
      status: "pending",
    });

    setSubmitted(true);
  };

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

        <button
          type="submit"
          className="rounded-full bg-ink text-paper px-8 py-3 text-sm font-medium mt-4"
        >
          Submit for review
        </button>
      </form>
    </div>
  );
}
