export function linearForecast(values, steps = 3) {
  const n = values.length;
  const clean = values.map(v => (isNaN(v) ? 0 : v));

  const xMean = (n - 1) / 2;
  const yMean = clean.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  clean.forEach((y, x) => {
    num += (x - xMean) * (y - yMean);
    den += (x - xMean) ** 2;
  });

  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;

  const forecast = [];
  for (let i = 1; i <= steps; i++) {
    forecast.push(Math.round(intercept + slope * (n - 1 + i)));
  }
  return forecast;
}

export function forecastLabels(lastMonth, steps = 3) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const date = new Date(lastMonth);
  const result = [];
  for (let i = 1; i <= steps; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() + i, 1);
    result.push(months[d.getMonth()] + " " + d.getFullYear());
  }
  return result;
}