import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Tooltip, Legend
} from "chart.js";
import { linearForecast, forecastLabels } from "../forecast";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

function fmt(n) { return "₨" + Math.round(n).toLocaleString(); }

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function SeasonalTrends({ data }) {
  const active = data.months
    .map((m, i) => ({ m, i }))
    .filter(({ m, i }) => m !== null && data.net_sales[i] > 0);

  const labels   = active.map(({ i }) => data.months[i]);
  const sales    = active.map(({ i }) => data.gross_sales[i]);
  const profits  = active.map(({ i }) => data.net_profit[i]);

  const byMonth = Array.from({ length: 12 }, () => ({ sales: [], profit: [] }));
  active.forEach(({ m, i }) => {
    const monthIdx = new Date(m).getMonth();
    byMonth[monthIdx].sales.push(data.gross_sales[i]);
    byMonth[monthIdx].profit.push(data.net_profit[i]);
  });

  const avgSalesByMonth  = byMonth.map(b => b.sales.length  ? b.sales.reduce((a,v)=>a+v,0)  / b.sales.length  : 0);
  const avgProfitByMonth = byMonth.map(b => b.profit.length ? b.profit.reduce((a,v)=>a+v,0) / b.profit.length : 0);

  const peakMonthIdx = avgSalesByMonth.indexOf(Math.max(...avgSalesByMonth));
  const slowMonthIdx = avgSalesByMonth.indexOf(Math.min(...avgSalesByMonth.filter(v => v > 0)));

  const byYear = {};
  active.forEach(({ m, i }) => {
    const year = new Date(m).getFullYear();
    if (!byYear[year]) byYear[year] = 0;
    byYear[year] += data.gross_sales[i];
  });

  const yearLabels = Object.keys(byYear);
  const yearSales  = yearLabels.map(y => byYear[y]);
  const yoyGrowth  = yearSales.length >= 2
    ? (((yearSales[yearSales.length-1] - yearSales[yearSales.length-2]) / yearSales[yearSales.length-2]) * 100).toFixed(1)
    : null;

  const lastMonthStr = data.months[active[active.length - 1].i];
  const fSalesVals   = linearForecast(sales, 3);
  const fProfitVals  = linearForecast(profits, 3);
  const fLabels      = forecastLabels(lastMonthStr, 3);

  const allLabels = [...labels, ...fLabels];
  const padNull   = (arr) => [...arr, null, null, null];
  const fPad      = (arr) => [...Array(labels.length).fill(null), ...arr];

  const salesChart = {
    labels: allLabels,
    datasets: [
      {
        label: "Gross sales",
        data: padNull(sales),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.08)",
        fill: true,
        tension: 0.3,
        pointRadius: 2,
      },
      {
        label: "Forecast",
        data: fPad(fSalesVals),
        borderColor: "#a78bfa",
        borderDash: [4, 4],
        backgroundColor: "rgba(167,139,250,0.08)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#a78bfa",
      },
    ],
  };

  const profitChart = {
    labels: allLabels,
    datasets: [
      {
        label: "Net profit",
        data: padNull(profits),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139,92,246,0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: padNull(profits).map(v => v === null ? "transparent" : v >= 0 ? "#8b5cf6" : "#ef4444"),
      },
      {
        label: "Forecast",
        data: fPad(fProfitVals),
        borderColor: "#f59e0b",
        borderDash: [4, 4],
        backgroundColor: "rgba(245,158,11,0.06)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#f59e0b",
      },
    ],
  };

  const seasonalChart = {
    labels: MONTH_NAMES,
    datasets: [
      {
        label: "Avg gross sales by month",
        data: avgSalesByMonth,
        backgroundColor: avgSalesByMonth.map((v, i) =>
          i === peakMonthIdx ? "#15803d" : i === slowMonthIdx ? "#dc2626" : "#93c5fd"
        ),
      },
    ],
  };

  const lineOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    scales: {
      x: { ticks: { maxRotation: 45, font: { size: 11 } } },
      y: { ticks: { callback: v => "₨" + (v/1000000).toFixed(1) + "M" } },
    },
  };

  const profitOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    scales: {
      x: { ticks: { maxRotation: 45, font: { size: 11 } } },
      y: { ticks: { callback: v => (v < 0 ? "-₨" : "₨") + Math.abs(v/1000).toFixed(0) + "K" } },
    },
  };

  const barOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { font: { size: 11 } } },
      y: { ticks: { callback: v => "₨" + (v/1000000).toFixed(1) + "M" } },
    },
  };

  return (
    <div>
      <p className="module-title">Seasonal trend analysis</p>
      <p className="module-sub">Revenue and profit patterns with 3 month forecast (dotted lines)</p>

      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Peak month</div>
          <div className="kpi-value green">{MONTH_NAMES[peakMonthIdx]}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg peak sales</div>
          <div className="kpi-value green">{fmt(avgSalesByMonth[peakMonthIdx])}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Slowest month</div>
          <div className="kpi-value red">{MONTH_NAMES[slowMonthIdx]}</div>
        </div>
        {yoyGrowth !== null && (
          <div className="kpi">
            <div className="kpi-label">YoY growth</div>
            <div className={`kpi-value ${parseFloat(yoyGrowth) >= 0 ? "green" : "red"}`}>
              {yoyGrowth}%
            </div>
          </div>
        )}
      </div>

      <div className="section-label">Gross sales over time + 3 month forecast</div>
      <div className="chart-wrap" style={{ height: 260 }}>
        <Line data={salesChart} options={lineOpts} />
      </div>

      <div className="section-label">Net profit over time + 3 month forecast</div>
      <div className="chart-wrap" style={{ height: 240 }}>
        <Line data={profitChart} options={profitOpts} />
      </div>

      <div className="section-label">Average gross sales by month (all years)</div>
      <div className="chart-wrap" style={{ height: 220 }}>
        <Bar data={seasonalChart} options={barOpts} />
      </div>

      <div className="section-label">Forecast next 3 months</div>
      <div className="kpi-row">
        {fSalesVals.map((val, i) => (
          <div className="kpi" key={i}>
            <div className="kpi-label">{fLabels[i]} sales</div>
            <div className="kpi-value green">{fmt(val)}</div>
          </div>
        ))}
      </div>

      <div className="section-label">Alerts</div>
      <div className="alert good">
        Peak season is {MONTH_NAMES[peakMonthIdx]} — plan inventory and staffing increases 4–6 weeks ahead.
      </div>
      <div className="alert warn">
        Slowest month is {MONTH_NAMES[slowMonthIdx]} — consider reducing discretionary spend during this period.
      </div>
      {yoyGrowth && parseFloat(yoyGrowth) > 0 &&
        <div className="alert good">Year-on-year sales growth is {yoyGrowth}% — business is expanding.</div>
      }
      {yoyGrowth && parseFloat(yoyGrowth) <= 0 &&
        <div className="alert danger">Year-on-year sales declined by {Math.abs(yoyGrowth)}% — investigate root causes.</div>
      }
    </div>
  );
}