(function () {
  "use strict";

  const RECOVERY = 0.98;
  const ENERGY_SAVINGS = 0.30;
  const BASE_ENERGY_INTENSITY = 0.5;
  const ANNUAL_HOURS = 8760;
  const PRODUCTS = [
    { key: "MEG", name: "Моноэтиленгликоль", color: "meg" },
    { key: "DEG", name: "Диэтиленгликоль", color: "deg" },
    { key: "TEG", name: "Триэтиленгликоль", color: "teg" }
  ];

  function calculate(input) {
    const compositionTotal = input.composition.MEG + input.composition.DEG + input.composition.TEG;
    if (!Number.isFinite(input.feedFlow) || input.feedFlow <= 0) {
      throw new Error("Расход подачи должен быть больше нуля.");
    }
    if (Object.values(input.composition).some((value) => !Number.isFinite(value) || value < 0 || value > 100)) {
      throw new Error("Доли компонентов должны быть в диапазоне от 0 до 100%.");
    }
    if (Math.abs(compositionTotal - 100) > 0.01) {
      throw new Error("Сумма массовых долей MEG, DEG и TEG должна равняться 100%.");
    }
    if (PRODUCTS.some(({ key }) => !Number.isFinite(input.purities[key]) || input.purities[key] < 1 || input.purities[key] > 100)) {
      throw new Error("Целевая чистота каждого продукта должна быть от 1 до 100%.");
    }
    if (!Number.isFinite(input.electricityPrice) || input.electricityPrice < 0) {
      throw new Error("Цена электроэнергии не может быть отрицательной.");
    }

    const componentFlows = Object.fromEntries(
      PRODUCTS.map(({ key }) => [key, input.feedFlow * input.composition[key] / 100])
    );
    const products = PRODUCTS.map(({ key, name, color }) => {
      const targetComponent = componentFlows[key];
      const targetPurity = input.purities[key] / 100;
      const recoveredComponent = targetComponent * RECOVERY;
      const productFlow = targetPurity > 0 ? recoveredComponent / targetPurity : 0;
      const impurityFlow = Math.max(0, productFlow - recoveredComponent);
      const otherComponentKeys = PRODUCTS.map((product) => product.key).filter((otherKey) => otherKey !== key);
      const otherComponentTotal = otherComponentKeys.reduce((total, otherKey) => total + componentFlows[otherKey], 0);
      const composition = Object.fromEntries(PRODUCTS.map((product) => [product.key, 0]));
      composition[key] = productFlow > 0 ? recoveredComponent / productFlow * 100 : 0;
      otherComponentKeys.forEach((otherKey) => {
        composition[otherKey] = productFlow > 0 && otherComponentTotal > 0
          ? impurityFlow * componentFlows[otherKey] / otherComponentTotal / productFlow * 100
          : 0;
      });

      return { key, name, color, flow: productFlow, purity: composition[key], composition };
    });

    const energySaved = input.feedFlow * BASE_ENERGY_INTENSITY * ENERGY_SAVINGS;
    return {
      input,
      products,
      energySaved,
      annualSavings: energySaved * ANNUAL_HOURS * input.electricityPrice,
      assumptions: {
        recoveryPercent: RECOVERY * 100,
        energySavingsPercent: ENERGY_SAVINGS * 100,
        baseEnergyIntensity: BASE_ENERGY_INTENSITY
      }
    };
  }

  window.DWCCalculation = { calculate };
})();
