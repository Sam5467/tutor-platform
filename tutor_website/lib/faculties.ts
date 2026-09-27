export type SubFaculty = {
  name: string;
  majors: string[];
};

export type Faculty = {
  name: string;
  subFaculties: SubFaculty[];
};

export const faculties: Faculty[] = [
  {
    name: "Faculty of Arts and Sciences",
    subFaculties: [
      {
        name: "Humanities & Social Sciences",
        majors: [
          "Arabic Language and Literature",
          "English Language and Literature",
          "French Language and Literature",
          "Modern Languages and Translation",
          "Education (Basic / Early Childhood)",
          "Journalism and Communication",
          "Psychology",
          "Philosophy",
          "Social Sciences",
          "History",
          "Liturgy",
          "Religious and Pastoral Education",
        ],
      },
      {
        name: "Sciences & Technology",
        majors: [
          "Computer Science",
          "Information Technology",
          "Actuarial and Financial Mathematics",
          "Biology",
          "Biochemistry",
          "Chemistry",
          "Human Nutrition and Dietetics",
        ],
      },
      {
        name: "Arts & Heritage",
        majors: [
          "Cinema and Television",
          "Performing Arts",
          "Conservation",
          "Restoration of Cultural Property",
          "Sacred Art",
        ],
      },
    ],
  },
  {
    name: "USEK Business School (UBS)",
    subFaculties: [
      {
        name: "Business Administration",
        majors: [
          "Audit",
          "Finance",
          "Management and Entrepreneurship",
          "Human Resources",
          "Marketing",
          "Hotel Management",
          "Business Computing",
          "Digital Management",
        ],
      },
    ],
  },
  {
    name: "School of Engineering",
    subFaculties: [
      {
        name: "Engineering Specialties",
        majors: [
          "Biomedical Engineering",
          "Chemical Engineering",
          "Civil Engineering",
          "Computer Engineering",
          "Electrical and Electronics Engineering",
          "Mechanical Engineering",
          "Telecommunications Engineering",
          "Agricultural Engineering",
        ],
      },
    ],
  },
  {
    name: "School of Architecture and Design",
    subFaculties: [
      {
        name: "Design & Architecture",
        majors: [
          "Architecture (Combined Bachelor & Master)",
          "Interior Architecture",
          "Graphic Design",
          "Communication Arts",
          "Digital Media",
        ],
      },
    ],
  },
  {
    name: "School of Law and Political Sciences",
    subFaculties: [
      {
        name: "Legal & Political Tracks",
        majors: [
          "Law Degree (Lebanese Law)",
          "International Relations",
          "Diplomacy and International Security",
          "Business Law",
          "Criminology",
        ],
      },
    ],
  },
  {
    name: "School of Medicine and Medical Sciences",
    subFaculties: [
      {
        name: "Medical Studies",
        majors: [
          "Fundamental Health Sciences (Pre-med path)",
          "Doctor of Medicine (MD)",
        ],
      },
    ],
  },
  {
    name: "School of Music and Performing Arts",
    subFaculties: [
      {
        name: "Music Studies",
        majors: [
          "Musicology",
          "Musical Education",
          "Music Therapy",
          "Higher Specialized Degree in Music",
        ],
      },
    ],
  },
  {
    name: "Pontifical School of Theology",
    subFaculties: [
      {
        name: "Theology Studies",
        majors: ["Theology", "Holy Writings", "Religious and Pastoral Sciences"],
      },
    ],
  },
  {
    name: "Higher Institute of Nursing Sciences",
    subFaculties: [
      {
        name: "Nursing",
        majors: ["Nursing Sciences"],
      },
    ],
  },
];

// Convenience helper: true only when a faculty has more than one sub-faculty
// (currently only Arts and Sciences), meaning the picker flow should show
// an extra "which sub-faculty" step.
export function hasMultipleSubFaculties(faculty: Faculty): boolean {
  return faculty.subFaculties.length > 1;
}
