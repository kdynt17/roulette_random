const presets = {
  300: [
    { name: "\ub9c8\uc774\ucbb8 1\uac1c", weight: 18.7 },
    { name: "ABC \ucd08\ucf5c\ub9bf 1\uac1c", weight: 16.7 },
    { name: "\uba58\ud1a0\uc2a4 1\uac1c", weight: 14.7 },
    { name: "\ud558\ub9ac\ubcf4 \ubbf8\ub2c8 1\uac1c", weight: 10.7 },
    { name: "\ud2b8\uc717\uc2a4 \ubbf8\ub2c8 1\uac1c", weight: 8.7 },
    { name: "\ub9c8\uc774\ucbb8 2\uac1c", weight: 12.7 },
    { name: "ABC \ucd08\ucf5c\ub9bf 2\uac1c", weight: 10.7 },
    { name: "\ubc84\ud130\ub5a1 1\uac1c", weight: 4.5 },
    { name: "\uac04\uc2dd 2\uac1c \ud68d\ub4dd", weight: 1.3 },
    { name: "\uc790\ub9ac \ub9ac\ub864\uad8c", weight: 1 },
    { name: "\ub450\ucabc\ucfe0 1\uac1c", weight: 0.3 },
  ],
  500: [
    { name: "\ub9c8\uc774\ucbb8 2\uac1c", weight: 15 },
    { name: "ABC \ucd08\ucf5c\ub9bf 2\uac1c", weight: 14 },
    { name: "\uba58\ud1a0\uc2a4 2\uac1c", weight: 13 },
    { name: "\ud558\ub9ac\ubcf4 \ubbf8\ub2c8 2\uac1c", weight: 10 },
    { name: "\ud2b8\uc717\uc2a4 \ubbf8\ub2c8 2\uac1c", weight: 8 },
    { name: "\ub9c8\uc774\ucbb8 3\uac1c", weight: 12 },
    { name: "ABC \ucd08\ucf5c\ub9bf 3\uac1c", weight: 10 },
    { name: "\ubc84\ud130\ub5a1 1\uac1c", weight: 7 },
    { name: "\ub79c\ub364 \uac04\uc2dd 3\uac1c", weight: 4 },
    { name: "\uc790\ub9ac \ub9ac\ub864\uad8c", weight: 2 },
    { name: "\uc544\uc774\uc2a4\ud06c\ub9bc 1\uac1c", weight: 4.5 },
    { name: "\ub450\ucabc\ucfe0 1\uac1c", weight: 0.5 },
  ],
  1000: [
    { name: "\ubabd\uc258 1\uac1c", weight: 13 },
    { name: "\ucd08\ucf54\ud305\ucd09 1\uac1c", weight: 8 },
    { name: "\ub9c8\uac00\ub81b\ud2b8 1\uac1c", weight: 10 },
    { name: "\uce74\uc2a4\ud14c\ub77c 1\uac1c", weight: 10 },
    { name: "\ucd08\ucf54\ud30c\uc774 1\uac1c", weight: 10 },
    { name: "\uc624\uc608\uc2a4 1\uac1c", weight: 10 },
    { name: "\uc544\uc774\uc2a4\ud06c\ub9bc 1\uac1c", weight: 8 },
    { name: "\ub3c4\ub9ac\ud1a0\uc2a4 1\ubd09", weight: 6 },
    { name: "\uc0c8\uc6b0\uae61 1\ubd09", weight: 6 },
    { name: "\ub79c\ub364 \uc74c\ub8cc\uc218 1\uce94", weight: 9 },
    { name: "\uc790\ub9ac \ub9ac\ub864\uad8c", weight: 4 },
    { name: "\uc790\ub9ac \uc120\ud0dd\uad8c", weight: 3 },
    { name: "\uccad\uc18c \uba74\uc81c\uad8c", weight: 2 },
    { name: "\ub450\ucabc\ucfe0 1\uac1c", weight: 1 },
  ],
};

const labels = {
  name: "\uc0c1\ud488\uba85",
  prize: "\uc0c1\ud488",
  weight: "\ube44\uc728",
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
const tierTabs = document.querySelectorAll(".tier-tab");
const addButton = document.querySelector("#addButton");
const spinButton = document.querySelector("#spinButton");
const shuffleButton = document.querySelector("#shuffleButton");
const resetButton = document.querySelector("#resetButton");
const resultText = document.querySelector("#resultText");
const historyList = document.querySelector("#historyList");
const totalWeight = document.querySelector("#totalWeight");
const tierTitle = document.querySelector("#tierTitle");
const summary = document.querySelector(".summary");

let currentRotation = 0;
let currentItems = [];
let history = [];
let activeTier = "300";
let itemsByTier = Object.fromEntries(
  Object.entries(presets).map(([tier, items]) => [tier, cloneItems(items)])
);

function cloneItems(items) {
  return items.map((item) => ({ ...item }));
}

function cloneDefaults() {
  return cloneItems(presets[activeTier]);
}

function normalizeWeight(value) {
  const parsed = Number.parseFloat(String(value).replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function formatPercent(weight, total) {
  return formatNumber((weight / total) * 100);
}

function getRows() {
  return [...prizeRows.querySelectorAll(".prize-row")];
}

function getItems() {
  const items = getRows()
    .map((row) => {
      const name = row.querySelector(".name-field").value.trim();
      const weight = normalizeWeight(row.querySelector(".weight-field").value);
      return { name, weight };
    })
    .filter((item) => item.name && item.weight > 0);

  return items.length > 0 ? items : cloneDefaults();
}

function saveActiveRows() {
  itemsByTier[activeTier] = getItems();
}

function getTotal(items) {
  return items.reduce((sum, item) => sum + item.weight, 0);
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

    const weightInput = document.createElement("input");
    weightInput.className = "weight-field";
    weightInput.type = "number";
    weightInput.min = "0";
    weightInput.step = "0.1";
    weightInput.value = formatNumber(item.weight);
    weightInput.setAttribute("aria-label", `${item.name || labels.prize} ${labels.weight}`);

    const removeButton = document.createElement("button");
    removeButton.className = "remove-button";
    removeButton.type = "button";
    removeButton.textContent = "\u00d7";
    removeButton.setAttribute("aria-label", `${item.name || labels.prize} ${labels.delete}`);

    row.append(nameInput, weightInput, removeButton);
    prizeRows.append(row);
  });

  updateWheelFromRows();
}

function updateSummary(items) {
  totalWeight.textContent = formatNumber(getTotal(items));
  summary.classList.remove("is-invalid");
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
    const segment = (Math.PI * 2 * item.weight) / total;
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
    ctx.font = "700 28px Arial, sans-serif";
    ctx.shadowColor = "rgba(25, 33, 42, 0.35)";
    ctx.shadowBlur = 4;
    ctx.fillText(item.name, radius - 38, -16, radius * 0.62);
    ctx.font = "800 23px Arial, sans-serif";
    ctx.fillText(`${formatPercent(item.weight, total)}%`, radius - 38, 18, radius * 0.62);
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
  itemsByTier[activeTier] = cloneItems(items);
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
    cursor -= items[index].weight;

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
    start += (items[index].weight / total) * 360;
  }

  return start + (items[selectedIndex].weight / total) * 180;
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
  itemsByTier[activeTier] = cloneDefaults();
  renderRows(itemsByTier[activeTier]);
}

function addItem() {
  renderRows([...getItems(), { name: labels.newPrize, weight: 1 }]);
}

function switchTier(tier) {
  saveActiveRows();
  activeTier = tier;
  currentRotation = 0;
  canvas.style.transform = "rotate(0deg)";
  resultText.textContent = labels.ready;
  history = [];
  renderHistory();

  tierTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.tier === tier);
  });
  tierTitle.textContent = `${tier}P`;

  renderRows(itemsByTier[tier]);
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

document.addEventListener("click", (event) => {
  const tierTab = event.target.closest(".tier-tab");

  if (tierTab) {
    switchTier(tierTab.dataset.tier);
  }
});
addButton.addEventListener("click", addItem);
spinButton.addEventListener("click", spin);
shuffleButton.addEventListener("click", shuffleItems);
resetButton.addEventListener("click", resetItems);

renderRows(itemsByTier[activeTier]);
