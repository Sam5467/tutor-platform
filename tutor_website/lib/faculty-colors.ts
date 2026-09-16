// Fixed, literal Tailwind classes only — Tailwind can't see dynamically
// concatenated class names (e.g. `${color}${opacity}`) at build time.
export const vividColors: { bg: string; text: string }[] = [
  { bg: "bg-[#2F6F6D]", text: "text-paper" }, // deep teal
  { bg: "bg-[#B5533C]", text: "text-paper" }, // muted terracotta
  { bg: "bg-[#6B4C6B]", text: "text-paper" }, // dusty plum
  { bg: "bg-brass", text: "text-ink" },        // brand brass gold
];

export const facultyColorIndex: Record<string, number> = {
  "Faculty of Engineering": 0,
  "Faculty of Business Administration": 1,
  "Faculty of Arts and Sciences": 2,
  "Faculty of Architecture, Art and Design": 3,
};
