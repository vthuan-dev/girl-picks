#!/usr/bin/env python3
"""
Script để fix hoàn toàn file SQL cho MySQL trên Ubuntu
- Bỏ START TRANSACTION (có thể gây lỗi)
- Fix datetime 2025 -> 2024
- Đảm bảo SET commands đúng
"""
import re
import sys

def fix_sql_file(input_file, output_file):
    """
    Fix SQL file cho MySQL Ubuntu
    """
    print(f"Đang đọc file: {input_file}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_length = len(content)
    print(f"Kích thước file gốc: {len(content)} bytes")
    
    # 1. Bỏ START TRANSACTION (có thể gây lỗi)
    content = re.sub(r'START TRANSACTION;', '', content)
    print("✓ Đã bỏ START TRANSACTION")
    
    # 2. Fix datetime 2025 -> 2024
    count_2025 = len(re.findall(r"'2025-", content))
    content = re.sub(r"'2025-", "'2024-", content)
    print(f"✓ Đã fix {count_2025} datetime từ 2025 về 2024")
    
    # 3. Đảm bảo SET commands ở đầu
    if not content.strip().startswith('SET'):
        # Thêm SET commands nếu chưa có
        set_commands = """-- SQL INSERT statements generated from crawled albums
-- Fixed for MySQL Ubuntu compatibility

-- Disable foreign key checks temporarily for faster import
SET SESSION sql_mode = '';
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
SET UNIQUE_CHECKS = 0;

"""
        # Bỏ các SET commands cũ nếu có
        content = re.sub(r'^--.*\n', '', content, flags=re.MULTILINE)
        content = re.sub(r'^SET FOREIGN_KEY_CHECKS = 0;.*\n', '', content, flags=re.MULTILINE)
        content = re.sub(r'^SET AUTOCOMMIT = 0;.*\n', '', content, flags=re.MULTILINE)
        content = set_commands + content
        print("✓ Đã thêm SET commands ở đầu")
    
    # 4. Đảm bảo COMMIT ở cuối
    if 'COMMIT;' not in content[-1000:]:  # Kiểm tra 1000 ký tự cuối
        content = content.rstrip() + "\n\n-- Commit transaction\nCOMMIT;\n"
        print("✓ Đã thêm COMMIT ở cuối")
    
    # 5. Thêm restore commands ở cuối
    if 'SET FOREIGN_KEY_CHECKS = 1;' not in content[-500:]:
        content = content.rstrip() + "\n\n-- Re-enable foreign key checks\nSET FOREIGN_KEY_CHECKS = 1;\nSET AUTOCOMMIT = 1;\nSET UNIQUE_CHECKS = 1;\n"
        print("✓ Đã thêm restore commands ở cuối")
    
    # Ghi file mới
    print(f"\nĐang ghi file: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Hoàn tất!")
    print(f"  File gốc: {original_length} bytes")
    print(f"  File mới: {len(content)} bytes")
    print(f"  File đã được fix: {output_file}")

if __name__ == "__main__":
    input_file = "data/albums_insert.sql"
    output_file = "data/albums_insert_ubuntu.sql"
    
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    
    try:
        fix_sql_file(input_file, output_file)
    except Exception as e:
        print(f"✗ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

