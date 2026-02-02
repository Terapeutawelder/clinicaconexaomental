
import csv

try:
    with open("Atendimentos de Dezembro - 2025.csv", 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        headers = next(reader)
        print("Headers:", headers)
        print("\nFirst 5 rows:")
        for i, row in enumerate(reader):
            if i < 5:
                print(row)
            else:
                break
except Exception as e:
    print(f"Error with utf-8: {e}")
    # Try alternate encoding
    try:
        print("\nRetrying with utf-8-sig...")
        with open("Atendimentos de Dezembro - 2025.csv", 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            headers = next(reader)
            print("Headers:", headers)
            print("\nFirst 5 rows:")
            for i, row in enumerate(reader):
                if i < 5:
                    print(row)
                else:
                    break
    except Exception as e2:
         print(f"Error with utf-8-sig: {e2}")
         try:
            print("\nRetrying with latin-1...")
            with open("Atendimentos de Dezembro - 2025.csv", 'r', encoding='latin-1') as f:
                reader = csv.reader(f)
                headers = next(reader)
                print("Headers:", headers)
                print("\nFirst 5 rows:")
                for i, row in enumerate(reader):
                    if i < 5:
                        print(row)
                    else:
                        break
         except Exception as e3:
            print(f"All encodings failed: {e3}")
