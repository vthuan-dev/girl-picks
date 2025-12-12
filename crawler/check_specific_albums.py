"""
Kiểm tra chi tiết một vài album cụ thể
"""
import json
import os
import re

# Đọc SQL
sql_file = "data/albums_insert.sql"
with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Kiểm tra album "Yeon Woo #1"
print("="*60)
print("KIỂM TRA ALBUM: Yeon Woo #1")
print("="*60)

# Tìm album_id
album_pattern = r"INSERT INTO `albums`.*?'([a-f0-9-]{36})',\s*\n\s*'Yeon Woo #1'"
match = re.search(album_pattern, sql_content, re.DOTALL)
if match:
    album_id = match.group(1)
    print(f"Album ID: {album_id}")
    
    # Đếm số ảnh
    image_count = len(re.findall(rf"'{album_id}'", sql_content)) - 1
    print(f"Số ảnh trong SQL: {image_count}")
    
    # Tìm tất cả các URL ảnh
    url_pattern = rf"'([a-f0-9-]{{36}})',\s*\n\s*'{album_id}',\s*\n\s*'(https://[^']+)'"
    image_urls = re.findall(url_pattern, sql_content)
    print(f"Số URL ảnh tìm thấy: {len(image_urls)}")
    if image_urls:
        print("Các URL ảnh:")
        for img_id, url in image_urls[:5]:
            print(f"  - {url}")
        if len(image_urls) > 5:
            print(f"  ... và {len(image_urls) - 5} ảnh nữa")
else:
    print("Không tìm thấy album!")

# Kiểm tra album "Mỹ Anh tây ninh"
print("\n" + "="*60)
print("KIỂM TRA ALBUM: Mỹ Anh tây ninh nyc bồn chứa tinh năm c3")
print("="*60)

json_file = "data/albums_batch_20251212_003851/album_Mỹ-Anh-tây-ninh-nyc-bồn-chứa-tinh-năm-c3_20251212_005829.json"
with open(json_file, 'r', encoding='utf-8') as f:
    json_data = json.load(f)

print(f"Số ảnh trong JSON: {len(json_data.get('images', []))}")
print("Các URL ảnh trong JSON:")
for url in json_data.get('images', [])[:5]:
    print(f"  - {url}")
if len(json_data.get('images', [])) > 5:
    print(f"  ... và {len(json_data.get('images', [])) - 5} ảnh nữa")

# Tìm trong SQL
title = json_data.get('title', '')
album_pattern2 = rf"INSERT INTO `albums`.*?'([a-f0-9-]{{36}})',\s*\n\s*'{re.escape(title)}'"
match2 = re.search(album_pattern2, sql_content, re.DOTALL)
if match2:
    album_id2 = match2.group(1)
    print(f"\nAlbum ID trong SQL: {album_id2}")
    image_count2 = len(re.findall(rf"'{album_id2}'", sql_content)) - 1
    print(f"Số ảnh trong SQL: {image_count2}")
    
    # Kiểm tra từng URL
    missing_urls = []
    for url in json_data.get('images', []):
        if url not in sql_content:
            missing_urls.append(url)
    
    if missing_urls:
        print(f"\n⚠️ Có {len(missing_urls)} URL không tìm thấy trong SQL:")
        for url in missing_urls:
            print(f"  - {url}")
    else:
        print("\n✓ Tất cả URL đều có trong SQL!")

