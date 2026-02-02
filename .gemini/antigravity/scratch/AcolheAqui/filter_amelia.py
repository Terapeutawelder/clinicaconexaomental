
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
        
        count = 0
        for row in reader:
             # Check Contact Owner column
             # We look for 'Amélia' in the Contact Owner column
             # Based on previous check, header is likely 'Contact Owner'
             # But let's check keys just in case
             
             contact_owner = row.get('Contact Owner', '')
             if 'Amélia' in contact_owner:
                 writer.writerow(row)
                 count += 1
                 
    print(f"Successfully saved {count} appointments for Amélia to '{output_file}'")

except Exception as e:
    print(f"Error: {e}")
