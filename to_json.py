import csv
import json
import re


def schools_to_json(table1_path, output_json_path):
    database = {}

    with open(table1_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        data = [row for row in reader]

        for row in data:
            municipality = (
                f"0{row['municipality'].strip()}"
                if len(row["municipality"].strip()) == 3
                else row["municipality"].strip()
            )
            municipality_code = (
                re.match(r"(\d{4})", municipality).group(1)
                if re.match(r"(\d{4})", municipality)
                else f"0{row['municipality_code_2013'].strip()}"
                if len(row["municipality_code_2013"].strip()) == 3
                else row["municipality_code_2013"].strip()
                if row["municipality_code_2013"].strip()
                else f"0{row['municipality_code'].strip()}"
                if len(row["municipality_code"].strip()) == 3
                else row["municipality_code"].strip()
            )
            municipality_name = (
                re.match(r"(.+)\(\d{4}\)", municipality).group(1).strip()
                if re.match(r"(.+)\(\d{4}\)", municipality)
                else f"0{row['municipality_name_2013'].strip()}"
                if len(row["municipality_name_2013"].strip()) == 3
                else row["municipality_name_2013"].strip()
                if row["municipality_name_2013"].strip()
                else f"0{row['municipality_name'].strip()}"
                if len(row["municipality_name"].strip()) == 3
                else row["municipality_name"].strip()
            )
            school_code = row.get("school_code", "").strip()
            school_name = (
                row.get("school_name_2024", "").strip()
                if row.get("school_name_2024", "").strip()
                else row.get("school_name_2013", "").strip()
                if row.get("school_name_2013", "").strip()
                else row.get("school_name", "").strip()
            )
            school_url = row.get("url", "").strip()
            school_street = row.get("street", "").strip()
            school_door_number = row.get("door_number", "").strip()
            school_locality = row.get("locality", "").strip()
            school_zip_code = row.get("zip_code", "").strip()
            school_latitude = row.get("latitude", "").strip()
            school_longitude = row.get("longitude", "").strip()
            school_phone_number = (
                row.get("phone_number_2013", "").strip()
                if row.get("phone_number_2013", "").strip()
                else row.get("phone_number", "").strip()
            )
            school_maps_place_url = row.get("maps_place_url", "").strip()
            school_maps_plus_code = row.get("maps_plus_code", "").strip()
            school_observations = (
                row.get("observations_2024", "").strip()
                if row.get("observations_2024", "").strip()
                else row.get("observations_2013", "").strip()
                if row.get("observations_2013", "").strip()
                else row.get("observations", "").strip()
            )
            if municipality_code not in database:
                database[municipality_code] = {
                    "municipality_name": municipality_name,
                }
                database[municipality_code][school_code] = {
                    "school_name": school_name,
                    "school_url": school_url,
                    "school_street": school_street,
                    "school_door_number": school_door_number,
                    "school_locality": school_locality,
                    "school_zip_code": school_zip_code,
                    "school_latitude": school_latitude,
                    "school_longitude": school_longitude,
                    "school_phone_number": school_phone_number,
                    "school_maps_place_url": school_maps_place_url,
                    "school_maps_plus_code": school_maps_plus_code,
                    "school_observations": school_observations,
                }
            else:
                database[municipality_code][school_code] = {
                    "school_name": school_name,
                    "school_url": school_url,
                    "school_street": school_street,
                    "school_door_number": school_door_number,
                    "school_locality": school_locality,
                    "school_zip_code": school_zip_code,
                    "school_latitude": school_latitude,
                    "school_longitude": school_longitude,
                    "school_phone_number": school_phone_number,
                    "school_maps_place_url": school_maps_place_url,
                    "school_maps_plus_code": school_maps_plus_code,
                    "school_observations": school_observations,
                }

    with open(output_json_path, "w", encoding="utf-8") as out_f:
        json.dump(database, out_f, indent=4, ensure_ascii=False)

    print(f"Successfully saved structured data to {output_json_path}")


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
    # build_hierarchical_json("table001.csv", "table002.csv", "structured_vacancies.json")
    schools_to_json("schools2012to2024.csv", "docs/src/data/schools.json")
