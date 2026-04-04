import csv
import json


def build_hierarchical_json(table1_path, table2_path, output_json_path):
    database = {}

    # ---------------------------------------------------------
    # STEP 1: Parse Table 2 (Zone Vacancies)
    # ---------------------------------------------------------
    # We do this first so we can seed our dictionary with the QZPs
    # and their respective 'zone_vacancies' totals.
    with open(table2_path, mode="r", encoding="utf-8") as f2:
        reader = csv.reader(f2)
        headers2 = next(reader)

        # Extract the names of the subjects (skip 'QZP' at index 0 and 'Total' at the end)
        subject_cols = headers2[1:-1]

        for row in reader:
            qzp_val = row[0].strip()

            # Skip empty rows or the final 'Total' row
            if not qzp_val or qzp_val.lower() == "total":
                continue

            # Format "1" to "QZP.01" to match table001
            qzp_formatted = f"QZP.{int(qzp_val):02d}"

            vacancies = {}
            for i, col in enumerate(subject_cols):
                val = row[i + 1].strip()
                # float() first to safely handle strings like "1.0", then cast to int
                vacancies[col] = int(float(val)) if val else 0

            # Initialize the QZP in the database
            database[qzp_formatted] = {"zone_vacancies": vacancies}

    # ---------------------------------------------------------
    # STEP 2: Parse Table 1 (Hierarchy & Schools)
    # ---------------------------------------------------------
    with open(table1_path, mode="r", encoding="utf-8") as f1:
        reader = csv.reader(f1)
        headers1 = next(reader)

        current_qzp = None
        current_muni = None

        for row in reader:
            if not row:
                continue

            col_0 = row[0].strip()

            # Check if this is a header row by seeing if all data columns are empty.
            # In a CSV, empty cells are read as empty strings "".
            is_header = all(val.strip() == "" for val in row[1:])

            if is_header:
                if col_0.startswith("QZP."):
                    current_qzp = col_0
                    # Ensure it exists (in case table001 has QZPs not in table002)
                    if current_qzp not in database:
                        database[current_qzp] = {}
                    current_muni = None  # Reset municipality context
                else:
                    current_muni = col_0
                    # Create the municipality dictionary inside the current QZP
                    if current_qzp and current_muni not in database[current_qzp]:
                        database[current_qzp][current_muni] = {}
            else:
                # It's a School data row
                school_name = col_0
                vacancies = {}

                # Zip headers from column 1 onwards with values from column 1 onwards
                for col_name, val in zip(headers1[1:], row[1:]):
                    val = val.strip()
                    vacancies[col_name] = int(float(val)) if val else 0

                # Insert the school under the correct QZP -> Municipality
                if current_qzp and current_muni:
                    database[current_qzp][current_muni][school_name] = vacancies

    # ---------------------------------------------------------
    # STEP 3: Export to JSON
    # ---------------------------------------------------------
    with open(output_json_path, "w", encoding="utf-8") as out_f:
        json.dump(database, out_f, indent=4, ensure_ascii=False)

    print(f"Successfully saved structured data to {output_json_path}")


if __name__ == "__main__":
    build_hierarchical_json("table001.csv", "table002.csv", "structured_vacancies.json")
