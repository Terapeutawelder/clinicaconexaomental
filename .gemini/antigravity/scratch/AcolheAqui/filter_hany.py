
import csv

input_file = "Atendimentos de Dezembro - 2025.csv"
output_file = "Atendimentos_Hany_Dezembro_2025.csv"
encoding = "latin-1" 

try:
    with open(input_file, 'r', encoding=encoding) as f_in, \
         open(output_file, 'w', encoding=encoding, newline='') as f_out:
        
        reader = csv.DictReader(f_in)
        fieldnames = reader.fieldnames
        writer = csv.DictWriter(f_out, fieldnames=fieldnames)
        
        writer.writeheader()
        
        # Robust column finding
        target_col = None
        if "Appointment Owner" in fieldnames:
            target_col = "Appointment Owner"
        else:
            for h in fieldnames:
                if "Owner" in h and "Appointment" in h:
                    target_col = h
                    break
        
        if not target_col:
             # Fallback to index if needed, but for DictReader we really need a key
             # If we can't find the key, let's try a standard reader approach or just fail gracefully
             print("Could not identify 'Appointment Owner' column. Available:", fieldnames)
             exit(1)

        print(f"Using column: '{target_col}'")

        count = 0
        for row in reader:
             owner_val = row.get(target_col, '')
             if 'Hany Campos' in owner_val: 
                 writer.writerow(row)
                 count += 1
                 
    print(f"Successfully saved {count} appointments for 'Hany Campos' to '{output_file}'")

except Exception as e:
    print(f"Error: {e}")
