// ✅ app.js (최종 완성본)

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
const userAnswers = [];

function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    showResult();
    return;
  }

  const questionBox = document.getElementById("question-box");
  const optionsBox = document.getElementById("options");

  const current = questions[currentQuestionIndex];
  questionBox.innerText = current.question;
  optionsBox.innerHTML = "";

  current.options.forEach((optionText, idx) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.innerText = optionText;
    btn.onclick = () => {
      userAnswers.push(idx);
      currentQuestionIndex++;
      showQuestion();
    };
    optionsBox.appendChild(btn);
  });
}

async function showResult() {
  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("result").classList.remove("hidden");

  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzBovZgNHU5SaC98A6LFe07OGKXjcXkQQ_esIhVq3PRtwbL_gI3QBoqgVVLjPLRg5F2Gw/exec";

  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({ answers: userAnswers })
    });

    const data = await response.json();
    const { bestMatch, others } = data;

    const bestDiv = document.getElementById("best-match");
    bestDiv.innerHTML = `
      <div class="angel-card">
        <h3>${bestMatch.name}</h3>
        <p>${bestMatch.description}</p>
        <img src="${bestMatch.image}" alt="${bestMatch.name}" style="max-width: 100%; margin-top: 12px;" />
      </div>
    `;

    const otherDiv = document.getElementById("other-matches");
    otherDiv.innerHTML = "";
    others.forEach(a => {
      const div = document.createElement("div");
      div.className = "angel-card";
      div.innerHTML = `
        <h4>${a.name}</h4>
        <p>${a.description}</p>
      `;
      otherDiv.appendChild(div);
    });

  } catch (error) {
    console.error("Google 웹앱 연동 실패:", error);
    document.getElementById("best-match").innerText = "결과를 불러오는 데 문제가 발생했습니다.";
  }
}

window.onload = showQuestion;
