export interface Lecture {
  title: string;
  duration: string;
  videoUrl: string;
  isCompleted: boolean;
  status?: "ready" | "coming_soon";
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface Handout {
  name: string;
  type: string;
  size: string;
  status?: "ready" | "coming_soon";
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface SubjectContent {
  id: string;
  name: string;
  iconName: string;
  category: "General Principles" | "Organ Systems";
  description: string;
  lectures: Lecture[];
  flashcards: Flashcard[];
  handouts: Handout[];
  questions: Question[];
}

export const subjectData: Record<string, SubjectContent> = {
  anatomy: {
    id: "anatomy",
    name: "Anatomy",
    iconName: "SkeletonIcon",
    category: "General Principles",
    description: "Contains comprehensive lessons on human body structures, skeletal system details, and clinical correlations.",
    lectures: [
      { title: "Upper Limb Neurovascular Structures", duration: "25:40", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Thoracic Wall and Mediastinum Anatomy", duration: "32:15", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Posterior Abdominal Wall & Retroperitoneum", duration: "28:10", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Pelvic Floor Musculature and Perineum", duration: "30:50", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "What nerve is at risk in fractures of the surgical neck of the humerus?", answer: "The Axillary Nerve. It travels around the humeral neck accompanied by the posterior circumflex humeral artery." },
      { question: "Which structures pass through the inguinal canal in females?", answer: "The Round Ligament of the uterus and the ilioinguinal nerve." },
      { question: "What is the relation of the ureter to the uterine artery?", answer: "The ureter passes under ('water under the bridge') the uterine artery near the cervix." }
    ],
    handouts: [
      { name: "Upper and Lower Limb Brachial Plexus Cheat Sheet.pdf", type: "PDF Document", size: "1.4 MB" },
      { name: "High-Yield Gross Anatomy Anatomical Relations Guide.pdf", type: "PDF Document", size: "2.1 MB" },
      { name: "Pelvic Viscera and Perineal Pouches Review.pdf", type: "PDF Document", size: "940 KB" }
    ],
    questions: [
      {
        id: 1,
        question: "A 45-year-old man presents to the clinic with shoulder pain and weakness after falling on his shoulder. Physical examination reveals weakness during arm abduction (first 15 degrees) and loss of sensation over the lateral shoulder area. Which of the following muscles is most likely affected?",
        options: ["Deltoid muscle", "Supraspinatus muscle", "Infraspinatus muscle", "Subscapularis muscle"],
        correctAnswer: 1,
        explanation: "The supraspinatus muscle initiates arm abduction for the first 15 degrees, before the deltoid muscle takes over. Falling on the shoulder can cause rotator cuff injury, specifically affecting the supraspinatus tendon. Axillary nerve damage would affect the deltoid (abduction from 15-90 degrees) and sensation over the deltoid."
      }
    ]
  },
  embryology: {
    id: "embryology",
    name: "Embryology",
    iconName: "Baby",
    category: "General Principles",
    description: "Contains developmental outlines from fertilization through fetal organ maturation and congenital defects.",
    lectures: [
      { title: "Gastrulation & Germ Layer Specification", duration: "22:15", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Cardiac Loop and Septation Anomalies", duration: "35:40", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Pharyngeal Arch Derivatives & Clefts", duration: "29:05", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "Which embryological structure forms the nucleus pulposus?", answer: "The Notochord (mesodermal origin)." },
      { question: "What arises from the third pharyngeal pouch?", answer: "The inferior parathyroid glands and the thymus." }
    ],
    handouts: [
      { name: "Germ Layer Derivatives Reference Map.pdf", type: "PDF Document", size: "850 KB" },
      { name: "Congenital Anomalies & Pharyngeal Arch Systems.pdf", type: "PDF Document", size: "1.8 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "During a newborn evaluation, a baby is noted to have a cleft lip. This congenital anomaly is primarily caused by a failure of fusion of which of the following structures?",
        options: ["Maxillary and medial nasal processes", "Lateral nasal and maxillary processes", "Medial nasal processes only", "Pharyngeal arches 1 and 2"],
        correctAnswer: 0,
        explanation: "Cleft lip occurs due to the failure of fusion of the maxillary and medial nasal processes. Cleft palate occurs due to the failure of fusion of the lateral palatal shelves."
      }
    ]
  },
  physiology: {
    id: "physiology",
    name: "Physiology",
    iconName: "HeartPulse",
    category: "General Principles",
    description: "Contains functional pathways detailing cellular feedback systems and systemic blood pressure regulation.",
    lectures: [
      { title: "Action Potential and Synaptic Transmission", duration: "26:45", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Capillary Fluid Dynamics & Starling Forces", duration: "31:10", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Renal Clearance and Glomerular Filtration Rate", duration: "34:25", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "What is the primary driver of resting membrane potential?", answer: "Potassium leak channels (bringing potential close to K+ equilibrium potential of -90mV)." },
      { question: "How does aldosterone affect sodium and potassium excretion?", answer: "It increases sodium reabsorption (via ENaC) and increases potassium excretion (via ROMK) in the principal cells." }
    ],
    handouts: [
      { name: "Starling Forces and Cardiac Action Potentials.pdf", type: "PDF Document", size: "1.2 MB" },
      { name: "Physiological Feedback Loops Review.pdf", type: "PDF Document", size: "1.7 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "Which of the following changes will most likely occur in response to acute hemorrhage?",
        options: ["Increased baroreceptor firing, decreased heart rate", "Decreased baroreceptor firing, increased sympathetic tone", "Decreased renin secretion, increased GFR", "Increased parasympathetic output, increased cardiac output"],
        correctAnswer: 1,
        explanation: "Hemorrhage leads to decreased blood volume and blood pressure. This reduces stretch on arterial baroreceptors (carotid sinus and aortic arch), leading to decreased baroreceptor firing rates. Consequently, the cardiovascular control center in the brainstem increases sympathetic output, increasing heart rate, contractility, and peripheral resistance."
      }
    ]
  },
  "biochemistry-genetics": {
    id: "biochemistry-genetics",
    name: "Biochemistry",
    iconName: "EnzymeIcon",
    category: "General Principles",
    description: "Contains metabolic cycle structures, enzyme regulatory mechanisms, and biochemical reaction pathways.",
    lectures: [
      { title: "Glycolysis and Regulation of Gluconeogenesis", duration: "38:20", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Mitochondrial Electron Transport Chain & ATP Synthase", duration: "29:45", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Autosomal Dominant vs Recessive Inheritance Patterns", duration: "25:30", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "What is the rate-limiting enzyme of glycolysis?", answer: "Phosphofructokinase-1 (PFK-1), which is allosterically activated by AMP and fructose-2,6-bisphosphate." },
      { question: "Which mutation is responsible for Sickle Cell Anemia?", answer: "A missense mutation replacing glutamic acid with valine at position 6 of the beta-globin chain." }
    ],
    handouts: [
      { name: "Metabolic Pathway Integration Map.pdf", type: "PDF Document", size: "3.2 MB" },
      { name: "Genetics Laws and DNA Repair Cheat Sheet.pdf", type: "PDF Document", size: "1.1 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "A 4-year-old boy is brought to the physician due to developmental delay. Physical exam reveals coarse facial features, corneal clouding, and hepatosplenomegaly. Lab testing shows high levels of lysosomal enzymes in the blood. What is the biochemical defect in this patient?",
        options: ["Deficient glucose-6-phosphatase", "Deficiency of alpha-L-iduronidase", "Failure of mannose-6-phosphate phosphorylation", "Deficient sphingomyelinase"],
        correctAnswer: 2,
        explanation: "This describes I-cell disease (mucolipidosis II), which is caused by a deficiency in UDP-N-acetylglucosamine-1-phosphotransferase. This deficiency leads to a failure of phosphorylating mannose residues to mannose-6-phosphate, meaning proteins cannot be targeted to lysosomes and are instead secreted extracellularly."
      }
    ]
  },
  histology: {
    id: "histology",
    name: "Histology",
    iconName: "Layers",
    category: "General Principles",
    description: "Contains cell structural biology, epithelial classifications, and tissue identification metrics.",
    lectures: [
      { title: "Epithelial Tissue Classifications and Staining", duration: "24:10", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Connective Tissues & Cartilage Structures", duration: "22:45", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "What cells synthesize surfactant in the lung alveoli?", answer: "Type II Pneumocytes (cuboidal in shape, containing lamellar bodies)." },
      { question: "Which fibers make up the reticular lamina?", answer: "Type III Collagen fibers." }
    ],
    handouts: [
      { name: "Cell Structure and Staining Guide.pdf", type: "PDF Document", size: "2.4 MB" },
      { name: "Epithelial Classifications Visual Sheet.pdf", type: "PDF Document", size: "1.9 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "Which of the following cell types is responsible for bone resorption and is characterized histologically as large multinucleated cells situated in Howship's lacunae?",
        options: ["Osteoblasts", "Osteocytes", "Osteoclasts", "Chondrocytes"],
        correctAnswer: 2,
        explanation: "Osteoclasts are large, multinucleated cells derived from monocyte-macrophage lineages that reabsorb bone tissue and reside in shallow depressions called Howship's lacunae."
      }
    ]
  },
  pathology: {
    id: "pathology",
    name: "Pathology",
    iconName: "PathologyIcon",
    category: "General Principles",
    description: "Contains mechanisms of cellular injury, adaptive responses, inflammatory reactions, and disease pathology.",
    lectures: [
      { title: "Cellular Adaptation, Injury, and Death Pathways", duration: "32:15", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Acute vs Chronic Inflammatory Cellular Responses", duration: "28:50", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Neoplasia: Oncogenes & Tumor Suppressors", duration: "34:10", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "What type of necrosis is typically observed in brain ischemia?", answer: "Liquefactive Necrosis (due to enzymatic digestion of tissues by microglial lysosomal enzymes)." },
      { question: "What is the hallmark of irreversible cell injury?", answer: "Membrane damage (both plasma and mitochondrial membranes) allowing calcium influx and leakage of enzymes." }
    ],
    handouts: [
      { name: "Cellular Injury Mechanisms & Pathology Slides.pdf", type: "PDF Document", size: "4.1 MB" },
      { name: "Neoplasia and Tumor Suppressor Networks.pdf", type: "PDF Document", size: "2.0 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "A biopsy of the esophagus in an obese patient with chronic heartburn reveals simple columnar epithelium with goblet cells, replacing the normal stratified squamous epithelium. What is the pathological term for this adaptive change?",
        options: ["Hyperplasia", "Dysplasia", "Metaplasia", "Hypertrophy"],
        correctAnswer: 2,
        explanation: "Metaplasia is the reversible replacement of one adult cell type by another. Here, Barrett's esophagus demonstrates squamous-to-columnar metaplasia as an adaptation to chronic acid exposure."
      }
    ]
  },
  pharmacology: {
    id: "pharmacology",
    name: "Pharmacology",
    iconName: "Pill",
    category: "General Principles",
    description: "Contains pharmacokinetic mathematics, drug clearance calculations, receptor dynamics, and drug toxicities.",
    lectures: [
      { title: "Pharmacokinetics: Clearance and Half-Life calculations", duration: "29:30", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Autonomic Nervous System Drug Receptor Targets", duration: "36:15", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Cytochrome P450 Inducers and Inhibitors list", duration: "24:50", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "What is the formula for calculating volume of distribution (Vd)?", answer: "Vd = Amount of drug in body / Plasma concentration of drug." },
      { question: "Which receptors does epinephrine stimulate at low vs high doses?", answer: "At low doses, epinephrine stimulates beta-2 receptors causing vasodilation. At high doses, alpha-1 stimulation dominates causing vasoconstriction." }
    ],
    handouts: [
      { name: "ANS Pharmacology Receptor Reference Chart.pdf", type: "PDF Document", size: "1.8 MB" },
      { name: "CYP450 Inducers, Inhibitors, and Substrates List.pdf", type: "PDF Document", size: "860 KB" }
    ],
    questions: [
      {
        id: 1,
        question: "A patient receives an intravenous loading dose of an antibiotic. The target concentration is 10 mg/L. The volume of distribution is 35 L. What loading dose should be administered?",
        options: ["3.5 mg", "35 mg", "350 mg", "3500 mg"],
        correctAnswer: 2,
        explanation: "Loading dose is calculated using the formula: LD = Cp * Vd. Here, LD = 10 mg/L * 35 L = 350 mg."
      }
    ]
  },
  microbiology: {
    id: "microbiology",
    name: "Microbiology",
    iconName: "BacteriaIcon",
    category: "General Principles",
    description: "Contains taxonomy of infectious agents, bacterial genetics, viral replication, and antimicrobial mechanisms.",
    lectures: [
      { title: "Gram-Positive Cocci Taxonomy & Virulence Factors", duration: "27:15", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Bacterial Genetics & Resistance Mechanisms", duration: "28:30", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Viral Replication Cycles & Antiviral Targets", duration: "24:15", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "Which organism is associated with pseudomembranous colitis?", answer: "Clostridioides difficile, which secretes toxin A and toxin B." },
      { question: "What is the mechanism of action of beta-lactam antibiotics?", answer: "Inhibition of peptidoglycan cross-linking by binding to transpeptidases (penicillin-binding proteins)." }
    ],
    handouts: [
      { name: "Microbiology Pathogen Identification Guide.pdf", type: "PDF Document", size: "2.8 MB" },
      { name: "High-Yield Antibiotic Mechanism Map.pdf", type: "PDF Document", size: "1.2 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "A 32-year-old patient presents with watery diarrhea and abdominal cramping after a course of clindamycin. Stool antigen testing is positive for Clostridioides difficile. Which toxin is primarily responsible for the mucosal injury?",
        options: ["Toxin A (enterotoxin) and Toxin B (cytotoxin)", "Erythrogenic toxin", "Shiga-like toxin", "Heat-labile enterotoxin"],
        correctAnswer: 0,
        explanation: "Clostridioides difficile produces Toxin A (enterotoxin, recruits neutrophils causing mucosal damage) and Toxin B (cytotoxin, disorganizes actin cytoskeleton causing cell death)."
      }
    ]
  },
  immunology: {
    id: "immunology",
    name: "Immunology",
    iconName: "Shield",
    category: "General Principles",
    description: "Contains innate and adaptive host immunity, hypersensitivity reactions, immunodeficiencies, and autoimmune diseases.",
    lectures: [
      { title: "Innate vs Adaptive Host Immune Defenses", duration: "32:40", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Hypersensitivity Reactions: Types I through IV", duration: "30:20", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Primary Immunodeficiency Syndromes", duration: "28:50", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "What antibody isotype can cross the placenta?", answer: "IgG is the only antibody class capable of crossing the placenta." }
    ],
    handouts: [
      { name: "Immunodeficiencies & Cytokine Pathways Chart.pdf", type: "PDF Document", size: "1.4 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "A 25-year-old woman experiences severe hives and difficulty breathing minutes after eating a peanut cookie. This reaction is mediated by which of the following immunoglobulins?",
        options: ["IgA", "IgD", "IgE", "IgM"],
        correctAnswer: 2,
        explanation: "Peanut allergy causes a Type I hypersensitivity reaction, which is mediated by IgE antibodies binding to mast cells and basophils, causing degranulation and release of histamine."
      }
    ]
  },
  "public-health": {
    id: "public-health",
    name: "Public Health",
    iconName: "Users",
    category: "General Principles",
    description: "Contains epidemiological concepts, patient safety, study designs, biostatistics, and healthcare systems.",
    lectures: [
      { title: "Epidemiology Study Designs: Cohort and Case-Control", duration: "26:40", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Sensitivity, Specificity, and Predictive Values", duration: "28:15", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Biostatistics: Hypothesis Testing & Power", duration: "25:30", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "What is the difference between a cohort and case-control study?", answer: "A cohort study is prospective or retrospective and groups participants by exposure status. A case-control study is retrospective and groups participants by outcome status." }
    ],
    handouts: [
      { name: "Biostatistics Calculations and Formulas Cheat Sheet.pdf", type: "PDF Document", size: "1.0 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "A new diagnostic test has a sensitivity of 90% and a specificity of 80%. If the test is applied to a population with low disease prevalence, how will the positive predictive value (PPV) be affected?",
        options: ["PPV will increase", "PPV will decrease", "PPV will remain unchanged", "PPV will become 100%"],
        correctAnswer: 1,
        explanation: "Positive predictive value (PPV) is directly dependent on the prevalence of the disease in the population. If the disease prevalence is low, the PPV will be lower, even with high sensitivity and specificity, because there will be more false positives in proportion to true positives."
      }
    ]
  },
  gastrointestinal: {
    id: "gastrointestinal",
    name: "Gastrointestinal System",
    iconName: "StomachIcon",
    category: "Organ Systems",
    description: "Contains comprehensive lessons on gastrointestinal physiology, digestive processes, and clinical pathology.",
    lectures: [
      { title: "Stomach Secretions and Gastric Motility", duration: "25:40", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Hepatobiliary Pathophysiology & Bilirubin Cycles", duration: "32:15", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Inflammatory Bowel Disease and Malabsorption", duration: "28:10", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "What hormone stimulates bicarbonate secretion from the pancreas?", answer: "Secretin (released by S cells of the duodenum in response to acidic chyme)." },
      { question: "Where is vitamin B12 absorbed in the GI tract?", answer: "The terminal ileum, requiring intrinsic factor from parietal cells." }
    ],
    handouts: [
      { name: "Gastrointestinal Hormones Summary.pdf", type: "PDF Document", size: "1.1 MB" },
      { name: "Hepatitis Serology and Liver Function Guides.pdf", type: "PDF Document", size: "1.6 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "A patient presents with weight loss, abdominal pain, and chronic diarrhea. Biopsy of the duodenum shows blunted villi and intraepithelial lymphocytes. What is the most likely diagnosis?",
        options: ["Crohn's Disease", "Celiac Disease", "Ulcerative Colitis", "Lactose Intolerance"],
        correctAnswer: 1,
        explanation: "Celiac disease is characterized by immune-mediated enteropathy triggered by gluten. Histopathology shows villous atrophy, crypt hyperplasia, and intraepithelial lymphocytosis in the duodenum."
      }
    ]
  },
  musculoskeletal: {
    id: "musculoskeletal",
    name: "Musculoskeletal System",
    iconName: "Bone",
    category: "Organ Systems",
    description: "Contains bone biology, skeletal muscle physiology, rheumatologic diseases, and soft tissue pathology.",
    lectures: [
      { title: "Sarcomere Muscle Contraction Mechanisms", duration: "21:30", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Osteoarthritis vs Rheumatoid Arthritis Pathophysiology", duration: "30:45", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "What protein blocks the myosin-binding sites on actin at rest?", answer: "Tropomyosin (regulated by the troponin complex)." },
      { question: "Which antibody is most specific for Rheumatoid Arthritis?", answer: "Anti-Cyclic Citrullinated Peptide (anti-CCP) antibodies." }
    ],
    handouts: [
      { name: "Bone Remodeling and Osteoporosis Guides.pdf", type: "PDF Document", size: "1.3 MB" },
      { name: "Musculoskeletal Joint Pathology Reference.pdf", type: "PDF Document", size: "2.2 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "Which of the following cellular changes is responsible for skeletal muscle contraction upon calcium binding to Troponin C?",
        options: ["Myosin head releases from actin", "Tropomyosin shifts to expose myosin-binding sites on actin", "ATP is hydrolyzed by actin filaments", "Calcium stimulates sodium channels"],
        correctAnswer: 1,
        explanation: "Calcium binds to Troponin C, causing a conformational change in the troponin-tropomyosin complex that pulls tropomyosin away, exposing the myosin-binding sites on the actin filament."
      }
    ]
  },
  "central-nervous-special-senses": {
    id: "central-nervous-special-senses",
    name: "Central Nervous System & Behavioral Science",
    iconName: "Brain",
    category: "Organ Systems",
    description: "Contains neuroanatomy, spinal tracts, visual/auditory systems, medical ethics, and behavioral neuroscience.",
    lectures: [
      { title: "Cortical Mapping & Ascending Spinal Tracts", duration: "34:15", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Basal Ganglia Circuitry and Parkinson's Disease", duration: "31:40", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Medical Ethics: Core Principles & Patient Autonomy", duration: "22:50", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Psychopharmacology and Cognitive Disorders", duration: "28:10", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "Which spinal tract carries pain and temperature sensation?", answer: "The Lateral Spinothalamic Tract (decussates at the spinal level)." },
      { question: "What neurotransmitter is deficient in Alzheimer's disease?", answer: "Acetylcholine, due to loss of cholinergic neurons in the nucleus basalis of Meynert." },
      { question: "Define patient autonomy in medical ethics.", answer: "The right of the patient to make self-determining decisions regarding their own healthcare, free from coercion." }
    ],
    handouts: [
      { name: "Spinal Cord Cross Sections & Tracts Cheat Sheet.pdf", type: "PDF Document", size: "2.5 MB" },
      { name: "Ethics Cases & Public Health Policies Guide.pdf", type: "PDF Document", size: "1.3 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "A 68-year-old man presents with resting tremor, rigidity, bradykinesia, and postural instability. The disease is caused by loss of dopaminergic neurons in which brain region?",
        options: ["Caudate nucleus", "Substantia nigra pars compacta", "Putamen", "Globus pallidus internus"],
        correctAnswer: 1,
        explanation: "Parkinson's disease is characterized by loss of pigmented dopaminergic neurons in the substantia nigra pars compacta (SNpc), resulting in depleted dopamine levels in the striatum."
      }
    ]
  },
  respiratory: {
    id: "respiratory",
    name: "Respiratory System",
    iconName: "LungsIcon",
    category: "Organ Systems",
    description: "Contains pulmonary ventilatory mechanics, gas diffusion, ventilation-perfusion, and respiratory disease states.",
    lectures: [
      { title: "Pulmonary Pressures and Compliance curves", duration: "26:30", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Oxygen-Hemoglobin Dissociation Curve factors", duration: "24:15", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Obstructive vs Restrictive Lung Diseases", duration: "32:45", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "What shifts the oxygen-hemoglobin dissociation curve to the right?", answer: "Increased CO2, acidity (decreased pH), increased temperature, and increased 2,3-BPG (indicates tissue demands)." },
      { question: "Define functional residual capacity (FRC).", answer: "The volume of air remaining in the lungs after a normal passive expiration (FRC = ERV + RV)." }
    ],
    handouts: [
      { name: "Lung Capacities and Spirometry Charts.pdf", type: "PDF Document", size: "1.4 MB" },
      { name: "ABG Analysis and Compensatory Mechanisms Guide.pdf", type: "PDF Document", size: "1.1 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "Which of the following pulmonary function test findings is characteristically associated with restrictive lung diseases?",
        options: ["Increased FEV1/FVC ratio", "Decreased FEV1/FVC ratio", "Increased residual volume (RV)", "Normal or elevated Total Lung Capacity (TLC)"],
        correctAnswer: 0,
        explanation: "Restrictive lung disease features reduced lung volumes (TLC, FVC) but normal or increased FEV1/FVC ratios (typically >80%), because both FEV1 and FVC are reduced proportionally."
      }
    ]
  },
  endocrine: {
    id: "endocrine",
    name: "Endocrine System",
    iconName: "EndocrineIcon",
    category: "Organ Systems",
    description: "Contains pituitary-hypothalamic pathways, peripheral hormone feedback, thyroid physiology, and diabetic pathology.",
    lectures: [
      { title: "Hypothalamic-Pituitary Hormone Axes feedback", duration: "28:50", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Thyroid Hormone Synthesis and Pathophysiology", duration: "31:40", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Adrenal Steroidogenesis and Congenital Adrenal Hyperplasia", duration: "35:10", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "What is the primary action of antidiuretic hormone (ADH)?", answer: "Insertion of aquaporin-2 water channels in the apical membranes of collecting duct principal cells." },
      { question: "Which enzyme is deficient in 90% of congenital adrenal hyperplasia cases?", answer: "21-hydroxylase, leading to decreased aldosterone/cortisol and increased androgen production." }
    ],
    handouts: [
      { name: "Adrenal Steroid Pathway Diagrams.pdf", type: "PDF Document", size: "2.1 MB" },
      { name: "Diabetes Mellitus Diagnosis & Treatment Guide.pdf", type: "PDF Document", size: "1.5 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "A patient presents with weight gain, moon facies, abdominal striae, and hypertension. Laboratory testing reveals elevated cortisol levels that are not suppressed by low-dose dexamethasone, but are suppressed by high-dose dexamethasone. What is the most likely diagnosis?",
        options: ["Adrenal adenoma", "ACTH-producing pituitary adenoma", "Ectopic ACTH-producing small cell lung cancer", "Exogenous glucocorticoid use"],
        correctAnswer: 1,
        explanation: "Cushing's disease (pituitary adenoma secreting ACTH) responds to feedback inhibition, meaning it will suppress with high-dose dexamethasone. Adrenal tumors and ectopic ACTH sources are autonomous and will not suppress."
      }
    ]
  },
  "hematology-oncology": {
    id: "hematology-oncology",
    name: "Hematology plus Oncology",
    iconName: "BloodCellIcon",
    category: "Organ Systems",
    description: "Contains erythrocytic pathways, coagulation cascades, leukemic classifications, and therapeutic oncology.",
    lectures: [
      { title: "Coagulation Cascade and Hemophilia Types", duration: "30:45", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Microcytic, Normocytic, Macrocytic Anemias", duration: "33:15", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Leukemia and Lymphoma Clinical Classification", duration: "36:40", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "What is the function of Von Willebrand Factor (vWF)?", answer: "It binds platelets via GP Ib receptors to exposed subendothelial collagen, and stabilizes coagulation Factor VIII." },
      { question: "Which translocation is associated with Chronic Myelogenous Leukemia (CML)?", answer: "The t(9;22) translocation, creating the BCR-ABL fusion oncogene (Philadelphia chromosome)." }
    ],
    handouts: [
      { name: "Coagulation Cascade Pathway Handout.pdf", type: "PDF Document", size: "1.9 MB" },
      { name: "Anemia Classification and Flowcharts.pdf", type: "PDF Document", size: "1.7 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "A 60-year-old male presents with bone pain, fatigue, and recurrent infections. Laboratory analysis shows anemia, hypercalcemia, renal insufficiency, and a monoclonal spike on serum protein electrophoresis. Which bone marrow finding is diagnostic?",
        options: ["Atypical lymphoid aggregates", "Greater than 10% clonal plasma cells", "Hypercellular marrow with myeloblasts", "Ringed sideroblasts"],
        correctAnswer: 1,
        explanation: "This presentation describes Multiple Myeloma, characterized by the CRAB criteria (Hypercalcemia, Renal insufficiency, Anemia, Bone lesions). Diagnosis requires a clonal bone marrow plasma cell percentage >= 10% or biopsy-proven bony plasmacytoma."
      }
    ]
  },
  cardiovascular: {
    id: "cardiovascular",
    name: "Cardiovascular System",
    iconName: "Heart",
    category: "Organ Systems",
    description: "Contains cardiac electrophysiology, ventricular pressure-volume cycles, vascular hemodynamics, and heart failure.",
    lectures: [
      { title: "Cardiac Cycle and Ventricular Pressure-Volume Loops", duration: "31:20", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "ECG Fundamentals & Cardiac Arrhythmia recognition", duration: "35:45", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Ischemic Heart Disease and Myocardial Infarction", duration: "33:10", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "What is the physiological cause of the S3 heart sound?", answer: "Rapid ventricular filling during early diastole, commonly associated with dilated ventricles or volume overload (e.g. heart failure)." },
      { question: "How does compliance affect pulse pressure?", answer: "Decreased arterial compliance (e.g., arteriosclerosis) increases pulse pressure." }
    ],
    handouts: [
      { name: "ECG Lead Placement and Rhythm Review.pdf", type: "PDF Document", size: "2.9 MB" },
      { name: "Wiggers Diagram and Pressure-Volume Loops.pdf", type: "PDF Document", size: "2.3 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "During a routine check-up, a patient is found to have an early diastolic decrescendo murmur heard best at the left sternal border with the patient leaning forward. What valvular defect is most likely?",
        options: ["Aortic Stenosis", "Aortic Regurgitation", "Mitral Stenosis", "Mitral Regurgitation"],
        correctAnswer: 1,
        explanation: "Aortic Regurgitation presents as a high-pitched, blowing, decrescendo diastolic murmur, heard best along the left sternal border when leaning forward. It is associated with wide pulse pressures."
      }
    ]
  },
  "renal-urinary": {
    id: "renal-urinary",
    name: "Renal with Urinary System",
    iconName: "KidneysIcon",
    category: "Organ Systems",
    description: "Contains glomerular filtration physiology, nephron transport systems, acid-base dynamics, and glomerular pathology.",
    lectures: [
      { title: "Nephron Segment Transport and Diuretic Actions", duration: "33:40", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Acid-Base Disorders: Metabolic vs Respiratory compensation", duration: "35:15", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Nephritic vs Nephrotic Syndromes pathology", duration: "32:50", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "Where do loop diuretics act in the nephron?", answer: "On the Na+/K+/2Cl- cotransporter (NKCC2) in the thick ascending limb of the loop of Henle." },
      { question: "What characterizes Nephrotic Syndrome?", answer: "Massive proteinuria (>3.5 g/day), hypoalbuminemia, generalized edema, and hyperlipidemia." }
    ],
    handouts: [
      { name: "Acid-Base Compensation Cheat Sheet.pdf", type: "PDF Document", size: "1.5 MB" },
      { name: "Nephrology Diuretics and Electrolytes Summary.pdf", type: "PDF Document", size: "1.9 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "A patient presents with hematuria, mild hypertension, and periorbital edema after recovering from a sore throat. Biopsy of the glomerulus reveals subepithelial humps on electron microscopy. What is the diagnosis?",
        options: ["Minimal Change Disease", "Membranous Nephropathy", "Poststreptococcal Glomerulonephritis", "Diabetic Nephropathy"],
        correctAnswer: 2,
        explanation: "Poststreptococcal Glomerulonephritis (PSGN) is a nephritic syndrome occurring 1-3 weeks post-streptococcal infection. It is characterized by hematuria, hypertension, edema, and subepithelial IgG/C3 humps on electron microscopy."
      }
    ]
  },
  reproductive: {
    id: "reproductive",
    name: "Reproductive System",
    iconName: "ReproductiveIcon",
    category: "Organ Systems",
    description: "Contains reproductive endocrinology, ovarian-uterine hormonal cycles, pregnancy, and sexual dysfunctions.",
    lectures: [
      { title: "Ovarian and Uterine Hormonal Cycle regulation", duration: "29:10", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Placental Hormones & Maternal Physiology adaptations", duration: "26:30", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false },
      { title: "Breast and Ovarian Cancer Pathophysiology", duration: "30:45", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isCompleted: false }
    ],
    flashcards: [
      { question: "What hormone triggers ovulation?", answer: "A surge in Luteinizing Hormone (LH), caused by positive feedback of high estrogen levels." },
      { question: "Which hormone is secreted by the syncytiotrophoblast to maintain the corpus luteum?", answer: "Human Chorionic Gonadotropin (hCG)." }
    ],
    handouts: [
      { name: "Ovarian Cycle Hormonal Graph.pdf", type: "PDF Document", size: "1.6 MB" },
      { name: "Maternal Physiology adaptation outlines.pdf", type: "PDF Document", size: "1.2 MB" }
    ],
    questions: [
      {
        id: 1,
        question: "Which of the following hormones is directly responsible for maintaining the endometrial lining during the luteal phase of the menstrual cycle?",
        options: ["Estrogen", "Progesterone", "Luteinizing Hormone", "Follicle-Stimulating Hormone"],
        correctAnswer: 1,
        explanation: "Progesterone, secreted by the corpus luteum during the luteal phase, prepares the endometrium for implantation and maintains it."
      }
    ]
  }
};
