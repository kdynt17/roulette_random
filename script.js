const defaults = [
  { name: "\ucd08\ucf54\ud30c\uc774", percent: 12.5 },
  { name: "\uc0c8\uc6b0\uae61", percent: 12.5 },
  { name: "\ud3ec\uce74\uce69", percent: 12.5 },
  { name: "\ube7c\ube7c\ub85c", percent: 12.5 },
  { name: "\ubabd\uc258", percent: 12.5 },
  { name: "\uc624\uc608\uc2a4", percent: 12.5 },
  { name: "\ub9c8\uc774\ucbb8", percent: 12.5 },
  { name: "\ucd08\ucf5c\ub9bf", percent: 12.5 },
];

const labels = {
  name: "\uc0c1\ud488\uba85",
  prize: "\uc0c1\ud488",
  percent: "\ud655\ub960",
  delete: "\uc0ad\uc81c",
  spinning: "\ub3cc\uc544\uac00\ub294 \uc911...",
  ready: "\ub8f0\ub81b\uc744 \ub3cc\ub824\uc8fc\uc138\uc694",
  newPrize: "\uc0c8 \uc0c1\ud488",
};

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
const prizeRows = document.querySelector("#prizeRows");
const addButton = document.querySelector("#addButton");
const spinButton = document.querySelector("#spinButton");
const shuffleButton = document.querySelector("#shuffleButton");
const resetButton = document.querySelector("#resetButton");
const resultText = document.querySelector("#resultText");
const historyList = document.querySelector("#historyList");
const totalPercent = document.querySelector("#totalPercent");
const summary = document.querySelector(".summary");

let currentRotation = 0;
let currentItems = [];
let history = [];

function cloneDefaults() {
  return defaults.map((item) => ({ ...item }));
}

function normalizePercent(value) {
  const parsed = Number.parseFloat(String(value).replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function formatPercent(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function getRows() {
  return [...prizeRows.querySelectorAll(".prize-row")];
}

function getItems() {
  const items = getRows()
    .map((row) => {
      const name = row.querySelector(".name-field").value.trim();
      const percent = normalizePercent(row.querySelector(".percent-field").value);
      return { name, percent };
    })
    .filter((item) => item.name && item.percent > 0);

  return items.length > 0 ? items : cloneDefaults();
}

function getTotal(items) {
  return items.reduce((sum, item) => sum + item.percent, 0);
}

function renderRows(items) {
  prizeRows.innerHTML = "";

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "prize-row";

    const nameInput = document.createElement("input");
    nameInput.className = "name-field";
    nameInput.type = "text";
    nameInput.value = item.name;
    nameInput.setAttribute("aria-label", labels.name);

    const percentInput = document.createElement("input");
    percentInput.className = "percent-field";
    percentInput.type = "number";
    percentInput.min = "0";
    percentInput.step = "0.1";
    percentInput.value = formatPercent(item.percent);
    percentInput.setAttribute("aria-label", `${item.name || labels.prize} ${labels.percent}`);

    const removeButton = document.createElement("button");
    removeButton.className = "remove-button";
    removeButton.type = "button";
    removeButton.textContent = "\u00d7";
    removeButton.setAttribute("aria-label", `${item.name || labels.prize} ${labels.delete}`);

    row.append(nameInput, percentInput, removeButton);
    prizeRows.append(row);
  });

  updateWheelFromRows();
}

function updateSummary(items) {
  const total = getTotal(items);
  totalPercent.textContent = `${formatPercent(total)}%`;
  summary.classList.toggle("is-invalid", Math.abs(total - 100) > 0.01);
}

function drawWheel(items) {
  currentItems = items;
  const size = canvas.width;
  const center = size / 2;
  const radius = center - 22;
  const total = getTotal(items);
  let angle = -Math.PI / 2;

  ctx.clearRect(0, 0, size, size);

  items.forEach((item, index) => {
    const segment = (Math.PI * 2 * item.percent) / total;
    const start = angle;
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
    ctx.font = "700 34px Arial, sans-serif";
    ctx.shadowColor = "rgba(25, 33, 42, 0.35)";
    ctx.shadowBlur = 4;
    ctx.fillText(`${item.name} ${formatPercent(item.percent)}%`, radius - 38, 0, radius * 0.62);
    ctx.restore();

    angle = end;
  });

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.lineWidth = 18;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(center, center, 88, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

function updateWheelFromRows() {
  const items = getItems();
  updateSummary(items);
  drawWheel(items);
}

function renderHistory() {
  historyList.innerHTML = "";

  history.slice(0, 5).forEach((item) => {
    const entry = document.createElement("li");
    entry.textContent = item;
    historyList.append(entry);
  });
}

function randomUnit() {
  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  return randomValues[0] / 2 ** 32;
}

function pickWeightedItem(items) {
  const total = getTotal(items);
  let cursor = randomUnit() * total;

  for (let index = 0; index < items.length; index += 1) {
    cursor -= items[index].percent;

    if (cursor <= 0) {
      return index;
    }
  }

  return items.length - 1;
}

function getSegmentCenterDegrees(items, selectedIndex) {
  const total = getTotal(items);
  let start = 0;

  for (let index = 0; index < selectedIndex; index += 1) {
    start += (items[index].percent / total) * 360;
  }

  return start + (items[selectedIndex].percent / total) * 180;
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function spin() {
  const items = getItems();
  drawWheel(items);

  spinButton.disabled = true;
  resultText.textContent = labels.spinning;

  const selectedIndex = pickWeightedItem(items);
  const targetCenter = getSegmentCenterDegrees(items, selectedIndex);
  const targetRotation = normalizeDegrees(360 - targetCenter);
  const currentAngle = normalizeDegrees(currentRotation);
  const turns = 6 + Math.floor(Math.random() * 4);
  const delta = turns * 360 + normalizeDegrees(targetRotation - currentAngle);

  currentRotation += delta;
  canvas.style.transform = `rotate(${currentRotation}deg)`;

  window.setTimeout(() => {
    const picked = items[selectedIndex].name;
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

  renderRows(shuffled);
}

function resetItems() {
  history = [];
  resultText.textContent = labels.ready;
  renderHistory();
  renderRows(cloneDefaults());
}

function addItem() {
  renderRows([...getItems(), { name: labels.newPrize, percent: 10 }]);
}

prizeRows.addEventListener("input", updateWheelFromRows);
prizeRows.addEventListener("click", (event) => {
  if (!event.target.classList.contains("remove-button")) {
    return;
  }

  const rows = getRows();

  if (rows.length <= 1) {
    return;
  }

  event.target.closest(".prize-row").remove();
  updateWheelFromRows();
});

addButton.addEventListener("click", addItem);
spinButton.addEventListener("click", spin);
shuffleButton.addEventListener("click", shuffleItems);
resetButton.addEventListener("click", resetItems);

renderRows(cloneDefaults());
