# -*- coding: utf-8 -*-
"""
Ví dụ sử dụng API Pixian.AI để xóa nền ảnh
LƯU Ý: Đây là API xóa NỀN, không phải xóa watermark/logo
"""

import sys
import io

# Set UTF-8 encoding for stdout
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from pixian_api import PixianAPI

# API Key và Secret từ Pixian.AI
# Lấy tại: https://vi.pixian.ai/api
API_KEY = 'YOUR_API_KEY_HERE'  # User ID
API_SECRET = 'YOUR_API_SECRET_HERE'  # Secret

# Khởi tạo API client
api = PixianAPI(API_KEY, API_SECRET)

# Xem thông tin tài khoản (số credit còn lại)
print("=" * 60)
print("THONG TIN TAI KHOAN:")
print("=" * 60)
account_info = api.get_account_info()
if account_info:
    print(f"Credits con lai: {account_info.get('credits', 'N/A')}")
    print(f"Trang thai: {account_info.get('state', 'N/A')}")
    print(f"Goi credit: {account_info.get('creditPack', 'N/A')}")
print()

# Xóa nền ảnh
image_path = '1367569.jpg'
output_path = '1367569_no_bg.png'

print("=" * 60)
print("XOA NEN ANH:")
print("=" * 60)
print(f"Luu y: Day la API xoa NEN, khong phai xoa watermark!")
print(f"Gia tinh theo megapixel cua anh (~$0.0023/anh 2MP)")
print()

result = api.remove_background(image_path, output_path, confirm=True)
if result:
    print("Xu ly thanh cong!")
else:
    print("Xu ly that bai!")







