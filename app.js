/* app.js — DOM API만 사용 (innerHTML/백틱 미사용) */
console.log("[app.js] 로드 OK");

// ===== 설정 =====
const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbx2pBnha3LyPzlzklccW8JKDa-0TA_46L7lOE9g3F7gNbsaYOKau9qWOHjicsMX-kzNNQ/exec";
const ANGELS_SRC = "angels.json";

// ===== 데이터 =====
const questions = [
  { question: "혼자 있는 시간이 많은 사람을 볼 때 당신은?", options: ["외로워 보인다", "편안해 보인다", "불안해다", "관심 없다"] },
  { question: "사람과 갈등에 처한 사람을 볼 때 당신은?", options: ["다정하게 위로하며 경청한다", "같이 화를 내준다", "해결책을 제시한다", "상대방의 입장도 생각해본다"] },
  { question: "당신이 남들과 공유하고싶지 않은 감정은?", options: ["슬픔", "분노", "죄책감", "무기력"] },
  { question: "무기력에 빠진 주변 사람을 볼 때 당신은", options: ["억지로라도 일을 만들라고 말한다", "아무것도 안하는게 최고야! 쉬어!", "당장 약속을 잡고 수다를 떤다", "내 코가 석자, 알아서 잘하겠거니 하고 넘긴다"] },
  { question: "눅누가 힘들어 할 때 나만의 위로 방식은?", options: ["응원의 문자 보내기", "현실적인 조언과 계획 나누기", "맛있는 저녁 사주기", "시간이 약이다, 기다려주기"] }
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
  bestMatch: best?.name ?? null,
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
