
import csv
import os
import re
from datetime import datetime

input_file = "Atendimentos de dezembro 2025.csv"
encoding = "latin-1" 

def is_dec_2025(date_str):
    # Format: "Feb 04 2026 11:00 AM" or "Dec 29 2025 10:20 PM"
    # Depending on the file, it might just be a string check if format varies
    if "Dec" in date_str and "2025" in date_str:
        return True
    return False

def sanitize_filename(name):
    # Remove dots, replace spaces with underscores
    clean = re.sub(r'[^\w\s-]', '', name)
    return clean.strip().replace(' ', '_')

try:
    print(f"Reading '{input_file}'...")
    with open(input_file, 'r', encoding=encoding) as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        
        # Identify columns
        owner_col = "Appointment Owner"
        date_col = "Requested Time" 
        
        # Fallback detection
        if owner_col not in fieldnames:
             for h in fieldnames:
                 if "Owner" in h and "Appointment" in h:
                     owner_col = h; break
        if date_col not in fieldnames:
             for h in fieldnames:
                 if "Requested" in h and "Time" in h:
                     date_col = h; break

        print(f"Using Owner Column: '{owner_col}'")
        print(f"Using Date Column: '{date_col}'")
        
        # Group by owner
        appointments_by_owner = {}
        
        for row in reader:
             owner = row.get(owner_col, '').strip()
             date_val = row.get(date_col, '')
             
             if owner and is_dec_2025(date_val):
                 if owner not in appointments_by_owner:
                     appointments_by_owner[owner] = []
                 appointments_by_owner[owner].append(row)
                 
    # Write files
    generated_files = []
    print("\nGenerating files:")
    for owner, rows in appointments_by_owner.items():
        safe_name = sanitize_filename(owner)
        output_file = f"Atendimentos_{safe_name}_Dezembro_2025.csv"
        
        with open(output_file, 'w', encoding=encoding, newline='') as f_out:
            writer = csv.DictWriter(f_out, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
            
        print(f"  - {output_file}: {len(rows)} appointments")
        generated_files.append(output_file)

    if not generated_files:
        print("No appointments found for December 2025.")

except Exception as e:
    print(f"Error: {e}")
