"""
Script để phân tích số lượng ảnh trong SQL file
"""
import re

sql_file = "data/albums_insert.sql"
with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Tìm tất cả albums và đếm số ảnh của mỗi album
album_pattern = r"INSERT INTO `albums`.*?'([a-f0-9-]{36})',\s*\n\s*'([^']+)'"
albums = {}

for match in re.finditer(album_pattern, sql_content, re.DOTALL):
    album_id = match.group(1)
    title = match.group(2).strip()
    albums[album_id] = {'title': title, 'images': 0}

# Đếm số ảnh cho mỗi album
image_pattern = r"INSERT INTO `album_images`.*?'([a-f0-9-]{36})',\s*\n\s*'([a-f0-9-]{36})'"
for match in re.finditer(image_pattern, sql_content, re.DOTALL):
    album_id = match.group(2)
    if album_id in albums:
        albums[album_id]['images'] += 1

# Phân tích
total_albums = len(albums)
total_images = sum(a['images'] for a in albums.values())
albums_with_1_2_images = [a for a in albums.values() if 1 <= a['images'] <= 2]
albums_with_many_images = [a for a in albums.values() if a['images'] >= 10]

print("="*60)
print("PHÂN TÍCH SQL FILE")
print("="*60)
print(f"Tổng số albums: {total_albums}")
print(f"Tổng số ảnh: {total_images}")
print(f"Trung bình ảnh/album: {total_images/total_albums:.2f}")
print(f"\nAlbums có 1-2 ảnh: {len(albums_with_1_2_images)} ({len(albums_with_1_2_images)/total_albums*100:.1f}%)")
print(f"Albums có >= 10 ảnh: {len(albums_with_many_images)} ({len(albums_with_many_images)/total_albums*100:.1f}%)")

# Phân bố số lượng ảnh
distribution = {}
for album in albums.values():
    count = album['images']
    if count not in distribution:
        distribution[count] = 0
    distribution[count] += 1

print(f"\nPhân bố số lượng ảnh:")
print("Số ảnh | Số albums")
print("-" * 30)
for count in sorted(distribution.keys())[:20]:
    print(f"{count:6d} | {distribution[count]:6d}")

print(f"\nVí dụ albums có 1-2 ảnh (10 đầu tiên):")
for album in albums_with_1_2_images[:10]:
    print(f"  - {album['title']}: {album['images']} ảnh")

print(f"\nVí dụ albums có nhiều ảnh (10 đầu tiên):")
for album in sorted(albums_with_many_images, key=lambda x: x['images'], reverse=True)[:10]:
    print(f"  - {album['title']}: {album['images']} ảnh")

