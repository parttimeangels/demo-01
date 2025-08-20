document.getElementById("startBtn").onclick = () => {
  document.getElementById("landing").classList.add("hidden");
  document.getElementById("browser").classList.remove("hidden");
  loadAngels();
};

async function loadAngels() {
  const res = await fetch("data/angels.json");
  const angels = await res.json();

  const container = document.getElementById("card-container");
  container.innerHTML = "";

  angels.forEach((angel, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="assets/${angel.photo}" alt="${angel.name}">
      <h3>${angel.name}</h3>
      <p>${angel.skill}</p>
      <button onclick="chooseAngel(${i})">선택하기</button>
    `;
    container.appendChild(card);
  });
}

function chooseAngel(index) {
  fetch("data/angels.json")
    .then(res => res.json())
    .then(angels => {
      const angel = angels[index];
      document.getElementById("browser").classList.add("hidden");
      document.getElementById("match").classList.remove("hidden");
      document.getElementById("matchName").innerText = `매칭 성공: ${angel.name}`;
      document.getElementById("matchBio").innerText = angel.bio;
    });
}

document.getElementById("finishBtn").onclick = () => {
  document.getElementById("match").classList.add("hidden");
  document.getElementById("final").classList.remove("hidden");
};
