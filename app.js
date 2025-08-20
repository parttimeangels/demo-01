// app.js

const quizData = [
  {
    question: "지금 당신의 기분은 어떤가요?",
    options: ["불안하고 복잡하다", "조용히 위로받고 싶다", "누군가 대신 결정을 내려줬으면 한다", "그냥 아무 말이나 나누고 싶다"]
  },
  {
    question: "상담자에게 바라는 태도는?",
    options: ["논리적이고 분석적인", "다정하고 수용적인", "직설적이고 현실적인", "엉뚱하고 창의적인"]
  },
  {
    question: "가장 힘들었던 기억은 어떤 감정이었나요?",
    options: ["버려졌다는 느낌", "죄책감과 후회", "수치심과 분노", "막연한 공허함"]
  },
  {
    question: "이상적인 대화 상대는?",
    options: ["내 말을 잘 정리해주는 사람", "말 없이 곁에 있어주는 사람", "강한 리더십으로 이끌어주는 사람", "내 상상을 따라와 주는 사람"]
  },
  {
    question: "지금 가장 필요한 것은?",
    options: ["명확한 해답", "공감과 위로", "현실적인 조언", "재미와 자극"]
  }
];

let currentQuestion = 0;
let answers = [];

const questionBox = document.getElementById("question-box");
const optionsBox = document.getElementById("options");
const resultSection = document.getElementById("result");
const bestMatchBox = document.getElementById("best-match");
const otherMatchesBox = document.getElementById("other-matches");

function showQuestion(index) {
  const q = quizData[index];
  questionBox.innerText = q.question;
  optionsBox.innerHTML = "";

  q.options.forEach((option, i) => {
    const btn = document.createElement("button");
    btn.classList.add("option");
    btn.innerText = option;
    btn.addEventListener("click", () => handleAnswer(i));
    optionsBox.appendChild(btn);
  });
}

function handleAnswer(answerIndex) {
  answers.push(answerIndex);
  currentQuestion++;

  if (currentQuestion < quizData.length) {
    showQuestion(currentQuestion);
  } else {
    showResult();
  }
}

async function showResult() {
  const response = await fetch("angels.json");
  const angels = await response.json();

  const scores = angels.map(angel => {
    let score = 0;
    answers.forEach((ans, i) => {
      if (angel.profile[i] === ans) score++;
    });
    return { ...angel, score };
  });

  scores.sort((a, b) => b.score - a.score);
  const [best, ...others] = scores;

  document.getElementById("quiz").classList.add("hidden");
  resultSection.classList.remove("hidden");

  bestMatchBox.innerHTML = `
    <div class="angel-card">
      <h3>${best.name}</h3>
      <p>${best.description}</p>
      <img src="${best.photo}" alt="${best.name}" style="width:100%; max-width:300px; border-radius:12px; margin-top:10px;" />
    </div>
  `;

  otherMatchesBox.innerHTML = others.slice(0, 3).map(a => `
    <div class="angel-card">
      <strong>${a.name}</strong>
      <p style="font-size:0.9em; opacity:0.8;">매칭률: ${a.score}/5</p>
    </div>
  `).join("");

  // 저장
  const formData = new FormData();
  formData.append("answers", answers.join(","));
  formData.append("bestMatch", best.name);

  fetch("https://script.google.com/macros/s/AKfycbw8D5Wt6ZPu6k0zPCCKUwdtuPo34vX7qfuzqJz6UpNZoZyWj4Dp0Fh2_ezctjOrsqZyEg/exec", {
    method: "POST",
    body: formData
  });
}

// 시작
showQuestion(currentQuestion);
