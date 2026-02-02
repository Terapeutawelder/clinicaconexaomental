
import csv

def find_name(name_query):
    encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']
    for encoding in encodings:
        try:
            with open("Atendimentos de Dezembro - 2025.csv", 'r', encoding=encoding) as f:
                reader = csv.reader(f)
                headers = next(reader)
                print(f"Searching with encoding: {encoding}")
                
                found = False
                for i, row in enumerate(reader):
                    for col_idx, value in enumerate(row):
                        if name_query.lower() in value.lower():
                            print(f"Found '{name_query}' in row {i+2}, column '{headers[col_idx] if col_idx < len(headers) else '?'}' : {value}")
                            found = True
                            if found: break 
                    if found: break
                
                if found:
                    return
        except Exception as e:
            print(f"Error with {encoding}: {e}")

find_name("Renata")
