"""
Script để chuyển các file JSON album thành SQL INSERT statements
"""

import json
import os
import glob
import uuid
from datetime import datetime
from urllib.parse import urlparse

def escape_sql_string(s):
    """Escape string cho SQL"""
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''").replace("\\", "\\\\") + "'"

def generate_uuid():
    """Generate UUID cho MySQL"""
    return str(uuid.uuid4())

def parse_category_from_url(url):
    """Parse category từ URL nếu có thể"""
    # URL format: https://gaigu1.net/album-anh-sex/ID/title
    # Có thể extract category từ path
    try:
        parsed = urlparse(url)
        path_parts = parsed.path.strip('/').split('/')
        if len(path_parts) > 0 and 'album' in path_parts[0]:
            return "album-anh-sex"
    except:
        pass
    return None

def generate_sql_from_json_folder(folder_path, output_file, created_by_id="00000000-0000-0000-0000-000000000000"):
    """
    Generate SQL INSERT statements từ các file JSON trong folder
    
    Args:
        folder_path: Đường dẫn đến folder chứa các file JSON
        output_file: File output để ghi SQL
        created_by_id: ID của user tạo album (mặc định là UUID rỗng, cần thay đổi)
    """
    files = glob.glob(os.path.join(folder_path, "*.json"))
    files.sort()  # Sắp xếp để dễ theo dõi
    
    sql_statements = []
    sql_statements.append("-- SQL INSERT statements generated from crawled albums")
    sql_statements.append(f"-- Generated at: {datetime.now().isoformat()}")
    sql_statements.append(f"-- Total albums: {len(files)}")
    sql_statements.append("")
    sql_statements.append("-- Disable foreign key checks temporarily for faster import")
    sql_statements.append("SET FOREIGN_KEY_CHECKS = 0;")
    sql_statements.append("SET AUTOCOMMIT = 0;")
    sql_statements.append("")
    sql_statements.append("-- Start transaction")
    sql_statements.append("START TRANSACTION;")
    sql_statements.append("")
    
    album_inserts = []
    image_inserts = []
    
    for idx, file_path in enumerate(files, 1):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Skip nếu có lỗi hoặc không có ảnh
            if data.get('error') or not data.get('images') or len(data.get('images', [])) == 0:
                print(f"Skipping {os.path.basename(file_path)}: No images or error")
                continue
            
            album_id = generate_uuid()
            title = data.get('title', '').strip() or 'Untitled Album'
            description = data.get('description', '').strip() or None
            url = data.get('url', '')
            images = data.get('images', [])
            crawled_at = data.get('crawled_at', datetime.now().isoformat())
            
            # Lấy ảnh đầu tiên làm cover
            cover_url = images[0] if images else None
            
            # Parse category từ URL
            category = parse_category_from_url(url)
            
            # Format datetime cho MySQL (YYYY-MM-DD HH:MM:SS)
            try:
                dt = datetime.fromisoformat(crawled_at.replace('Z', '+00:00'))
                mysql_datetime = dt.strftime('%Y-%m-%d %H:%M:%S')
            except:
                mysql_datetime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Xử lý tags nếu có (format JSON)
            tags_value = "NULL"
            if data.get('tags'):
                tags_json = json.dumps(data.get('tags'), ensure_ascii=False)
                tags_value = escape_sql_string(tags_json)
            
            # Tạo INSERT cho Album (thêm backticks cho các tên cột camelCase)
            album_sql = f"""INSERT INTO `albums` (
    `id`, `title`, `description`, `coverUrl`, `category`, `albumCategoryId`, `tags`, `isPublic`, `viewCount`, `createdById`, `createdAt`, `updatedAt`
) VALUES (
    {escape_sql_string(album_id)},
    {escape_sql_string(title)},
    {escape_sql_string(description)},
    {escape_sql_string(cover_url)},
    {escape_sql_string(category)},
    NULL,
    {tags_value},
    1,
    0,
    {escape_sql_string(created_by_id)},
    '{mysql_datetime}',
    '{mysql_datetime}'
);"""
            
            album_inserts.append(album_sql)
            
            # Tạo INSERT cho từng ảnh
            for img_idx, img_url in enumerate(images):
                image_id = generate_uuid()
                # Thumbnail URL có thể giống với URL chính hoặc có thể parse từ URL
                thumb_url = img_url  # Có thể cần xử lý để tạo thumb URL
                
                image_sql = f"""INSERT INTO `album_images` (
    `id`, `albumId`, `url`, `thumbUrl`, `caption`, `order`, `createdAt`
) VALUES (
    {escape_sql_string(image_id)},
    {escape_sql_string(album_id)},
    {escape_sql_string(img_url)},
    {escape_sql_string(thumb_url)},
    NULL,
    {img_idx},
    '{mysql_datetime}'
);"""
                
                image_inserts.append(image_sql)
            
            if idx % 100 == 0:
                print(f"Processed {idx}/{len(files)} albums...")
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            continue
    
    # Gộp tất cả SQL statements
    sql_statements.extend(album_inserts)
    sql_statements.append("")
    sql_statements.append("-- Album Images")
    sql_statements.append("")
    sql_statements.extend(image_inserts)
    sql_statements.append("")
    sql_statements.append("-- Commit transaction")
    sql_statements.append("COMMIT;")
    sql_statements.append("")
    sql_statements.append("-- Re-enable foreign key checks")
    sql_statements.append("SET FOREIGN_KEY_CHECKS = 1;")
    sql_statements.append("SET AUTOCOMMIT = 1;")
    
    # Ghi vào file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_statements))
    
    print(f"\n{'='*60}")
    print(f"SQL generation completed!")
    print(f"{'='*60}")
    print(f"Total albums: {len(album_inserts)}")
    print(f"Total images: {len(image_inserts)}")
    print(f"Output file: {output_file}")
    print(f"{'='*60}")

if __name__ == "__main__":
    import sys
    
    # Đường dẫn folder chứa JSON files
    folder_path = "data/albums_batch_20251212_003851"
    
    # File output SQL
    output_file = "data/albums_insert.sql"
    
    # User ID tạo album (Admin user ID)
    created_by_id = "f267acc4-47e0-4de5-9ac3-fd72cfee1422"
    
    if len(sys.argv) > 1:
        folder_path = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    if len(sys.argv) > 3:
        created_by_id = sys.argv[3]
    
    print(f"Reading albums from: {folder_path}")
    print(f"Output SQL file: {output_file}")
    print(f"Created by user ID: {created_by_id}")
    print()
    
    generate_sql_from_json_folder(folder_path, output_file, created_by_id)

