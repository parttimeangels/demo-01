const $ = (id) => document.getElementById(id);
let selectedAngelName = null;

const questions = [
  {
    question: "Q1. 요즘 가장 가까운 감정은?",
    options: ["무기력함", "불안함", "분노", "상실감"],
    tags: ["depressed", "anxious", "angry", "grieving"]
  },
  {
    question: "Q2. 감정을 가장 많이 나누는 대상은?",
    options: ["나 자신 뿐이다", "가족이나 연인", "친구나 동료", "전문가"],
    tags: ["closed", "intimate", "social", "self-aware"]
  },
  {
    question: "Q3. 필요한 위로의 방식은?",
    options: ["잘 들어주는 사람", "그저 곁에 있어주는 사람", "단호한 조언자", "함께 울어주는 사람"],
    tags: ["listener", "presence", "directive", "empathetic"]
  },
  {
    question: "Q4. 지금 떠오르는 장소는?",
    options: ["아무도 없는 빈 방", "익숙한 거리", "병원이나 상담실", "어린 시절 집"],
    tags: ["isolated", "ordinary", "healing", "nostalgic"]
  },
  {
    question: "Q5. 나 자신을 표현하자면?",
    options: ["감정을 숨긴다", "속마음을 알고 싶다", "감정에 솔직하다", "타인 감정에 민감하다"],
    tags: ["guarded", "curious", "expressive", "sensitive"]
  }
];

const angels = [
  { name: "Angel J", tags: ["grieving", "empathetic", "nostalgic"], desc: "상실과 그리움에 깊이 공감하는 엔젤입니다." },
  { name: "Angel L", tags: ["anxious", "presence", "healing"], desc: "불안을 다정히 감싸주는 치유형 엔젤입니다." },
  { name: "Angel H", tags: ["angry", "directive", "expressive"], desc: "분노와 혼란 속에서도 방향을 제시하는 강단 있는 엔젤입니다." },
  { name: "Angel Y", tags: ["depressed", "listener", "isolated"], desc: "고요한 공간에서 조용히 함께해주는 위로형 엔젤입니다." }
];

let current = 0;
const userTags = [];

const box = $("question-box");
const options = $("options");
const quiz = $("quiz");
const result = $("result");
const bestMatch = $("best-match");
const otherMatches = $("other-matches");

function showQuestion() {
  box.textContent = questions[current].question;
  options.innerHTML = "";
  questions[current].options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "option";
    btn.onclick = () => {
      userTags.push(questions[current].tags[idx]);
      current++;
      if (current < questions.length) showQuestion();
      else showResult();
    };
    options.appendChild(btn);
  });
}

function showResult() {
  quiz.classList.add("hidden");
  result.classList.remove("hidden");

  const scores = angels.map(a => {
    const match = a.tags.filter(tag => userTags.includes(tag)).length;
    return { ...a, score: match };
  }).sort((a, b) => b.score - a.score);

  const top = scores[0];
  selectedAngelName = top.name;
  bestMatch.innerHTML = `<h3>${top.name}</h3><p>${top.desc}</p>`;

  scores.slice(1, 3).forEach(a => {
    const div = document.createElement("div");
    div.className = "angel-card";
    div.innerHTML = `<h4>${a.name}</h4><p>매칭률 ${a.score}/3</p><p>${a.desc}</p>`;
    otherMatches.appendChild(div);
  });

  sendToSheet(top);
}

// ✅ 결과 Google 시트로 전송
function sendToSheet(result) {
  const submitData = {
    nickname: "관객",  // 나중에 입력란 추가 가능
    q1: userTags[0],
    q2: userTags[1],
    q3: userTags[2],
    q4: userTags[3],
    q5: userTags[4],
    matched_angel: result.name,
    match_score: result.score
  };

  fetch("https://script.google.com/macros/s/AKfycbw8D5Wt6ZPu6k0zPCCKUwdtuPo34vX7qfuzqJz6UpNZoZyWj4Dp0Fh2_ezctjOrsqZyEg/exec", {
    method: "POST",
    body: JSON.stringify(submitData),
    headers: { "Content-Type": "application/json" }
  }).then(() => {
    console.log("✅ 응답 결과가 Google 시트에 저장되었습니다.");
  }).catch(() => {
    console.error("❌ 저장 실패: Google Apps Script 응답 오류");
  });
}

showQuestion();
