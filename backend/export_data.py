import pandas as pd
import json
import io

def parse_excel(path):
    df = pd.read_excel(path, sheet_name="Detailed P&L", header=None)

    months_raw = df.iloc[4, 1:51]
    months = pd.to_datetime(months_raw, errors="coerce")

    def get_row(row_idx):
        return pd.to_numeric(df.iloc[row_idx, 1:51], errors="coerce").fillna(0).tolist()

    labels = [m.strftime("%b %Y") if pd.notna(m) else None for m in months]

    return {
        "months":           labels,
        "gross_sales":      get_row(7),
        "sales_manual":     get_row(8),
        "total_sales":      get_row(9),
        "discounts":        get_row(11),
        "returns":          get_row(12),
        "tax_pos_fee":      get_row(13),
        "total_deductions": get_row(14),
        "net_sales":        get_row(15),
        "cost_of_sales":    get_row(22),
        "gross_profit":     get_row(23),
        "salaries":         get_row(27),
        "other_employment": get_row(28),
        "total_employment": get_row(30),
        "occupancy":        get_row(49),
        "total_ga":         get_row(63),
        "total_marketing":  get_row(67),
        "total_operating":  get_row(81),
        "total_other_exp":  get_row(97),
        "total_expenses":   get_row(98),
        "net_profit":       get_row(99),
    }

data = parse_excel("/Users/eesharizwan/Downloads/Financial_Statement.xlsx")

js_content = f"const DATA = {json.dumps(data, indent=2)};\n\nexport default DATA;"

with open("../frontend/src/data.js", "w") as f:
    f.write(js_content)

print("Done! data.js written to frontend/src/")
