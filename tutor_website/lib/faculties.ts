export type Faculty = {
  name: string;
  majors: string[];
};

export const faculties: Faculty[] = [
  {
    name: "Faculty of Business Administration",
    majors: ["Finance", "Marketing", "Accounting"],
  },
  {
    name: "Faculty of Engineering",
    majors: ["Computer Engineering", "Civil Engineering", "Mechanical Engineering"],
  },
  {
    name: "Faculty of Arts and Sciences",
    majors: ["Psychology", "Political Science", "Biology"],
  },
  {
    name: "Faculty of Architecture, Art and Design",
    majors: ["Architecture", "Interior Design"],
  },
];
