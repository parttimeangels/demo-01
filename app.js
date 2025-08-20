```javascript
/* app.js — 최종본
   - 퀴즈/결과 섹션 토글(showSection)
   - 이전/다음 네비게이션 + 선택 하이라이트
   - 결과 렌더(베스트 + 다른 추천 2명, 이미지 포함)
   - Google Apps Script 저장 (sendBeacon → no-cors 대체)
*/
console.log('[app.js] 로드 OK');

// ==== 설정 ====
const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbypCCeRa-i4vIRBioEIxqKziSPghABPVxLl8oLc1qoIC0xdTiN6jQUHz-r77_NPXlcU4Q/exec";
const ANGELS_SRC = "angels.json";

// ==== 질문 데이터 ====
const questions = [
  { question: "혼자 있는 시간이 많을 때 당신은?", options: ["외로워진다", "편안하다", "불안하다", "무감각해진다"] },
  { question: "사람과 갈등이 생겼을 때 당신의 반응은?", options: ["화를 내고 후회한다", "상대 탓을 한다", "내 탓을 한다", "아무렇지 않은 척 한다"] },
  { question: "당신이 가장 두려워하는 감정은?", options: ["슬픔", "분노", "죄책감", "무기력"] },
  { question: "당신의 하루가 무의미하다고 느껴질 때", options: ["억지로라도 할 일을 만든다", "아무것도 하지 않는다", "누군가를 만나 위로받고 싶다", "그냥 그런 날도 있지 하며 넘긴다"] },
  { question: "지금 당신에게 가장 필요한 것은?", options: ["다정한 말", "현실적인 조언", "함께 있어줄 사람", "아무 말 없이 들어주는 사람"] }
];

// ==== 상태/헬퍼 ====
let currentQuestionIndex = 0;
const userAnswers = new Array(questions.length).fill(undefined);
const $ = (id) => document.getElementById(id);

// 섹션 토글 (상태 꼬임 방지용)
function showSection(which) {
  const quiz = $("quiz");
  const result = $("result");
  if (which === "quiz") {
    quiz.classList.remove("hidden");
    result.classList.add("hidden");
  } else if (which === "result") {
    result.classList.remove("hidden");
    quiz.classList.add("hidden");
  }
}

// ==== 질문 렌더 ====
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

  questionBox.textContent = q.question;
  optionsBox.innerHTML = "";

  q.options.forEach((label, idx) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = label;

    if (userAnswers[currentQuestionIndex] === idx) {
      btn.classList.add("selected");
      nextBtn.disabled = false;
    }

    btn.onclick = () => {
      optionsBox.querySelectorAll(".option").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      userAnswers[currentQuestionIndex] = idx;
      nextBtn.disabled = false;
    };

    optionsBox.appendChild(btn);
  });

  prevBtn.disabled = currentQuestionIndex === 0;
  nextBtn.disabled = userAnswers[currentQuestionIndex] === undefined;
}

// ==== 네비게이션 ====
function bindNav() {
  $("prevBtn").onclick = () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      showQuestion();
    }
  };

  $("nextBtn").onclick = () => {
    if (userAnswers[currentQuestionIndex] === undefined) return;
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      showQuestion();
    } else {
      showResult();
    }
  };
}

// ==== 결과 표시 ====
async function showResult() {
  showSection("result");

  try {
    const res = await fetch(ANGELS_SRC);
    const angels = await res.json();

    const total = userAnswers.reduce((a, b) => a + (b ?? 0), 0);
    const bestIndex = angels.length ? total % angels.length : 0;
    const best = angels[bestIndex] || {};
    const others = angels.filter((_, i) => i !== bestIndex).slice(0, 2);

    $("best-match").innerHTML = `
      <div class="angel-card">
        <h3>${best.name ?? "Angel"}</h3>
        <p>${best.description ?? ""}</p>
        ${best.image ? `<img src="${best.image}" alt="${best.name ?? "Angel"}" />` : ""}
      </div>
    `;

    const otherWrap = $("other-matches");
    otherWrap.innerHTML = "";
    others.forEach((a) => {
      const div = document.createElement("div");
      div.className = "angel-card";
      div.innerHTML = `
        <h4>${a.name ?? "Angel"}</h4>
        <p>${a.description ?? ""}</p>
        ${a.image ? `<img src="${a.image}" alt="${a.name ?? "Angel"}" />` : ""}
      `;
      otherWrap.appendChild(div);
    });

    // 시트 저장 (응답은 읽지 않음: CORS 회피)
    saveToSheet({
      answers: userAnswers,
      bestMatch: best?.name ?? null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("결과 처리 오류:", err);
    $("best-match").textContent = "결과를 불러오는 데 문제가 발생했습니다.";
  }
}

// ==== Google Sheet 저장 (CORS-safe) ====
function saveToSheet(payload) {
  const data = JSON.stringify(payload);
  const blob = new Blob([data], { type: "text/plain;charset=UTF-8" });

  // 1) 가장 안전: sendBeacon (응답 읽지 않음)
  if (navigator.sendBeacon) {
    navigator.sendBeacon(WEB_APP_URL, blob);
    return;
  }
  // 2) 대체: no-cors fetch (opaque 응답, 서버엔 전달됨)
  fetch(WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: data
  }).catch(() => {});
}

// ==== 처음부터 다시하기 ====
function bindRestart() {
  const btn = $("restartBtn");
  if (!btn) return;
  btn.onclick = () => {
    currentQuestionIndex = 0;
    userAnswers.fill(undefined);
    showSection("quiz");
    showQuestion();
  };
}

// ==== 초기화 ====
window.addEventListener("DOMContentLoaded", () => {
  console.log('[app.js] DOMContentLoaded init');
  showSection("quiz");   // 초기 상태 확정
  bindNav();
  bindRestart();
  showQuestion();
});
```
