#!/usr/bin/env python3
"""
Script để fix datetime trong file SQL - chuyển date tương lai về date hiện tại
"""
import re
import sys
from datetime import datetime

def fix_datetime_in_sql(input_file, output_file):
    """
    Fix datetime trong SQL file:
    - Chuyển date 2025 về 2024 (hoặc date hiện tại)
    - Giữ nguyên format YYYY-MM-DD HH:MM:SS
    """
    print(f"Đang đọc file: {input_file}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Đếm số lần thay thế
    count = 0
    
    # Pattern để tìm datetime: '2025-12-12 00:58:05'
    # Chuyển 2025 về 2024
    pattern = r"'2025-(\d{2}-\d{2} \d{2}:\d{2}:\d{2})'"
    
    def replace_date(match):
        nonlocal count
        count += 1
        # Giữ nguyên phần sau 2025-, chỉ đổi năm
        return f"'2024-{match.group(1)}'"
    
    # Thay thế tất cả
    new_content = re.sub(pattern, replace_date, content)
    
    print(f"Đã thay thế {count} datetime từ 2025 về 2024")
    
    # Ghi file mới
    print(f"Đang ghi file: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✓ Hoàn tất! File đã được fix: {output_file}")
    return count

if __name__ == "__main__":
    input_file = "data/albums_insert.sql"
    output_file = "data/albums_insert_fixed.sql"
    
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    
    try:
        count = fix_datetime_in_sql(input_file, output_file)
        print(f"\nTổng cộng: {count} datetime đã được fix")
    except Exception as e:
        print(f"✗ Lỗi: {e}")
        sys.exit(1)

