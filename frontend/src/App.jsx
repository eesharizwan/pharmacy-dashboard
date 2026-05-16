import { useState } from "react";
import DATA from "./data";
import DiscountAnalysis from "./modules/DiscountAnalysis";
import ProfitForecast from "./modules/ProfitForecast";
import SeasonalTrends from "./modules/SeasonalTrends";
import ExpenseMonitor from "./modules/ExpenseMonitor";
import MarginDeepDive from "./modules/MarginDeepDive";
import "./App.css";

const TABS = [
  { id: "discount", label: "Discount & Leakage" },
  { id: "forecast", label: "Profit Forecast" },
  { id: "seasonal", label: "Seasonal Trends" },
  { id: "expense",  label: "Expense Monitor" },
  { id: "margin",   label: "Margin Deep Dive" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("discount");

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Pharmacy Analytics Dashboard</h1>
          <p className="subtitle">50 months of P&L data — Oct 2022 to Jan 2026</p>
        </div>
        <div className="badge">Live demo</div>
      </header>

      <nav className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={activeTab === t.id ? "tab active" : "tab"}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {activeTab === "discount" && <DiscountAnalysis data={DATA} />}
        {activeTab === "forecast" && <ProfitForecast   data={DATA} />}
        {activeTab === "seasonal" && <SeasonalTrends   data={DATA} />}
        {activeTab === "expense"  && <ExpenseMonitor   data={DATA} />}
        {activeTab === "margin"   && <MarginDeepDive   data={DATA} />}
      </main>
    </div>
  );
}