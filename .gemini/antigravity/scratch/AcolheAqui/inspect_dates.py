
import csv

input_file = "Atendimentos de Dezembro - 2025.csv"
encoding = "latin-1"

try:
    with open(input_file, 'r', encoding=encoding) as f:
        reader = csv.reader(f)
        headers = next(reader)
        row1 = next(reader)
        
        print("Headers:", headers)
        print("Row 1:", row1)
        
        # Identify date columns
        date_cols = []
        for i, h in enumerate(headers):
            if "date" in h.lower() or "time" in h.lower() or "data" in h.lower() or "dia" in h.lower():
                date_cols.append((i, h, row1[i] if len(row1) > i else "N/A"))
        
        print("\nPossible Date Columns:")
        for idx, name, val in date_cols:
            print(f"Index {idx}: '{name}' -> Sample: '{val}'")

except Exception as e:
    print(f"Error: {e}")
