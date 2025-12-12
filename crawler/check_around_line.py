"""
Kiểm tra các album xung quanh dòng 25288 và đếm số ảnh
"""
import re

sql_file = "data/albums_insert.sql"
with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Đọc các album từ dòng 25260 đến 25400
print("="*80)
print("KIỂM TRA CÁC ALBUM XUNG QUANH DÒNG 25288")
print("="*80)

# Tìm tất cả albums trong file
album_pattern = r"INSERT INTO `albums`.*?'([a-f0-9-]{36})',\s*\n\s*'([^']+)'"
albums_found = []

for match in re.finditer(album_pattern, sql_content, re.DOTALL):
    album_id = match.group(1)
    title = match.group(2).strip()
    albums_found.append((album_id, title))

# Tìm vị trí của album "Yua mikami #1" (dòng 25280)
target_album_id = None
for i, (album_id, title) in enumerate(albums_found):
    if 'Yua mikami #1' in title or title == 'Yua mikami #1':
        target_album_id = album_id
        print(f"\nTìm thấy album tại vị trí {i}: {title}")
        print(f"Album ID: {album_id}")
        break

# Kiểm tra 10 album xung quanh vị trí này
start_idx = max(0, albums_found.index((target_album_id, 'Yua mikami #1')) - 5)
end_idx = min(len(albums_found), albums_found.index((target_album_id, 'Yua mikami #1')) + 5)

print(f"\nKiểm tra {end_idx - start_idx} albums xung quanh:")
print("-" * 80)

for i in range(start_idx, end_idx):
    album_id, title = albums_found[i]
    # Đếm số ảnh
    image_count = len(re.findall(rf"'{album_id}'", sql_content)) - 1
    
    # Tìm các URL ảnh
    url_pattern = rf"'([a-f0-9-]{{36}})',\s*\n\s*'{album_id}',\s*\n\s*'(https://[^']+)'"
    image_urls = re.findall(url_pattern, sql_content)
    
    status = "✓" if image_count > 2 else "⚠"
    print(f"{status} [{i:4d}] {title[:50]:50s} | {image_count:2d} ảnh")
    
    if image_count <= 2 and image_count > 0:
        print(f"      URLs: {', '.join([url for _, url in image_urls[:3]])}")
        if len(image_urls) > 3:
            print(f"      ... và {len(image_urls) - 3} ảnh nữa")

# Kiểm tra cụ thể album "Yua mikami #1"
if target_album_id:
    print(f"\n{'='*80}")
    print(f"CHI TIẾT ALBUM: Yua mikami #1")
    print(f"{'='*80}")
    print(f"Album ID: {target_album_id}")
    
    image_count = len(re.findall(rf"'{target_album_id}'", sql_content)) - 1
    print(f"Số ảnh trong SQL: {image_count}")
    
    # Tìm tất cả các URL ảnh
    url_pattern = rf"'([a-f0-9-]{{36}})',\s*\n\s*'{target_album_id}',\s*\n\s*'(https://[^']+)'"
    image_urls = re.findall(url_pattern, sql_content)
    print(f"Số URL tìm thấy: {len(image_urls)}")
    
    if image_urls:
        print("\nCác URL ảnh:")
        for img_id, url in image_urls:
            print(f"  - {url}")

