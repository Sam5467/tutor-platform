export type SessionMode = "online" | "in_person" | "both";

export const sessionModes: { value: SessionMode; label: string }[] = [
  { value: "online", label: "Online" },
  { value: "in_person", label: "In person" },
  { value: "both", label: "Online & in person" },
];

export function sessionModeLabel(mode: SessionMode): string {
  return sessionModes.find((m) => m.value === mode)?.label ?? "";
}

// Does a tutor's way of teaching fit what a student is looking for?
export function modeMatches(tutorMode: SessionMode, wanted: SessionMode | "any") {
  return wanted === "any" || tutorMode === "both" || tutorMode === wanted;
}
