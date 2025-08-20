// ==========================
// 부트 로그
// ==========================
console.log('[app.js] 로드 OK (2025-08-21)');

// ==========================
// 설정
// ==========================
const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbw9flu7oc49WOywz-FlUc1JfzWsdopiMgOH_kRsdLWwtgEPtsnwVj_mvYIq1yPgXFSdAQ/exec";
const ANGELS_SRC = "angels.json";

// ==========================
// 질문 데이터
// ==========================
const questions = [
  { question: "혼자 있는 시간이 많을 때 당신은?", options: ["외로워진다", "편안하다", "불안하다", "무감각해진다"] },
  { question: "사람과 갈등이 생겼을 때 당신의 반응은?", options: ["화를 내고 후회한다", "상대 탓을 한다", "내 탓을 한다", "아무렇지 않은 척 한다"] },
  { question: "당신이 가장 두려워하는 감정은?", options: ["슬픔", "분노", "죄책감", "무기력"] },
  { question: "당신의 하루가 무의미하다고 느껴질 때", options: ["억지로라도 할 일을 만든다", "아무것도 하지 않는다", "누군가를 만나 위로받고 싶다", "그냥 그런 날도 있지 하며 넘긴다"] },
  { question: "지금 당신에게 가장 필요한 것은?", options: ["다정한 말", "현실적인 조언", "함께 있어줄 사람", "아무 말 없이 들어주는 사람"] }
];

// ==========================
// 상태 & 헬퍼
// ==========================
let currentQuestionIndex = 0;
const userAnswers = new Array(questions.length).fill(undefined);
const $ = (id) => document.getElementById(id);

// ==========================
// 질문 렌더
// ==========================
function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    showResult();
    return;
  }

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

    // 기존 선택 표시
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

// ==========================
// 네비게이션
// ==========================
function bindNav() {
  $("prevBtn").onclick = () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      showQuestion();
    }
  };

  $("nextBtn").onclick = () => {
    if (userAnswers[currentQuestionIndex] === undefined) return;
    if (currentQuestionIndex < questions.length
