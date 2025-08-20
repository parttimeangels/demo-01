const $ = (id) => document.getElementById(id);

$("#startBtn").onclick = () => {
  $("#landing").classList.add("hidden");
  $("#browser").classList.remove("hidden");
  loadAngels();
};

async function loadAngels() {
  const res = await fetch("data/angels.json", { cache: "no-store" });
  const angels = await res.json();

  const container = $("#card-container");
  container.innerHTML = "";

  angels.forEach((angel, i) => {
    const card = document.createElement("div");
    card.className = "card";
    const imgSrc = angel.photo.startsWith("http") ? angel.photo : `assets/${angel.photo}`;
    card.innerHTML = `
      <img src="${imgSrc}" alt="${angel.name}">
      <h3>${angel.name}</h3>
      <p>${angel.skill}</p>
      <p style="opacity:.7">${angel.bio}</p>
      <button class="pick" data-index="${i}">선택하기</button>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll(".pick").forEach(btn => {
    btn.addEventListener("click", (e) => chooseAngel(Number(e.target.dataset.index)));
  });
}

async function chooseAngel(index) {
  const angels = await (await fetch("data/angels.json", { cache: "no-store" })).json();
  const angel = angels[index];
  $("#browser").classList.add("hidden");
  $("#match").classList.remove("hidden");
  $("#matchName").innerText = `매칭 성공: ${angel.name}`;
  $("#matchBio").innerText = angel.bio;
}

$("#finishBtn").onclick = () => {
  $("#match").classList.add("hidden");
  $("#final").classList.remove("hidden");
};
