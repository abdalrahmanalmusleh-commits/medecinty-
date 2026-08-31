import { Suspense } from "react";
import ExamClient from "./ExamClient";

export function generateStaticParams() {
  const baseSubjects = [
    "gastrointestinal", "musculoskeletal", "central-nervous-special-senses",
    "respiratory", "endocrine", "hematology-oncology", "cardiovascular",
    "renal-urinary", "reproductive", "anatomy", "embryology", "physiology",
    "biochemistry-genetics", "histology", "pathology", "pharmacology",
    "microbiology", "immunology", "public-health", "internal-medicine",
    "general-surgery", "pediatrics", "obgyn"
  ];

  const generatedCourseIds: string[] = [];
  for (let i = 1; i <= 999; i++) {
    generatedCourseIds.push(`course-mstox${i}`);
    generatedCourseIds.push(`course-${i}`);
    generatedCourseIds.push(`mstox${i}`);
  }

  const allIds = Array.from(new Set([...baseSubjects, ...generatedCourseIds]));

  return allIds.map(id => ({ subjectId: id }));
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-teal-500">Loading exam...</div>}>
      <ExamClient />
    </Suspense>
  );
}
