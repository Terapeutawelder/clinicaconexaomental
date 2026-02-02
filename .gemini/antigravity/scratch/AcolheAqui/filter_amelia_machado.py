
import csv

input_file = "Atendimentos de Dezembro - 2025.csv"
output_file = "Atendimentos_Amelia_Dezembro_2025.csv"
encoding = "latin-1" 

try:
    with open(input_file, 'r', encoding=encoding) as f_in, \
         open(output_file, 'w', encoding=encoding, newline='') as f_out:
        
        reader = csv.DictReader(f_in)
        fieldnames = reader.fieldnames
        writer = csv.DictWriter(f_out, fieldnames=fieldnames)
        
        writer.writeheader()
        
        # Verify column existence
        target_col = "Appointment Owner"
        if target_col not in fieldnames:
            print(f"Warning: '{target_col}' not found in headers: {fieldnames}")
            # Try to find a close match
            for h in fieldnames:
                if "Owner" in h and "Appointment" in h:
                    target_col = h
                    break
            print(f"Using column: '{target_col}'")

        count = 0
        for row in reader:
             owner_val = row.get(target_col, '')
             # Case insensitive check just in case, though user specified exact
             if 'Amélia Machado' in owner_val: 
                 writer.writerow(row)
                 count += 1
                 
    print(f"Successfully saved {count} appointments for 'Amélia Machado' to '{output_file}'")

except Exception as e:
    print(f"Error: {e}")
