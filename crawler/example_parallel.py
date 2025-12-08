# -*- coding: utf-8 -*-
"""
Ví dụ xử lý nhiều ảnh SONG SONG (parallel)
LƯU Ý: Mỗi ảnh vẫn trừ 1 credit! Không thể "lách" được!
"""

import sys
import io
from pathlib import Path

# Set UTF-8 encoding for stdout
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from dewatermark_api import DewatermarkAPI

# API Key
API_KEY = '093361e40ec59bfe7ce8bf1cfff52c0e199281af8fefa6a52b142ff5b59dee44'.strip()

# Khởi tạo API client
api = DewatermarkAPI(API_KEY)

# Danh sách ảnh cần xử lý (ví dụ: 100 ảnh)
# Thay thế bằng danh sách ảnh thực tế của bạn
image_paths = [
    '1367569.jpg',
    # 'image2.jpg',
    # 'image3.jpg',
    # ... thêm 100 ảnh ở đây
]

print("=" * 60)
print("QUAN TRONG: KHONG THE 'LACH'!")
print("=" * 60)
print("- Moi anh = 1 request = 1 credit")
print("- 100 anh = 100 requests = 100 credits")
print("- Chi toi uu TOC DO (xu ly song song), KHONG toi uu CREDIT")
print("=" * 60)
print()

# Xử lý song song (5 requests cùng lúc)
# max_workers: số request song song (có thể tăng lên 10, 20...)
results = api.remove_watermark_parallel(
    image_paths=image_paths,
    output_dir='output_parallel',  # Thư mục lưu kết quả
    max_workers=5,  # Số request song song
    confirm=True
)

print("\n" + "=" * 60)
print("KET QUA:")
print("=" * 60)
for image_path, success in results.items():
    status = "✅" if success else "❌"
    print(f"{status} {Path(image_path).name}")




