"""
Script để chuyển file JSON chat sex thành SQL INSERT statements
"""

import json
import os
import uuid
import re
from datetime import datetime
from urllib.parse import quote

def escape_sql_string(s):
    """Escape string cho SQL"""
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''").replace("\\", "\\\\") + "'"

def generate_uuid():
    """Generate UUID cho MySQL"""
    return str(uuid.uuid4())

def generate_slug(name):
    """Generate slug từ name"""
    if not name:
        return None
    
    # Chuyển sang lowercase
    slug = name.lower()
    
    # Loại bỏ ký tự đặc biệt, thay bằng dấu gạch ngang
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    
    # Thay khoảng trắng bằng dấu gạch ngang
    slug = re.sub(r'\s+', '-', slug)
    
    # Loại bỏ nhiều dấu gạch ngang liên tiếp
    slug = re.sub(r'-+', '-', slug)
    
    # Loại bỏ dấu gạch ngang ở đầu và cuối
    slug = slug.strip('-')
    
    return slug if slug else None

def clean_tags(tags):
    """Làm sạch tags, loại bỏ các tag không hợp lệ"""
    if not tags or not isinstance(tags, list):
        return []
    
    invalid_tags = ['Color', 'Transparency', 'Font Size', 'Text Edge Style', 'Font Family']
    cleaned = [tag for tag in tags if tag and tag not in invalid_tags]
    return cleaned

def generate_sql_from_json(json_file, output_file, managed_by_id=None):
    """
    Generate SQL INSERT statements từ file JSON chat sex
    
    Args:
        json_file: Đường dẫn đến file JSON
        output_file: File output để ghi SQL
        managed_by_id: ID của admin/staff tạo (optional)
    """
    print(f"📂 Đang đọc file: {json_file}")
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        print("❌ File JSON phải là array")
        return
    
    print(f"📊 Tổng cộng: {len(data)} chat sex girls")
    
    sql_statements = []
    sql_statements.append("-- SQL INSERT statements generated from crawled chat sex girls")
    sql_statements.append(f"-- Generated at: {datetime.now().isoformat()}")
    sql_statements.append(f"-- Total girls: {len(data)}")
    sql_statements.append("")
    sql_statements.append("-- Disable foreign key checks temporarily for faster import")
    sql_statements.append("SET FOREIGN_KEY_CHECKS = 0;")
    sql_statements.append("SET AUTOCOMMIT = 0;")
    sql_statements.append("SET UNIQUE_CHECKS = 0;")
    sql_statements.append("")
    sql_statements.append("-- Start transaction")
    sql_statements.append("START TRANSACTION;")
    sql_statements.append("")
    
    valid_count = 0
    skipped_count = 0
    used_slugs = {}  # Track slugs để tránh duplicate
    
    for idx, item in enumerate(data, 1):
        try:
            # Skip nếu có lỗi hoặc không có name
            if item.get('error') or not item.get('name'):
                skipped_count += 1
                print(f"  ⚠️  Skipping item {idx}: No name or error")
                continue
            
            girl_id = generate_uuid()
            name = item.get('name', '').strip()
            title = item.get('title', '').strip() or None
            
            # Generate unique slug
            base_slug = generate_slug(name)
            if not base_slug:
                base_slug = f"girl-{girl_id[:8]}"  # Fallback nếu không có name
            
            # Đảm bảo slug unique
            slug = base_slug
            counter = 1
            while slug in used_slugs:
                slug = f"{base_slug}-{counter}"
                counter += 1
            used_slugs[slug] = True
            age = item.get('age')
            birth_year = item.get('birthYear')
            height = item.get('height', '').strip() or None
            weight = item.get('weight', '').strip() or None
            bio = item.get('description', '').strip() or item.get('bio', '').strip() or None
            phone = item.get('phone', '').strip() or None
            zalo = item.get('zalo', '').strip() or None
            telegram = item.get('telegram', '').strip() or None
            location = item.get('location', '').strip() or None
            province = None  # Có thể parse từ location nếu cần
            address = location  # Dùng location làm address
            price = item.get('price', '').strip() or None
            price_15min = item.get('price15min', '').strip() or None
            payment_info = item.get('paymentInfo', '').strip() or None
            working_hours = item.get('workingHours', '').strip() or None
            instruction = item.get('instruction', '').strip() or None
            
            # Images
            images = item.get('images', [])
            if not isinstance(images, list):
                images = []
            cover_image = images[0] if images else None
            
            # Services
            services = item.get('services', [])
            if not isinstance(services, list):
                services = []
            
            # Tags
            tags = clean_tags(item.get('tags', []))
            
            # Status flags
            is_verified = item.get('verified', False) or False
            is_featured = False  # Mặc định false
            is_active = True  # Mặc định true
            is_available = True  # Mặc định true
            
            # Statistics
            view_count = item.get('viewCount', 0) or 0
            rating = item.get('rating')
            
            # Metadata
            source_url = item.get('url', '').strip() or None
            crawled_at = item.get('crawled_at')
            
            # Format datetime cho MySQL
            try:
                if crawled_at:
                    dt = datetime.fromisoformat(crawled_at.replace('Z', '+00:00'))
                    mysql_datetime = dt.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    mysql_datetime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            except:
                mysql_datetime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Format JSON cho MySQL
            images_json = json.dumps(images, ensure_ascii=False) if images else "[]"
            services_json = json.dumps(services, ensure_ascii=False) if services else "[]"
            tags_json = json.dumps(tags, ensure_ascii=False) if tags else "[]"
            
            # Parse videos nếu có
            videos = item.get('videos', [])
            if not isinstance(videos, list):
                videos = []
            videos_json = json.dumps(videos, ensure_ascii=False) if videos else "[]"
            
            # Tạo INSERT statement với ON DUPLICATE KEY UPDATE để update nếu đã tồn tại
            sql = f"""INSERT INTO `chat_sex_girls` (
    `id`, `managedById`, `name`, `slug`, `title`, `age`, `birthYear`, `height`, `weight`, `bio`, `phone`, `zalo`, `telegram`,
    `location`, `province`, `address`, `price`, `price15min`, `paymentInfo`, `services`, `workingHours`, `instruction`,
    `images`, `videos`, `coverImage`, `tags`,
    `isVerified`, `isFeatured`, `isActive`, `isAvailable`,
    `viewCount`, `rating`, `sourceUrl`, `crawledAt`, `createdAt`, `updatedAt`
) VALUES (
    {escape_sql_string(girl_id)},
    {escape_sql_string(managed_by_id) if managed_by_id else "NULL"},
    {escape_sql_string(name)},
    {escape_sql_string(slug) if slug else "NULL"},
    {escape_sql_string(title) if title else "NULL"},
    {age if age is not None else "NULL"},
    {birth_year if birth_year is not None else "NULL"},
    {escape_sql_string(height) if height else "NULL"},
    {escape_sql_string(weight) if weight else "NULL"},
    {escape_sql_string(bio) if bio else "NULL"},
    {escape_sql_string(phone) if phone else "NULL"},
    {escape_sql_string(zalo) if zalo else "NULL"},
    {escape_sql_string(telegram) if telegram else "NULL"},
    {escape_sql_string(location) if location else "NULL"},
    {escape_sql_string(province) if province else "NULL"},
    {escape_sql_string(address) if address else "NULL"},
    {escape_sql_string(price) if price else "NULL"},
    {escape_sql_string(price_15min) if price_15min else "NULL"},
    {escape_sql_string(payment_info) if payment_info else "NULL"},
    {escape_sql_string(services_json)},
    {escape_sql_string(working_hours) if working_hours else "NULL"},
    {escape_sql_string(instruction) if instruction else "NULL"},
    {escape_sql_string(images_json)},
    {escape_sql_string(videos_json)},
    {escape_sql_string(cover_image) if cover_image else "NULL"},
    {escape_sql_string(tags_json)},
    {1 if is_verified else 0},
    {1 if is_featured else 0},
    {1 if is_active else 0},
    {1 if is_available else 0},
    {view_count},
    {rating if rating is not None else "NULL"},
    {escape_sql_string(source_url) if source_url else "NULL"},
    {escape_sql_string(mysql_datetime) if crawled_at else "NULL"},
    {escape_sql_string(mysql_datetime)},
    {escape_sql_string(mysql_datetime)}
) ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `slug` = VALUES(`slug`),
    `title` = VALUES(`title`),
    `age` = VALUES(`age`),
    `birthYear` = VALUES(`birthYear`),
    `height` = VALUES(`height`),
    `weight` = VALUES(`weight`),
    `bio` = VALUES(`bio`),
    `phone` = VALUES(`phone`),
    `zalo` = VALUES(`zalo`),
    `telegram` = VALUES(`telegram`),
    `location` = VALUES(`location`),
    `province` = VALUES(`province`),
    `address` = VALUES(`address`),
    `price` = VALUES(`price`),
    `price15min` = VALUES(`price15min`),
    `paymentInfo` = VALUES(`paymentInfo`),
    `services` = VALUES(`services`),
    `workingHours` = VALUES(`workingHours`),
    `instruction` = VALUES(`instruction`),
    `images` = VALUES(`images`),
    `videos` = VALUES(`videos`),
    `coverImage` = VALUES(`coverImage`),
    `tags` = VALUES(`tags`),
    `isVerified` = VALUES(`isVerified`),
    `isFeatured` = VALUES(`isFeatured`),
    `isActive` = VALUES(`isActive`),
    `isAvailable` = VALUES(`isAvailable`),
    `rating` = VALUES(`rating`),
    `sourceUrl` = VALUES(`sourceUrl`),
    `crawledAt` = VALUES(`crawledAt`),
    `updatedAt` = VALUES(`updatedAt`);"""
            
            sql_statements.append(sql)
            sql_statements.append("")
            valid_count += 1
            
            if idx % 100 == 0:
                print(f"  ✓ Đã xử lý: {idx}/{len(data)}")
        
        except Exception as e:
            print(f"  ❌ Lỗi khi xử lý item {idx}: {e}")
            skipped_count += 1
            continue
    
    # Commit transaction
    sql_statements.append("-- Commit transaction")
    sql_statements.append("COMMIT;")
    sql_statements.append("")
    sql_statements.append("-- Re-enable checks")
    sql_statements.append("SET FOREIGN_KEY_CHECKS = 1;")
    sql_statements.append("SET AUTOCOMMIT = 1;")
    sql_statements.append("SET UNIQUE_CHECKS = 1;")
    sql_statements.append("")
    sql_statements.append(f"-- Total inserted: {valid_count}")
    sql_statements.append(f"-- Total skipped: {skipped_count}")
    
    # Ghi file
    print(f"\n💾 Đang ghi file SQL: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_statements))
    
    print(f"\n✅ Hoàn thành!")
    print(f"   ✓ Đã tạo: {valid_count} INSERT statements")
    print(f"   ⚠️  Đã bỏ qua: {skipped_count} items")
    print(f"   📄 File output: {output_file}")

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate SQL INSERT statements from chat sex JSON')
    parser.add_argument('--input', '-i', required=True, help='Input JSON file path')
    parser.add_argument('--output', '-o', default='data/chat_sex_insert.sql', help='Output SQL file path')
    parser.add_argument('--managed-by-id', help='ID of admin/staff who manages these girls (optional)')
    
    args = parser.parse_args()
    
    # Tạo thư mục output nếu chưa có
    output_dir = os.path.dirname(args.output)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
    
    generate_sql_from_json(args.input, args.output, args.managed_by_id)

if __name__ == '__main__':
    main()

