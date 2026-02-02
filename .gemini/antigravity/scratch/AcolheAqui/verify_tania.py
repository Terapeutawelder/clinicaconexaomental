
import csv

try:
    with open("Atendimentos_Tania_Dezembro_2025.csv", 'r', encoding='latin-1') as f:
        reader = csv.DictReader(f)
        dates = [row['Requested Time'] for row in reader]
        print(f"Total: {len(dates)}")
        print("First 5 dates:", dates[:5])
        
        # Verify if any non-December date exists
        non_dec = [d for d in dates if "Dec" not in d or "2025" not in d]
        if non_dec:
            print("WARNING: Found non-December dates:", non_dec)
        else:
            print("VERIFIED: All dates contain 'Dec' and '2025'.")

except Exception as e:
    print(f"Error: {e}")
