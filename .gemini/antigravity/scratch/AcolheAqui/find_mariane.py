
import csv

def find_mariane():
    name_query = "Mariane"
    name_query2 = "Meneses"
    encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']
    
    for encoding in encodings:
        try:
            with open("Atendimentos de Dezembro - 2025.csv", 'r', encoding=encoding) as f:
                reader = csv.reader(f)
                headers = next(reader)
                
                print(f"Searching for '{name_query}' or '{name_query2}' with encoding: {encoding}")
                
                found_count = 0
                for i, row in enumerate(reader):
                    row_str = str(row).lower()
                    if name_query.lower() in row_str or name_query2.lower() in row_str:
                         print(f"Found match in Row {i+2}: {row}")
                         found_count += 1
                
                if found_count > 0:
                    print(f"Found {found_count} matches.")
                    return
                else:
                    print("No matches found in this encoding.")
                    
        except Exception as e:
            print(f"Error with {encoding}: {e}")

find_mariane()
