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

  return baseSubjects.map(id => ({ subjectId: id }));
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-teal-500">Loading exam...</div>}>
      <ExamClient />
    </Suspense>
  );
}
