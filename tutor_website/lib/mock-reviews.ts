export type Review = {
  id: string;
  tutorId: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
};

export const mockReviews: Review[] = [
  { id: "r1", tutorId: "1", studentName: "Yara S.", rating: 5, comment: "Explained recursion way better than my professor did.", date: "2026-03-01" },
  { id: "r2", tutorId: "1", studentName: "Ali M.", rating: 5, comment: "Very patient, helped me pass my CSC 210 midterm.", date: "2026-03-20" },
  { id: "r3", tutorId: "2", studentName: "Dana K.", rating: 4, comment: "Good session, clear explanations on ratio analysis.", date: "2026-02-25" },
  { id: "r4", tutorId: "4", studentName: "Ramy T.", rating: 5, comment: "Nour's studio feedback saved my final project.", date: "2026-04-05" },
  { id: "r5", tutorId: "5", studentName: "Lina H.", rating: 5, comment: "Made OOP concepts finally click for me.", date: "2026-01-30" },
  { id: "r6", tutorId: "6", studentName: "Fadi Z.", rating: 5, comment: "Best math tutor I've worked with on campus.", date: "2026-02-10" },
  { id: "r7", tutorId: "6", studentName: "Maya R.", rating: 5, comment: "Super clear and structured sessions.", date: "2026-02-18" },
  { id: "r8", tutorId: "7", studentName: "Omar D.", rating: 4, comment: "Solid help with algorithms, a bit fast-paced.", date: "2026-03-02" },
  { id: "r9", tutorId: "8", studentName: "Nadine F.", rating: 5, comment: "Really friendly and easy to understand.", date: "2026-03-18" },
];
