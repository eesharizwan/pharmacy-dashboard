import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, Tooltip, Legend, Filler
} from "chart.js";
import { linearForecast, forecastLabels } from "../forecast";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

function fmt(n) { return "₨" + Math.round(n).toLocaleString(); }
function pct(n) { return parseFloat(n).toFixed(1) + "%"; }

export default function MarginDeepDive({ data }) {
  const active = data.months
    .map((m, i) => ({ m, i }))
    .filter(({ m, i }) => m !== null && data.net_sales[i] > 0);

  const labels      = active.map(({ i }) => data.months[i]);
  const netSales    = active.map(({ i }) => data.net_sales[i]);
  const grossProfit = active.map(({ i }) => data.gross_profit[i]);
  const costOfSales = active.map(({ i }) => data.cost_of_sales[i]);
  const netProfit   = active.map(({ i }) => data.net_profit[i]);

  const grossMargins = grossProfit.map((g, i) => parseFloat(((g / netSales[i]) * 100).toFixed(1)));
  const netMargins   = netProfit.map((n, i) => parseFloat(((n / netSales[i]) * 100).toFixed(1)));
  const cosRatios    = costOfSales.map((c, i) => parseFloat(((c / netSales[i]) * 100).toFixed(1)));

  const avgGrossMargin = grossMargins.reduce((a, b) => a + b, 0) / grossMargins.length;
  const avgNetMargin   = netMargins.reduce((a, b) => a + b, 0) / netMargins.length;
  const avgCosRatio    = cosRatios.reduce((a, b) => a + b, 0) / cosRatios.length;

  const totalGrossProfit = grossProfit.reduce((a, b) => a + b, 0);
  const totalCos         = costOfSales.reduce((a, b) => a + b, 0);
  const totalNetSales    = netSales.reduce((a, b) => a + b, 0);

  const best  = grossMargins.indexOf(Math.max(...grossMargins));
  const worst = grossMargins.indexOf(Math.min(...grossMargins));

  const lastMonthStr  = data.months[active[active.length - 1].i];
  const fLabels       = forecastLabels(lastMonthStr, 3);
  const fGrossMargins = linearForecast(grossMargins, 3);
  const fNetMargins   = linearForecast(netMargins, 3);
  const fCostOfSales  = linearForecast(costOfSales, 3);
  const fGrossProfit  = linearForecast(grossProfit, 3);

  const allLabels = [...labels, ...fLabels];
  const padNull   = (arr) => [...arr, null, null, null];
  const fPad      = (arr) => [...Array(labels.length).fill(null), ...arr];

  const marginChart = {
    labels: allLabels,
    datasets: [
      {
        label: "Gross margin %",
        data: padNull(grossMargins),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.07)",
        fill: true,
        tension: 0.3,
        pointRadius: 2,
      },
      {
        label: "Net margin %",
        data: padNull(netMargins),
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.07)",
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointBackgroundColor: padNull(netMargins).map(m => m === null ? "transparent" : m < 0 ? "#ef4444" : "#10b981"),
      },
      {
        label: "Forecast gross margin %",
        data: fPad(fGrossMargins),
        borderColor: "#a78bfa",
        borderDash: [4, 4],
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#a78bfa",
      },
      {
        label: "Forecast net margin %",
        data: fPad(fNetMargins),
        borderColor: "#f59e0b",
        borderDash: [4, 4],
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#f59e0b",
      },
      {
        label: "Avg gross margin",
        data: Array(allLabels.length).fill(parseFloat(avgGrossMargin.toFixed(1))),
        borderColor: "#cbd5e1",
        borderDash: [6, 3],
        pointRadius: 0,
        tension: 0,
      },
    ],
  };

  const cosChart = {
    labels: allLabels,
    datasets: [
      {
        label: "Cost of sales",
        data: padNull(costOfSales),
        backgroundColor: "#f87171",
        stack: "actual",
      },
      {
        label: "Gross profit",
        data: padNull(grossProfit),
        backgroundColor: "#86efac",
        stack: "actual",
      },
      {
        label: "Forecast cost of sales",
        data: fPad(fCostOfSales),
        backgroundColor: "rgba(248,113,113,0.4)",
        stack: "forecast",
      },
      {
        label: "Forecast gross profit",
        data: fPad(fGrossProfit),
        backgroundColor: "rgba(134,239,172,0.4)",
        stack: "forecast",
      },
    ],
  };

  const marginOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    scales: {
      x: { ticks: { maxRotation: 45, font: { size: 11 } } },
      y: { ticks: { callback: v => v + "%" } },
    },
  };

  const cosOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    scales: {
      x: { stacked: true, ticks: { maxRotation: 45, font: { size: 11 } } },
      y: { stacked: true, ticks: { callback: v => "₨" + (v/1000000).toFixed(1) + "M" } },
    },
  };

  return (
    <div>
      <p className="module-title">Cost of sales & gross margin deep dive</p>
      <p className="module-sub">Margin trends and purchasing efficiency — with 3 month forecast (dotted lines)</p>

      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Avg gross margin</div>
          <div className={`kpi-value ${avgGrossMargin > 15 ? "green" : avgGrossMargin > 12 ? "amber" : "red"}`}>
            {pct(avgGrossMargin)}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg net margin</div>
          <div className={`kpi-value ${avgNetMargin > 0 ? "green" : "red"}`}>
            {pct(avgNetMargin)}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg cost of sales %</div>
          <div className="kpi-value amber">{pct(avgCosRatio)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total gross profit</div>
          <div className="kpi-value green">{fmt(totalGrossProfit)}</div>
        </div>
      </div>

      <div className="section-label">Best & worst margin months</div>
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Best gross margin month</div>
          <div className="kpi-value green">{labels[best]} — {pct(grossMargins[best])}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Worst gross margin month</div>
          <div className="kpi-value red">{labels[worst]} — {pct(grossMargins[worst])}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total cost of sales</div>
          <div className="kpi-value">{fmt(totalCos)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total net sales</div>
          <div className="kpi-value">{fmt(totalNetSales)}</div>
        </div>
      </div>

      <div className="section-label">Gross & net margin % over time + forecast</div>
      <div className="chart-wrap" style={{ height: 300 }}>
        <Line data={marginChart} options={marginOpts} />
      </div>

      <div className="section-label">Cost of sales vs gross profit + forecast (faded bars)</div>
      <div className="chart-wrap" style={{ height: 280 }}>
        <Bar data={cosChart} options={cosOpts} />
      </div>

      <div className="section-label">Forecast next 3 months</div>
      <div className="kpi-row">
        {fGrossMargins.map((val, i) => (
          <div className="kpi" key={i}>
            <div className="kpi-label">{fLabels[i]}</div>
            <div className={`kpi-value ${val > 15 ? "green" : val > 12 ? "amber" : "red"}`}>
              Gross {pct(val)} / Net {pct(fNetMargins[i])}
            </div>
          </div>
        ))}
      </div>

      <div className="section-label">Alerts</div>
      {avgGrossMargin < 14 &&
        <div className="alert danger">
          Gross margin is below 14% — review supplier pricing and purchasing terms urgently.
        </div>
      }
      {avgGrossMargin >= 14 && avgGrossMargin < 16 &&
        <div className="alert warn">
          Gross margin is {pct(avgGrossMargin)} — room to improve through better supplier negotiations.
        </div>
      }
      {avgGrossMargin >= 16 &&
        <div className="alert good">
          Gross margin is healthy at {pct(avgGrossMargin)}.
        </div>
      }
      {avgNetMargin < 1 &&
        <div className="alert danger">
          Net margin is critically low at {pct(avgNetMargin)} — expenses are eating almost all profit.
        </div>
      }
      {avgNetMargin >= 1 && avgNetMargin < 3 &&
        <div className="alert warn">
          Net margin of {pct(avgNetMargin)} is thin — focus on reducing the largest expense categories.
        </div>
      }
      {avgNetMargin >= 3 &&
        <div className="alert good">
          Net margin of {pct(avgNetMargin)} is solid for a pharmacy business.
        </div>
      }
      {fNetMargins[2] < 0 &&
        <div className="alert danger">
          Forecast suggests net margin will go negative — urgent cost review needed.
        </div>
      }
    </div>
  );
}