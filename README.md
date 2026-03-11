# 💊 Rx Quiz — Top 200 Drugs Study Tool

A browser-based quiz and reference app for pharmacy students studying the **Top 200 Medications** curriculum. Built for the Class of 2029 at the University of Michigan College of Pharmacy.

🔗 **Live app:** [spoppei.github.io]([https://spoppei.github.io](https://spoppei.github.io/top200-drugs-app/])

---

## Features

### 📝 Quiz Mode
Five modes to match how you want to study:

| Mode | Description |
|------|-------------|
| **Study** | Answer questions and get immediate feedback with the correct answer shown |
| **Exam** | No feedback until the end — simulates real test conditions |
| **Flashcards** | Flip-card format; self-grade with Got It / Missed It |
| **⏱ Time Attack** | Answer as many as possible before the timer runs out |
| **🌀 CHAOS** | Randomized everything — question types, drugs, input methods |

**Question types** (mix and match any combination):
- Generic → Brand, Brand → Generic
- Generic → Indication, Brand → Indication, Indication → Generic, Indication → Brand
- Generic → Drug Class, Brand → Drug Class, Class → Generic, Class → Brand

**Input methods:** Multiple choice buttons or free-text typing (with fuzzy matching — up to 2 typos forgiven on longer answers)

**Session length:** 10, 20, 50 questions, or Endless mode

**Smart Review:** After any session, replay only the questions you missed with one click

### 🃏 Match Mode
Drag-and-drop matching game — pair drugs to their brands, indications, or classes against the clock.

### 📚 Reference Page
Searchable drug reference table organized by quiz, covering the full Fall (Top 100) and Winter (Top 200) curriculum. Filterable by semester.

### ♿ Accessibility
- 🌙 Dark mode
- 🔤 Large text
- ⬛ High contrast
- ✋ Reduce motion (disables animations and confetti)

### 🪩 Disco Mode
You'll know it when you find it.

---

## Drug Coverage

### Fall Semester — Top 100 (Quizzes F1–F10)
| Quiz | Topic |
|------|-------|
| F1 | Asthma, Allergies & Anaphylaxis |
| F2 | Diabetes & Antiplatelet |
| F3 | Insomnia, Pain & Stimulants |
| F4 | GI & Dietary Supplements |
| F5 | Women's & Men's Health |
| F6 | Hypertension & Hyperlipidemia |
| F7 | Antibiotics I |
| F8 | Antibiotics II, Antifungals & Corticosteroids |
| F9 | Antidepressants |
| F10 | Antipsychotics & Antianxiety |

### Winter Semester — Top 200 (Quizzes W1–W9)
| Quiz | Topic |
|------|-------|
| W1 | Cardiovascular I |
| W2 | Cardiovascular II |
| W3 | Pain I |
| W4 | Pain II |
| W5 | Women's / Men's Health & HIV |
| W6 | Asthma & COPD |
| W7 | Neurology |
| W8 | Miscellaneous |
| W9 | Miscellaneous II |

---

## File Structure

```
├── index.html       # App structure and layout
├── styles.css       # All styling
├── script.js        # Quiz logic, match game, reference rendering
├── drugs.js         # Drug data (canonical source — edit here for corrections)
└── scenarios.js     # Pharmacy simulation game logic
```

**`drugs.js` is the single source of truth** for all drug names, brand names, drug classes, and indications. If you spot a data error, that's the only file that needs to change.

---

## Found an Error?

Drug data errors happen! If something doesn't match your course materials, use the **💬 Feedback** tab inside the app to report it. Submissions go directly to the maintainer.

---

## Tech Stack

- Vanilla HTML, CSS, and JavaScript — no frameworks, no build step
- Hosted on GitHub Pages
- Fuzzy text matching via Levenshtein distance
- Confetti via [canvas-confetti](https://github.com/catdad/canvas-confetti)
- Form submissions via [Formspree](https://formspree.io)

---

*Maintained by Sloane Poppei. Drug data based on the UMich Pharmacy Top 200 Medications curriculum, Class of 2029.*
