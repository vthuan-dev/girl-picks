"""
Kiểm tra chi tiết nhiều album để tìm vấn đề
"""
import json
import os
import glob
import re
import random

# Đọc SQL
sql_file = "data/albums_insert.sql"
with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Đọc tất cả JSON files
folder_path = "data/albums_batch_20251212_003851"
json_files = glob.glob(os.path.join(folder_path, "*.json"))

# Lấy 20 album ngẫu nhiên có nhiều ảnh
albums_to_check = []
for json_file in json_files:
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        images = data.get('images', [])
        if len(images) >= 10:  # Chỉ lấy album có >= 10 ảnh
            albums_to_check.append({
                'file': json_file,
                'title': data.get('title', ''),
                'images': images
            })
    except:
        pass

# Lấy 20 album ngẫu nhiên
random.seed(42)
albums_to_check = random.sample(albums_to_check, min(20, len(albums_to_check)))

print("="*80)
print("KIỂM TRA 20 ALBUM CÓ NHIỀU ẢNH (>= 10 ảnh)")
print("="*80)

issues_found = []
for album in albums_to_check:
    title = album['title']
    json_images = album['images']
    json_count = len(json_images)
    
    # Tìm album trong SQL
    escaped_title = re.escape(title)
    album_pattern = rf"INSERT INTO `albums`.*?'([a-f0-9-]{{36}})',\s*\n\s*'{escaped_title}'"
    match = re.search(album_pattern, sql_content, re.DOTALL)
    
    if match:
        album_id = match.group(1)
        # Đếm số ảnh trong SQL
        sql_count = len(re.findall(rf"'{album_id}'", sql_content)) - 1
        
        # Kiểm tra từng URL
        missing_count = 0
        for url in json_images:
            # Tìm URL trong SQL với album_id này
            url_pattern = rf"'{album_id}',\s*\n\s*'{re.escape(url)}'"
            if not re.search(url_pattern, sql_content):
                missing_count += 1
        
        status = "✓" if sql_count == json_count and missing_count == 0 else "✗"
        print(f"{status} {title[:50]:50s} | JSON: {json_count:2d} | SQL: {sql_count:2d} | Missing: {missing_count}")
        
        if sql_count != json_count or missing_count > 0:
            issues_found.append({
                'title': title,
                'json_count': json_count,
                'sql_count': sql_count,
                'missing_count': missing_count
            })
    else:
        print(f"✗ {title[:50]:50s} | JSON: {json_count:2d} | SQL: NOT FOUND")
        issues_found.append({
            'title': title,
            'json_count': json_count,
            'sql_count': 0,
            'missing_count': json_count
        })

print("\n" + "="*80)
if issues_found:
    print(f"Tìm thấy {len(issues_found)} album có vấn đề:")
    for issue in issues_found[:10]:
        print(f"  - {issue['title']}: {issue['json_count']} trong JSON, {issue['sql_count']} trong SQL")
else:
    print("✓ Không tìm thấy vấn đề nào! Tất cả album đều có đủ ảnh.")

