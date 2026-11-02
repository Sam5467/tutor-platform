"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { dbErrorMessage } from "@/lib/errors";
import { normalizePhone } from "@/lib/phone";
import { universities } from "@/lib/universities";
import { fields } from "@/lib/fields";
import { sessionModes, type SessionMode } from "@/lib/session-modes";

export type EditableTutor = {
  id: string;
  full_name: string;
  university: string;
  faculty: string;
  major: string;
  year: string;
  courses: string;
  price: number | string;
  bio: string | null;
  session_mode: SessionMode;
  phone: string | null;
  gpa: number | null;
};

type AdminEditTutorProps = {
  tutor: EditableTutor;
  onSaved: (updated: EditableTutor) => void;
  onCancel: () => void;
};

const inputClass = "border border-stone rounded-lg py-2 px-3 text-ink text-sm";

// Lets an admin fix anything a tutor typed wrong in their application.
export function AdminEditTutor({ tutor, onSaved, onCancel }: AdminEditTutorProps) {
  const [fullName, setFullName] = useState(tutor.full_name);
  const [university, setUniversity] = useState(tutor.university);
  const [faculty, setFaculty] = useState(tutor.faculty);
  const [major, setMajor] = useState(tutor.major);
  const [year, setYear] = useState(tutor.year);
  const [courses, setCourses] = useState(tutor.courses);
  const [price, setPrice] = useState(String(Number(tutor.price)));
  const [bio, setBio] = useState(tutor.bio ?? "");
  const [sessionMode, setSessionMode] = useState<SessionMode>(tutor.session_mode);
  const [phone, setPhone] = useState(tutor.phone ?? "");
  const [gpa, setGpa] = useState(tutor.gpa !== null ? String(tutor.gpa) : "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const majorsInField = fields.find((f) => f.name === faculty)?.majors ?? [];
  // Keep values that aren't in the lists (older or typed-in ones) selectable.
  const universityOptions = universities.some((u) => u.short === university)
    ? universities.map((u) => u.short)
    : [university, ...universities.map((u) => u.short)];
  const fieldOptions = fields.some((f) => f.name === faculty)
    ? fields.map((f) => f.name)
    : [faculty, ...fields.map((f) => f.name)];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanedPhone = normalizePhone(phone);
    if (!cleanedPhone) {
      setError("That phone number doesn't look valid. Include the country code, e.g. 96170123456.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: saveError } = await supabase.rpc("admin_update_tutor", {
      p_tutor_id: tutor.id,
      p_full_name: fullName,
      p_university: university,
      p_faculty: faculty,
      p_major: major,
      p_year: year,
      p_courses: courses,
      p_price: Number(price),
      p_bio: bio,
      p_session_mode: sessionMode,
      p_phone: cleanedPhone,
      p_gpa: Number(gpa),
    });
    setSaving(false);

    if (saveError) {
      setError(dbErrorMessage(saveError));
      return;
    }

    onSaved({
      ...tutor,
      full_name: fullName.trim(),
      university: university.trim(),
      faculty: faculty.trim(),
      major: major.trim(),
      year: year.trim(),
      courses: courses.trim(),
      price: Number(price),
      bio,
      session_mode: sessionMode,
      phone: cleanedPhone,
      gpa: Number(gpa),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 pb-5 text-sm"
    >
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate">Full name</span>
        <input required maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate">University</span>
        <select value={university} onChange={(e) => setUniversity(e.target.value)} className={inputClass}>
          {universityOptions.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate">Field</span>
        <select value={faculty} onChange={(e) => setFaculty(e.target.value)} className={inputClass}>
          {fieldOptions.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate">Major (pick or type)</span>
        <input
          required
          maxLength={100}
          list={`majors-${tutor.id}`}
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          className={inputClass}
        />
        <datalist id={`majors-${tutor.id}`}>
          {majorsInField.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate">Year</span>
        <input required maxLength={30} value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate">Price / session ($)</span>
        <input required type="number" min={1} max={1000} value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate">How they teach</span>
        <select value={sessionMode} onChange={(e) => setSessionMode(e.target.value as SessionMode)} className={inputClass}>
          {sessionModes.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate">Phone (with country code)</span>
        <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate">GPA (0 to 4)</span>
        <input required type="number" min={0} max={4} step="0.01" value={gpa} onChange={(e) => setGpa(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-xs text-slate">Courses (comma-separated)</span>
        <textarea required maxLength={300} rows={2} value={courses} onChange={(e) => setCourses(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-xs text-slate">Bio</span>
        <textarea maxLength={1000} rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className={inputClass} />
      </label>

      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}

      <div className="sm:col-span-2 flex gap-3">
        <button type="button" onClick={onCancel} className="rounded-full border border-stone px-5 py-2 text-xs text-slate">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="rounded-full bg-ink text-paper px-5 py-2 text-xs font-medium disabled:opacity-60">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
