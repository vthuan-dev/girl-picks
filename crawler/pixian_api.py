"""
Script Python để gọi API Pixian.AI để xóa nền ảnh
API Documentation: https://vi.pixian.ai/api
LƯU Ý: Đây là API xóa NỀN, không phải xóa watermark/logo
"""

import os
import base64
import requests
from typing import Optional, Union
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock


class PixianAPI:
    """Class để tương tác với API Pixian.AI (xóa nền ảnh)"""
    
    def __init__(self, api_key: str, api_secret: str):
        """
        Khởi tạo client API
        
        Args:
            api_key: API Key từ Pixian.AI (user ID)
            api_secret: API Secret từ Pixian.AI
        """
        self.api_key = api_key
        self.api_secret = api_secret
        self.api_url = 'https://api.pixian.ai/api/v2/remove-background'
        self.account_url = 'https://api.pixian.ai/api/v2/account'
        # Basic auth: base64(username:password)
        auth_string = f"{api_key}:{api_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        self.headers = {
            'Authorization': f'Basic {auth_b64}'
        }
    
    def get_account_info(self) -> Optional[dict]:
        """
        Lấy thông tin tài khoản (số credit còn lại)
        
        Returns:
            dict: Thông tin tài khoản hoặc None nếu lỗi
        """
        try:
            response = requests.get(self.account_url, headers=self.headers, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Lỗi khi lấy thông tin tài khoản: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ Lỗi: {e}")
            return None
    
    def remove_background(
        self,
        image_path: Union[str, Path],
        output_path: Optional[Union[str, Path]] = None,
        confirm: bool = True
    ) -> Optional[bytes]:
        """
        Xóa nền ảnh
        
        LƯU Ý: 
        - Đây là API xóa NỀN, không phải xóa watermark/logo
        - Giá tính theo megapixel của ảnh (~$0.0023/ảnh 2MP)
        - Mỗi lần gọi sẽ trừ credit tương ứng
        
        Args:
            image_path: Đường dẫn đến file ảnh cần xử lý
            output_path: Đường dẫn để lưu ảnh kết quả (nếu None thì tự động tạo tên)
            confirm: Xác nhận trước khi gọi API (mặc định: True)
        
        Returns:
            bytes: Dữ liệu ảnh đã xử lý (nếu thành công), None nếu thất bại
        """
        image_path = Path(image_path)
        
        # Cảnh báo về credit
        if confirm:
            print(f"⚠️  CẢNH BÁO: Mỗi lần gọi API sẽ trừ credit (tính theo megapixel)!")
            print(f"📸 Ảnh sẽ xử lý: {image_path.name}")
            user_input = input("Bạn có muốn tiếp tục? (y/n): ").strip().lower()
            if user_input not in ['y', 'yes', '']:
                print("❌ Đã hủy!")
                return None
        
        # Kiểm tra file tồn tại
        if not image_path.exists():
            raise FileNotFoundError(f"Không tìm thấy file: {image_path}")
        
        # Đọc file ảnh
        try:
            with open(image_path, 'rb') as image_file:
                image_data = image_file.read()
        except Exception as e:
            raise IOError(f"Không thể đọc file: {e}")
        
        # Gửi request đến API
        try:
            print(f"🔄 Đang xử lý ảnh: {image_path.name}...")
            files = {
                'image': (image_path.name, image_data, 'image/jpeg')
            }
            
            response = requests.post(
                self.api_url,
                headers=self.headers,
                files=files,
                timeout=60
            )
            
            # Kiểm tra response
            if response.status_code == 200:
                # Lấy số credit đã trừ từ header
                credits_charged = response.headers.get('X-Credits-Charged', 'N/A')
                print(f"💳 Credits đã trừ: {credits_charged}")
                
                # Lưu file kết quả
                if output_path:
                    output_path = Path(output_path)
                    output_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(output_path, 'wb') as output_file:
                        output_file.write(response.content)
                    print(f"✅ Đã lưu ảnh kết quả: {output_path}")
                else:
                    # Tự động tạo tên file output
                    output_path = image_path.parent / f"{image_path.stem}_no_bg.png"
                    with open(output_path, 'wb') as output_file:
                        output_file.write(response.content)
                    print(f"✅ Đã lưu ảnh kết quả: {output_path}")
                
                return response.content
            else:
                print(f"❌ Lỗi API: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Chi tiết: {error_data}")
                except:
                    print(f"   Response: {response.text}")
                return None
                
        except requests.exceptions.Timeout:
            print(f"❌ Timeout khi gọi API")
            return None
        except requests.exceptions.RequestException as e:
            print(f"❌ Lỗi kết nối: {e}")
            return None
        except Exception as e:
            print(f"❌ Lỗi không xác định: {e}")
            return None
    
    def remove_background_parallel(
        self,
        image_paths: list,
        output_dir: Optional[Union[str, Path]] = None,
        max_workers: int = 5,
        confirm: bool = True
    ) -> dict:
        """
        Xóa nền từ nhiều ảnh SONG SONG (parallel)
        
        ⚠️ QUAN TRỌNG: 
        - Mỗi ảnh trừ credit tương ứng (tính theo megapixel)
        - 100 ảnh = 100 requests = ~100 credits (tùy kích thước ảnh)
        - Chỉ tối ưu TỐC ĐỘ, không tối ưu CREDIT
        
        Args:
            image_paths: Danh sách đường dẫn đến các file ảnh
            output_dir: Thư mục để lưu ảnh kết quả
            max_workers: Số lượng request song song tối đa (mặc định: 5)
            confirm: Xác nhận trước khi xử lý (mặc định: True)
        
        Returns:
            dict: Kết quả với key là đường dẫn ảnh gốc, value là True/False
        """
        num_images = len(image_paths)
        
        # Cảnh báo về credit
        if confirm:
            print(f"⚠️  CẢNH BÁO: Sẽ xử lý {num_images} ảnh SONG SONG")
            print(f"💳 MỖI ẢNH TRỪ CREDIT (tính theo megapixel)")
            print(f"⚡ Số request song song: {max_workers}")
            print(f"📸 Tổng số ảnh: {num_images}")
            user_input = input(f"\nBạn có muốn tiếp tục? (y/n): ").strip().lower()
            if user_input not in ['y', 'yes', '']:
                print("❌ Đã hủy!")
                return {}
        
        results = {}
        credits_used = 0
        credits_lock = Lock()
        
        def process_single_image(image_path):
            """Xử lý 1 ảnh (dùng trong thread pool)"""
            nonlocal credits_used
            try:
                if output_dir:
                    output_path = Path(output_dir) / f"{Path(image_path).stem}_no_bg.png"
                else:
                    output_path = None
                
                result = self._remove_background_internal(image_path, output_path)
                success = result is not None
                
                if success:
                    with credits_lock:
                        credits_used += 1
                    print(f"✅ [{credits_used}/{num_images}] Đã xử lý: {Path(image_path).name}")
                else:
                    print(f"❌ Lỗi khi xử lý: {Path(image_path).name}")
                
                return str(image_path), success
            except Exception as e:
                print(f"❌ Lỗi khi xử lý {image_path}: {e}")
                return str(image_path), False
        
        # Xử lý song song
        print(f"\n🚀 Bắt đầu xử lý {num_images} ảnh song song...")
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {executor.submit(process_single_image, img_path): img_path 
                      for img_path in image_paths}
            
            for future in as_completed(futures):
                image_path, success = future.result()
                results[image_path] = success
        
        print(f"\n💳 Đã xử lý: {credits_used}/{num_images} ảnh thành công")
        return results
    
    def _remove_background_internal(
        self,
        image_path: Union[str, Path],
        output_path: Optional[Union[str, Path]] = None
    ) -> Optional[bytes]:
        """Internal method để xử lý ảnh (không có confirm)"""
        image_path = Path(image_path)
        
        if not image_path.exists():
            return None
        
        try:
            with open(image_path, 'rb') as image_file:
                image_data = image_file.read()
        except:
            return None
        
        try:
            files = {'image': (image_path.name, image_data, 'image/jpeg')}
            response = requests.post(
                self.api_url,
                headers=self.headers,
                files=files,
                timeout=60
            )
            
            if response.status_code == 200:
                if output_path:
                    output_path = Path(output_path)
                    output_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(output_path, 'wb') as output_file:
                        output_file.write(response.content)
                else:
                    output_path = image_path.parent / f"{image_path.stem}_no_bg.png"
                    with open(output_path, 'wb') as output_file:
                        output_file.write(response.content)
                return response.content
            return None
        except:
            return None


def main():
    """Hàm main để chạy script từ command line"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Xóa nền ảnh sử dụng API Pixian.AI'
    )
    parser.add_argument('--api-key', type=str, required=True, help='API Key (user ID)')
    parser.add_argument('--api-secret', type=str, required=True, help='API Secret')
    parser.add_argument('--image', type=str, help='Đường dẫn đến file ảnh')
    parser.add_argument('--images', type=str, nargs='+', help='Danh sách ảnh')
    parser.add_argument('--output', type=str, help='Đường dẫn lưu kết quả')
    parser.add_argument('--output-dir', type=str, help='Thư mục lưu kết quả')
    parser.add_argument('--account', action='store_true', help='Xem thông tin tài khoản')
    
    args = parser.parse_args()
    
    api = PixianAPI(args.api_key, args.api_secret)
    
    if args.account:
        info = api.get_account_info()
        if info:
            print(f"📊 Thông tin tài khoản:")
            print(f"   Credits còn lại: {info.get('credits', 'N/A')}")
            print(f"   Trạng thái: {info.get('state', 'N/A')}")
            print(f"   Gói credit: {info.get('creditPack', 'N/A')}")
    elif args.image:
        api.remove_background(args.image, args.output)
    elif args.images:
        results = api.remove_background_parallel(args.images, args.output_dir)
        print("\n📊 Kết quả:")
        for image_path, success in results.items():
            status = "✅" if success else "❌"
            print(f"  {status} {image_path}")
    else:
        parser.print_help()


if __name__ == '__main__':
    main()

















