import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend
} from "chart.js";
import { linearForecast, forecastLabels } from "../forecast";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function fmt(n) { return "₨" + Math.round(n).toLocaleString(); }

export default function DiscountAnalysis({ data }) {
  const active = data.months.map((m, i) => ({ m, i }))
    .filter(({ m }) => m !== null)
    .slice(-24);

  const labels     = active.map(({ i }) => data.months[i]);
  const gross      = active.map(({ i }) => data.gross_sales[i]);
  const deductions = active.map(({ i }) => data.total_deductions[i]);
  const net        = active.map(({ i }) => data.net_sales[i]);

  const totalGross = gross.reduce((a, b) => a + b, 0);
  const totalDed   = deductions.reduce((a, b) => a + b, 0);
  const totalNet   = net.reduce((a, b) => a + b, 0);
  const leakagePct = ((totalDed / totalGross) * 100).toFixed(1);

  const totalDisc  = data.discounts.reduce((a, b) => a + b, 0);
  const totalRet   = data.returns.reduce((a, b) => a + b, 0);
  const totalTax   = data.tax_pos_fee.reduce((a, b) => a + b, 0);

  const lastMonth    = active[active.length - 1];
  const fLabels      = forecastLabels(data.months[lastMonth.i], 3);
  const fDeductions  = linearForecast(deductions, 3);
  const fDisc        = linearForecast(active.map(({ i }) => data.discounts[i]), 3);
  const fRet         = linearForecast(active.map(({ i }) => data.returns[i]), 3);
  const fTax         = linearForecast(active.map(({ i }) => data.tax_pos_fee[i]), 3);

  const allLabels = [...labels, ...fLabels];
  const pad = (arr, n) => [...arr, ...Array(n).fill(null)];
  const fPad = (arr, n) => [...Array(n).fill(null), ...arr];

  const chartData = {
    labels: allLabels,
    datasets: [
      {
        label: "Discounts",
        data: pad(active.map(({ i }) => data.discounts[i]), 3),
        backgroundColor: "#f87171",
        stack: "actual",
      },
      {
        label: "Returns",
        data: pad(active.map(({ i }) => data.returns[i]), 3),
        backgroundColor: "#fb923c",
        stack: "actual",
      },
      {
        label: "Tax & POS fees",
        data: pad(active.map(({ i }) => data.tax_pos_fee[i]), 3),
        backgroundColor: "#fbbf24",
        stack: "actual",
      },
      {
        label: "Forecast discounts",
        data: fPad(fDisc, labels.length),
        backgroundColor: "rgba(248,113,113,0.4)",
        stack: "forecast",
      },
      {
        label: "Forecast returns",
        data: fPad(fRet, labels.length),
        backgroundColor: "rgba(251,146,60,0.4)",
        stack: "forecast",
      },
      {
        label: "Forecast tax & fees",
        data: fPad(fTax, labels.length),
        backgroundColor: "rgba(251,191,36,0.4)",
        stack: "forecast",
      },
    ],
  };

  const opts = {
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
      <p className="module-title">Discount & leakage analysis</p>
      <p className="module-sub">Where gross sales bleed away — last 24 months + 3 month forecast</p>

      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Total gross sales</div>
          <div className="kpi-value">{fmt(totalGross)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total leakage</div>
          <div className="kpi-value red">{fmt(totalDed)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Leakage rate</div>
          <div className="kpi-value amber">{leakagePct}%</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Net sales retained</div>
          <div className="kpi-value green">{fmt(totalNet)}</div>
        </div>
      </div>

      <div className="section-label">Leakage breakdown (lifetime)</div>
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Discounts given</div>
          <div className="kpi-value red">{fmt(totalDisc)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Returns</div>
          <div className="kpi-value red">{fmt(totalRet)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Tax & POS fees</div>
          <div className="kpi-value amber">{fmt(totalTax)}</div>
        </div>
      </div>

      <div className="section-label">Monthly leakage + 3 month forecast (faded bars)</div>
      <div className="chart-wrap" style={{ height: 320 }}>
        <Bar data={chartData} options={opts} />
      </div>

      <div className="section-label">Alerts</div>
      {parseFloat(leakagePct) > 15
        ? <div className="alert danger">Leakage rate is {leakagePct}% — above the 15% danger threshold. Review discount policies.</div>
        : <div className="alert good">Leakage rate is {leakagePct}% — within acceptable range.</div>
      }
      <div className="alert warn">
        Forecast: next 3 months estimated leakage is {fmt(fDeductions.reduce((a,b) => a+b, 0))} total.
      </div>
    </div>
  );
}