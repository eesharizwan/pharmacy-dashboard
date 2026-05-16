import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend, Filler
} from "chart.js";
import { linearForecast, forecastLabels } from "../forecast";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

function fmt(n) {
  const abs = Math.abs(Math.round(n));
  return (n < 0 ? "-₨" : "₨") + abs.toLocaleString();
}

export default function ProfitForecast({ data }) {
  const active = data.months
    .map((m, i) => ({ m, i }))
    .filter(({ m, i }) => m !== null && data.net_sales[i] > 0);

  const labels  = active.map(({ i }) => data.months[i]);
  const profits = active.map(({ i }) => data.net_profit[i]);
  const sales   = active.map(({ i }) => data.net_sales[i]);
  const margins = profits.map((p, i) => parseFloat(((p / sales[i]) * 100).toFixed(1)));

  const lossMths   = profits.filter(p => p < 0).length;
  const bestMonth  = labels[profits.indexOf(Math.max(...profits))];
  const worstMonth = labels[profits.indexOf(Math.min(...profits))];
  const avgProfit  = profits.reduce((a, b) => a + b, 0) / profits.length;

  const last6  = profits.slice(-6);
  const avg6   = last6.reduce((a, b) => a + b, 0) / last6.length;

  const fProfit = linearForecast(profits, 3);
  const fLabels = forecastLabels(data.months[active[active.length - 1].i], 3);

  const allLabels  = [...labels, ...fLabels];
  const pad        = (arr) => [...arr, null, null, null];
  const fPad       = (arr) => [...Array(labels.length).fill(null), ...arr];

  const chartData = {
    labels: allLabels,
    datasets: [
      {
        label: "Net profit",
        data: pad(profits),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.08)",
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: pad(profits).map(p => p === null ? "transparent" : p >= 0 ? "#3b82f6" : "#ef4444"),
      },
      {
        label: "Avg profit",
        data: Array(allLabels.length).fill(Math.round(avgProfit)),
        borderColor: "#10b981",
        borderDash: [6, 3],
        pointRadius: 0,
        tension: 0,
      },
      {
        label: "Forecast",
        data: fPad(fProfit),
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

  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    scales: {
      x: { ticks: { maxRotation: 45, font: { size: 11 } } },
      y: { ticks: { callback: v => (v < 0 ? "-₨" : "₨") + Math.abs(v / 1000).toFixed(0) + "K" } },
    },
  };

  return (
    <div>
      <p className="module-title">Profitability forecast & loss-month alerts</p>
      <p className="module-sub">Historical profit trends with 3 month linear forecast (purple dotted)</p>

      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Avg monthly profit</div>
          <div className={`kpi-value ${avgProfit >= 0 ? "green" : "red"}`}>{fmt(avgProfit)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Loss months</div>
          <div className="kpi-value red">{lossMths} of {profits.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Best month</div>
          <div className="kpi-value green">{bestMonth}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Worst month</div>
          <div className="kpi-value red">{worstMonth}</div>
        </div>
      </div>

      <div className="section-label">Net profit over time + 3 month forecast</div>
      <div className="chart-wrap" style={{ height: 320 }}>
        <Line data={chartData} options={opts} />
      </div>

      <div className="section-label">Forecast next 3 months</div>
      <div className="kpi-row">
        {fProfit.map((val, i) => (
          <div className="kpi" key={i}>
            <div className="kpi-label">{fLabels[i]}</div>
            <div className={`kpi-value ${val >= 0 ? "green" : "red"}`}>{fmt(val)}</div>
          </div>
        ))}
      </div>

      <div className="section-label">Alerts</div>
      {lossMths >= 3 &&
        <div className="alert danger">
          {lossMths} loss-making months detected. Review high-expense periods carefully.
        </div>
      }
      {avg6 < avgProfit &&
        <div className="alert warn">
          Last 6 months average is below overall average — recent performance is declining.
        </div>
      }
      {avg6 >= avgProfit &&
        <div className="alert good">
          Last 6 months are trending above the overall average — momentum is positive.
        </div>
      }
      {fProfit[2] < 0 &&
        <div className="alert danger">
          Forecast suggests a loss-making month ahead — plan expense reductions now.
        </div>
      }
    </div>
  );
}