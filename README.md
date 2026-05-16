# Pharmacy Analytics Dashboard

A full-stack analytics platform for pharmacy P&L data built with FastAPI and React.

## What it does

Upload a monthly Excel P&L file and instantly get 5 analytics modules:

- **Discount & leakage analysis** — tracks where gross sales bleed away before becoming net revenue
- **Profit forecast** — historical trends with 3-month linear forecasting and loss-month alerts
- **Seasonal trends** — identifies peak and slow months across all years with year-on-year growth
- **Expense ratio monitor** — tracks costs as a % of net sales with forward projections
- **Margin deep dive** — gross and net margin trends with cost-of-sales breakdown

## Tech stack

- **Backend** — Python, FastAPI, pandas, openpyxl
- **Frontend** — React, Vite, Chart.js
- **Forecasting** — linear regression computed client-side

## How to run locally

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn pandas openpyxl python-multipart
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
nvm use 20
npm install
npm run dev
```

Then open `http://localhost:5173` and upload your Excel file.

## Project structure