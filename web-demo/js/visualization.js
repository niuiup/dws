(function () {
  "use strict";

  const COMPONENT_ORDER = ["MEG", "DEG", "TEG"];
  const numberFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
  const percentFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

  function formatNumber(value, digits) {
    return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits === undefined ? 2 : digits }).format(value);
  }

  function renderProducts(results, container) {
    container.replaceChildren(...results.products.map((product) => {
      const card = document.createElement("article");
      card.className = `product-card ${product.color}`;
      card.dataset.stream = product.key;

      const tag = document.createElement("span");
      tag.className = "product-tag";
      tag.textContent = product.key;

      const details = document.createElement("div");
      const flow = document.createElement("div");
      flow.className = "product-flow";
      flow.textContent = `${formatNumber(product.flow)} кг/ч`;
      const composition = document.createElement("div");
      composition.className = "product-composition";
      composition.textContent = COMPONENT_ORDER
        .map((key) => `${key} ${percentFormat.format(product.composition[key])}%`)
        .join(" · ");
      details.append(flow, composition);

      const purity = document.createElement("div");
      purity.className = "product-purity";
      purity.textContent = `${formatNumber(product.purity)}%`;
      const purityLabel = document.createElement("small");
      purityLabel.textContent = "основной компонент";
      purity.append(purityLabel);

      card.append(tag, details, purity);
      return card;
    }));
  }

  function updateEnergy(results, energyElement, savingsElement) {
    energyElement.textContent = formatNumber(results.energySaved);
    savingsElement.textContent = `${formatNumber(results.annualSavings)} ₽`;
  }

  function createComparisonChart(canvas, fallback) {
    if (typeof window.Chart !== "function") {
      canvas.hidden = true;
      fallback.hidden = false;
      return null;
    }
    return new window.Chart(canvas, {
      type: "bar",
      data: {
        labels: ["Энергопотребление", "Капитальные затраты"],
        datasets: [
          {
            label: "Традиционная схема",
            data: [100, 100],
            backgroundColor: "#697386",
            borderRadius: 4,
            barPercentage: 0.62
          },
          {
            label: "DWC",
            data: [70, 75],
            backgroundColor: "#ffd54f",
            borderRadius: 4,
            barPercentage: 0.62
          }
        ]
      },
      options: {
        indexAxis: "y",
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#b9c0cc", usePointStyle: true, pointStyle: "rectRounded", padding: 20, font: { family: "DM Sans", size: 10 } }
          },
          tooltip: {
            callbacks: { label: (context) => `${context.dataset.label}: ${context.parsed.x}% от базового уровня` }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 110,
            grid: { color: "#2b303a" },
            ticks: { color: "#8f98a7", callback: (value) => `${value}%`, font: { size: 9 } }
          },
          y: { grid: { display: false }, ticks: { color: "#d8dce4", font: { size: 10 } } }
        }
      }
    });
  }

  function bindSchematic(resultsProvider, infoElement) {
    const streams = document.querySelectorAll(".stream[data-stream]");
    streams.forEach((stream) => {
      const showInfo = () => {
        const key = stream.dataset.stream;
        const results = resultsProvider();
        if (key === "feed") {
          infoElement.textContent = results
            ? `Подача: ${formatNumber(results.input.feedFlow)} кг/ч · MEG ${formatNumber(results.input.composition.MEG)}% · DEG ${formatNumber(results.input.composition.DEG)}% · TEG ${formatNumber(results.input.composition.TEG)}%.`
            : "Задайте расход и состав в калькуляторе, чтобы увидеть параметры подачи.";
          return;
        }
        const product = results && results.products.find((item) => item.key === key);
        infoElement.textContent = product
          ? `${product.key} · ${product.name}: ${formatNumber(product.flow)} кг/ч · основной компонент ${formatNumber(product.purity)} мас.%.`
          : `Поток ${key}: запустите расчёт, чтобы увидеть оценку расхода и состава.`;
      };

      stream.addEventListener("mouseenter", showInfo);
      stream.addEventListener("focus", showInfo);
      stream.addEventListener("click", showInfo);
      stream.addEventListener("mouseleave", () => { infoElement.textContent = "Выберите поток на схеме — здесь появится его расчётная оценка."; });
      stream.addEventListener("blur", () => { infoElement.textContent = "Выберите поток на схеме — здесь появится его расчётная оценка."; });
    });
  }

  window.DWCVisualization = { createComparisonChart, renderProducts, updateEnergy, bindSchematic, formatNumber };
})();
