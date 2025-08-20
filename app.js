const questions = [
  {
    question: "혼자 있는 시간이 많을 때 당신은?",
    options: ["외로워진다", "편안하다", "불안하다", "무감각해진다"]
  },
  {
    question: "사람과 갈등이 생겼을 때 당신의 반응은?",
    options: ["화를 내고 후회한다", "상대 탓을 한다", "내 탓을 한다", "아무렇지 않은 척 한다"]
  },
  {
    question: "당신이 가장 두려워하는 감정은?",
    options: ["슬픔", "분노", "죄책감", "무기력"]
  },
  {
    question: "당신의 하루가 무의미하다고 느껴질 때",
    options: ["억지로라도 할 일을 만든다", "아무것도 하지 않는다", "누군가를 만나 위로받고 싶다", "그냥 그런 날도 있지 하며 넘긴다"]
  },
  {
    question: "지금 당신에게 가장 필요한 것은?",
    options: ["다정한 말", "현실적인 조언", "함께 있어줄 사람", "아무 말 없이 들어주는 사람"]
  }
];

let currentIndex = 0;
let userAnswers = [];

const questionText = document.getElementById("question-text");
const answerButtons = document.getElementById("answer-buttons");
const nextBtn = document.getElementById("next-btn");
const quizSection = document.getElementById("quiz");
const resultSection = document.getElementById("result");
const restartBtn = document.getElementById("restart-btn");

const mainAngelName = document.getElementById("main-angel-name");
const mainAngelDesc = document.getElementById("main-angel-description");
const mainAngelImage = document.getElementById("main-angel-image");
const otherAngelsContainer = document.getElementById("other-angels");

function startQuiz() {
  currentIndex = 0;
  userAnswers = [];
  quizSection.classList.remove("hidden");
  resultSection.classList.add("hidden");
  showQuestion();
}

function showQuestion() {
  const current = questions[currentIndex];
  questionText.innerText = current.question;
  answerButtons.innerHTML = "";

  current.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.classList.add("option-btn");
    btn.onclick = () => {
      userAnswers.push(i);
      currentIndex++;
      if (currentIndex < questions.length) {
        showQuestion();
      } else {
        showResult();
      }
    };
    answerButtons.appendChild(btn);
  });
}

async function showResult() {
  quizSection.classList.add("hidden");
  resultSection.classList.remove("hidden");

  try {
    const res = await fetch("angels.json");
    const angels = await res.json();

    const score = userAnswers.reduce((a, b) => a + b, 0);
    const bestIndex = score % angels.length;
    const bestAngel = angels[bestIndex];

    // 메인 엔젤 표시
    mainAngelName.innerText = bestAngel.name;
    mainAngelDesc.innerText = bestAngel.description;
    mainAngelImage.src = bestAngel.image;

    // 보조 엔젤 추천 (최대 2명)
    const others = angels.filter((_, i) => i !== bestIndex).slice(0, 2);
    otherAngelsContainer.innerHTML = "";

    others.forEach(angel => {
      const card = document.createElement("div");
      card.className = "other-angel-card";
      card.innerHTML = `
        <img src="${angel.image}" alt="${angel.name}" class="other-angel-image" />
        <h4>${angel.name}</h4>
        <p>${angel.description}</p>
      `;
      otherAngelsContainer.appendChild(card);
    });

  } catch (err) {
    console.error("결과 불러오기 오류:", err);
    mainAngelName.innerText = "문제가 발생했습니다.";
    mainAngelDesc.innerText = "결과 데이터를 불러올 수 없습니다.";
  }
}

// 버튼 핸들링
restartBtn.onclick = startQuiz;

// 시작
window.onload = startQuiz;
