import json

import polars as pl
from bs4 import BeautifulSoup


def main():
    # Load JSON
    with open("text.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    # Navigate to the HTML field
    html_text = data["screenData"]["variables"]["TextoFormatadoAux"]

    # Parse HTML
    soup = BeautifulSoup(html_text, "lxml")

    def table_to_polars(table):
        rows = table.find_all("tr")

        # Extract headers
        headers = [th.get_text(strip=True) for th in rows[0].find_all(["th", "td"])]

        # Extract data rows
        data_rows = []
        for row in rows[1:]:
            cols = [td.get_text(strip=True) for td in row.find_all("td")]
            if cols:
                data_rows.append(cols)

        return pl.DataFrame(data_rows, schema=headers)

    # Extract tables
    tables = {
        "table001": soup.find("table", {"id": "table001"}),
        "table002": soup.find("table", {"id": "table002"}),
    }

    # Convert and save
    for name, table in tables.items():
        if table:
            df = table_to_polars(table)
            df.write_csv(f"{name}.csv")
            print(f"Saved {name}.csv")
        else:
            print(f"{name} not found")


if __name__ == "__main__":
    main()
