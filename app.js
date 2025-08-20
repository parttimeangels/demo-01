const questions = [


async function showResult() {
document.getElementById("quiz").classList.add("hidden");
document.getElementById("result").classList.remove("hidden");


try {
const response = await fetch("angels.json");
const angels = await response.json();


const score = userAnswers.reduce((a, b) => a + b, 0);
const bestIndex = score % angels.length;
const bestAngel = angels[bestIndex];
const others = angels.filter((_, i) => i !== bestIndex).slice(0, 2);


document.getElementById("best-match").innerHTML = `
<div class="angel-card">
<h3>${bestAngel.name}</h3>
<p>${bestAngel.description}</p>
<img src="${bestAngel.image}" alt="${bestAngel.name}" />
</div>
`;


const otherDiv = document.getElementById("other-matches");
otherDiv.innerHTML = "";
others.forEach(a => {
const div = document.createElement("div");
div.className = "angel-card";
div.innerHTML = `<h4>${a.name}</h4><p>${a.description}</p>`;
otherDiv.appendChild(div);
});


// Google Apps Script 연동
await fetch("https://script.google.com/macros/s/AKfycbypCCeRa-i4vIRBioEIxqKziSPghABPVxLl8oLc1qoIC0xdTiN6jQUHz-r77_NPXlcU4Q/exec", {
method: "POST",
mode: "no-cors",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ answers: userAnswers })
});


} catch (error) {
console.error("결과 로딩 실패:", error);
document.getElementById("best-match").innerText = "결과를 불러오는 데 문제가 발생했습니다.";
}
}


window.onload = showQuestion;
