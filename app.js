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

document.getElementById("start-btn").onclick = () => {
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");
  showQuestion();
};

document.getElementById("prev-btn").onclick = () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
};

document.getElementById("next-btn").onclick = () => {
  if (userAnswers[currentQuestionIndex] !== null) {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      showResult();
    }
  } else {
    alert("옵션을 선택해주세요.");
  }
};

function showQuestion() {
  const q = questions[currentQuestionIndex];
  const questionBox = document.getElementById("question-box");
  const optionsBox = document.getElementById("options");

  questionBox.innerText = q.question;
  optionsBox.innerHTML = "";

  q.options.forEach((optionText, idx) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.innerText = optionText;
    if (userAnswers[currentQuestionIndex] === idx) btn.classList.add("selected");

    btn.onclick = () => {
      userAnswers[currentQuestionIndex] = idx;
      showQuestion();
    };
    optionsBox.appendChild(btn);
  });

  document.getElementById("prev-btn").disabled = currentQuestionIndex === 0;
  document.getElementById("next-btn").innerText =
    currentQuestionIndex === questions.length - 1 ? "결과보기" : "다음";
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
    const others = angels.filter((_, i) => i !== bestIndex).slice(0, 2);

    const bestDiv = document.getElementById("best-match");
    bestDiv.innerHTML = `
      <div class="angel-card">
        <img src="${bestAngel.image}" alt="${bestAngel.name}">
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
        <img src="${a.image}" alt="${a.name}">
        <h4>${a.name}</h4>
        <p>${a.description}</p>
      `;
      otherDiv.appendChild(div);
    });

  } catch (err) {
    document.getElementById("best-match").innerText = "결과를 불러오는 데 문제가 발생했습니다.";
    console.error(err);
  }
}

function restartQuiz() {
  currentQuestionIndex = 0;
  userAnswers.fill(null);
  document.getElementById("result").classList.add("hidden");
  document.getElementById("start-screen").classList.remove("hidden");
}
