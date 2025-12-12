"""
Script để verify tất cả albums và số ảnh của chúng
Kiểm tra xem có album nào bị thiếu ảnh không
"""
import json
import os
import glob
import re

# Đọc JSON files
folder_path = "data/albums_batch_20251212_003851"
json_files = glob.glob(os.path.join(folder_path, "*.json"))

# Đọc SQL file
sql_file = "data/albums_insert.sql"
with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Tạo map từ title -> số ảnh trong JSON
json_data = {}
for json_file in json_files:
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        title = data.get('title', '').strip()
        if title and data.get('images'):
            json_data[title] = len(data.get('images', []))
    except:
        pass

# Tạo map từ title -> số ảnh trong SQL
sql_data = {}
album_pattern = r"INSERT INTO `albums`.*?'([a-f0-9-]{36})',\s*\n\s*'([^']+)'"
for match in re.finditer(album_pattern, sql_content, re.DOTALL):
    album_id = match.group(1)
    title = match.group(2).strip()
    # Đếm số ảnh
    image_count = len(re.findall(rf"'{album_id}'", sql_content)) - 1
    sql_data[title] = image_count

# So sánh
missing_images = []
for title, json_count in json_data.items():
    if title in sql_data:
        sql_count = sql_data[title]
        if sql_count < json_count:
            missing_images.append({
                'title': title,
                'json': json_count,
                'sql': sql_count,
                'missing': json_count - sql_count
            })

print(f"Tổng số albums trong JSON: {len(json_data)}")
print(f"Tổng số albums trong SQL: {len(sql_data)}")
print(f"\nAlbums bị thiếu ảnh: {len(missing_images)}")

if missing_images:
    print("\n10 albums bị thiếu ảnh đầu tiên:")
    for item in sorted(missing_images, key=lambda x: x['missing'], reverse=True)[:10]:
        print(f"  - {item['title']}: {item['json']} trong JSON, {item['sql']} trong SQL (thiếu {item['missing']} ảnh)")
else:
    print("\n✓ Không có album nào bị thiếu ảnh!")

