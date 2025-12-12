"""
Tìm tất cả các album có 1-2 ảnh trong file SQL
"""
import re

sql_file = "data/albums_insert.sql"
with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

print("="*80)
print("TÌM TẤT CẢ ALBUMS CÓ 1-2 ẢNH TRONG FILE SQL")
print("="*80)

# Tìm tất cả albums
album_pattern = r"INSERT INTO `albums`.*?'([a-f0-9-]{36})',\s*\n\s*'([^']+)'"
albums = {}

for match in re.finditer(album_pattern, sql_content, re.DOTALL):
    album_id = match.group(1)
    title = match.group(2).strip()
    albums[album_id] = {'title': title, 'image_count': 0}

# Đếm số ảnh
image_pattern = r"INSERT INTO `album_images`.*?'([a-f0-9-]{36})',\s*\n\s*'([a-f0-9-]{36})'"
for match in re.finditer(image_pattern, sql_content, re.DOTALL):
    album_id = match.group(2)
    if album_id in albums:
        albums[album_id]['image_count'] += 1

# Lọc albums có 1-2 ảnh
albums_with_few = [(aid, data) for aid, data in albums.items() if 1 <= data['image_count'] <= 2]

print(f"\nTìm thấy {len(albums_with_few)} albums có 1-2 ảnh:\n")
print(f"{'STT':<5} | {'Số ảnh':<8} | {'Title'}")
print("-" * 80)

for idx, (album_id, data) in enumerate(albums_with_few, 1):
    print(f"{idx:<5} | {data['image_count']:<8} | {data['title']}")
    
    if idx >= 50:  # Chỉ hiển thị 50 đầu tiên
        print(f"\n... và {len(albums_with_few) - 50} albums khác")
        break

print(f"\n{'='*80}")
print(f"Tổng cộng: {len(albums_with_few)} albums có 1-2 ảnh")
print(f"Tổng số albums: {len(albums)}")
print(f"Tỷ lệ: {len(albums_with_few)/len(albums)*100:.1f}%")

