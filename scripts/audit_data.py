import json
import glob
import os

data_dir = "/Users/xuantruong/Documents/WORK/SIDE_PROJECTS/watashi-jp/data/minna_1"
files = sorted(glob.glob(os.path.join(data_dir, "unit*.json")))

print(f"{'Unit':<10} | {'KanjiBD':<8} | {'ExParts':<8} | {'Romaji':<8} | {'Status'}")
print("-" * 55)

lacking_units = []

for file_path in files:
    filename = os.path.basename(file_path)
    unit_name = filename.replace(".json", "")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if not isinstance(data, list) or not data:
            print(f"{unit_name:<10} | {'ERROR':<8} | {'ERROR':<8} | {'ERROR':<8} | Empty/Invalid")
            continue

        # Check the first few items to gauge the file
        has_kanji_bd = False
        has_ex_parts = False
        has_romaji = False
        
        # Check a sample of items to be sure
        sample_count = min(len(data), 5)
        checks = {'kbd': 0, 'ex': 0, 'rom': 0}
        
        for item in data[:sample_count]:
            if item.get('kanjiBreakdown'):
                checks['kbd'] += 1
            
            ex = item.get('exampleSentence', {})
            if ex.get('parts'):
                checks['ex'] += 1
                
            parts = item.get('wordParts', [])
            if parts and 'romaji' in parts[0]:
                checks['rom'] += 1

        # Use looser criteria: if ANY of the sample has it, we assume it's "there" 
        # but realistically valid data should have it for mostly all. 
        # Let's say if > 0 found.
        has_kanji_bd = checks['kbd'] > 0
        has_ex_parts = checks['ex'] > 0
        has_romaji = checks['rom'] > 0

        status = "OK"
        if not (has_kanji_bd and has_ex_parts and has_romaji):
            status = "LACKING"
            lacking_units.append(unit_name)

        print(f"{unit_name:<10} | {str(has_kanji_bd):<8} | {str(has_ex_parts):<8} | {str(has_romaji):<8} | {status}")

    except Exception as e:
        print(f"{unit_name:<10} | Error: {str(e)}")

print("-" * 55)
print(f"Lacking Units: {', '.join(lacking_units)}")
