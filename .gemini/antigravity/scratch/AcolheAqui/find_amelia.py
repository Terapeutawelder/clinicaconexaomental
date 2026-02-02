
import csv

def find_amelia(encoding):
    try:
        with open("Atendimentos de Dezembro - 2025.csv", 'r', encoding=encoding) as f:
            reader = csv.reader(f)
            headers = next(reader)
            print(f"Success with encoding: {encoding}")
            print("Headers:", headers)
            
            found_count = 0
            for i, row in enumerate(reader):
                # Search for Amélia in any column
                for col_idx, value in enumerate(row):
                    if "Amélia" in value or "Amelia" in value or "AMÉLIA" in value or "AMELIA" in value:
                        print(f"Found 'Amélia' in row {i+2}, column '{headers[col_idx]}' (Index {col_idx}): {value}")
                        found_count += 1
                        if found_count >= 5:
                            return True
            if found_count == 0:
                print("Name 'Amélia' not found in this encoding.")
            return True
    except UnicodeDecodeError:
        return False
    except Exception as e:
        print(f"Error with {encoding}: {e}")
        return False

encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252', 'utf-16']
for enc in encodings:
    print(f"Trying {enc}...")
    if find_amelia(enc):
        break
