# Pharmacy Analytics Dashboard

A pharmacy financial analytics platform built with React and Chart.js — powered by 50 months of real P&L data.

## Live demo

[Coming soon — deploying to Vercel]

## What it does

Five analytics modules built on real pharmacy data from Oct 2022 to Jan 2026:

- **Discount & leakage analysis** — tracks where gross sales bleed away before becoming net revenue
- **Profit forecast** — historical trends with 3-month linear forecasting and loss-month alerts
- **Seasonal trends** — identifies peak and slow months across all years with year-on-year growth
- **Expense ratio monitor** — tracks costs as a % of net sales with forward projections
- **Margin deep dive** — gross and net margin trends with cost-of-sales breakdown

All charts include 3-month forecasts using linear regression.

## Tech stack

- **Frontend** — React, Vite, Chart.js
- **Data** — pandas, openpyxl (used offline to parse Excel into static JSON)
- **Forecasting** — linear regression computed client-side in JavaScript
- **Deployment** - Vercel
