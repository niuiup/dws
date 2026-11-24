(function () {
  "use strict";

  async function loadJSON(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Не удалось загрузить ${path}: ${response.status}`);
    return response.json();
  }

  function makeCard(title, content) {
    const card = document.createElement("article");
    card.className = "card";
    const heading = document.createElement("h2");
    heading.textContent = title;
    const body = document.createElement("div");
    body.innerHTML = content;
    card.append(heading, body);
    return card;
  }

  async function renderPassport() {
    const passport = await loadJSON("data/project-passport.json");
    const container = document.getElementById("passport-content");
    const list = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
    const milestones = passport.milestones.map((item) =>
      `<li><strong>${item.name}</strong> — ${item.start} … ${item.end} (${item.status})</li>`
    ).join("");
    container.append(
      makeCard("Название и цель", `<p><strong>${passport.title}</strong></p><p>${passport.goal}</p>`),
      makeCard("Текущее состояние", `<p>${passport.state}</p>`),
      makeCard("Существующие разработки", list(passport.developments)),
      makeCard("Текущие задачи", list(passport.currentTasks)),
      makeCard("Планируемые результаты", list(passport.plannedResults)),
      makeCard("Сроки этапов", `<ul>${milestones}</ul>`)
    );
  }

  async function renderResults() {
    const data = await loadJSON("data/results-status.json");
    const container = document.getElementById("results-list");
    data.results.forEach((result) => {
      const row = document.createElement("article");
      row.className = "result-row";
      const copy = document.createElement("div");
      const heading = document.createElement("strong");
      heading.textContent = result.name;
      const note = document.createElement("p");
      note.textContent = result.note;
      copy.append(heading, note);
      const status = document.createElement("div");
      const badge = document.createElement("span");
      badge.className = `badge ${result.kind}`;
      badge.textContent = result.status;
      status.append(badge);
      if (result.evidence) {
        const link = document.createElement("a");
        link.href = result.evidence;
        link.textContent = " Подтверждающий файл";
        link.style.display = "block";
        link.style.marginTop = "7px";
        status.append(link);
      }
      row.append(copy, status);
      container.append(row);
    });
  }

  function checkComposition() {
    const form = document.getElementById("input-form");
    const data = new FormData(form);
    const total = Number(data.get("meg")) + Number(data.get("deg")) + Number(data.get("teg"));
    const check = document.getElementById("composition-check");
    check.textContent = `Сумма компонентного состава: ${Number.isFinite(total) ? total : 0}%`;
    check.style.color = Math.abs(total - 100) <= 0.01 ? "#54d6bd" : "#ff7a7a";
  }

  function bindInputForm() {
    const form = document.getElementById("input-form");
    form.addEventListener("input", checkComposition);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const values = Object.fromEntries(data.entries());
      ["flow","temperature","pressure","meg","deg","teg","purityMeg","purityDeg","purityTeg","energyCost"].forEach((key) => {
        values[key] = Number(values[key]);
      });
      const total = values.meg + values.deg + values.teg;
      const error = document.getElementById("input-error");
      if (!Number.isFinite(values.flow) || values.flow <= 0) {
        error.textContent = "Производительность должна быть больше нуля.";
      } else if (values.pressure <= 0) {
        error.textContent = "Давление должно быть больше нуля.";
      } else if (Math.abs(total - 100) > 0.01) {
        error.textContent = "Сумма MEG, DEG и TEG должна равняться 100%.";
      } else if (values.energyCost < 0) {
        error.textContent = "Стоимость энергоносителя не может быть отрицательной.";
      } else {
        error.hidden = true;
        const payload = { source: "engineering-workspace", ...values };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "dwc-input-data.json";
        link.click();
        URL.revokeObjectURL(url);
        return;
      }
      error.hidden = false;
    });
  }

  function bindNavigation() {
    const links = [...document.querySelectorAll(".sidebar nav a")];
    links.forEach((link) => link.addEventListener("click", () => {
      links.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    }));
  }

  Promise.all([renderPassport(), renderResults()]).catch((error) => {
    const container = document.getElementById("passport-content");
    container.textContent = `Ошибка загрузки данных: ${error.message}`;
  });
  bindInputForm();
  bindNavigation();
  checkComposition();
})();
