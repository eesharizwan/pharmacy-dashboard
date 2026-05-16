from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def parse_excel(file_bytes):
    df = pd.read_excel(io.BytesIO(file_bytes), sheet_name="Detailed P&L", header=None)

    months_raw = df.iloc[4, 1:51]
    months = pd.to_datetime(months_raw, errors="coerce")

    def get_row(row_idx):
        return pd.to_numeric(df.iloc[row_idx, 1:51], errors="coerce").fillna(0).tolist()

    labels = [m.strftime("%b %Y") if pd.notna(m) else None for m in months]

    return {
        "months": labels,
        "gross_sales":        get_row(7),
        "sales_manual":       get_row(8),
        "total_sales":        get_row(9),
        "discounts":          get_row(11),
        "returns":            get_row(12),
        "tax_pos_fee":        get_row(13),
        "total_deductions":   get_row(14),
        "net_sales":          get_row(15),
        "cost_of_sales":      get_row(22),
        "gross_profit":       get_row(23),
        "salaries":           get_row(27),
        "other_employment":   get_row(28),
        "total_employment":   get_row(30),
        "occupancy":          get_row(49),
        "total_ga":           get_row(63),
        "total_marketing":    get_row(67),
        "total_operating":    get_row(81),
        "total_other_exp":    get_row(97),
        "total_expenses":     get_row(98),
        "net_profit":         get_row(99),
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    data = parse_excel(contents)
    return data

@app.get("/")
def root():
    return {"status": "ok"}