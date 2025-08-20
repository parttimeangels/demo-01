let currentQuestion = 0;
let answers = [];

let questions = [
  {
    question: "지금 가장 필요한 감정은 무엇인가요?",
    options: ["위로", "조언", "침묵", "응원"]
  },
  {
    question: "당신이 선호하는 소통 방식은?",
    options: ["다정한 말투", "논리적인 설명", "묵묵한 경청", "유쾌한 농담"]
  },
  {
    question: "당신은 어떤 상황에서 힘을 얻나요?",
    options: ["감정을 공감받을 때", "현실적인 해결책을 들을 때", "조용히 함께 있어줄 때", "웃으며 넘길 수 있을 때"]
  },
  {
    question: "당신이 원하는 관계의 거리는?",
    options: ["가까운 친구처럼", "멘토처럼", "그림자처럼", "가볍게 스쳐가는 인연"]
  },
  {
    question: "지금 당신의 상태에 가장 가까운 것은?",
    options: ["마음이 무겁고 외롭다", "혼란스럽고 복잡하다", "말로 설명할 수 없다", "그냥 누군가 있으면 좋겠다"]
  }
];

let angelsData = [];
let selectedAngels = [];

// 엔젤 JSON 로드
async function loadAngels() {
  const response = await fetch("angels.json");
  angelsData = await response.json();
}

// 첫 질문 렌더링
function showQuestion() {
  const quizDiv = document.getElementById("quiz");
  quizDiv.innerHTML = "";

  const q = questions[currentQuestion];

  const questionEl = document.createElement("h2");
  questionEl.textContent = q.question;
  quizDiv.appendChild(questionEl);

  q.options.forEach(option => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-button");
    button.addEventListener("click", () => {
      answers.push(option);
      currentQuestion++;
      if (currentQuestion < questions.length) {
        showQuestion();
      } else {
        matchAngels();
        showResult();
      }
    });
    quizDiv.appendChild(button);
  });
}

// 엔젤 매칭 로직 (랜덤 3명 추천)
function matchAngels() {
  const shuffled = angelsData.sort(() => 0.5 - Math.random());
  selectedAngels = shuffled.slice(0, 3);
}

// 결과 화면 표시
function showResult() {
  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("result").classList.remove("hidden");

  const mainAngel = selectedAngels[0];
  const otherAngels = selectedAngels.slice(1);

  document.getElementById("main-angel-name").textContent = mainAngel.name;
  document.getElementById("main-angel-description").textContent = mainAngel.description;
  document.getElementById("main-angel-image").src = mainAngel.image;
  document.getElementById("main-angel-image").alt = mainAngel.name;

  const othersContainer = document.getElementById("other-angels");
  othersContainer.innerHTML = "";

  otherAngels.forEach(angel => {
    const div = document.createElement("div");
    div.className = "other-angel-card";
    div.innerHTML = `
      <img src="${angel.image}" alt="${angel.name}" class="other-angel-image" />
      <div>
        <h4>${angel.name}</h4>
        <p>${angel.description}</p>
      </div>
    `;
    othersContainer.appendChild(div);
  });
}

// 다시 시작
function restartQuiz() {
  currentQuestion = 0;
  answers = [];
  selectedAngels = [];
  document.getElementById("result").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");
  showQuestion();
}

// 페이지 로드 시 초기화
window.onload = async function () {
  await loadAngels();
  showQuestion();

  const restartBtn = document.getElementById("restart-btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", restartQuiz);
  }
};
