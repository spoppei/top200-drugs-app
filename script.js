// ═══════════════════════════════════════════════
// RX QUIZ — script.js
// Sections:
//   1. Utilities
//   2. State
//   3. Page Navigation
//   4. Accessibility & Disco
//   5. Quiz Controls Setup
//   6. Deck Building
//   7. Session Start
//   8. Question Generation & Building
//   9. Render Question
//  10. Check Answer & Results
//  11. End Quiz
//  12. Stats Update
//  13. Matching Game
//  14. Reference Tables
//  15. Feedback Form
//  16. Init
// ═══════════════════════════════════════════════

/* ── 1. Utilities ────────────────────────────── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cleanStr(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function levenshtein(a, b) {
  const m = [], al = a.length, bl = b.length;
  for (let i = 0; i <= bl; i++) m[i] = [i];
  for (let j = 0; j <= al; j++) m[0][j] = j;
  for (let i = 1; i <= bl; i++)
    for (let j = 1; j <= al; j++)
      m[i][j] = b[i-1] === a[j-1] ? m[i-1][j-1] : 1 + Math.min(m[i-1][j-1], m[i][j-1], m[i-1][j]);
  return m[bl][al];
}

function fuzzyMatch(user, target) {
  const u = cleanStr(user), t = cleanStr(target);
  if (u === t) return true;
  if (u.length < 3) return false;
  const maxLen = Math.max(u.length, t.length);
  return levenshtein(u, t) <= (maxLen > 6 ? 2 : 1);
}

function shootConfetti() {
  if (document.body.classList.contains("reduce-motion") || typeof confetti !== "function") return;
  confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 } });
}

function fireDiscoConfetti() {
  if (document.body.classList.contains("reduce-motion") || typeof confetti !== "function") return;
  for (let i = 0; i < 4; i++)
    confetti({
      particleCount: 50, spread: 120,
      origin: { x: Math.random(), y: Math.random() },
      colors: ["#e8437a", "#6c63ff", "#1db954", "#f5a623"]
    });
}

/* ── 2. State ────────────────────────────────── */
let mode        = "study";
let inputMethod = "buttons";
let totalQ      = 10;
let quizActive  = false;
let isSmartReview = false;
let currentIdx  = 0;
let score       = 0;
let missedQueue = [];
let deck        = [];
let currentQ    = null;
let gameTime    = 60;
let gameInterval = null;
let discoOn     = false;

/* ── 3. Page Navigation ──────────────────────── */
document.querySelectorAll(".nav-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");

    if (tab.dataset.page === "match") {
      document.getElementById("page-match").classList.add("active");
    } else {
      document.getElementById("page-" + tab.dataset.page).classList.add("active");
    }

    if (tab.dataset.page === "reference") renderReference("fall");
    if (tab.dataset.page === "match")     initMatchGame();
  });
});

/* ── 4. Accessibility & Disco ────────────────── */
document.getElementById("btn-a11y").addEventListener("click", () => {
  document.getElementById("a11y-panel").classList.toggle("open");
});

document.getElementById("btn-dark").addEventListener("click", function () {
  document.body.classList.toggle("dark");
  this.innerText = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
});

document.getElementById("btn-large-text").addEventListener("click", function () {
  document.body.classList.toggle("large-text");
  this.innerText = "🔤 Large Text: " + (document.body.classList.contains("large-text") ? "ON" : "OFF");
});

document.getElementById("btn-reduce-motion").addEventListener("click", function () {
  document.body.classList.toggle("reduce-motion");
  if (document.body.classList.contains("reduce-motion") && discoOn) toggleDisco();
  this.innerText = "✋ Reduce Motion: " + (document.body.classList.contains("reduce-motion") ? "ON" : "OFF");
});

document.getElementById("btn-high-contrast").addEventListener("click", function () {
  document.body.classList.toggle("high-contrast");
  this.innerText = "⬛ High Contrast: " + (document.body.classList.contains("high-contrast") ? "ON" : "OFF");
});

document.getElementById("disco-btn").addEventListener("click", toggleDisco);

function toggleDisco() {
  if (document.body.classList.contains("reduce-motion")) return;
  discoOn = !discoOn;
  document.body.classList.toggle("disco", discoOn);
  if (discoOn) fireDiscoConfetti();
}

/* ── 5. Quiz Controls Setup ──────────────────── */
document.querySelectorAll(".mode-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    mode = btn.dataset.mode;
    document.body.classList.toggle("chaos-on", mode === "chaos");
    updateControlsForMode();
  });
});

document.querySelectorAll(".input-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".input-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    inputMethod = btn.dataset.input;
    if (quizActive) renderQ(currentQ);
  });
});

document.getElementById("sel-all").addEventListener("click", () => {
  document.querySelectorAll(".qcheck").forEach(c => c.checked = true);
});
document.getElementById("sel-none").addEventListener("click", () => {
  document.querySelectorAll(".qcheck").forEach(c => c.checked = false);
});

document.getElementById("start-btn").addEventListener("click", () => {
  if (mode === "game" || mode === "chaos") showGameOverlay();
  else startSession(false);
});
document.getElementById("smart-review-btn").addEventListener("click", () => startSession(true));

document.getElementById("check-btn").addEventListener("click", checkAnswer);
document.getElementById("next-btn").addEventListener("click", nextQuestion);
document.getElementById("answer-input").addEventListener("keypress", e => {
  if (e.key === "Enter" && !document.getElementById("check-btn").disabled) checkAnswer();
});
document.getElementById("fc-wrap").addEventListener("click", () => {
  document.getElementById("fc-wrap").classList.toggle("fc-flipped");
});

document.addEventListener("keydown", e => {
  if (mode === "flashcards" && quizActive) {
    if (e.code === "Space") { e.preventDefault(); document.getElementById("fc-wrap").classList.toggle("fc-flipped"); }
    if (e.code === "ArrowRight" && !document.getElementById("next-btn").disabled) nextQuestion();
  }
});

document.getElementById("btn-got-it").addEventListener("click", () => processResult(true, false));
document.getElementById("btn-missed-it").addEventListener("click", () => processResult(false, false));

// Game overlay
document.getElementById("overlay-start-btn").addEventListener("click", () => {
  document.getElementById("overlay").classList.remove("show");
  startGameSession();
});
document.getElementById("overlay-cancel-btn").addEventListener("click", () => {
  document.getElementById("overlay").classList.remove("show");
});

function updateControlsForMode() {
  const btn = document.getElementById("start-btn");
  const inputRow = document.getElementById("input-row");

  btn.innerText = {
    study:      "START SESSION",
    exam:       "START EXAM",
    flashcards: "START FLASHCARDS",
    game:       "⏱ OPEN GAME LOBBY",
    chaos:      "🌀 ENTER CHAOS",
  }[mode] || "START";

  const isTimedMode = mode === "game" || mode === "chaos";
  inputRow.style.display = isTimedMode ? "none" : "flex";
  document.getElementById("num-q").parentElement.style.display = isTimedMode ? "none" : "flex";
}

/* ── 6. Deck Building ────────────────────────── */
function getActiveTypes() {
  const t = Array.from(document.querySelectorAll(".qtype:checked")).map(c => c.value);
  return t.length ? t : ["gen_brand"];
}

function getFilteredDrugs() {
  const sel = new Set(Array.from(document.querySelectorAll(".qcheck:checked")).map(c => c.value));
  if (sel.size === 0) return allDrugs;
  return allDrugs.filter(d => d.quiz && sel.has(d.quiz));
}

function isValidType(type, drug) {
  switch (type) {
    case "gen_brand":   case "brand_gen":   return drug.brand && drug.brand.length > 0 && drug.brand[0] !== "-";
    case "gen_ind":     case "ind_gen":     return drug.indications && drug.indications.length > 0;
    case "brand_ind":   case "ind_brand":   return drug.brand?.length && drug.brand[0] !== "-" && drug.indications?.length;
    case "gen_class":   case "class_gen":   return !!drug.class;
    case "brand_class": case "class_brand": return drug.brand?.length && drug.brand[0] !== "-" && !!drug.class;
    default: return false;
  }
}

function buildDeck() {
  // Smart review: replay exact {drug, type} pairs that were missed
  if (isSmartReview) {
    deck = shuffle([...missedQueue]);
    return;
  }
  const pool  = getFilteredDrugs();
  const types = getActiveTypes();
  deck = [];
  pool.forEach(drug => {
    const valid = types.filter(t => isValidType(t, drug));
    if (valid.length) deck.push({ drug, type: valid[Math.floor(Math.random() * valid.length)] });
  });
  deck = shuffle(deck);
}

/* ── 7. Session Start ────────────────────────── */
function startSession(smartReview) {
  isSmartReview = smartReview;
  if (!smartReview) missedQueue = [];
  quizActive  = true;
  score       = 0;
  currentIdx  = 0;
  totalQ      = parseInt(document.getElementById("num-q").value);
  buildDeck();
  if (!deck.length) { alert("No questions available for selected filters."); return; }
  document.getElementById("game-hud").style.display = "none";
  document.getElementById("smart-review-btn").style.display = "none";
  resetFeedbackArea();
  generateQuestion();
  updateStats();
}

function showGameOverlay() {
  const isChaos = mode === "chaos";
  document.getElementById("overlay-title").innerText = isChaos ? "🌀 CHAOS MODE" : "⏱ TIME ATTACK";
  document.getElementById("overlay-title").style.color = isChaos ? "#06d6a0" : "var(--pink)";
  document.getElementById("overlay-desc").innerText = isChaos ? "Can you survive the chaos?!" : "Answer as many as you can!";
  document.getElementById("overlay-list").innerHTML = isChaos ? `
    <li>⏱ <strong>60 Seconds</strong></li>
    <li>🌪 Everything moves & flashes</li>
    <li>⚠️ <em>Epilepsy warning: flashing colors</em></li>
    <li>✅ Correct: <strong>+4s</strong></li>
    <li>❌ Wrong: <strong>-5s</strong></li>
  ` : `
    <li>⏱ <strong>60 Seconds</strong></li>
    <li>✅ Correct: <strong>+3s</strong></li>
    <li>❌ Wrong: <strong>-5s</strong></li>
  `;
  document.getElementById("overlay").classList.add("show");
}

function startGameSession() {
  quizActive   = true;
  score        = 0;
  gameTime     = 60;
  currentIdx   = 0;
  inputMethod  = "buttons";
  buildDeck();
  if (!deck.length) { alert("No questions available."); return; }
  const hud = document.getElementById("game-hud");
  hud.style.display = "flex";
  document.getElementById("timer-val").innerText = gameTime;
  document.getElementById("game-score-val").innerText = 0;
  resetFeedbackArea();
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    gameTime--;
    document.getElementById("timer-val").innerText = gameTime;
    if (gameTime <= 10) document.getElementById("timer-val").style.color = "var(--red)";
    if (gameTime <= 0)  endGame();
  }, 1000);
  generateQuestion();
}

/* ── 8. Question Generation & Building ──────── */
function generateQuestion() {
  if (mode !== "game" && mode !== "chaos" && !isSmartReview && totalQ !== 0 && currentIdx >= totalQ) {
    endQuiz(); return;
  }
  if (!deck.length) {
    if (isSmartReview) { endQuiz(); return; }
    buildDeck();
  }
  if (!deck.length) { endQuiz(); return; }

  const card = deck.pop();
  currentQ = buildQuestion(card.type, card.drug);
  if (!currentQ) { generateQuestion(); return; }
  renderQ(currentQ);
  updateStats();
}

function buildQuestion(type, drug) {
  function getDistractors(filterFn, mapFn, count = 3) {
    let pool = allDrugs.filter(d => d !== drug && filterFn(d)).flatMap(mapFn);
    pool = [...new Set(pool)].filter(Boolean);
    return shuffle(pool).slice(0, count);
  }

  let q = { drug, type, prompt: "", correctText: "", options: [], multiSelect: true };

  switch (type) {
    case "gen_brand": {
      q.prompt = `What is the brand name for ${drug.generic}?`;
      q.correctText = drug.brand.join(" / ");
      q.options = drug.brand.map(b => ({ text: b, correct: true }));
      const fill = Math.max(4 - q.options.length, 1);
      getDistractors(d => d.brand?.length && d.brand[0] !== "-", d => d.brand, fill + 2)
        .slice(0, fill).forEach(t => q.options.push({ text: t, correct: false }));
      break;
    }
    case "brand_gen": {
      q.prompt = `What is the generic name for ${drug.brand[0]}?`;
      q.correctText = drug.generic;
      q.options = [{ text: drug.generic, correct: true }];
      getDistractors(() => true, d => [d.generic], 3).forEach(t => q.options.push({ text: t, correct: false }));
      break;
    }
    case "gen_ind": {
      q.prompt = `What are the indications for ${drug.generic}?`;
      q.correctText = drug.indications.join(", ");
      q.options = drug.indications.map(i => ({ text: i, correct: true }));
      const fill = Math.max(4 - q.options.length, 1);
      const allInds = [...new Set(allDrugs.flatMap(d => d.indications))].filter(i => !drug.indications.includes(i));
      shuffle(allInds).slice(0, fill).forEach(i => q.options.push({ text: i, correct: false }));
      break;
    }
    case "brand_ind": {
      q.prompt = `What are the indications for ${drug.brand[0]}?`;
      q.correctText = drug.indications.join(", ");
      q.options = drug.indications.map(i => ({ text: i, correct: true }));
      const fill = Math.max(4 - q.options.length, 1);
      const allInds = [...new Set(allDrugs.flatMap(d => d.indications))].filter(i => !drug.indications.includes(i));
      shuffle(allInds).slice(0, fill).forEach(i => q.options.push({ text: i, correct: false }));
      break;
    }
    case "ind_gen": {
      const ind = drug.indications[Math.floor(Math.random() * drug.indications.length)];
      q.prompt = `Which generic(s) treat: "${ind}"?`;
      const allCorrect = allDrugs.filter(d => d.indications.includes(ind)).map(d => d.generic);
      q.correctText = allCorrect.join(", ");
      const shown = shuffle([...allCorrect]).slice(0, 3);
      q.options = shown.map(g => ({ text: g, correct: true }));
      const fill = Math.max(4 - q.options.length, 1);
      getDistractors(d => !d.indications.includes(ind), d => [d.generic], fill).forEach(t => q.options.push({ text: t, correct: false }));
      break;
    }
    case "ind_brand": {
      const ind = drug.indications[Math.floor(Math.random() * drug.indications.length)];
      q.prompt = `Which brand(s) treat: "${ind}"?`;
      const allCorrect = allDrugs.filter(d => d.indications.includes(ind) && d.brand.length && d.brand[0] !== "-").flatMap(d => d.brand);
      q.correctText = allCorrect.join(", ");
      const shown = shuffle([...allCorrect]).slice(0, 3);
      q.options = shown.map(b => ({ text: b, correct: true }));
      const fill = Math.max(4 - q.options.length, 1);
      getDistractors(d => !d.indications.includes(ind) && d.brand.length, d => d.brand, fill).forEach(t => q.options.push({ text: t, correct: false }));
      break;
    }
    case "gen_class": {
      q.prompt = `What is the therapeutic class of ${drug.generic}?`;
      q.correctText = drug.class;
      q.options = [{ text: drug.class, correct: true }];
      getDistractors(d => d.class && d.class !== drug.class, d => [d.class], 3).forEach(t => q.options.push({ text: t, correct: false }));
      break;
    }
    case "brand_class": {
      q.prompt = `What is the therapeutic class of ${drug.brand[0]}?`;
      q.correctText = drug.class;
      q.options = [{ text: drug.class, correct: true }];
      getDistractors(d => d.class && d.class !== drug.class, d => [d.class], 3).forEach(t => q.options.push({ text: t, correct: false }));
      break;
    }
    case "class_gen": {
      q.prompt = `Which generic(s) belong to: ${drug.class}?`;
      const allCorrect = allDrugs.filter(d => d.class === drug.class).map(d => d.generic);
      q.correctText = allCorrect.join(", ");
      const shown = shuffle([...allCorrect]).slice(0, 3);
      q.options = shown.map(g => ({ text: g, correct: true }));
      const fill = Math.max(4 - q.options.length, 1);
      getDistractors(d => d.class !== drug.class, d => [d.generic], fill).forEach(t => q.options.push({ text: t, correct: false }));
      break;
    }
    case "class_brand": {
      q.prompt = `Which brand(s) belong to: ${drug.class}?`;
      const allCorrect = allDrugs.filter(d => d.class === drug.class && d.brand.length && d.brand[0] !== "-").flatMap(d => d.brand);
      q.correctText = allCorrect.join(", ");
      const shown = shuffle([...allCorrect]).slice(0, 3);
      q.options = shown.map(b => ({ text: b, correct: true }));
      const fill = Math.max(4 - q.options.length, 1);
      getDistractors(d => d.class !== drug.class && d.brand.length, d => d.brand, fill).forEach(t => q.options.push({ text: t, correct: false }));
      break;
    }
    default: return null;
  }

  q.options = shuffle(q.options);
  return q;
}

/* ── 9. Render Question ──────────────────────── */
function renderQ(q) {
  if (!q) return;
  const qEl  = document.getElementById("question-text");
  const optEl = document.getElementById("options-grid");
  const tiEl  = document.getElementById("text-input-wrap");
  const fcEl  = document.getElementById("fc-wrap");

  resetFeedbackArea();

  // Chaos effects
  if (mode === "chaos") {
    const effects = ["eff-float", "eff-shake", "eff-pulse", "eff-spin", "eff-flash"];
    qEl.className  = effects[Math.floor(Math.random() * effects.length)];
    optEl.className = effects[Math.floor(Math.random() * effects.length)];
  } else {
    qEl.className  = "";
    optEl.className = "";
  }

  const corrCount = q.options.filter(o => o.correct).length;
  qEl.innerHTML = q.prompt + `<span class="select-hint">${corrCount > 1 ? "Select all that apply" : "Select one"}</span>`;

  // Flashcard mode
  if (mode === "flashcards") {
    fcEl.style.display = "block";
    optEl.style.display = "none";
    tiEl.style.display  = "none";
    fcEl.classList.remove("fc-flipped");
    document.getElementById("fc-front").innerText = q.prompt;
    document.getElementById("fc-back").innerText  = q.correctText;
    document.getElementById("check-btn").style.display = "none";
    document.getElementById("next-btn").style.display  = "inline-block";
    document.getElementById("next-btn").disabled = false;
    return;
  }

  fcEl.style.display = "none";
  document.getElementById("check-btn").style.display = "inline-block";
  document.getElementById("check-btn").disabled = false;
  document.getElementById("next-btn").style.display = "none";
  document.getElementById("next-btn").disabled = true;

  if (inputMethod === "text" && mode !== "game" && mode !== "chaos") {
    optEl.style.display = "none";
    tiEl.style.display  = "flex";
    document.getElementById("answer-input").value = "";
    document.getElementById("answer-input").focus();
  } else {
    tiEl.style.display  = "none";
    optEl.style.display = "grid";
    optEl.innerHTML = "";
    q.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "opt-btn";
      btn.innerText = opt.text;
      if (mode === "chaos") {
        const rot = (Math.random() * 20 - 10);
        const tx  = (Math.random() * 40 - 20);
        const ty  = (Math.random() * 30 - 15);
        btn.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
      }
      btn.addEventListener("click", () => btn.classList.toggle("selected"));
      optEl.appendChild(btn);
    });
  }
}

function resetFeedbackArea() {
  document.getElementById("feedback").innerHTML = "";
  document.getElementById("self-grade-btns").style.display = "none";
  document.getElementById("answer-input").value = "";
}

/* ── 10. Check Answer & Results ──────────────── */
function checkAnswer() {
  if (!currentQ) return;
  const q  = currentQ;
  if (mode === "flashcards") { nextQuestion(); return; }

  let correct = false, partial = false;
  const fb = document.getElementById("feedback");

  if (inputMethod === "buttons" || mode === "game" || mode === "chaos") {
    const selected = Array.from(document.querySelectorAll(".opt-btn.selected"));
    if (!selected.length) { fb.innerText = "Please select at least one answer."; return; }

    const totalCorrect = q.options.filter(o => o.correct).length;
    let corrSel = 0, incorrSel = 0;

    document.querySelectorAll(".opt-btn").forEach((btn, i) => {
      const opt   = q.options[i];
      const isSel = btn.classList.contains("selected");
      btn.onclick = null;
      if (isSel) { opt.correct ? corrSel++ : incorrSel++; }
      if (mode !== "exam") {
        if (opt.correct)       btn.classList.add("correct");
        else if (isSel)        btn.classList.add("incorrect");
      }
    });

    if (incorrSel === 0 && corrSel === totalCorrect) correct = true;
    else if (corrSel > 0) partial = true;

  } else {
    // Text input
    const val = document.getElementById("answer-input").value.trim();
    if (!val) { fb.innerText = "Please type an answer."; return; }

    const acceptable = [];
    if (q.drug.generic)      acceptable.push(q.drug.generic);
    if (q.drug.brand)        acceptable.push(...q.drug.brand);
    if (q.drug.indications)  acceptable.push(...q.drug.indications);
    q.options.filter(o => o.correct).forEach(o => acceptable.push(o.text));

    const isComplex = q.type.includes("ind") || q.type.includes("class");

    if (acceptable.some(a => fuzzyMatch(val, a))) {
      correct = true;
      fb.innerHTML = `<span style="color:var(--green)">✅ Correct!</span>`;
    } else if (!isComplex) {
      fb.innerHTML = `<span style="color:var(--red)">❌ Incorrect.</span> Answer: <strong>${q.correctText}</strong>`;
    } else {
      fb.innerHTML = `Correct answer(s): <strong>${q.correctText}</strong><br>Did you get it?`;
      document.getElementById("self-grade-btns").style.display = "flex";
      document.getElementById("check-btn").style.display = "none";
      return;
    }
  }

  processResult(correct, partial);
}

function processResult(correct, partial) {
  document.getElementById("self-grade-btns").style.display = "none";
  document.getElementById("check-btn").disabled = true;
  document.getElementById("next-btn").style.display  = "inline-block";
  document.getElementById("next-btn").disabled = false;
  document.querySelectorAll(".opt-btn").forEach(b => b.onclick = null);

  const fb = document.getElementById("feedback");

  if (correct) {
    score++;
    if (mode !== "exam") shootConfetti();
    if (mode === "game" || mode === "chaos") {
      const bonus = mode === "chaos" ? 4 : 3;
      gameTime += bonus;
      document.getElementById("timer-val").style.color = "var(--green)";
      setTimeout(() => document.getElementById("timer-val").style.color = "", 600);
      fb.innerHTML = `<span style="color:var(--green)">✅ Correct! +${bonus}s</span>`;
      setTimeout(nextQuestion, 750);
    } else if (mode !== "exam" && (inputMethod === "buttons" || mode === "game")) {
      fb.innerHTML = `<span style="color:var(--green)">✅ Correct!</span>`;
    }
  } else if (partial) {
    if (!missedQueue.some(m => m.drug === currentQ.drug && m.type === currentQ.type)) missedQueue.push({ drug: currentQ.drug, type: currentQ.type });
    if (mode === "game" || mode === "chaos") {
      gameTime -= 2;
      fb.innerHTML = `<span style="color:var(--yellow)">⚠️ Partial. -2s</span>`;
      setTimeout(nextQuestion, 750);
    } else if (mode !== "exam") {
      fb.innerHTML = `<span style="color:var(--yellow)">⚠️ Partially correct.</span> All: <strong>${currentQ.correctText}</strong>`;
    }
  } else {
    if (!missedQueue.some(m => m.drug === currentQ.drug && m.type === currentQ.type)) missedQueue.push({ drug: currentQ.drug, type: currentQ.type });
    if (mode === "game" || mode === "chaos") {
      gameTime -= 5;
      document.getElementById("timer-val").style.color = "var(--red)";
      fb.innerHTML = `<span style="color:var(--red)">❌ Wrong. -5s</span>`;
      setTimeout(nextQuestion, 750);
    } else if (mode !== "exam") {
      fb.innerHTML = `<span style="color:var(--red)">❌ Incorrect.</span> Answer: <strong>${currentQ.correctText}</strong>`;
    }
  }

  updateStats();
}

function nextQuestion() {
  if (!quizActive) return;
  currentIdx++;
  generateQuestion();
}

function endGame() {
  clearInterval(gameInterval);
  endQuiz();
}

/* ── 11. End Quiz ────────────────────────────── */
function endQuiz() {
  quizActive = false;
  if (gameInterval) { clearInterval(gameInterval); gameInterval = null; }

  document.getElementById("options-grid").innerHTML = "";
  document.getElementById("text-input-wrap").style.display = "none";
  document.getElementById("fc-wrap").style.display = "none";
  document.getElementById("game-hud").style.display = "none";
  document.getElementById("question-text").innerHTML = "Session Complete! 🎉";
  document.getElementById("check-btn").style.display = "none";
  document.getElementById("next-btn").style.display  = "none";

  const total = (mode === "game" || mode === "chaos")
    ? currentIdx
    : (isSmartReview || totalQ === 0 ? currentIdx : totalQ);
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  if (mode === "exam" && pct >= 70) shootConfetti();

  const missedBtn = missedQueue.length > 0
    ? `<br><button id="review-missed-btn" style="background:var(--pink-light);color:var(--pink);border:1.5px solid var(--pink);border-radius:8px;padding:8px 18px;cursor:pointer;font-weight:700;margin-top:8px;font-family:var(--font);">🔁 Review ${missedQueue.length} Missed Item${missedQueue.length > 1 ? "s" : ""}</button>`
    : "";

  document.getElementById("feedback").innerHTML = `
    <div style="font-size:1.3em;font-weight:700;margin-bottom:8px;">${(mode === "game" || mode === "chaos") ? "⏱ Time's Up!" : "✅ Quiz Complete!"}</div>
    <div style="font-size:1.1em;margin-bottom:12px;">Score: <strong>${score} / ${total}</strong> (${pct}%)</div>
    <div style="opacity:0.6;font-size:0.9em;">Keep studying — you've got this! 💊</div>
    ${missedBtn}
    <br><button id="restart-btn" style="background:var(--text);color:var(--bg);border:none;border-radius:8px;padding:8px 20px;cursor:pointer;font-weight:700;margin-top:10px;font-family:var(--font);">↩ New Session</button>
  `;

  if (missedQueue.length > 0) {
    document.getElementById("smart-review-btn").style.display = "block";
    document.getElementById("smart-review-btn").innerText = `🔁 Review ${missedQueue.length} Missed Items`;
    document.getElementById("review-missed-btn")?.addEventListener("click", () => startSession(true));
  }

  document.getElementById("restart-btn")?.addEventListener("click", () => {
    document.getElementById("feedback").innerHTML = "";
    document.getElementById("question-text").innerHTML = "Configure settings above and hit Start. 🎯";
    document.getElementById("check-btn").style.display = "inline-block";
    document.getElementById("check-btn").disabled = true;
    document.getElementById("stat-left").innerText  = "";
    document.getElementById("stat-right").innerText = "";
    document.getElementById("progress-fill").style.width = "0%";
    document.body.classList.remove("chaos-on");
  });

  document.getElementById("stat-left").innerText  = "";
  document.getElementById("stat-right").innerText = `Final: ${score}/${total} (${pct}%)`;
  document.getElementById("progress-fill").style.width = "100%";
}

/* ── 12. Stats Update ────────────────────────── */
function updateStats() {
  const sl = document.getElementById("stat-left");
  const sr = document.getElementById("stat-right");

  if (mode === "game" || mode === "chaos") {
    document.getElementById("game-score-val").innerText = score;
    sl.innerText = "";
    sr.innerText = "";
    document.getElementById("progress-fill").style.width =
      Math.min((currentIdx / Math.max(1, deck.length + currentIdx)) * 100, 100) + "%";
    return;
  }
  if (!quizActive) return;
  sl.innerText = isSmartReview
    ? `Smart Review: Q ${currentIdx + 1}`
    : totalQ === 0 ? `Q ${currentIdx + 1}` : `Q ${currentIdx + 1} / ${totalQ}`;
  sr.innerText = mode === "exam" ? "" : `Score: ${score}`;
  if (!isSmartReview && totalQ !== 0)
    document.getElementById("progress-fill").style.width = (currentIdx / totalQ * 100) + "%";
  else
    document.getElementById("progress-fill").style.width = "50%";
}

/* ── 13. Matching Game ───────────────────────── */
let matchSelected = null;   // { el, type, drug, text }
let matchPairs    = [];     // { generic, brand, matched }
let matchErrors   = 0;
let matchMatched  = 0;
let matchTotal    = 0;
let matchStartTime = null;

function initMatchGame() {
  // Pick 6 drugs that have brands, from active quiz filters
  const sel = new Set(Array.from(document.querySelectorAll(".qcheck:checked")).map(c => c.value));
  let pool = allDrugs.filter(d => d.brand?.length && d.brand[0] !== "-" && (!sel.size || sel.has(d.quiz)));
  if (pool.length < 4) pool = allDrugs.filter(d => d.brand?.length && d.brand[0] !== "-");
  pool = shuffle(pool).slice(0, 6);

  matchPairs    = pool.map(d => ({ generic: d.generic, brand: d.brand[0], matched: false }));
  matchErrors   = 0;
  matchMatched  = 0;
  matchTotal    = matchPairs.length;
  matchSelected = null;
  matchStartTime = Date.now();

  renderMatchBoard();
}

function renderMatchBoard() {
  const container = document.getElementById("match-container");
  if (!container) return;

  const generics = shuffle(matchPairs.map(p => p.generic));
  const brands   = shuffle(matchPairs.map(p => p.brand));

  container.innerHTML = `
    <div class="match-header">
      <div class="match-title">🃏 Drug Deal — Match Generics to Brands</div>
      <div class="match-meta">
        <span>Matched: <strong id="match-matched">0</strong> / ${matchTotal}</span>
        <span>Errors: <strong id="match-errors">0</strong></span>
      </div>
    </div>
    <div class="match-board">
      <div>
        <div class="match-col-label">Generic Names</div>
        <div class="match-col" id="match-generics">
          ${generics.map(g => `<div class="match-card" data-type="generic" data-value="${g}">${g}</div>`).join("")}
        </div>
      </div>
      <div>
        <div class="match-col-label">Brand Names</div>
        <div class="match-col" id="match-brands">
          ${brands.map(b => `<div class="match-card" data-type="brand" data-value="${b}">${b}</div>`).join("")}
        </div>
      </div>
    </div>
    <div class="match-controls">
      <button id="match-new-btn">🔀 New Round</button>
      <button id="match-back-btn">← Back to Quiz</button>
    </div>
  `;

  container.querySelectorAll(".match-card").forEach(card => {
    card.addEventListener("click", handleMatchClick);
  });

  document.getElementById("match-new-btn").addEventListener("click", initMatchGame);
  document.getElementById("match-back-btn").addEventListener("click", () => {
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.querySelector(".nav-tab[data-page='quiz']").classList.add("active");
    document.getElementById("page-quiz").classList.add("active");
  });
}

function handleMatchClick(e) {
  const card = e.currentTarget;
  if (card.classList.contains("matched")) return;

  const type  = card.dataset.type;
  const value = card.dataset.value;

  // Deselect if clicking same card
  if (matchSelected && matchSelected.el === card) {
    card.classList.remove("selected");
    matchSelected = null;
    return;
  }

  // First pick
  if (!matchSelected) {
    if (matchSelected?.el) matchSelected.el.classList.remove("selected");
    card.classList.add("selected");
    matchSelected = { el: card, type, value };
    return;
  }

  // Second pick — must be opposite type
  if (matchSelected.type === type) {
    // Same type: move selection
    matchSelected.el.classList.remove("selected");
    card.classList.add("selected");
    matchSelected = { el: card, type, value };
    return;
  }

  // Check if it's a pair
  const genVal   = type === "generic" ? value : matchSelected.value;
  const brandVal = type === "brand"   ? value : matchSelected.value;
  const pair = matchPairs.find(p => p.generic === genVal && p.brand === brandVal);

  if (pair) {
    // Correct match!
    pair.matched = true;
    matchMatched++;
    card.classList.remove("selected");
    card.classList.add("matched");
    matchSelected.el.classList.remove("selected");
    matchSelected.el.classList.add("matched");
    matchSelected = null;
    document.getElementById("match-matched").innerText = matchMatched;

    if (matchMatched === matchTotal) {
      const elapsed = Math.round((Date.now() - matchStartTime) / 1000);
      setTimeout(() => showMatchComplete(elapsed), 300);
      shootConfetti();
    }
  } else {
    // Wrong match
    matchErrors++;
    document.getElementById("match-errors").innerText = matchErrors;
    card.classList.add("wrong");
    matchSelected.el.classList.add("wrong");
    const prevEl = matchSelected.el;
    matchSelected = null;
    setTimeout(() => {
      card.classList.remove("wrong", "selected");
      prevEl.classList.remove("wrong", "selected");
    }, 500);
  }
}

function showMatchComplete(elapsed) {
  const container = document.getElementById("match-container");
  const star = matchErrors === 0 ? "🌟" : matchErrors <= 2 ? "⭐" : "✅";
  container.innerHTML = `
    <div class="match-complete">
      <div class="match-complete-title">${star} Round Complete!</div>
      <div class="match-complete-score">
        Matched all ${matchTotal} pairs in <strong>${elapsed}s</strong> with <strong>${matchErrors} error${matchErrors !== 1 ? "s" : ""}</strong>
      </div>
      <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
        <button id="match-new-btn" style="background:var(--pink);color:#fff;border:none;padding:12px 28px;border-radius:10px;font-family:var(--font);font-size:1em;font-weight:700;cursor:pointer;">🔀 Play Again</button>
        <button id="match-back-btn" style="background:var(--card);color:var(--text);border:1.5px solid var(--border);padding:12px 28px;border-radius:10px;font-family:var(--font);font-size:1em;font-weight:700;cursor:pointer;">← Back to Quiz</button>
      </div>
    </div>
  `;
  document.getElementById("match-new-btn").addEventListener("click", initMatchGame);
  document.getElementById("match-back-btn").addEventListener("click", () => {
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.querySelector(".nav-tab[data-page='quiz']").classList.add("active");
    document.getElementById("page-quiz").classList.add("active");
  });
}

/* ── 14. Reference Tables ────────────────────── */
let currentRefSet = "fall";

document.querySelectorAll(".ref-tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".ref-tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentRefSet = btn.dataset.ref;
    renderReference(currentRefSet);
  });
});

document.getElementById("ref-search").addEventListener("input", function () {
  renderReference(currentRefSet, this.value.toLowerCase());
});

const fallSectionNames = {
  F1:  "Quiz 1: Asthma & Allergies",
  F2:  "Quiz 2: Diabetes & Antiplatelet",
  F3:  "Quiz 3: Insomnia / Pain / Stimulants",
  F4:  "Quiz 4: GI & Supplements",
  F5:  "Quiz 5: Women's & Men's Health",
  F6:  "Quiz 6: HTN & Lipids",
  F7:  "Quiz 7: Antibiotics I",
  F8:  "Quiz 8: Antibiotics II",
  F9:  "Quiz 9: Antidepressants",
  F10: "Quiz 10: Antipsychotics & Antianxiety",
};

const winterSectionNames = {
  W1: "Quiz 1: Cardiovascular I",
  W2: "Quiz 2: Cardiovascular II",
  W3: "Quiz 3: Cardiovascular III",
  W4: "Quiz 4: Pain I",
  W5: "Quiz 5: Pain II",
  W6: "Quiz 6: Women's / Men's Health & HIV",
  W7: "Quiz 7: Asthma & COPD",
  W8: "Quiz 8: Neurology",
  W9: "Quiz 9: Miscellaneous",
};

function renderReference(set, search = "") {
  const drugs    = set === "fall" ? fallDrugs : winterDrugs;
  const sections = set === "fall" ? fallSectionNames : winterSectionNames;
  const container = document.getElementById("ref-content");
  let html = "";

  Object.entries(sections).forEach(([key, title]) => {
    const sectionDrugs = drugs.filter(d => d.quiz === key);
    const filtered = search
      ? sectionDrugs.filter(d =>
          d.generic.toLowerCase().includes(search) ||
          d.brand.join(" ").toLowerCase().includes(search) ||
          d.class.toLowerCase().includes(search) ||
          d.indications.join(" ").toLowerCase().includes(search)
        )
      : sectionDrugs;

    if (!filtered.length) return;

    html += `
      <div class="quiz-section">
        <div class="quiz-section-title">${title}</div>
        <table class="ref-table">
          <thead><tr>
            <th>Generic</th>
            <th>Brand(s)</th>
            <th>Therapeutic Class</th>
            <th>Indications</th>
          </tr></thead>
          <tbody>
    `;

    filtered.forEach(d => {
      const brands = d.brand.filter(b => b && b !== "-").map(b => `<span class="brand-cell">${b}</span>`).join(", ");
      const inds   = d.indications.map(i => `<span class="ind-pill">${i}</span>`).join(" ");
      html += `
        <tr>
          <td class="generic-cell">${d.generic}</td>
          <td>${brands || "—"}</td>
          <td class="class-cell">${d.class}</td>
          <td class="ind-cell">${inds || "—"}</td>
        </tr>
      `;
    });

    html += `</tbody></table></div>`;
  });

  container.innerHTML = html || `<p style="opacity:0.5; padding:20px;">No results found for "${search}"</p>`;
}

/* ── 15. Feedback Form ───────────────────────── */
document.getElementById("feedback-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const btn = document.getElementById("feedback-submit");
  btn.disabled = true;
  btn.innerText = "Sending...";

  try {
    const response = await fetch(this.action, {
      method: "POST",
      body: new FormData(this),
      headers: { "Accept": "application/json" },
    });

    if (response.ok) {
      document.getElementById("form-success").style.display = "block";
      this.reset();
      btn.innerText = "✅ Sent!";
    } else {
      btn.innerText = "Failed — try again";
      btn.disabled  = false;
    }
  } catch {
    btn.innerText = "Failed — try again";
    btn.disabled  = false;
  }
});

/* ── 16. Init ────────────────────────────────── */
updateControlsForMode();
renderReference("fall");
