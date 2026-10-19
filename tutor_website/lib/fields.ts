// One shared list of fields and majors for every university. A tutor from any
// university picks from here, so students find tutors by subject, not campus.
export type Field = {
  name: string;
  majors: string[];
};

export const fields: Field[] = [
  {
    name: "Engineering",
    majors: [
      "Biomedical Engineering",
      "Chemical Engineering",
      "Civil Engineering",
      "Computer Engineering",
      "Electrical and Electronics Engineering",
      "Mechanical Engineering",
      "Industrial Engineering",
      "Mechatronics Engineering",
      "Petroleum Engineering",
      "Telecommunications Engineering",
      "Agricultural Engineering",
    ],
  },
  {
    name: "Architecture and Design",
    majors: [
      "Architecture",
      "Interior Architecture",
      "Graphic Design",
      "Digital Media",
    ],
  },
  {
    name: "Computer Science and IT",
    majors: [
      "Computer Science",
      "Information Technology",
      "Information Systems",
      "Data Science",
      "Cybersecurity",
    ],
  },
  {
    name: "Business and Economics",
    majors: [
      "Accounting and Audit",
      "Banking and Finance",
      "Business Administration",
      "Business Computing",
      "Digital Management",
      "Economics",
      "Hotel Management",
      "Human Resources",
      "Management and Entrepreneurship",
      "Marketing",
    ],
  },
  {
    name: "Natural Sciences",
    majors: [
      "Actuarial and Financial Mathematics",
      "Biochemistry",
      "Biology",
      "Chemistry",
      "Environmental Science",
      "Geology",
      "Mathematics",
      "Physics",
      "Statistics",
    ],
  },
  {
    name: "Health and Medicine",
    majors: [
      "Medicine (MD)",
      "Pre-Med (Fundamental Health Sciences)",
      "Dentistry",
      "Pharmacy",
      "Nursing",
      "Human Nutrition and Dietetics",
      "Medical Laboratory Sciences",
      "Physical Therapy",
      "Public Health",
    ],
  },
  {
    name: "Law and Political Science",
    majors: [
      "Law",
      "Business Law",
      "Criminology",
      "Diplomacy and International Security",
      "International Relations",
      "Political Science",
    ],
  },
  {
    name: "Humanities and Languages",
    majors: [
      "Arabic Language and Literature",
      "English Language and Literature",
      "French Language and Literature",
      "Modern Languages and Translation",
      "History",
      "Philosophy",
      "Archaeology",
    ],
  },
  {
    name: "Education and Social Sciences",
    majors: [
      "Education",
      "Psychology",
      "Sociology",
      "Social Work",
    ],
  },
  {
    name: "Media and Arts",
    majors: [
      "Journalism and Communication",
      "Cinema and Television",
      "Communication Arts",
      "Advertising",
      "Performing Arts",
      "Fine Arts",
      "Musicology and Music Education",
      "Music Therapy",
      "Conservation and Restoration",
      "Sacred Art",
    ],
  },
  {
    name: "Theology and Religious Studies",
    majors: [
      "Theology",
      "Holy Writings",
      "Liturgy",
      "Religious and Pastoral Education",
    ],
  },
];
