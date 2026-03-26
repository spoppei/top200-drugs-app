// ═══════════════════════════════════════════════
// CHANGELOG DATA
// Add new versions to the TOP of this array.
// Each entry has:
//   version  – version string, e.g. "1.2"
//   date     – display date, e.g. "March 26, 2026"
//   title    – short headline for this release
//   changes  – array of change objects with:
//       type – "fix" | "add" | "remove" | "update"
//       text – description of the change
// ═══════════════════════════════════════════════

const changelog = [
  {
    version: "1.3",
    date: "March 26, 2026",
    title: "Drug Data Corrections & Standardization",
    changes: [
      { type: "fix", text: "Lamotrigine (Lamictal): removed incorrect Seizures indication — source document shows Bipolar disorder only" },
      { type: "fix", text: "Methylprednisolone (Medrol): removed incorrect Asthma indication — source document shows 'Conditions affecting multiple organ systems' only" },
      { type: "fix", text: "Fluticasone/salmeterol (Advair): removed incorrect COPD indication — source document shows Asthma only" },
      { type: "fix", text: "Apixaban (Eliquis): corrected indications — removed DVT and PE, added Cerebrovascular accident prevention per source document" },
      { type: "fix", text: "Rivaroxaban (Xarelto): corrected indications — removed PE, added Thromboembolism per source document" },
      { type: "fix", text: "Valacyclovir (Valtrex): changed 'Herpes simplex' to 'Genital herpes simplex' to match source document" },
      { type: "fix", text: "Meclizine (Antivert): corrected drug class from '1st generation antihistamine' to 'Antihistamine' — source document leaves generation unspecified" },
      { type: "update", text: "The Fall and Winter course documents use slightly different wording for some indications, which was causing certain drugs to not group together correctly in quiz questions. We've standardized these so everything plays nicely together!" },
      { type: "fix", text: "Seizure → Seizures: standardized to plural across all drugs (Clonazepam, Diazepam)" },
      { type: "fix", text: "Angina pectoris → Angina: standardized to match all other drugs (Propranolol)" },
      { type: "fix", text: "Atrial fibrillation (stroke prevention) → Atrial fibrillation: removed qualifier to match source document column header (Apixaban, Dabigatran, Rivaroxaban)" },
      { type: "fix", text: "Migraine headaches → Migraine: standardized to match all other drugs (Topiramate)" },
      { type: "fix", text: "Tourette's disorder → Tourette syndrome: standardized across both drugs (Aripiprazole)" },
      { type: "fix", text: "Urinary tract infections → Urinary tract infection (UTI): standardized to match all other drugs (Amoxicillin/Clavulanate)" },
      { type: "fix", text: "Attention-deficit/hyperactivity disorder → Attention-deficit hyperactivity disorder: removed slash to match all other ADHD drugs (Adderall)" },
    ]
  },
  {
    version: "1.2",
    date: "March 2026",
    title: "Winter Quiz Expansion",
    changes: [
      { type: "add", text: "Added W9: Miscellaneous II with 9 new drugs including Adderall, Latuda, Aimovig, Emgality, Prograf, Humira, Stelara, Keytruda, and Myrbetriq" },
      { type: "update", text: "Drug data verified against official Top 200 Medications Winter 2026 course documents" },
    ]
  },
  {
    version: "1.1",
    date: "Early 2026",
    title: "Features & Polish",
    changes: [
      { type: "add", text: "Time Attack mode — answer as many questions as possible before the timer runs out" },
      { type: "add", text: "CHAOS mode — randomized question types for maximum challenge" },
      { type: "add", text: "Flashcard mode with flip animation" },
      { type: "add", text: "Matching game tab" },
      { type: "add", text: "Smart Review — replay only the questions you missed" },
      { type: "add", text: "Accessibility panel: dark mode, large text, reduce motion, high contrast" },
      { type: "add", text: "Disco mode 🪩" },
      { type: "add", text: "Feedback form for reporting data errors and suggestions" },
    ]
  },
  {
    version: "1.0",
    date: "Fall 2025",
    title: "Initial Release",
    changes: [
      { type: "add", text: "Quiz app launched with Fall semester drugs (F1–F10, Top 100 medications)" },
      { type: "add", text: "Study and Exam modes" },
      { type: "add", text: "10 question types: Gen→Brand, Brand→Gen, Gen→Indication, and more" },
      { type: "add", text: "Drug reference tab for browsing all medications" },
      { type: "add", text: "Quiz filter — select specific quizzes to study" },
    ]
  },
];
