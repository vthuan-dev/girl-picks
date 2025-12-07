# -*- coding: utf-8 -*-
"""
Ví dụ sử dụng script dewatermark_api.py
"""

import sys
import io

# Set UTF-8 encoding for stdout
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from dewatermark_api import DewatermarkAPI
from pathlib import Path

# Thay thế bằng API Key thực tế của bạn
API_KEY = '093361e40ec59bfe7ce8bf1cfff52c0e199281af8fefa6a52b142ff5b59dee44'.strip()

# Khởi tạo API client
api = DewatermarkAPI(API_KEY)

# Xóa watermark từ ảnh 1367569.jpg
image_path = '1367569.jpg'
output_path = '1367569_dewatermarked.jpg'

print(f"Dang xu ly anh: {image_path}")
print("Luu y: Moi lan goi API se tru 1 credit!")
print()

# Xác nhận trước khi gọi API (có thể set confirm=False để bỏ qua)
result = api.remove_watermark(image_path, output_path, confirm=True)
if result:
    print("Xu ly thanh cong!")
else:
    print("Xu ly that bai!")

