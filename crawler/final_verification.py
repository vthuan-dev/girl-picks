"""
Kiểm tra cuối cùng: Đếm số ảnh thực tế cho mỗi album trong SQL
"""
import re

sql_file = "data/albums_insert.sql"
with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Tìm tất cả albums
album_pattern = r"INSERT INTO `albums`.*?'([a-f0-9-]{36})',\s*\n\s*'([^']+)'"
albums = {}

for match in re.finditer(album_pattern, sql_content, re.DOTALL):
    album_id = match.group(1)
    title = match.group(2).strip()
    albums[album_id] = {'title': title, 'image_count': 0}

print(f"Tổng số albums: {len(albums)}")

# Đếm số ảnh cho mỗi album
image_pattern = r"INSERT INTO `album_images`.*?'([a-f0-9-]{36})',\s*\n\s*'([a-f0-9-]{36})'"
for match in re.finditer(image_pattern, sql_content, re.DOTALL):
    album_id = match.group(2)
    if album_id in albums:
        albums[album_id]['image_count'] += 1

# Phân tích
distribution = {}
for album_id, data in albums.items():
    count = data['image_count']
    if count not in distribution:
        distribution[count] = []
    distribution[count].append(data['title'])

print("\nPhân bố số lượng ảnh:")
print("Số ảnh | Số albums | Ví dụ titles")
print("-" * 80)

for count in sorted(distribution.keys()):
    albums_with_count = distribution[count]
    print(f"{count:6d} | {len(albums_with_count):9d} | {', '.join(albums_with_count[:3])}")
    if len(albums_with_count) > 3:
        print(f"{'':6s} | {'':9s} | ... và {len(albums_with_count) - 3} album khác")

# Tìm albums có ít ảnh
albums_with_few = [(aid, data) for aid, data in albums.items() if 1 <= data['image_count'] <= 2]
print(f"\nAlbums có 1-2 ảnh: {len(albums_with_few)}")
print("10 ví dụ đầu tiên:")
for album_id, data in albums_with_few[:10]:
    print(f"  - {data['title']}: {data['image_count']} ảnh")

# Tìm albums có nhiều ảnh
albums_with_many = [(aid, data) for aid, data in albums.items() if data['image_count'] >= 10]
print(f"\nAlbums có >= 10 ảnh: {len(albums_with_many)}")
print("10 ví dụ đầu tiên:")
for album_id, data in sorted(albums_with_many, key=lambda x: x[1]['image_count'], reverse=True)[:10]:
    print(f"  - {data['title']}: {data['image_count']} ảnh")

