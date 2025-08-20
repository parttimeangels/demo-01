/* app.js — DOM API만 사용 (innerHTML/백틱 미사용) */
console.log("[app.js] 로드 OK");

// ===== 설정 =====
const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbw9flu7oc49WOywz-FlUc1JfzWsdopiMgOH_kRsdLWwtgEPtsnwVj_mvYIq1yPgXFSdAQ/exec";
const ANGELS_SRC = "angels.json";

// ===== 데이터 =====
const questions = [
  { question: "혼자 있는 시간이 많을 때 당신은?", options: ["외로워진다", "편안하다", "불안하다", "무감각해진다"] },
  { question: "사람과 갈등이 생겼을 때 당신의 반응은?", options: ["화를 내고 후회한다", "상대 탓을 한다", "내 탓을 한다", "아무렇지 않은 척 한다"] },
  { question: "당신이 가장 두려워하는 감정은?", options: ["슬픔", "분노", "죄책감", "무기력"] },
  { question: "당신의 하루가 무의미하다고 느껴질 때", options: ["억지로라도 할 일을 만든다", "아무것도 하지 않는다", "누군가를 만나 위로받고 싶다", "그냥 그런 날도 있지 하며 넘긴다"] },
  { question: "지금 당신에게 가장 필요한 것은?", options: ["다정한 말", "현실적인 조언", "함께 있어줄 사람", "아무 말 없이 들어주는 사람"] }
];

// ===== 상태 =====
let currentQuestionIndex = 0;
const userAnswers = new Array(questions.length).fill(undefined);
const $ = (id) => document.getElementById(id);

// ===== 토글 =====
function showSection(which) {
  const quiz = $("quiz");
  const result = $("result");
  if (which === "quiz") {
    quiz.classList.remove("hidden");
    result.classList.add("hidden");
  } else {
    result.classList.remove("hidden");
    quiz.classList.add("hidden");
  }
}

// ===== 질문 렌더 =====
function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    showResult();
    return;
  }
  showSection("quiz");

  const q = questions[currentQuestionIndex];
  const questionBox = $("question-box");
  const optionsBox = $("options");
  const prevBtn = $("prevBtn");
  const nextBtn = $("nextBtn");

  // 질문 텍스트
  questionBox.textContent = q.question;

  // 기존 옵션 제거
  while (optionsBox.firstChild) optionsBox.removeChild(optionsBox.firstChild);

  // 옵션 생성
  q.options.forEach((label, idx) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.type = "button";
    btn.textContent = label;

    if (userAnswers[currentQuestionIndex] === idx) {
      btn.classList.add("selected");
      nextBtn.disabled = false;
    }

    btn.addEventListener("click", () => {
      const all = optionsBox.querySelectorAll(".option");
      all.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      userAnswers[currentQuestionIndex] = idx;
      nextBtn.disabled = false;
    });

    optionsBox.appendChild(btn);
  });

  prevBtn.disabled = currentQuestionIndex === 0;
  nextBtn.disabled = userAnswers[currentQuestionIndex] === undefined;
}

// ===== 네비게이션 =====
function bindNav() {
  $("prevBtn").addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      showQuestion();
    }
  });

  $("nextBtn").addEventListener("click", () => {
    if (userAnswers[currentQuestionIndex] === undefined) return;
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      showQuestion();
    } else {
      showResult();
    }
  });
}

// ===== 결과 렌더 =====
async function showResult() {
  showSection("result");

  try {
    const res = await fetch(ANGELS_SRC);
    const angels = await res.json();

    const total = userAnswers.reduce((a, b) => a + (b ?? 0), 0);
    const bestIndex = angels.length ? total % angels.length : 0;
    const best = angels[bestIndex] || {};
    const others = angels.filter((_, i) => i !== bestIndex).slice(0, 2);

    // 베스트 매치 카드
    renderAngelCard($("best-match"), best, true);

    // 다른 추천 2개
    const otherWrap = $("other-matches");
    while (otherWrap.firstChild) otherWrap.removeChild(otherWrap.firstChild);
    others.forEach((a) => {
      const card = buildAngelCard(a, false);
      otherWrap.appendChild(card);
    });

    // 저장 (CORS-safe)
    saveToSheet({
      answers: userAnswers,
      bestMatch: best && best.name ? best.name : null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("결과 처리 오류:", err);
    const bm = $("best-match");
    while (bm.firstChild) bm.removeChild(bm.firstChild);
    const p = document.createElement("p");
    p.textContent = "결과를 불러오는 데 문제가 발생했습니다.";
    bm.appendChild(p);
  }
}

// 카드 빌더(동일)
function buildAngelCard(angel, isBest) {
  const wrap = document.createElement("div");
  wrap.className = "angel-card";

  const title = document.createElement(isBest ? "h3" : "h4");
  title.textContent = angel && angel.name ? angel.name : "Angel";
  wrap.appendChild(title);

  const desc = document.createElement("p");
  desc.textContent = angel && angel.description ? angel.description : "";
  wrap.appendChild(desc);

  if (angel && angel.image) {
    const img = document.createElement("img");
    img.src = angel.image;
    img.alt = angel.name || "Angel";
    wrap.appendChild(img);
  }

  return wrap;
}

function renderAngelCard(container, angel, isBest) {
  while (container.firstChild) container.removeChild(container.firstChild);
  container.appendChild(buildAngelCard(angel, isBest));
}

// ===== 시트 저장 (sendBeacon → no-cors) =====
function saveToSheet(payload) {
  const data = JSON.stringify(payload);
  const blob = new Blob([data], { type: "text/plain;charset=UTF-8" });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(WEB_APP_URL, blob);
    return;
  }
  fetch(WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: data
  }).catch(() => {});
}

// ===== 다시하기 =====
function bindRestart() {
  const btn = $("restartBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    currentQuestionIndex = 0;
    for (let i = 0; i < userAnswers.length; i++) userAnswers[i] = undefined;
    showSection("quiz");
    showQuestion();
  });
}

// ===== 초기화 =====
window.addEventListener("DOMContentLoaded", () => {
  console.log("[app.js] DOMContentLoaded init");
  showSection("quiz");
  bindNav();
  bindRestart();
  showQuestion();
});
