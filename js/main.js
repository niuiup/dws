(function () {
  "use strict";

  const form = document.getElementById("calculator-form");
  const errorElement = document.getElementById("form-error");
  const compositionTotalElement = document.getElementById("composition-total");
  const productResults = document.getElementById("product-results");
  const energySavedElement = document.getElementById("energy-saved");
  const annualSavingsElement = document.getElementById("annual-savings");
  const reportOutput = document.getElementById("report-output");
  const reportText = document.getElementById("report-text");
  let latestResults = null;

  function readInput() {
    const data = new FormData(form);
    return {
      feedFlow: Number(data.get("feedFlow")),
      composition: {
        MEG: Number(data.get("meg")),
        DEG: Number(data.get("deg")),
        TEG: Number(data.get("teg"))
      },
      purities: {
        MEG: Number(data.get("purityMeg")),
        DEG: Number(data.get("purityDeg")),
        TEG: Number(data.get("purityTeg"))
      },
      electricityPrice: Number(data.get("electricityPrice"))
    };
  }

  function updateCompositionTotal() {
    const input = readInput();
    const total = input.composition.MEG + input.composition.DEG + input.composition.TEG;
    compositionTotalElement.textContent = `Сумма состава: ${window.DWCVisualization.formatNumber(total)}%`;
    compositionTotalElement.classList.toggle("invalid", Math.abs(total - 100) > 0.01);
  }

  function runCalculation(event) {
    if (event) event.preventDefault();
    errorElement.hidden = true;
    try {
      latestResults = window.DWCCalculation.calculate(readInput());
      window.DWCVisualization.renderProducts(latestResults, productResults);
      window.DWCVisualization.updateEnergy(latestResults, energySavedElement, annualSavingsElement);
      reportOutput.hidden = true;
    } catch (error) {
      errorElement.textContent = error.message;
      errorElement.hidden = false;
      latestResults = null;
    }
  }

  function makeReport(results) {
    const lines = [
      "DWC Digital Twin — демонстрационный отчёт",
      "",
      "Параметры подачи",
      `Расход: ${window.DWCVisualization.formatNumber(results.input.feedFlow)} кг/ч`,
      `Состав: MEG ${results.input.composition.MEG} мас.%, DEG ${results.input.composition.DEG} мас.%, TEG ${results.input.composition.TEG} мас.%`,
      `Целевая чистота: MEG ${results.input.purities.MEG} мас.%, DEG ${results.input.purities.DEG} мас.%, TEG ${results.input.purities.TEG} мас.%`,
      "",
      "Оценка продуктовых потоков (извлечение целевого компонента 98%)",
      ...results.products.map((product) =>
        `${product.key}: ${window.DWCVisualization.formatNumber(product.flow)} кг/ч; основной компонент ${window.DWCVisualization.formatNumber(product.purity)} мас.%`
      ),
      "",
      "Потенциальная экономия",
      `Энергия: ${window.DWCVisualization.formatNumber(results.energySaved)} кВт при условной базовой энергоёмкости ${results.assumptions.baseEnergyIntensity} кВт·ч/кг`,
      `Экономия в год: ${window.DWCVisualization.formatNumber(results.annualSavings)} ₽ при цене ${results.input.electricityPrice} ₽/кВт·ч и 8 760 ч/год`,
      "",
      "Ключевые преимущества DWC",
      "• Объединение нескольких операций разделения в одном аппарате.",
      "• Потенциальное снижение энергопотребления (ориентировочно 30%) и капитальных затрат (ориентировочно 25%).",
      "• Компактность технологической схемы.",
      "",
      "Оговорка: упрощённый материальный баланс для демонстрации, не строгая термодинамическая симуляция. Сравнительные показатели — приблизительные оценки на основе литературы, не гарантия для конкретного проекта."
    ];
    return lines.join("\n");
  }

  form.addEventListener("submit", runCalculation);
  form.querySelectorAll('input[name="meg"], input[name="deg"], input[name="teg"]').forEach((input) => {
    input.addEventListener("input", updateCompositionTotal);
  });
  document.getElementById("report-button").addEventListener("click", () => {
    if (!latestResults) runCalculation();
    if (!latestResults) return;
    reportText.textContent = makeReport(latestResults);
    reportOutput.hidden = false;
    reportOutput.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  document.getElementById("download-report").addEventListener("click", () => {
    if (!latestResults) return;
    const blob = new Blob([makeReport(latestResults)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dwc-demo-report.txt";
    link.click();
    URL.revokeObjectURL(url);
  });

  window.DWCVisualization.createComparisonChart(
    document.getElementById("comparison-chart"),
    document.getElementById("chart-fallback")
  );
  window.DWCVisualization.bindSchematic(() => latestResults, document.getElementById("stream-info").querySelector("p"));
  updateCompositionTotal();
  runCalculation();
})();
