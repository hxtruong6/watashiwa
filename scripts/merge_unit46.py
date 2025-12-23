import json
import os

base_dir = "data/seed/minna_raw"
files = ["unit46_part1.json", "unit46_part2.json", "unit46_part3.json"]
merged_data = []

try:
    for f in files:
        path = os.path.join(base_dir, f)
        print(f"Reading {path}...")
        with open(path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            merged_data.extend(data)

    output_path = os.path.join(base_dir, "unit46.json")
    print(f"Writing {len(merged_data)} items to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as outfile:
        json.dump(merged_data, outfile, indent=2, ensure_ascii=False)

    print("Success!")
    
    # Optional cleanup
    # for f in files:
    #     os.remove(os.path.join(base_dir, f))
    # print("Cleaned up partial files")

except Exception as e:
    print(f"Error: {e}")
