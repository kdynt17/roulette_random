const defaults = [
  "초코파이",
  "새우깡",
  "포카칩",
  "빼빼로",
  "몽쉘",
  "오예스",
  "마이쮸",
  "초콜릿",
];

const colors = [
  "#e54b4b",
  "#f6c85f",
  "#5aa9a8",
  "#7d6b91",
  "#f08a5d",
  "#3d5a80",
  "#8ab17d",
  "#d67ab1",
];

const canvas = document.querySelector("#wheel");
const ctx = canvas.getContext("2d");
const input = document.querySelector("#snackInput");
const spinButton = document.querySelector("#spinButton");
const shuffleButton = document.querySelector("#shuffleButton");
const resetButton = document.querySelector("#resetButton");
const resultText = document.querySelector("#resultText");
const historyList = document.querySelector("#historyList");

let currentRotation = 0;
let currentItems = [];
let history = [];

function getItems() {
  const items = input.value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 1 ? items : defaults;
}

function drawWheel(items) {
  currentItems = items;
  const size = canvas.width;
  const center = size / 2;
  const radius = center - 18;
  const segment = (Math.PI * 2) / items.length;

  ctx.clearRect(0, 0, size, size);

  items.forEach((item, index) => {
    const start = index * segment - Math.PI / 2;
    const end = start + segment;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + segment / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 30px Arial, sans-serif";
    ctx.shadowColor = "rgba(25, 33, 42, 0.35)";
    ctx.shadowBlur = 4;
    ctx.fillText(item, radius - 34, 0, radius * 0.58);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.lineWidth = 16;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(center, center, 78, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

function renderHistory() {
  historyList.innerHTML = "";

  history.slice(0, 5).forEach((item) => {
    const entry = document.createElement("li");
    entry.textContent = item;
    historyList.append(entry);
  });
}

function pickIndex(items) {
  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  return randomValues[0] % items.length;
}

function spin() {
  const items = getItems();
  drawWheel(items);

  spinButton.disabled = true;
  resultText.textContent = "돌아가는 중...";

  const selectedIndex = pickIndex(items);
  const segmentDegrees = 360 / items.length;
  const targetCenter = selectedIndex * segmentDegrees + segmentDegrees / 2;
  const turns = 6 + Math.floor(Math.random() * 4);
  const finalRotation = turns * 360 + (360 - targetCenter);

  currentRotation += finalRotation;
  canvas.style.transform = `rotate(${currentRotation}deg)`;

  window.setTimeout(() => {
    const picked = items[selectedIndex];
    resultText.textContent = picked;
    history = [picked, ...history.filter((item) => item !== picked)];
    renderHistory();
    spinButton.disabled = false;
  }, 4700);
}

function shuffleItems() {
  const shuffled = [...getItems()];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }

  input.value = shuffled.join("\n");
  drawWheel(shuffled);
}

function resetItems() {
  input.value = defaults.join("\n");
  history = [];
  resultText.textContent = "룰렛을 돌려주세요";
  renderHistory();
  drawWheel(defaults);
}

input.addEventListener("input", () => drawWheel(getItems()));
spinButton.addEventListener("click", spin);
shuffleButton.addEventListener("click", shuffleItems);
resetButton.addEventListener("click", resetItems);

drawWheel(getItems());
