#!/usr/bin/env python3
"""
Script để debug dòng lỗi trong SQL file
"""
import sys

def debug_sql_line(filename, line_num, context=10):
    """Xem dòng lỗi và context xung quanh"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        start = max(0, line_num - context - 1)
        end = min(len(lines), line_num + context)
        
        print(f"=== Dòng {line_num} và context ({start+1} - {end}) ===")
        print()
        
        for i in range(start, end):
            marker = ">>> " if i == line_num - 1 else "    "
            print(f"{marker}{i+1:6d}: {lines[i]}", end='')
        
        print()
        print(f"=== Chi tiết dòng {line_num} ===")
        if line_num <= len(lines):
            line = lines[line_num - 1]
            print(f"Content: {repr(line)}")
            print(f"Length: {len(line)}")
            print(f"Has special chars: {any(ord(c) > 127 for c in line)}")
            
            # Kiểm tra datetime pattern
            import re
            datetime_pattern = r"'2024-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'"
            matches = re.findall(datetime_pattern, line)
            if matches:
                print(f"Datetime found: {matches}")
        
    except Exception as e:
        print(f"Lỗi: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 debug_sql_line.py <file> [line_number]")
        sys.exit(1)
    
    filename = sys.argv[1]
    line_num = int(sys.argv[2]) if len(sys.argv) > 2 else 25278
    
    debug_sql_line(filename, line_num)

