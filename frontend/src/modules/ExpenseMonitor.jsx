import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, Tooltip, Legend, Filler
} from "chart.js";
import { linearForecast, forecastLabels } from "../forecast";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

function fmt(n) { return "₨" + Math.round(n).toLocaleString(); }
function pct(n) { return n.toFixed(1) + "%"; }

export default function ExpenseMonitor({ data }) {
  const active = data.months
    .map((m, i) => ({ m, i }))
    .filter(({ m, i }) => m !== null && data.net_sales[i] > 0);

  const labels     = active.map(({ i }) => data.months[i]);
  const netSales   = active.map(({ i }) => data.net_sales[i]);
  const employment = active.map(({ i }) => data.total_employment[i]);
  const occupancy  = active.map(({ i }) => data.occupancy[i]);
  const ga         = active.map(({ i }) => data.total_ga[i]);
  const operating  = active.map(({ i }) => data.total_operating[i]);
  const totalExp   = active.map(({ i }) => data.total_expenses[i]);

  const expRatio   = totalExp.map((e, i) => parseFloat(((e / netSales[i]) * 100).toFixed(1)));
  const empRatio   = employment.map((e, i) => parseFloat(((e / netSales[i]) * 100).toFixed(1)));

  const avgExpRatio = expRatio.reduce((a, b) => a + b, 0) / expRatio.length;
  const avgEmpRatio = empRatio.reduce((a, b) => a + b, 0) / empRatio.length;

  const totalEmployment = employment.reduce((a, b) => a + b, 0);
  const totalOccupancy  = occupancy.reduce((a, b) => a + b, 0);
  const totalGA         = ga.reduce((a, b) => a + b, 0);
  const totalOperating  = operating.reduce((a, b) => a + b, 0);
  const grandTotal      = totalExp.reduce((a, b) => a + b, 0);
  const highRatioMonths = expRatio.filter(r => r > 90).length;

  const lastMonthStr  = data.months[active[active.length - 1].i];
  const fLabels       = forecastLabels(lastMonthStr, 3);
  const fExpRatio     = linearForecast(expRatio, 3);
  const fEmployment   = linearForecast(employment, 3);
  const fOccupancy    = linearForecast(occupancy, 3);
  const fGa           = linearForecast(ga, 3);
  const fOperating    = linearForecast(operating, 3);

  const allLabels = [...labels, ...fLabels];
  const padNull   = (arr) => [...arr, null, null, null];
  const fPad      = (arr) => [...Array(labels.length).fill(null), ...arr];

  const ratioChart = {
    labels: allLabels,
    datasets: [
      {
        label: "Expense ratio %",
        data: padNull(expRatio),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245,158,11,0.08)",
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: padNull(expRatio).map(r => r === null ? "transparent" : r > 90 ? "#ef4444" : "#f59e0b"),
      },
      {
        label: "Avg ratio",
        data: Array(allLabels.length).fill(parseFloat(avgExpRatio.toFixed(1))),
        borderColor: "#94a3b8",
        borderDash: [6, 3],
        pointRadius: 0,
        tension: 0,
      },
      {
        label: "Forecast ratio %",
        data: fPad(fExpRatio),
        borderColor: "#a78bfa",
        borderDash: [4, 4],
        backgroundColor: "rgba(167,139,250,0.06)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#a78bfa",
      },
    ],
  };

  const stackedChart = {
    labels: allLabels,
    datasets: [
      {
        label: "Employment",
        data: padNull(employment),
        backgroundColor: "#3b82f6",
        stack: "actual",
      },
      {
        label: "Occupancy",
        data: padNull(occupancy),
        backgroundColor: "#10b981",
        stack: "actual",
      },
      {
        label: "G&A",
        data: padNull(ga),
        backgroundColor: "#f59e0b",
        stack: "actual",
      },
      {
        label: "Operating",
        data: padNull(operating),
        backgroundColor: "#8b5cf6",
        stack: "actual",
      },
      {
        label: "Forecast employment",
        data: fPad(fEmployment),
        backgroundColor: "rgba(59,130,246,0.4)",
        stack: "forecast",
      },
      {
        label: "Forecast occupancy",
        data: fPad(fOccupancy),
        backgroundColor: "rgba(16,185,129,0.4)",
        stack: "forecast",
      },
      {
        label: "Forecast G&A",
        data: fPad(fGa),
        backgroundColor: "rgba(245,158,11,0.4)",
        stack: "forecast",
      },
      {
        label: "Forecast operating",
        data: fPad(fOperating),
        backgroundColor: "rgba(139,92,246,0.4)",
        stack: "forecast",
      },
    ],
  };

  const ratioOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    scales: {
      x: { ticks: { maxRotation: 45, font: { size: 11 } } },
      y: { ticks: { callback: v => v + "%" } },
    },
  };

  const stackOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    scales: {
      x: { stacked: true, ticks: { maxRotation: 45, font: { size: 11 } } },
      y: { stacked: true, ticks: { callback: v => "₨" + (v/1000).toFixed(0) + "K" } },
    },
  };

  return (
    <div>
      <p className="module-title">Expense ratio monitoring</p>
      <p className="module-sub">Track costs as % of net sales — with 3 month forecast (purple dotted)</p>

      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Avg expense ratio</div>
          <div className={`kpi-value ${avgExpRatio > 90 ? "red" : avgExpRatio > 80 ? "amber" : "green"}`}>
            {pct(avgExpRatio)}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg salary ratio</div>
          <div className="kpi-value amber">{pct(avgEmpRatio)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">High-ratio months</div>
          <div className={`kpi-value ${highRatioMonths > 3 ? "red" : "amber"}`}>
            {highRatioMonths} of {expRatio.length}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total expenses</div>
          <div className="kpi-value">{fmt(grandTotal)}</div>
        </div>
      </div>

      <div className="section-label">Expense breakdown (lifetime totals)</div>
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Employment</div>
          <div className="kpi-value">{fmt(totalEmployment)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Occupancy</div>
          <div className="kpi-value">{fmt(totalOccupancy)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">General & admin</div>
          <div className="kpi-value">{fmt(totalGA)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Operating</div>
          <div className="kpi-value">{fmt(totalOperating)}</div>
        </div>
      </div>

      <div className="section-label">Expense ratio % over time + forecast</div>
      <div className="chart-wrap" style={{ height: 280 }}>
        <Line data={ratioChart} options={ratioOpts} />
      </div>

      <div className="section-label">Monthly expense breakdown + forecast (faded bars)</div>
      <div className="chart-wrap" style={{ height: 280 }}>
        <Bar data={stackedChart} options={stackOpts} />
      </div>

      <div className="section-label">Forecast next 3 months</div>
      <div className="kpi-row">
        {fExpRatio.map((val, i) => (
          <div className="kpi" key={i}>
            <div className="kpi-label">{fLabels[i]} expense ratio</div>
            <div className={`kpi-value ${val > 90 ? "red" : val > 80 ? "amber" : "green"}`}>
              {pct(val)}
            </div>
          </div>
        ))}
      </div>

      <div className="section-label">Alerts</div>
      {avgExpRatio > 90 &&
        <div className="alert danger">
          Average expense ratio is {pct(avgExpRatio)} — expenses consuming over 90% of net sales. Immediate review needed.
        </div>
      }
      {avgExpRatio <= 90 && avgExpRatio > 80 &&
        <div className="alert warn">
          Average expense ratio is {pct(avgExpRatio)} — watch closely, margins are thin.
        </div>
      }
      {highRatioMonths > 3 &&
        <div className="alert warn">
          {highRatioMonths} months exceeded 90% expense ratio — identify what drove costs in those months.
        </div>
      }
      {fExpRatio[2] > 90 &&
        <div className="alert danger">
          Forecast suggests expense ratio will exceed 90% — plan cost reductions now.
        </div>
      }
      {avgExpRatio <= 80 &&
        <div className="alert good">
          Expense ratio is healthy at {pct(avgExpRatio)}.
        </div>
      }
    </div>
  );
}