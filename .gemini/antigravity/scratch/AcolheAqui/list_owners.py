
import csv

input_file = "Atendimentos de Dezembro - 2025.csv"
encoding = "latin-1"

try:
    with open(input_file, 'r', encoding=encoding) as f:
        reader = csv.DictReader(f)
        owners = set()
        for row in reader:
             # Find owner column loosely
             val = ""
             if 'Appointment Owner' in row:
                 val = row['Appointment Owner']
             else:
                 for k in row.keys():
                     if k and 'Owner' in k and 'Appointment' in k:
                         val = row[k]
                         break
             if val:
                owners.add(val)
        
        print("Unique Owners:")
        for o in sorted(list(owners)):
            print(f"- {o}")

except Exception as e:
    print(f"Error: {e}")
