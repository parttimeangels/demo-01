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

let currentQuestionIndex = 0;
const userAnswers = new Array(questions.length).fill(null);

function showQuestion() {
  const questionBox = document.getElementById("question-box");
  const optionsBox = document.getElementById("options");
  optionsBox.innerHTML = "";

  if (currentQuestionIndex >= questions.length) {
    showResult();
    return;
  }

  const current = questions[currentQuestionIndex];
  questionBox.innerText = current.question;

  current.options.forEach((optionText, idx) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.innerText = optionText;

    if (userAnswers[currentQuestionIndex] === idx) {
      btn.classList.add("selected");
    }

    btn.onclick = () => {
      userAnswers[currentQuestionIndex] = idx;
      currentQuestionIndex++;
      showQuestion();
    };
    optionsBox.appendChild(btn);
  });

  const navContainer = document.createElement("div");
  navContainer.className = "nav-container";

  const prevBtn = document.createElement("button");
  prevBtn.innerText = "이전";
  prevBtn.className = "nav-button";
  prevBtn.onclick = () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      showQuestion();
    } else {
      // 첫 질문이면 시작화면으로
      document.getElementById("quiz").classList.add("hidden");
      document.getElementById("start").classList.remove("hidden");
    }
  };

  navContainer.appendChild(prevBtn);
  optionsBox.appendChild(document.createElement("hr"));
  optionsBox.appendChild(navContainer);
}

async function showResult() {
  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("result").classList.remove("hidden");

  try {
    const response = await fetch("angels.json");
    const angels = await response.json();

    const score = userAnswers.reduce((a, b) => a + (b ?? 0), 0);
    const bestIndex = score % angels.length;
    const bestAngel = angels[bestIndex];

    // 나머지 추천엔젤 (중복 없이)
    const others = angels
      .map((a, i) => ({ ...a, originalIndex: i }))
      .filter(a => a.originalIndex !== bestIndex)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    const bestDiv = document.getElementById("best-match");
    bestDiv.innerHTML = `
      <div class="angel-card highlight">
        <img src="${bestAngel.image}" alt="${bestAngel.name}" />
        <h3>${bestAngel.name}</h3>
        <p>${bestAngel.description}</p>
      </div>
    `;

    const otherDiv = document.getElementById("other-matches");
    otherDiv.innerHTML = "";
    others.forEach(a => {
      const div = document.createElement("div");
      div.className = "angel-card";
      div.innerHTML = `
        <img src="${a.image}" alt="${a.name}" />
        <h4>${a.name}</h4>
        <p>${a.description}</p>
      `;
      otherDiv.appendChild(div);
    });

  } catch (error) {
    console.error("결과 오류:", error);
    document.getElementById("best-match").innerText = "결과를 불러오는 데 문제가 발생했습니다.";
  }
}

function startQuiz() {
  currentQuestionIndex = 0;
  userAnswers.fill(null);
  document.getElementById("start").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");
  document.getElementById("result").classList.add("hidden");
  showQuestion();
}

function restartQuiz() {
  currentQuestionIndex = 0;
  userAnswers.fill(null);
  document.getElementById("result").classList.add("hidden");
  document.getElementById("start").classList.remove("hidden");
}

window.onload = function () {
  document.getElementById("start").classList.remove("hidden");
  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("result").classList.add("hidden");
};
