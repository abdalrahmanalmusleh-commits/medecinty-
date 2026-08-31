"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ArrowRight, Clock, Award, RotateCw, AlertTriangle, 
  Settings, CheckCircle2, X, Flag, Trash2, Plus, 
  Search, Calculator as CalcIcon, FlaskConical, Sparkles, Eye, Check,
  Pause, Play, CheckSquare, Square, Layers, Table as TableIcon,
  Image as ImageIcon, Edit3
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { subjectData } from "@/data/subjectData";

interface QuestionTable {
  headers: string[];
  rows: string[][];
}

interface ExamQuestion {
  id?: string;
  blockNumber: number; // 1, 2, 3...
  question: string;
  questionImageUrl?: string;
  tableData?: QuestionTable;
  options: string[];
  correctAnswer: number;
  explanation: string;
  explanationImageUrl?: string;
  clinicalPearl?: string;
}

export function getLetterGrade(score: number): string {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "B-";
  if (score >= 70) return "C+";
  if (score >= 65) return "C";
  if (score >= 60) return "C-";
  if (score >= 50) return "D";
  return "F";
}

interface LabItem {
  isHeader?: boolean;
  name: string;
  range: string;
  si: string;
}

interface LabCategory {
  id: string;
  title: string;
  items: LabItem[];
}

// Complete Official Standard USMLE Normal Laboratory Values Database
const LAB_CATEGORIES: LabCategory[] = [
  {
    id: "serum",
    title: "Serum",
    items: [
      { isHeader: true, name: "Serum", range: "Reference Range", si: "SI Reference" },
      { name: "Alanine aminotransferase (ALT)", range: "10–40 U/L", si: "10–40 U/L" },
      { name: "Aspartate aminotransferase (AST)", range: "12–38 U/L", si: "12–38 U/L" },
      { name: "Alkaline phosphatase", range: "25–100 U/L", si: "25–100 U/L" },
      { name: "Amylase", range: "25–125 U/L", si: "25–125 U/L" },
      { name: "Bilirubin, Total // Direct", range: "0.1–1.0 mg/dL // 0.0–0.3 mg/dL", si: "2–17 µmol/L // 0–5 µmol/L" },
      { name: "Calcium", range: "8.4–10.2 mg/dL", si: "2.1–2.6 mmol/L" },
      { isHeader: true, name: "Cholesterol", range: "", si: "" },
      { name: "  Total", range: "Normal: <200 mg/dL // High: >240 mg/dL", si: "<5.2 mmol/L // >6.2 mmol/L" },
      { name: "  HDL", range: "40–60 mg/dL", si: "1.0–1.6 mmol/L" },
      { name: "  LDL", range: "<160 mg/dL", si: "<4.2 mmol/L" },
      { name: "  Triglycerides", range: "Normal: <150 mg/dL // Borderline: 151–199 mg/dL", si: "<1.70 mmol/L // 1.71–2.25 mmol/L" },
      { name: "Cortisol", range: "0800 h: 5–23 µg/dL // 1600 h: 3–15 µg/dL // 2000 h: <50% of 0800 h", si: "138–635 nmol/L // 82–413 nmol/L // Fraction of 0800 h: <0.50" },
      { name: "Creatine kinase", range: "Male: 25–90 U/L // Female: 10–70 U/L", si: "25–90 U/L // 10–70 U/L" },
      { name: "Creatinine", range: "0.6–1.2 mg/dL", si: "53–106 µmol/L" },
      { name: "Urea nitrogen", range: "7–18 mg/dL", si: "2.5–6.4 mmol/L" },
      { name: "Creatinine clearance", range: "Male: 97–137 mL/min // Female: 88–128 mL/min", si: "97–137 mL/min // 88–128 mL/min" },
      { isHeader: true, name: "Electrolytes, serum", range: "", si: "" },
      { name: "  Sodium (Na+)", range: "136–146 mEq/L", si: "136–146 mmol/L" },
      { name: "  Potassium (K+)", range: "3.5–5.0 mEq/L", si: "3.5–5.0 mmol/L" },
      { name: "  Chloride (Cl-)", range: "95–105 mEq/L", si: "95–105 mmol/L" },
      { name: "  Bicarbonate (HCO3-)", range: "22–28 mEq/L", si: "22–28 mmol/L" },
      { name: "  Magnesium (Mg2+)", range: "1.5–2.0 mg/dL", si: "0.75–1.0 mmol/L" },
      { name: "  Phosphorus (inorganic)", range: "3.0–4.5 mg/dL", si: "1.0–1.5 mmol/L" },
      { name: "Ferritin", range: "Male: 20–250 ng/mL // Female: 10–120 ng/mL", si: "20–250 µg/L // 10–120 µg/L" },
      { name: "Follicle-stimulating hormone", range: "Male: 4–25 mIU/mL // Female: follicular phase 4–30 mIU/mL, midcycle peak 10–90 mIU/mL, postmenopause 40–250 mIU/mL", si: "4–25 U/L // 4–30 U/L // 10–90 U/L // 40–250 U/L" },
      { name: "Glucose", range: "Fasting: 70–100 mg/dL // Random, non-fasting: <140 mg/dL", si: "3.8–5.6 mmol/L // <7.77 mmol/L" },
      { name: "Growth hormone - arginine stimulation", range: "Fasting: <5 ng/mL // Provocative stimuli: >7 ng/mL", si: "<5 µg/L // >7 µg/L" },
      { name: "Iron", range: "Male: 65–175 µg/dL // Female: 50–170 µg/dL", si: "11.6–31.3 µmol/L // 9.0–30.4 µmol/L" },
      { name: "Total iron-binding capacity", range: "250–400 µg/dL", si: "44.8–71.6 µmol/L" },
      { name: "Transferrin", range: "200–360 mg/dL", si: "2.0–3.6 g/L" },
      { name: "Lactate dehydrogenase", range: "45–200 U/L", si: "45–200 U/L" },
      { name: "Lipase", range: "13–60 U/L", si: "13–60 U/L" },
      { name: "Luteinizing hormone", range: "Male: 6–23 mIU/mL // Female: follicular phase 5–30 mIU/mL, midcycle 75–150 mIU/mL, postmenopause 30–200 mIU/mL", si: "6–23 U/L // 5–30 U/L // 75–150 U/L // 30–200 U/L" },
      { name: "Osmolality", range: "275–295 mOsmol/kg H2O", si: "275–295 mOsmol/kg H2O" },
      { name: "Intact parathyroid hormone (PTH)", range: "10–60 pg/mL", si: "10–60 ng/L" },
      { name: "Prolactin (hPRL)", range: "Male: <17 ng/mL // Female: <25 ng/mL", si: "<17 µg/L // <25 µg/L" },
      { isHeader: true, name: "Proteins", range: "", si: "" },
      { name: "  Total", range: "6.0–7.8 g/dL", si: "60–78 g/L" },
      { name: "  Albumin", range: "3.5–5.5 g/dL", si: "35–55 g/L" },
      { name: "  Globulin", range: "2.3–3.5 g/dL", si: "23–35 g/L" },
      { name: "Troponin I", range: "≤0.04 ng/mL", si: "≤0.04 µg/L" },
      { name: "TSH", range: "0.4–4.0 µU/mL", si: "0.4–4.0 mIU/L" },
      { name: "Thyroidal iodine (123I) uptake", range: "8%–30% of administered dose/24 h", si: "0.08–0.30/24 h" },
      { name: "Thyroxine (T4)", range: "5–12 µg/dL", si: "64–155 nmol/L" },
      { name: "Free T4", range: "0.9–1.7 ng/dL", si: "12.0–21.9 pmol/L" },
      { name: "Triiodothyronine (T3) (RIA)", range: "100–200 ng/dL", si: "1.5–3.1 nmol/L" },
      { name: "Triiodothyronine (T3) resin uptake", range: "25%–35%", si: "0.25–0.35" },
      { name: "Uric acid", range: "3.0–8.2 mg/dL", si: "0.18–0.48 mmol/L" },
      { isHeader: true, name: "Immunoglobulins", range: "", si: "" },
      { name: "  IgA", range: "76–390 mg/dL", si: "0.76–3.90 g/L" },
      { name: "  IgE", range: "0–380 IU/mL", si: "0–380 kIU/L" },
      { name: "  IgG", range: "650–1500 mg/dL", si: "6.5–15.0 g/L" },
      { name: "  IgM", range: "50–300 mg/dL", si: "0.5–3.0 g/L" },
      { isHeader: true, name: "Gases, arterial blood (room air)", range: "", si: "" },
      { name: "  pH", range: "7.35–7.45", si: "[H+] 36–44 nmol/L" },
      { name: "  Pco2", range: "33–45 mm Hg", si: "4.4–5.9 kPa" },
      { name: "  Po2", range: "75–105 mm Hg", si: "10.0–14.0 kPa" }
    ]
  },
  {
    id: "csf",
    title: "Cerebrospinal",
    items: [
      { isHeader: true, name: "Cerebrospinal Fluid", range: "Reference Range", si: "SI Reference" },
      { name: "Cell count", range: "0–5/mm³", si: "0–5 × 10⁶/L" },
      { name: "Chloride", range: "118–132 mEq/L", si: "118–132 mmol/L" },
      { name: "Gamma globulin", range: "3%–12% total proteins", si: "0.03–0.12" },
      { name: "Glucose", range: "40–70 mg/dL", si: "2.2–3.9 mmol/L" },
      { name: "Pressure", range: "70–180 mm H₂O", si: "70–180 mm H₂O" },
      { name: "Proteins, total", range: "<40 mg/dL", si: "<0.40 g/L" }
    ]
  },
  {
    id: "blood",
    title: "Blood",
    items: [
      { isHeader: true, name: "Hematologic", range: "Reference Range", si: "SI Reference" },
      { name: "Erythrocyte count", range: "Male: 4.3–5.9 million/mm³ // Female: 3.5–5.5 million/mm³", si: "4.3–5.9 × 10¹²/L // 3.5–5.5 × 10¹²/L" },
      { name: "Erythrocyte sedimentation rate (Westergren)", range: "Male: 0–15 mm/h // Female: 0–20 mm/h", si: "0–15 mm/h // 0–20 mm/h" },
      { name: "Hematocrit", range: "Male: 41%–53% // Female: 36%–46%", si: "0.41–0.53 // 0.36–0.46" },
      { name: "Hemoglobin, blood", range: "Male: 13.5–17.5 g/dL // Female: 12.0–16.0 g/dL", si: "135–175 g/L // 120–160 g/L" },
      { name: "Hemoglobin A1c", range: "≤6%", si: "≤42 mmol/mol" },
      { name: "Hemoglobin, plasma", range: "<4 mg/dL", si: "<0.62 mmol/L" },
      { name: "Leukocyte count (WBC)", range: "4500–11,000/mm³", si: "4.5–11.0 × 10⁹/L" },
      { name: "  Neutrophils, segmented", range: "54%–62%", si: "0.54–0.62" },
      { name: "  Neutrophils, bands", range: "3%–5%", si: "0.03–0.05" },
      { name: "  Eosinophils", range: "1%–3%", si: "0.01–0.03" },
      { name: "  Basophils", range: "0%–0.75%", si: "0.00–0.0075" },
      { name: "  Lymphocytes", range: "25%–33%", si: "0.25–0.33" },
      { name: "  Monocytes", range: "3%–7%", si: "0.03–0.07" },
      { name: "CD4+ T-lymphocyte count", range: ">500/mm³", si: ">0.5 × 10⁹/L" },
      { name: "Platelet count", range: "150,000–400,000/mm³", si: "150–400 × 10⁹/L" },
      { name: "Reticulocyte count", range: "0.5%–1.5%", si: "0.005–0.015" },
      { name: "D-Dimer", range: "≤250 ng/mL", si: "≤1.4 nmol/L" },
      { name: "Partial thromboplastin time (PTT) (activated)", range: "25–40 seconds", si: "25–40 seconds" },
      { name: "Prothrombin time (PT)", range: "11–15 seconds", si: "11–15 seconds" },
      { name: "Mean corpuscular hemoglobin (MCH)", range: "25–35 pg/cell", si: "0.39–0.54 fmol/cell" },
      { name: "Mean corpuscular hemoglobin concentration (MCHC)", range: "31%–36% Hb/cell", si: "4.8–5.6 mmol Hb/L" },
      { name: "Mean corpuscular volume (MCV)", range: "80–100 µm³", si: "80–100 fL" },
      { isHeader: true, name: "Volume", range: "", si: "" },
      { name: "  Plasma", range: "Male: 25–43 mL/kg // Female: 28–45 mL/kg", si: "0.025–0.043 L/kg // 0.028–0.045 L/kg" },
      { name: "  Red cell", range: "Male: 20–36 mL/kg // Female: 19–31 mL/kg", si: "0.020–0.036 L/kg // 0.019–0.031 L/kg" }
    ]
  },
  {
    id: "urine",
    title: "Urine and BMI",
    items: [
      { isHeader: true, name: "Urine", range: "Reference Range", si: "SI Reference" },
      { name: "Calcium", range: "100–300 mg/24 h", si: "2.5–7.5 mmol/24 h" },
      { name: "Creatinine clearance", range: "Male: 97–137 mL/min // Female: 88–128 mL/min", si: "97–137 mL/min // 88–128 mL/min" },
      { name: "Osmolality", range: "50–1200 mOsmol/kg H₂O", si: "50–1200 mOsmol/kg H₂O" },
      { name: "Oxalate", range: "8–40 µg/mL", si: "90–445 µmol/L" },
      { name: "Proteins, total", range: "<150 mg/24 h", si: "<0.15 g/24 h" },
      { name: "17-Hydroxycorticosteroids", range: "Male: 3.0–10.0 mg/24 h // Female: 2.0–8.0 mg/24 h", si: "8.2–27.6 µmol/24 h // 5.5–22.0 µmol/24 h" },
      { name: "17-Ketosteroids, total", range: "Male: 8–20 mg/24 h // Female: 6–15 mg/24 h", si: "28–70 µmol/24 h // 21–52 µmol/24 h" },
      { isHeader: true, name: "Body Mass Index (BMI)", range: "Reference Range", si: "" },
      { name: "Body Mass Index (BMI)", range: "Adult: 19–25 kg/m²", si: "19–25 kg/m²" }
    ]
  }
];

export default function SubjectExamPage() {
  const { language } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = params.subjectId as string;
  const sectionId = searchParams.get("sectionId");
  const [subjectName, setSubjectName] = useState("");

  // Block & Question States
  const [activeBlock, setActiveBlock] = useState(1);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Record<string, boolean>>({});
  const [strikethroughOptions, setStrikethroughOptions] = useState<Record<string, Record<number, boolean>>>({});
  const [examFinished, setExamFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  // Docked Lab Values State
  const [showLabValues, setShowLabValues] = useState(false);
  const [activeLabTab, setActiveLabTab] = useState("serum");
  const [showSIUnits, setShowSIUnits] = useState(true);
  const [labSearchQuery, setLabSearchQuery] = useState("");

  // Calculator State with full USMLE functions (Square Root, Reciprocal, Memory)
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcPrevVal, setCalcPrevVal] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcWaitingForOperand, setCalcWaitingForOperand] = useState(false);
  const [calcMemory, setCalcMemory] = useState<number | null>(null);

  // Modals
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showAdminAddQ, setShowAdminAddQ] = useState(false);
  const [showBlockSwitcher, setShowBlockSwitcher] = useState(false);

  // Timer per Block (1 Hour = 3600 seconds)
  const [blockTimeLeft, setBlockTimeLeft] = useState<Record<number, number>>({ 1: 3600 });
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // All Questions (Across all blocks)
  const [allQuestions, setAllQuestions] = useState<ExamQuestion[]>([]);

  // Admin New Question Form State
  const [formBlockNum, setFormBlockNum] = useState(1);
  const [formQuestionText, setFormQuestionText] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formOptions, setFormOptions] = useState<string[]>([
    "A. ",
    "B. ",
    "C. ",
    "D. ",
    "E. "
  ]);
  const [formCorrectIndex, setFormCorrectIndex] = useState(0);
  const [formExplanation, setFormExplanation] = useState("");
  const [formClinicalPearl, setFormClinicalPearl] = useState("");
  
  // Custom Table Builder in Admin Form
  const [hasCustomTable, setHasCustomTable] = useState(false);
  const [tableHeaders, setTableHeaders] = useState<string[]>([
    "Option", "Serum glucose (mg/dL)", "Serum osmolality (mOsmol/kg H₂O)", "Serum sodium (mEq/L)", "Serum bicarbonate (mEq/L)"
  ]);
  const [tableRows, setTableRows] = useState<string[][]>([
    ["A", "840", "330", "132", "23"],
    ["B", "670", "325", "147", "26"],
    ["C", "410", "268", "131", "27"],
    ["D", "145", "322", "152", "22"],
    ["E", "490", "310", "130", "14"]
  ]);

  // Load subject, admin status, and questions
  useEffect(() => {
    const role = localStorage.getItem("medicinety_user_role");
    const isPrev = localStorage.getItem("medicinety_preview_as_student") === "true";
    setIsAdmin(role === "admin" && !isPrev);

    if (!subjectId) return;

    let sName = "";
    const defaultSubject = subjectData[subjectId];
    if (defaultSubject) sName = defaultSubject.name;

    const savedMeta = localStorage.getItem(`medicinety_subject_${subjectId}_meta`);
    if (savedMeta) {
      try {
        const parsed = JSON.parse(savedMeta);
        if (parsed.name) sName = parsed.name;
      } catch (e) {}
    }

    if (!sName) {
      const gp = localStorage.getItem("medicinety_general_principles_list");
      const sys = localStorage.getItem("medicinety_systems_list");
      const clin = localStorage.getItem("medicinety_clinical_list");
      let foundMod: any = null;
      if (gp) { try { foundMod = JSON.parse(gp).find((m: any) => m.id === subjectId); } catch(e){} }
      if (!foundMod && sys) { try { foundMod = JSON.parse(sys).find((m: any) => m.id === subjectId); } catch(e){} }
      if (!foundMod && clin) { try { foundMod = JSON.parse(clin).find((m: any) => m.id === subjectId); } catch(e){} }
      if (foundMod) {
        sName = language === "ar" ? (foundMod.name_ar || foundMod.name) : (foundMod.name_en || foundMod.name);
      } else {
        sName = subjectId.replace(/_/g, " ").toUpperCase();
      }
    }
    setSubjectName(sName || subjectId);

    // Load Exam Questions
    let loadedQuestions: ExamQuestion[] = [];
    const savedExam = localStorage.getItem(`medicinety_subject_${subjectId}_exam_blocks_q`);
    if (savedExam) {
      try {
        const parsed = JSON.parse(savedExam);
        if (Array.isArray(parsed) && parsed.length > 0) loadedQuestions = parsed;
      } catch (e) {}
    }

    // Default Seed Questions with Multiple Blocks & Clinical Lab Table
    if (loadedQuestions.length === 0) {
      loadedQuestions = [
        {
          id: "b1_q1",
          blockNumber: 1,
          question: "A 36-year-old woman comes to the physician for evaluation of unintentional weight gain of 5.5 kg (12.2 lb) and irregular menstrual cycles over the past 2 months. She does not take any medications. Her blood pressure is 155/85 mm Hg. Physical examination shows central obesity, hyperpigmentation of the palmar creases, and violaceous scarring of the abdomen. Early morning serum cortisol levels are elevated and serum adrenocorticotropic hormone (ACTH) is within the reference range after a low-dose dexamethasone suppression test. A high-dose dexamethasone suppression test shows suppression of ACTH. Further evaluation is most likely to show which of the following findings?",
          options: [
            "A. Atrophy of the pituitary gland",
            "B. Benign adenoma of the adrenal medulla",
            "C. Nodular hypertrophy of the zona reticularis",
            "D. Bilateral hyperplasia of the zona fasciculata",
            "E. Unilateral carcinoma of the adrenal cortex"
          ],
          correctAnswer: 3,
          explanation: "This patient presents with Cushing disease (ACTH-secreting pituitary adenoma). Suppression of cortisol/ACTH with a high-dose (8 mg) dexamethasone suppression test but not with a low-dose test is diagnostic of a pituitary ACTH-secreting adenoma. Pituitary ACTH hypersecretion causes chronic overstimulation of the adrenal cortex, specifically resulting in bilateral hyperplasia of the zona fasciculata (which produces cortisol) and zona reticularis (androgens).",
          clinicalPearl: "High-dose dexamethasone suppression test suppresses pituitary ACTH secretion (Cushing disease) but does NOT suppress ectopic ACTH production (e.g. small cell lung cancer) or autonomous adrenal cortisol secretion."
        },
        {
          id: "b1_q2",
          blockNumber: 1,
          question: "A 62-year-old man is brought to the emergency room by his wife because of worsening confusion and weakness for 3 days. He has type 2 diabetes mellitus, for which he takes insulin. Five days ago, he developed an upper respiratory tract infection. As a result, he has not been following his normal diet and insulin administration schedule. On arrival, he is lethargic and oriented only to self. His vital signs are within normal limits. Urinalysis shows 3+ glucose. Serum test for beta-hydroxybutyrate is negative. Fluid replacement therapy is initiated. Which of the following sets of laboratory values is most likely expected on further evaluation of this patient?",
          tableData: {
            headers: ["Option", "Serum glucose (mg/dL)", "Serum osmolality (mOsmol/kg H₂O)", "Serum sodium (mEq/L)", "Serum bicarbonate (mEq/L)"],
            rows: [
              ["A", "840", "330", "132", "23"],
              ["B", "670", "325", "147", "26"],
              ["C", "410", "268", "131", "27"],
              ["D", "145", "322", "152", "22"],
              ["E", "490", "310", "130", "14"]
            ]
          },
          options: [
            "A. A",
            "B. B",
            "C. C",
            "D. D",
            "E. E"
          ],
          correctAnswer: 0,
          explanation: "This patient presents with Hyperosmolar Hyperglycemic State (HHS), characterized by marked hyperglycemia (>600 mg/dL), severe hyperosmolality (>320 mOsmol/kg), absence of significant ketoacidosis (normal or mildly reduced bicarbonate >18 mEq/L, negative beta-hydroxybutyrate), and pseudohyponatremia due to osmotic fluid shifts from intracellular to extracellular spaces.",
          clinicalPearl: "HHS vs DKA: HHS is characterized by higher glucose (>600 mg/dL), higher osmolality (>320 mOsmol/kg), and normal/near-normal pH and bicarbonate with absent ketones, most commonly in older patients with Type 2 Diabetes."
        },
        {
          id: "b1_q3",
          blockNumber: 1,
          question: "A 45-year-old male presents with persistent epigastric pain that improves immediately upon eating food. Endoscopy reveals a 1.5 cm ulcerated lesion in the duodenal bulb. Rapid urease testing of the antral mucosal biopsy turns pink within 10 minutes. Which of the following is the most definitive first-line therapeutic regimen?",
          options: [
            "A. Triple therapy: PPI + Clarithromycin + Amoxicillin for 14 days",
            "B. High-dose H2-receptor antagonist monotherapy for 6 months",
            "C. Surgical partial gastrectomy with Billroth II gastrojejunostomy",
            "D. Bismuth subsalicylate alone for 4 weeks",
            "E. Oral Metronidazole monotherapy for 7 days"
          ],
          correctAnswer: 0,
          explanation: "The presentation is classic for a Helicobacter pylori-induced duodenal ulcer (pain improved by food). First-line eradication consists of standard triple therapy for 14 days.",
          clinicalPearl: "Duodenal ulcers are almost universally associated with H. pylori (>90%) and pain is relieved by meals."
        }
      ];
    }

    setAllQuestions(loadedQuestions);
  }, [subjectId, sectionId, language]);

  // Current Block's Questions (Max 20 questions per block)
  const currentBlockQuestions = allQuestions.filter(q => Number(q.blockNumber || 1) === Number(activeBlock)).slice(0, 20);

  // Total Available Blocks
  const totalBlocks = Math.max(1, ...allQuestions.map(q => Number(q.blockNumber || 1)));

  // Countdown Timer for Current Block (1 Hour = 3600 seconds)
  const currentTimeLeft = blockTimeLeft[activeBlock] ?? 3600;

  useEffect(() => {
    if (!isTimerPaused && currentTimeLeft > 0 && !examFinished) {
      timerRef.current = setTimeout(() => {
        setBlockTimeLeft(prev => ({
          ...prev,
          [activeBlock]: Math.max(0, (prev[activeBlock] ?? 3600) - 1)
        }));
      }, 1000);
    } else if (currentTimeLeft === 0 && !isTimerPaused && !examFinished) {
      handleFinishExam();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentTimeLeft, isTimerPaused, examFinished, activeBlock]);

  const currQKey = `${activeBlock}_${activeQuestionIdx}`;

  const handleSelectOption = (optIdx: number) => {
    if (examFinished) return;
    setSelectedOption(optIdx);
    setAnswers(prev => ({ ...prev, [currQKey]: optIdx }));
  };

  const toggleStrikethrough = (e: React.MouseEvent, key: string, optIdx: number) => {
    e.stopPropagation();
    setStrikethroughOptions(prev => {
      const qMap = prev[key] || {};
      return {
        ...prev,
        [key]: {
          ...qMap,
          [optIdx]: !qMap[optIdx]
        }
      };
    });
  };

  const handleJumpToQuestion = (idx: number) => {
    setActiveQuestionIdx(idx);
    const targetKey = `${activeBlock}_${idx}`;
    setSelectedOption(answers[targetKey] !== undefined ? answers[targetKey] : null);
  };

  const handleNext = () => {
    if (activeQuestionIdx < currentBlockQuestions.length - 1) {
      const nextIdx = activeQuestionIdx + 1;
      setActiveQuestionIdx(nextIdx);
      const nextKey = `${activeBlock}_${nextIdx}`;
      setSelectedOption(answers[nextKey] !== undefined ? answers[nextKey] : null);
    }
  };

  const handlePrev = () => {
    if (activeQuestionIdx > 0) {
      const prevIdx = activeQuestionIdx - 1;
      setActiveQuestionIdx(prevIdx);
      const prevKey = `${activeBlock}_${prevIdx}`;
      setSelectedOption(answers[prevKey] !== undefined ? answers[prevKey] : null);
    }
  };

  const toggleMarkQuestion = (key: string) => {
    setMarkedQuestions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const switchBlock = (blockNum: number) => {
    setActiveBlock(blockNum);
    setActiveQuestionIdx(0);
    const key = `${blockNum}_0`;
    setSelectedOption(answers[key] !== undefined ? answers[key] : null);
    setShowBlockSwitcher(false);
  };

  const handleFinishExam = () => {
    setIsTimerPaused(true);
    setShowFinishConfirm(false);
    
    let finalScore = 0;
    currentBlockQuestions.forEach((q, idx) => {
      const k = `${activeBlock}_${idx}`;
      if (answers[k] === q.correctAnswer) {
        finalScore++;
      }
    });

    const percentage = currentBlockQuestions.length > 0 ? Math.round((finalScore / currentBlockQuestions.length) * 100) : 0;
    setScore(finalScore);
    setExamFinished(true);

    const user = localStorage.getItem("medicinety_logged_in_user") || "anonymous";
    const storageKey = `medicinety_exam_grades_${user}`;
    try {
      const currentGrades = localStorage.getItem(storageKey);
      const gradesObj = currentGrades ? JSON.parse(currentGrades) : {};
      gradesObj[`${subjectId}_block_${activeBlock}`] = percentage;
      localStorage.setItem(storageKey, JSON.stringify(gradesObj));
    } catch (e) {}
  };

  const handleReturnToCourse = () => {
    if (subjectId) {
      router.push(`/subject/${subjectId}`);
    } else {
      router.push("/medicine");
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCalcDigit = (digit: string) => {
    if (calcWaitingForOperand) {
      setCalcDisplay(digit === "." ? "0." : digit);
      setCalcWaitingForOperand(false);
    } else {
      if (digit === ".") {
        if (!calcDisplay.includes(".")) {
          setCalcDisplay(calcDisplay + ".");
        }
      } else {
        setCalcDisplay(calcDisplay === "0" ? digit : calcDisplay + digit);
      }
    }
  };

  const handleCalcOperator = (nextOp: string) => {
    const inputValue = parseFloat(calcDisplay);

    if (calcPrevVal === null) {
      setCalcPrevVal(inputValue);
    } else if (calcOp && !calcWaitingForOperand) {
      const currentVal = calcPrevVal || 0;
      let newValue = currentVal;
      if (calcOp === "+") newValue = currentVal + inputValue;
      else if (calcOp === "-") newValue = currentVal - inputValue;
      else if (calcOp === "×" || calcOp === "*") newValue = currentVal * inputValue;
      else if (calcOp === "÷" || calcOp === "/") newValue = inputValue !== 0 ? currentVal / inputValue : 0;
      
      setCalcDisplay(String(Number(newValue.toFixed(8))));
      setCalcPrevVal(newValue);
    }

    setCalcWaitingForOperand(true);
    setCalcOp(nextOp);
  };

  const handleCalcEquals = () => {
    const inputValue = parseFloat(calcDisplay);
    if (calcPrevVal !== null && calcOp) {
      let newValue = calcPrevVal;
      if (calcOp === "+") newValue = calcPrevVal + inputValue;
      else if (calcOp === "-") newValue = calcPrevVal - inputValue;
      else if (calcOp === "×" || calcOp === "*") newValue = calcPrevVal * inputValue;
      else if (calcOp === "÷" || calcOp === "/") newValue = inputValue !== 0 ? calcPrevVal / inputValue : 0;

      setCalcDisplay(String(Number(newValue.toFixed(8))));
      setCalcPrevVal(null);
      setCalcOp(null);
      setCalcWaitingForOperand(true);
    }
  };

  const handleCalcSqrt = () => {
    const current = parseFloat(calcDisplay);
    if (current >= 0) {
      const res = Math.sqrt(current);
      setCalcDisplay(String(Number(res.toFixed(8))));
      setCalcWaitingForOperand(true);
    }
  };

  const handleCalcReciprocal = () => {
    const current = parseFloat(calcDisplay);
    if (current !== 0) {
      const res = 1 / current;
      setCalcDisplay(String(Number(res.toFixed(8))));
      setCalcWaitingForOperand(true);
    }
  };

  const handleCalcPlusMinus = () => {
    const current = parseFloat(calcDisplay);
    setCalcDisplay(String(-current));
  };

  const handleCalcClear = () => {
    setCalcDisplay("0");
    setCalcPrevVal(null);
    setCalcOp(null);
    setCalcWaitingForOperand(false);
  };

  const handleCalcMemoryAdd = () => {
    const current = parseFloat(calcDisplay);
    setCalcMemory((calcMemory || 0) + current);
  };

  const handleCalcMemoryRecall = () => {
    if (calcMemory !== null) {
      setCalcDisplay(String(calcMemory));
      setCalcWaitingForOperand(true);
    }
  };

  const handleCalcMemoryClear = () => {
    setCalcMemory(null);
  };

  // Admin Add Options Helpers
  const addOptionField = () => {
    const nextLetter = String.fromCharCode(65 + formOptions.length);
    setFormOptions(prev => [...prev, `${nextLetter}. `]);
  };

  const removeOptionField = (idx: number) => {
    if (formOptions.length <= 2) return;
    setFormOptions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const newQ: ExamQuestion = {
      id: `q_${Date.now()}`,
      blockNumber: Number(formBlockNum) || 1,
      question: formQuestionText.trim(),
      questionImageUrl: formImageUrl.trim() || undefined,
      tableData: hasCustomTable ? { headers: tableHeaders, rows: tableRows } : undefined,
      options: formOptions.filter(o => o.trim().length > 0),
      correctAnswer: formCorrectIndex,
      explanation: formExplanation.trim(),
      clinicalPearl: formClinicalPearl.trim() || undefined
    };

    const updated = [...allQuestions, newQ];
    setAllQuestions(updated);
    localStorage.setItem(`medicinety_subject_${subjectId}_exam_blocks_q`, JSON.stringify(updated));
    setShowAdminAddQ(false);
    
    // Reset form
    setFormQuestionText("");
    setFormImageUrl("");
    setHasCustomTable(false);
    setFormExplanation("");
    setFormClinicalPearl("");
  };

  const currQ = currentBlockQuestions[activeQuestionIdx];
  const currCategory = LAB_CATEGORIES.find(c => c.id === activeLabTab) || LAB_CATEGORIES[0];
  const filteredLabItems = currCategory.items.filter(item => 
    item.name.toLowerCase().includes(labSearchQuery.toLowerCase()) || (item.isHeader && !labSearchQuery)
  );

  return (
    <div 
      className="flex flex-col h-screen w-screen bg-white text-black select-none overflow-hidden"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      
      {/* 1. Official Top Examination Header Bar - Pale Medical Sage Green Theme */}
      <header className="h-12 bg-[#285346] text-white flex items-center justify-between px-3 md:px-6 shrink-0 z-30 shadow border-b border-[#1F4338]">
        
        {/* Left: Item info with Block Switcher and Exit Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReturnToCourse}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#1E4338] hover:bg-[#18362D] text-white text-xs font-bold rounded-sm border border-white/30 transition-all cursor-pointer shadow-xs"
            title="العودة لصفحة الكورس"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === "ar" ? "العودة للكورس" : "Exit to Course"}</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowBlockSwitcher(!showBlockSwitcher)}
              className="border border-white/40 px-3 py-1 text-xs font-semibold leading-tight rounded-sm bg-[#1E4338] hover:bg-[#18362D] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <div>
                <div>Item: {activeQuestionIdx + 1} of {currentBlockQuestions.length} (Max 20)</div>
                <div className="text-[10px] text-teal-200">Block: {activeBlock} of {totalBlocks} ▾</div>
              </div>
            </button>

            {/* Block Switcher Dropdown */}
            {showBlockSwitcher && (
              <div className="absolute top-full left-0 mt-1 bg-white text-black border border-slate-300 rounded shadow-xl py-1 z-50 min-w-[140px] text-xs">
                {Array.from({ length: totalBlocks }, (_, i) => i + 1).map((bNum) => (
                  <button
                    key={bNum}
                    onClick={() => switchBlock(bNum)}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#E8F2EC] flex items-center justify-between font-bold ${activeBlock === bNum ? "bg-[#D8EAE0] text-[#285346]" : ""}`}
                  >
                    <span>Block {bNum} (1 Hour)</span>
                    {activeBlock === bNum && <Check className="w-3.5 h-3.5 text-[#285346]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Previous / Next buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrev}
            disabled={activeQuestionIdx === 0}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#1E4338] hover:bg-[#18362D] disabled:opacity-40 text-white text-xs font-bold rounded-sm border border-white/20 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="font-bold text-sm tracking-widest text-emerald-100">
            {activeQuestionIdx + 1} / {currentBlockQuestions.length}
          </span>

          <button
            onClick={handleNext}
            disabled={activeQuestionIdx === currentBlockQuestions.length - 1}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#1E4338] hover:bg-[#18362D] disabled:opacity-40 text-white text-xs font-bold rounded-sm border border-white/20 transition-all cursor-pointer"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Lab Values & Calculator Tools & Add Question */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowLabValues(!showLabValues)}
            className={`flex flex-col items-center justify-center px-2 py-0.5 rounded transition-all cursor-pointer ${showLabValues ? "bg-white text-[#285346] font-black" : "text-white hover:bg-white/10"}`}
          >
            <FlaskConical className="w-4 h-4" />
            <span className="text-[10px] font-bold">Lab Values</span>
          </button>

          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className={`flex flex-col items-center justify-center px-2 py-0.5 rounded transition-all cursor-pointer ${showCalculator ? "bg-white text-[#285346] font-black" : "text-white hover:bg-white/10"}`}
          >
            <CalcIcon className="w-4 h-4" />
            <span className="text-[10px] font-bold">Calculator</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowAdminAddQ(true)}
              className="flex items-center gap-1 px-3 py-1 bg-[#3B7A66] hover:bg-[#316857] text-white text-xs font-bold rounded-sm shadow cursor-pointer border border-white/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Block / Question</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Examination Split-Pane Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Side: Question Status Sidebar (1, 2, 3... up to 20 per block) */}
        <aside className="w-16 bg-[#285346] text-white flex flex-col shrink-0 border-r border-[#1F4338] overflow-y-auto">
          <div className="p-2 border-b border-[#1F4338] text-center font-bold text-[11px] bg-[#22483C] leading-tight">
            Question<br />Status
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {currentBlockQuestions.map((_, qIdx) => {
              const k = `${activeBlock}_${qIdx}`;
              const isCurrent = qIdx === activeQuestionIdx;
              const isAnswered = answers[k] !== undefined;
              const isMarked = markedQuestions[k];

              return (
                <div
                  key={qIdx}
                  onClick={() => handleJumpToQuestion(qIdx)}
                  className={`px-2.5 py-1.5 flex items-center justify-between text-xs font-medium cursor-pointer transition-colors ${
                    isCurrent ? "bg-[#18362D] font-black border-l-4 border-white" : "hover:bg-[#22483C]"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-teal-300">•</span>
                    <span>{qIdx + 1}</span>
                  </div>
                  {isMarked && <Flag className="w-2.5 h-2.5 text-red-400 fill-red-400" />}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center: Clinical Vignette, Tables & Answer Choices Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5 text-black bg-white w-full transition-all duration-300">
          
          {currQ ? (
            <div className="w-full space-y-5 text-[13.5px] pr-2">
              
              {/* Mark Question Checkbox */}
              <div className="flex items-center gap-2">
                <label 
                  onClick={() => toggleMarkQuestion(currQKey)}
                  className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-black hover:opacity-80"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(markedQuestions[currQKey])}
                    onChange={() => {}}
                    className="w-3.5 h-3.5 text-[#285346] rounded cursor-pointer"
                  />
                  <Flag className={`w-3.5 h-3.5 ${markedQuestions[currQKey] ? "text-red-600 fill-red-600" : "text-red-500"}`} />
                  <span className="text-black font-semibold">Mark Question</span>
                </label>
              </div>

              {/* Clinical Vignette Text Stem */}
              <div className="text-[13.5px] leading-[1.65] text-black font-normal select-text">
                <p className="whitespace-pre-line mb-3">
                  {currQ.question}
                </p>

                {/* Optional Question Image */}
                {currQ.questionImageUrl && (
                  <div className="my-4 border border-slate-300 rounded overflow-hidden max-w-lg">
                    <img src={currQ.questionImageUrl} alt="Clinical Case Image" className="w-full h-auto object-contain" />
                  </div>
                )}

                {/* Built-in Custom Clinical Table (If Present) */}
                {currQ.tableData && currQ.tableData.headers && (
                  <div className="my-4 overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse border border-slate-300 bg-white">
                      <thead>
                        <tr className="bg-[#E4ECE7] text-black font-bold border-b border-slate-300">
                          {currQ.tableData.headers.map((h, hIdx) => (
                            <th key={hIdx} className="p-2 border-r border-slate-300 last:border-r-0">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-black font-normal">
                        {currQ.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-[#F3F7F5]"}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className={`p-2 border-r border-slate-300 last:border-r-0 ${cIdx === 0 ? "font-bold text-[#285346]" : ""}`}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Answer Choices List with Clean Bordered Box Style */}
              <div className="pt-2 space-y-4">
                <div className="inline-block border border-slate-400 rounded-sm p-3 bg-white space-y-2.5 min-w-[340px] max-w-full">
                  {currQ.options.map((optText, optIdx) => {
                    const isSelected = selectedOption === optIdx || answers[currQKey] === optIdx;
                    const isStriked = strikethroughOptions[currQKey]?.[optIdx];

                    return (
                      <div
                        key={optIdx}
                        onClick={() => !isStriked && handleSelectOption(optIdx)}
                        className="flex items-center justify-between gap-4 group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <input 
                            type="radio" 
                            name={`q_opt_${currQKey}`}
                            checked={isSelected && !isStriked}
                            disabled={isStriked}
                            onChange={() => !isStriked && handleSelectOption(optIdx)}
                            className="w-3.5 h-3.5 text-[#285346] cursor-pointer disabled:opacity-30"
                          />
                          <span className={`text-[13px] transition-all select-none ${
                            isStriked 
                              ? "line-through decoration-red-600 decoration-2 text-slate-400 opacity-60 italic" 
                              : "text-black font-normal"
                          }`}>
                            {optText}
                          </span>
                        </div>

                        {!examFinished && (
                          <button
                            type="button"
                            onClick={(e) => toggleStrikethrough(e, currQKey, optIdx)}
                            className={`px-2 py-0.5 text-xs font-mono rounded cursor-pointer transition-all border ${
                              isStriked 
                                ? "bg-red-50 text-red-600 border-red-300 font-bold shadow-xs" 
                                : "text-slate-400 hover:text-slate-900 border-transparent hover:bg-slate-100 hover:border-slate-300"
                            }`}
                            title="Strike through / استبعاد الإجابة"
                          >
                            <span className="line-through">ab</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Proceed to Next Item Green Button */}
                <div>
                  <button
                    onClick={handleNext}
                    className="px-4 py-1.5 bg-[#2D6A57] hover:bg-[#235646] text-white text-xs font-bold rounded-sm shadow-sm transition-all cursor-pointer border border-[#1F4538]"
                  >
                    Proceed to Next Item
                  </button>
                </div>
              </div>

              {/* High-Yield Explanation & Block Completion Action Card */}
              {examFinished && (
                <div className="mt-8 space-y-4">
                  
                  {/* Block Results & Return to Course Banner */}
                  <div className="p-5 bg-[#EAF2ED] border-2 border-[#285346] rounded-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1 text-left rtl:text-right">
                      <div className="text-sm font-black text-[#285346] flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-600" />
                        <span>
                          {language === "ar" 
                            ? `🎉 تم إنهاء Block ${activeBlock} بنجاح! النتيجة: ${score} من ${currentBlockQuestions.length} (${Math.round((score / Math.max(1, currentBlockQuestions.length)) * 100)}% - ${getLetterGrade(Math.round((score / Math.max(1, currentBlockQuestions.length)) * 100))})` 
                            : `🎉 Block ${activeBlock} Completed! Score: ${score} / ${currentBlockQuestions.length} (${Math.round((score / Math.max(1, currentBlockQuestions.length)) * 100)}% - ${getLetterGrade(Math.round((score / Math.max(1, currentBlockQuestions.length)) * 100))})`}
                        </span>
                      </div>
                      <p className="text-xs text-black">
                        {language === "ar" ? "يمكنك مراجعة كافة الإجابات والشروحات أدناه أو العودة لصفحة المادة الرئيسية." : "Review all question explanations below or return to the course overview."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                      <button
                        onClick={handleReturnToCourse}
                        className="px-4 py-2 bg-[#285346] hover:bg-[#1E4338] text-white text-xs font-bold rounded shadow transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{language === "ar" ? "العودة لصفحة الكورس 📚" : "Return to Course 📚"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setExamFinished(false);
                          setSelectedOption(null);
                        }}
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-black border border-slate-300 text-xs font-bold rounded shadow-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>{language === "ar" ? "إعادة المحاولة" : "Retake"}</span>
                      </button>

                      {activeBlock < totalBlocks && (
                        <button
                          onClick={() => switchBlock(activeBlock + 1)}
                          className="px-3.5 py-2 bg-[#3B7A66] hover:bg-[#316857] text-white text-xs font-bold rounded shadow transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>{language === "ar" ? "الانتقال للبلوك التالي ➡️" : "Next Block ➡️"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Clinical Explanation */}
                  <div className="p-6 bg-[#F3F7F5] border border-slate-300 rounded-sm space-y-3">
                    <div className="flex items-center gap-2 text-[#285346] font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      <span>Explanation & Diagnostic Breakdown</span>
                    </div>
                    <p className="text-[13px] text-black leading-relaxed font-normal">
                      {currQ.explanation}
                    </p>
                    {currQ.clinicalPearl && (
                      <div className="p-3 bg-[#EAF2ED] border border-[#B6D4C4] rounded-sm text-xs text-black font-medium space-y-1">
                        <div className="font-bold text-[#285346] flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                          <span>High-Yield Clinical Pearl</span>
                        </div>
                        <p>{currQ.clinicalPearl}</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p>No questions found in Block {activeBlock}.</p>
            </div>
          )}

        </main>

        {/* Right Side: Docked Lab Values Side Panel - Pale Green Theme */}
        {showLabValues && (
          <aside className="w-[380px] lg:w-[420px] bg-[#EAF2ED] border-l border-slate-300 flex flex-col shrink-0 text-black text-[12px] shadow-lg animate-in slide-in-from-right duration-200">
            
            {/* Top Close Header */}
            <div className="p-2 bg-[#DDE9E2] border-b border-slate-300 flex items-center justify-between">
              <span className="font-bold text-xs text-black">Normal Laboratory Values</span>
              <button 
                onClick={() => setShowLabValues(false)}
                className="text-black hover:text-red-700 font-bold p-0.5 text-sm cursor-pointer"
                title="Close Lab Values"
              >
                [X]
              </button>
            </div>

            {/* Search Input */}
            <div className="p-2.5 bg-[#EAF2ED] border-b border-slate-300 space-y-2">
              <input
                type="text"
                placeholder="Search"
                value={labSearchQuery}
                onChange={e => setLabSearchQuery(e.target.value)}
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-sm text-xs text-black outline-none focus:border-[#285346]"
              />

              {/* SI Reference Intervals Checkbox */}
              <label 
                onClick={() => setShowSIUnits(!showSIUnits)}
                className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-normal text-black"
              >
                <input
                  type="checkbox"
                  checked={showSIUnits}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 text-[#285346] rounded cursor-pointer"
                />
                <span>SI Reference Intervals</span>
              </label>
            </div>

            {/* Category Tabs (Serum | Cerebrospinal | Blood | Urine and BMI) */}
            <div className="flex border-b border-slate-300 bg-[#DDE9E2] text-[11px] font-normal overflow-x-auto no-scrollbar">
              {LAB_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveLabTab(cat.id)}
                  className={`px-2.5 py-1.5 border-r border-slate-300 whitespace-nowrap cursor-pointer transition-colors ${
                    activeLabTab === cat.id ? "bg-[#EAF2ED] text-[#285346] font-bold border-b-2 border-b-[#285346]" : "text-black hover:bg-[#CFE0D6]"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 bg-[#DDE9E2] border-b border-slate-300 p-1.5 font-bold text-[11px] text-black">
              <div className="col-span-4">{currCategory.title}</div>
              <div className="col-span-4 text-center">Reference Range</div>
              {showSIUnits && <div className="col-span-4 text-center">SI Reference</div>}
            </div>

            {/* Reference Table Rows with Stacked Multi-lines */}
            <div className="flex-1 overflow-y-auto bg-white text-[11.5px] leading-normal divide-y divide-slate-200">
              {filteredLabItems.map((item, idx) => {
                if (item.isHeader) {
                  return (
                    <div key={idx} className="p-2 bg-[#DDE9E2] font-bold text-black text-xs border-b border-slate-300">
                      {item.name}
                    </div>
                  );
                }

                const rangeLines = item.range.split(" // ");
                const siLines = item.si.split(" // ");

                return (
                  <div 
                    key={idx} 
                    className={`grid grid-cols-12 p-2 items-start text-xs border-b border-slate-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#F3F7F5]"
                    }`}
                  >
                    <div className="col-span-4 font-bold text-black pr-1.5 leading-snug">
                      {item.name}
                    </div>

                    <div className="col-span-4 text-left font-normal text-black pr-1.5 space-y-1">
                      {rangeLines.map((line, lIdx) => (
                        <div key={lIdx} className="leading-snug">{line}</div>
                      ))}
                    </div>

                    {showSIUnits && (
                      <div className="col-span-4 text-left font-normal text-black space-y-1">
                        {siLines.map((line, sIdx) => (
                          <div key={sIdx} className="leading-snug">{line}</div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </aside>
        )}

      </div>

      {/* 3. Official Bottom Docked Control Bar - Pale Green Theme */}
      <footer className="h-12 bg-[#285346] text-white flex items-center justify-between px-4 md:px-6 shrink-0 z-30 border-t border-[#1F4338]">
        
        {/* Left: Block Time Remaining (1 Hour per Block) */}
        <div className="border border-white/40 px-4 py-1 bg-[#1E4338] rounded-sm font-semibold text-xs tracking-wider">
          Block Time Remaining: {formatTime(currentTimeLeft)}
        </div>

        {/* Center/Right: Pause & End Block */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setIsTimerPaused(!isTimerPaused)}
            className="flex flex-col items-center justify-center text-white hover:text-teal-200 transition-colors cursor-pointer"
          >
            {isTimerPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span className="text-[10px] font-bold">{isTimerPaused ? "Resume" : "Pause"}</span>
          </button>



          {examFinished ? (
            <button
              onClick={handleReturnToCourse}
              className="px-3 py-1 bg-[#1E4338] hover:bg-[#18362D] text-emerald-200 hover:text-white rounded text-xs font-bold border border-emerald-500/40 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === "ar" ? "العودة لصفحة الكورس" : "Return to Course"}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowFinishConfirm(true)}
              className="flex flex-col items-center justify-center text-red-300 hover:text-red-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span className="text-[10px] font-bold">End Block</span>
            </button>
          )}
        </div>

      </footer>

      {/* 4. Calculator Docked Bottom-Right Widget - Exact Match to USMLE/AMBOSS with Square Root */}
      {showCalculator && (
        <div className="fixed bottom-14 right-4 z-50 bg-[#E8EEF5] border-2 border-[#0070BA] rounded-md p-2.5 w-[240px] shadow-2xl space-y-2 select-none animate-in slide-in-from-bottom duration-150">
          
          {/* Top Close Button */}
          <div className="flex justify-end">
            <button 
              onClick={() => setShowCalculator(false)} 
              className="text-slate-600 hover:text-black border border-slate-400 bg-white px-1 text-xs font-bold leading-none cursor-pointer"
            >
              ×
            </button>
          </div>

          {/* LCD Display */}
          <div className="bg-white border border-slate-400 p-1.5 flex items-center justify-between min-h-[38px] shadow-inner">
            <span className="text-[11px] font-bold text-slate-700 font-mono">
              {calcMemory !== null ? "M" : ""}
            </span>
            <span className="text-lg font-mono font-black text-black tracking-wider truncate pl-1">
              {calcDisplay}
            </span>
          </div>

          {/* Keypad Grid (Exact Color Scheme and Layout) */}
          <div className="grid grid-cols-4 gap-1 text-xs font-bold">
            
            {/* Row 1: Memory & Clear */}
            <button onClick={handleCalcMemoryAdd} className="py-1.5 bg-[#DCE4EC] hover:bg-[#CFDCE6] text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">M+</button>
            <button onClick={handleCalcMemoryRecall} className="py-1.5 bg-[#DCE4EC] hover:bg-[#CFDCE6] text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">MR</button>
            <button onClick={handleCalcMemoryClear} className="py-1.5 bg-[#DCE4EC] hover:bg-[#CFDCE6] text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">MC</button>
            <button onClick={handleCalcClear} className="py-1.5 bg-[#F6DE98] hover:bg-[#EDD07E] text-black border border-amber-400 rounded-sm cursor-pointer active:scale-95 transition-all">C</button>

            {/* Row 2: Sign, Sqrt, 1/x, Division */}
            <button onClick={handleCalcPlusMinus} className="py-1.5 bg-[#DCE4EC] hover:bg-[#CFDCE6] text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">±</button>
            <button onClick={handleCalcSqrt} className="py-1.5 bg-[#DCE4EC] hover:bg-[#CFDCE6] text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">√x</button>
            <button onClick={handleCalcReciprocal} className="py-1.5 bg-[#DCE4EC] hover:bg-[#CFDCE6] text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">1/x</button>
            <button onClick={() => handleCalcOperator("÷")} className="py-1.5 bg-[#CFE0F0] hover:bg-[#BED4E8] text-black border border-sky-300 rounded-sm cursor-pointer active:scale-95 transition-all">÷</button>

            {/* Row 3: 7, 8, 9, Multiplication */}
            <button onClick={() => handleCalcDigit("7")} className="py-1.5 bg-white hover:bg-slate-100 text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">7</button>
            <button onClick={() => handleCalcDigit("8")} className="py-1.5 bg-white hover:bg-slate-100 text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">8</button>
            <button onClick={() => handleCalcDigit("9")} className="py-1.5 bg-white hover:bg-slate-100 text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">9</button>
            <button onClick={() => handleCalcOperator("×")} className="py-1.5 bg-[#CFE0F0] hover:bg-[#BED4E8] text-black border border-sky-300 rounded-sm cursor-pointer active:scale-95 transition-all">×</button>

            {/* Row 4: 4, 5, 6, Subtraction */}
            <button onClick={() => handleCalcDigit("4")} className="py-1.5 bg-white hover:bg-slate-100 text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">4</button>
            <button onClick={() => handleCalcDigit("5")} className="py-1.5 bg-white hover:bg-slate-100 text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">5</button>
            <button onClick={() => handleCalcDigit("6")} className="py-1.5 bg-white hover:bg-slate-100 text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">6</button>
            <button onClick={() => handleCalcOperator("-")} className="py-1.5 bg-[#CFE0F0] hover:bg-[#BED4E8] text-black border border-sky-300 rounded-sm cursor-pointer active:scale-95 transition-all">−</button>

            {/* Row 5: 1, 2, 3, Addition */}
            <button onClick={() => handleCalcDigit("1")} className="py-1.5 bg-white hover:bg-slate-100 text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">1</button>
            <button onClick={() => handleCalcDigit("2")} className="py-1.5 bg-white hover:bg-slate-100 text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">2</button>
            <button onClick={() => handleCalcDigit("3")} className="py-1.5 bg-white hover:bg-slate-100 text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">3</button>
            <button onClick={() => handleCalcOperator("+")} className="py-1.5 bg-[#CFE0F0] hover:bg-[#BED4E8] text-black border border-sky-300 rounded-sm cursor-pointer active:scale-95 transition-all">+</button>

            {/* Row 6: 0, Dot, Equals */}
            <button onClick={() => handleCalcDigit("0")} className="py-1.5 bg-white hover:bg-slate-100 text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">0</button>
            <button onClick={() => handleCalcDigit(".")} className="py-1.5 bg-white hover:bg-slate-100 text-black border border-slate-300 rounded-sm cursor-pointer active:scale-95 transition-all">.</button>
            <button onClick={handleCalcEquals} className="py-1.5 col-span-2 bg-[#F6DE98] hover:bg-[#EDD07E] text-black border border-amber-400 rounded-sm cursor-pointer active:scale-95 transition-all font-black text-sm">=</button>

          </div>
        </div>
      )}

      {/* 5. End Block Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-300 text-center space-y-4">
            <h3 className="text-base font-black text-black">End Block {activeBlock}?</h3>
            <p className="text-xs text-black leading-relaxed font-normal">
              You have answered {Object.keys(answers).filter(k => k.startsWith(`${activeBlock}_`)).length} of {currentBlockQuestions.length} questions in this block. Your score and clinical review will be shown.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-black font-bold rounded text-xs cursor-pointer"
              >
                Keep Working
              </button>
              <button
                onClick={handleFinishExam}
                className="flex-1 py-2 bg-[#285346] hover:bg-[#1E4338] text-white font-black rounded text-xs shadow cursor-pointer"
              >
                End Block & Grade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Admin Rich Question Builder Modal (Blocks, Tables, Images & Options) */}
      {showAdminAddQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl border border-slate-300 space-y-4 max-h-[90vh] overflow-y-auto text-black">
            
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-[#285346] flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Add Question to Block (Max 20 per Block)</span>
              </h3>
              <button onClick={() => setShowAdminAddQ(false)} className="text-slate-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              
              {/* Block Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Block Number (1 Hour / 20 Questions)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formBlockNum}
                    onChange={e => setFormBlockNum(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border border-slate-300 rounded font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Question Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/case_image.png"
                    value={formImageUrl}
                    onChange={e => setFormImageUrl(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="font-bold block mb-1">Clinical Vignette / Question Text</label>
                <textarea
                  rows={4}
                  value={formQuestionText}
                  onChange={e => setFormQuestionText(e.target.value)}
                  placeholder="Enter patient history, vitals, labs, and question stem..."
                  required
                  className="w-full p-2.5 border border-slate-300 rounded text-xs"
                />
              </div>

              {/* Clinical Table Option - Ultra Interactive Table Builder */}
              <div className="p-3.5 bg-[#F3F7F5] border-2 border-[#285346]/30 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold flex items-center gap-2 cursor-pointer text-sm text-[#285346]">
                    <input
                      type="checkbox"
                      checked={hasCustomTable}
                      onChange={e => setHasCustomTable(e.target.checked)}
                      className="w-4 h-4 text-[#285346] rounded cursor-pointer"
                    />
                    <TableIcon className="w-4 h-4" />
                    <span>تضمين جدول تحاليل / بيانات سريرية داخل السؤال (Clinical Table)</span>
                  </label>

                  {hasCustomTable && (
                    <button
                      type="button"
                      onClick={() => {
                        setTableHeaders(["Option", "Serum glucose (mg/dL)", "Serum osmolality (mOsmol/kg)", "Serum sodium (mEq/L)", "Serum bicarbonate (mEq/L)"]);
                        setTableRows([
                          ["A", "840", "330", "132", "23"],
                          ["B", "670", "325", "147", "26"],
                          ["C", "410", "268", "131", "27"],
                          ["D", "145", "322", "152", "22"],
                          ["E", "490", "310", "130", "14"]
                        ]);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-teal-50 text-[#285346] border border-[#285346]/40 rounded text-[11px] font-bold shadow-xs cursor-pointer"
                    >
                      ⚡ ملء جدول تحاليل جاهز بنقرة واحدة
                    </button>
                  )}
                </div>

                {hasCustomTable && (
                  <div className="space-y-3 pt-1">
                    
                    {/* Controls to Add/Remove Column & Row */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          const colName = `Column ${tableHeaders.length + 1}`;
                          setTableHeaders([...tableHeaders, colName]);
                          setTableRows(tableRows.map(r => [...r, "-"]));
                        }}
                        className="px-2 py-1 bg-[#285346] text-white rounded font-bold hover:bg-[#1E4338] cursor-pointer"
                      >
                        + إضافة عمود جديد
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (tableHeaders.length > 2) {
                            setTableHeaders(tableHeaders.slice(0, -1));
                            setTableRows(tableRows.map(r => r.slice(0, -1)));
                          }
                        }}
                        className="px-2 py-1 bg-slate-200 text-slate-700 rounded font-bold hover:bg-slate-300 cursor-pointer"
                      >
                        - حذف آخر عمود
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const nextLetter = String.fromCharCode(65 + tableRows.length);
                          const newRow = [nextLetter, ...Array(tableHeaders.length - 1).fill("0")];
                          setTableRows([...tableRows, newRow]);
                        }}
                        className="px-2 py-1 bg-[#285346] text-white rounded font-bold hover:bg-[#1E4338] cursor-pointer"
                      >
                        + إضافة صف جديد
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (tableRows.length > 1) {
                            setTableRows(tableRows.slice(0, -1));
                          }
                        }}
                        className="px-2 py-1 bg-slate-200 text-slate-700 rounded font-bold hover:bg-slate-300 cursor-pointer"
                      >
                        - حذف آخر صف
                      </button>
                    </div>

                    {/* Live Editable Table */}
                    <div className="overflow-x-auto border border-slate-300 rounded bg-white shadow-inner max-h-60 overflow-y-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-[#E4ECE7] text-black font-bold border-b border-slate-300">
                            {tableHeaders.map((h, i) => (
                              <th key={i} className="p-2 border-r border-slate-300 min-w-[120px]">
                                <input
                                  type="text"
                                  value={h}
                                  onChange={e => {
                                    const updated = [...tableHeaders];
                                    updated[i] = e.target.value;
                                    setTableHeaders(updated);
                                  }}
                                  placeholder="عنوان العمود"
                                  className="w-full bg-white p-1 border border-slate-300 rounded font-bold text-black text-xs outline-none focus:border-[#285346]"
                                />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-black">
                          {tableRows.map((row, rIdx) => (
                            <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-[#F3F7F5]"}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-1.5 border-r border-slate-200">
                                  <input
                                    type="text"
                                    value={cell}
                                    onChange={e => {
                                      const updated = tableRows.map((r, ri) => 
                                        ri === rIdx ? r.map((c, ci) => ci === cIdx ? e.target.value : c) : r
                                      );
                                      setTableRows(updated);
                                    }}
                                    className="w-full bg-white p-1 border border-slate-200 rounded text-black text-xs outline-none focus:border-[#285346]"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Answer Choices */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold">Answer Choices & Correct Option</label>
                  <button
                    type="button"
                    onClick={addOptionField}
                    className="text-xs text-[#285346] font-bold hover:underline"
                  >
                    + Add Option ({String.fromCharCode(65 + formOptions.length)})
                  </button>
                </div>

                <div className="space-y-2">
                  {formOptions.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_opt_selector"
                        checked={formCorrectIndex === oIdx}
                        onChange={() => setFormCorrectIndex(oIdx)}
                        className="w-4 h-4 text-[#285346] cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const updated = [...formOptions];
                          updated[oIdx] = e.target.value;
                          setFormOptions(updated);
                        }}
                        className="flex-1 p-2 border border-slate-300 rounded text-xs"
                        required
                      />
                      {formOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOptionField(oIdx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation & Pearl */}
              <div className="space-y-2">
                <div>
                  <label className="font-bold block mb-1">Explanation</label>
                  <textarea
                    rows={2}
                    value={formExplanation}
                    onChange={e => setFormExplanation(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">High-Yield Clinical Pearl (Optional)</label>
                  <input
                    type="text"
                    value={formClinicalPearl}
                    onChange={e => setFormClinicalPearl(e.target.value)}
                    placeholder="Key take-away rule for board exams..."
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#285346] hover:bg-[#1E4338] text-white font-bold rounded shadow transition-all cursor-pointer"
              >
                Save Question to Block {formBlockNum}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
