import json
import os
import glob

folder = "data/albums_batch_20251212_003851"
files = glob.glob(os.path.join(folder, "*.json"))

total_images = 0
success = 0
errors = 0

for f in files:
    try:
        with open(f, encoding='utf-8') as file:
            data = json.load(file)
            img_count = data.get('total_images', 0)
            if img_count > 0:
                success += 1
                total_images += img_count
            else:
                errors += 1
    except Exception as e:
        errors += 1
        print(f"Error reading {f}: {e}")

print(f"\n{'='*60}")
print(f"THONG KE FOLDER: {folder}")
print(f"{'='*60}")
print(f"Tong so file JSON: {len(files)}")
print(f"Album thanh cong: {success}")
print(f"Album loi/khong co anh: {errors}")
print(f"Tong so anh da cao: {total_images:,}")
print(f"{'='*60}")

