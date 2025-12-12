"""
Kiểm tra toàn diện: So sánh JSON với SQL để tìm album bị thiếu ảnh
"""
import json
import os
import glob
import re
from collections import defaultdict

# Đọc SQL
sql_file = "data/albums_insert.sql"
print("Đang đọc file SQL...")
with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Tạo map: coverUrl -> album_id (vì có thể có nhiều album cùng title)
print("Đang parse SQL...")
cover_to_album = {}
album_data = {}

# Tìm tất cả albums
album_pattern = r"INSERT INTO `albums`.*?'([a-f0-9-]{36})',\s*\n\s*'([^']+)',\s*\n\s*NULL,\s*\n\s*'(https://[^']+)'"
for match in re.finditer(album_pattern, sql_content, re.DOTALL):
    album_id = match.group(1)
    title = match.group(2).strip()
    cover_url = match.group(3)
    album_data[album_id] = {'title': title, 'cover_url': cover_url, 'images': []}
    cover_to_album[cover_url] = album_id

# Tìm tất cả images
print("Đang parse images...")
image_pattern = r"INSERT INTO `album_images`.*?'([a-f0-9-]{36})',\s*\n\s*'([a-f0-9-]{36})',\s*\n\s*'(https://[^']+)'"
for match in re.finditer(image_pattern, sql_content, re.DOTALL):
    album_id = match.group(2)
    image_url = match.group(3)
    if album_id in album_data:
        album_data[album_id]['images'].append(image_url)

print(f"Tìm thấy {len(album_data)} albums trong SQL")

# Đọc JSON files
print("\nĐang đọc JSON files...")
folder_path = "data/albums_batch_20251212_003851"
json_files = glob.glob(os.path.join(folder_path, "*.json"))

issues = []
total_checked = 0
total_matched = 0

for json_file in json_files:
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        title = data.get('title', '').strip()
        images = data.get('images', [])
        cover_url = images[0] if images else None
        
        if not images or not cover_url:
            continue
        
        total_checked += 1
        
        # Tìm album trong SQL bằng coverUrl (chính xác hơn title)
        album_id = cover_to_album.get(cover_url)
        
        if album_id:
            total_matched += 1
            sql_images = album_data[album_id]['images']
            
            if len(sql_images) != len(images):
                issues.append({
                    'file': os.path.basename(json_file),
                    'title': title,
                    'json_count': len(images),
                    'sql_count': len(sql_images),
                    'cover_url': cover_url
                })
        else:
            issues.append({
                'file': os.path.basename(json_file),
                'title': title,
                'json_count': len(images),
                'sql_count': 0,
                'cover_url': cover_url,
                'error': 'Album not found in SQL'
            })
    except Exception as e:
        print(f"Error reading {json_file}: {e}")

print(f"\n{'='*80}")
print(f"KẾT QUẢ KIỂM TRA")
print(f"{'='*80}")
print(f"Tổng số JSON files: {len(json_files)}")
print(f"Tổng số albums đã kiểm tra: {total_checked}")
print(f"Albums tìm thấy trong SQL: {total_matched}")
print(f"Albums có vấn đề: {len(issues)}")

if issues:
    print(f"\n⚠️ Tìm thấy {len(issues)} album có vấn đề:")
    print("\n10 album đầu tiên có vấn đề:")
    for issue in issues[:10]:
        if 'error' in issue:
            print(f"  ✗ {issue['title']}: {issue['error']}")
        else:
            print(f"  ✗ {issue['title']}: {issue['json_count']} trong JSON, {issue['sql_count']} trong SQL")
else:
    print("\n✓ Không tìm thấy vấn đề nào! Tất cả album đều có đủ ảnh.")

