
import csv
from datetime import datetime

input_file = "Atendimentos de Dezembro - 2025.csv"
output_file = "Atendimentos_Silvia_Dezembro_2025.csv"
encoding = "latin-1" 

def is_dec_2025(date_str):
    # Format: Feb 04 2026 11:00 AM
    try:
        dt = datetime.strptime(date_str, '%b %d %Y %I:%M %p')
        return dt.month == 12 and dt.year == 2025
    except ValueError:
        return False

try:
    with open(input_file, 'r', encoding=encoding) as f_in, \
         open(output_file, 'w', encoding=encoding, newline='') as f_out:
        
        reader = csv.DictReader(f_in)
        fieldnames = reader.fieldnames
        writer = csv.DictWriter(f_out, fieldnames=fieldnames)
        
        writer.writeheader()
        
        # Column Identification
        owner_col = "Appointment Owner"
        date_col = "Requested Time" 
        
        # Fallback for date column if exact name mismatch
        if date_col not in fieldnames:
             for h in fieldnames:
                 if "Requested" in h and "Time" in h:
                     date_col = h
                     break
        
        # Fallback for owner
        if owner_col not in fieldnames:
             for h in fieldnames:
                 if "Owner" in h and "Appointment" in h:
                     owner_col = h
                     break
        
        print(f"Using Owner Column: '{owner_col}'")
        print(f"Using Date Column: '{date_col}'")

        count = 0
        for row in reader:
             owner_val = row.get(owner_col, '')
             date_val = row.get(date_col, '')
             
             if 'Dra.Silvia' in owner_val:
                 if is_dec_2025(date_val):
                     writer.writerow(row)
                     count += 1
                 
    print(f"Successfully saved {count} appointments for 'Dra.Silvia' in December 2025 to '{output_file}'")

except Exception as e:
    print(f"Error: {e}")
