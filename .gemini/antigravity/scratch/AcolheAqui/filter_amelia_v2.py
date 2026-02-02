
import csv

input_file = "Atendimentos de Dezembro - 2025.csv"
output_file = "Atendimentos_Amelia_Dezembro_2025.csv"
encoding = "latin-1"

try:
    with open(input_file, 'r', encoding=encoding) as f_in, \
         open(output_file, 'w', encoding=encoding, newline='') as f_out:
        
        reader = csv.reader(f_in)
        headers = next(reader)
        writer = csv.writer(f_out)
        
        writer.writerow(headers)
        
        count = 0
        # Find index of 'Contact Owner'
        try:
             # Try exact match first
             owner_idx = headers.index('Contact Owner')
        except ValueError:
             # Try partial match or just use index 5 if that fails
             owner_idx = 5
             for i, h in enumerate(headers):
                 if "Contact Owner" in h:
                     owner_idx = i
                     break
        
        print(f"Using column index {owner_idx} ('{headers[owner_idx]}') for filtering.")

        for row in reader:
             if len(row) > owner_idx:
                 val = row[owner_idx]
                 if 'Amélia' in val or 'Amelia' in val:
                     writer.writerow(row)
                     count += 1
                 
    print(f"Successfully saved {count} appointments for Amélia to '{output_file}'")

except Exception as e:
    print(f"Error: {e}")
