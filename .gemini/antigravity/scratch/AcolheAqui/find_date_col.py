
import csv

input_file = "Atendimentos de Dezembro - 2025.csv"
encoding = "latin-1"

try:
    with open(input_file, 'r', encoding=encoding) as f:
        reader = csv.reader(f)
        headers = next(reader)
        row1 = next(reader)
        
        for i, val in enumerate(row1):
            # Look for the date pattern
            if "2025" in val or "2026" in val or "Dec" in val or "Feb" in val:
                print(f"Index {i}: Header='{headers[i]}' Value='{val}'")

except Exception as e:
    print(f"Error: {e}")
