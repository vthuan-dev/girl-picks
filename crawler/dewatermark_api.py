"""
Script Python để gọi API dewatermark.ai để xóa logo/watermark khỏi ảnh
API Documentation: https://dewatermark.ai/vi/api-document
"""

import os
import base64
import requests
from typing import Optional, Union
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock


class DewatermarkAPI:
    """Class để tương tác với API dewatermark.ai"""
    
    def __init__(self, api_key: str):
        """
        Khởi tạo client API
        
        Args:
            api_key: API Key từ dewatermark.ai
        """
        self.api_key = api_key
        self.api_url = 'https://platform.dewatermark.ai/api/object_removal/v1/erase_watermark'
        self.headers = {
            'X-API-KEY': api_key
        }
        self.credits_lock = Lock()  # Lock để đếm credit thread-safe
    
    def remove_watermark(
        self, 
        image_path: Union[str, Path], 
        output_path: Optional[Union[str, Path]] = None,
        confirm: bool = True
    ) -> Optional[bytes]:
        """
        Xóa watermark/logo khỏi ảnh
        
        LƯU Ý: Mỗi lần gọi API sẽ trừ 1 credit!
        
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
            print(f"⚠️  CẢNH BÁO: Mỗi lần gọi API sẽ trừ 1 credit!")
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
        
        # Tạo payload với file ảnh
        files = {
            'original_preview_image': (image_path.name, image_data, 'image/jpeg')
        }
        
        # Gửi request đến API
        try:
            print(f"🔄 Đang xử lý ảnh: {image_path.name}... (Sẽ trừ 1 credit)")
            response = requests.post(
                self.api_url, 
                headers=self.headers, 
                files=files,
                timeout=60  # Timeout 60 giây
            )
            
            # Kiểm tra response
            if response.status_code == 200:
                result = response.json()
                
                # Lấy ảnh đã xử lý từ base64
                if 'edited_image' in result and 'image' in result['edited_image']:
                    edited_image_base64 = result['edited_image']['image']
                    
                    # Giải mã base64
                    edited_image_data = base64.b64decode(edited_image_base64)
                    
                    # Lưu file nếu có output_path
                    if output_path:
                        output_path = Path(output_path)
                        output_path.parent.mkdir(parents=True, exist_ok=True)
                        with open(output_path, 'wb') as output_file:
                            output_file.write(edited_image_data)
                        print(f"✅ Đã lưu ảnh kết quả: {output_path}")
                        print(f"💳 Đã trừ 1 credit")
                    else:
                        # Tự động tạo tên file output
                        output_path = image_path.parent / f"{image_path.stem}_dewatermarked{image_path.suffix}"
                        with open(output_path, 'wb') as output_file:
                            output_file.write(edited_image_data)
                        print(f"✅ Đã lưu ảnh kết quả: {output_path}")
                        print(f"💳 Đã trừ 1 credit")
                    
                    return edited_image_data
                else:
                    print(f"❌ Response không có dữ liệu ảnh: {result}")
                    return None
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
    
    def remove_watermark_batch(
        self, 
        image_paths: list, 
        output_dir: Optional[Union[str, Path]] = None,
        confirm: bool = True
    ) -> dict:
        """
        Xóa watermark từ nhiều ảnh
        
        LƯU Ý: Mỗi ảnh sẽ trừ 1 credit! Tổng cộng sẽ trừ {số_ảnh} credits.
        
        Args:
            image_paths: Danh sách đường dẫn đến các file ảnh
            output_dir: Thư mục để lưu ảnh kết quả (nếu None thì lưu cùng thư mục với ảnh gốc)
            confirm: Xác nhận trước khi xử lý batch (mặc định: True)
        
        Returns:
            dict: Kết quả với key là đường dẫn ảnh gốc, value là True/False
        """
        num_images = len(image_paths)
        
        # Cảnh báo về credit
        if confirm:
            print(f"⚠️  CẢNH BÁO: Sẽ xử lý {num_images} ảnh, mỗi ảnh trừ 1 credit!")
            print(f"💳 Tổng cộng sẽ trừ: {num_images} credits")
            print(f"📸 Danh sách ảnh:")
            for i, img_path in enumerate(image_paths, 1):
                print(f"   {i}. {Path(img_path).name}")
            user_input = input(f"\nBạn có muốn tiếp tục? (y/n): ").strip().lower()
            if user_input not in ['y', 'yes', '']:
                print("❌ Đã hủy!")
                return {}
        
        results = {}
        credits_used = 0
        
        for image_path in image_paths:
            try:
                if output_dir:
                    output_path = Path(output_dir) / Path(image_path).name
                else:
                    output_path = None
                
                result = self.remove_watermark(image_path, output_path, confirm=False)
                success = result is not None
                results[str(image_path)] = success
                if success:
                    credits_used += 1
            except Exception as e:
                print(f"❌ Lỗi khi xử lý {image_path}: {e}")
                results[str(image_path)] = False
        
        print(f"\n💳 Tổng số credit đã sử dụng: {credits_used}/{num_images}")
        return results
    
    def remove_watermark_parallel(
        self,
        image_paths: list,
        output_dir: Optional[Union[str, Path]] = None,
        max_workers: int = 5,
        confirm: bool = True
    ) -> dict:
        """
        Xóa watermark từ nhiều ảnh SONG SONG (parallel) để tăng tốc độ
        
        ⚠️ QUAN TRỌNG: 
        - KHÔNG THỂ "LÁCH" - Mỗi ảnh vẫn trừ 1 credit!
        - 100 ảnh = 100 credits (KHÔNG PHẢI 1 credit)
        - Chỉ tối ưu TỐC ĐỘ, không tối ưu CREDIT
        
        Args:
            image_paths: Danh sách đường dẫn đến các file ảnh
            output_dir: Thư mục để lưu ảnh kết quả (nếu None thì lưu cùng thư mục với ảnh gốc)
            max_workers: Số lượng request song song tối đa (mặc định: 5)
            confirm: Xác nhận trước khi xử lý (mặc định: True)
        
        Returns:
            dict: Kết quả với key là đường dẫn ảnh gốc, value là True/False
        """
        num_images = len(image_paths)
        
        # Cảnh báo về credit
        if confirm:
            print(f"⚠️  CẢNH BÁO: Sẽ xử lý {num_images} ảnh SONG SONG")
            print(f"💳 MỖI ẢNH TRỪ 1 CREDIT - Tổng cộng sẽ trừ: {num_images} credits")
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
                    output_path = Path(output_dir) / Path(image_path).name
                else:
                    output_path = None
                
                # Gọi API (không confirm vì đã confirm ở trên)
                result = self._remove_watermark_internal(image_path, output_path)
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
        
        print(f"\n💳 Tổng số credit đã sử dụng: {credits_used}/{num_images}")
        print(f"📊 Kết quả: {sum(1 for v in results.values() if v)}/{num_images} ảnh thành công")
        return results
    
    def _remove_watermark_internal(
        self,
        image_path: Union[str, Path],
        output_path: Optional[Union[str, Path]] = None
    ) -> Optional[bytes]:
        """
        Internal method để xử lý ảnh (không có confirm, dùng cho parallel processing)
        """
        image_path = Path(image_path)
        
        # Kiểm tra file tồn tại
        if not image_path.exists():
            return None
        
        # Đọc file ảnh
        try:
            with open(image_path, 'rb') as image_file:
                image_data = image_file.read()
        except Exception as e:
            return None
        
        # Tạo payload với file ảnh
        files = {
            'original_preview_image': (image_path.name, image_data, 'image/jpeg')
        }
        
        # Gửi request đến API
        try:
            response = requests.post(
                self.api_url,
                headers=self.headers,
                files=files,
                timeout=60
            )
            
            # Kiểm tra response
            if response.status_code == 200:
                result = response.json()
                
                # Lấy ảnh đã xử lý từ base64
                if 'edited_image' in result and 'image' in result['edited_image']:
                    edited_image_base64 = result['edited_image']['image']
                    
                    # Giải mã base64
                    edited_image_data = base64.b64decode(edited_image_base64)
                    
                    # Lưu file
                    if output_path:
                        output_path = Path(output_path)
                        output_path.parent.mkdir(parents=True, exist_ok=True)
                        with open(output_path, 'wb') as output_file:
                            output_file.write(edited_image_data)
                    else:
                        output_path = image_path.parent / f"{image_path.stem}_dewatermarked{image_path.suffix}"
                        with open(output_path, 'wb') as output_file:
                            output_file.write(edited_image_data)
                    
                    return edited_image_data
            return None
        except:
            return None


def main():
    """Hàm main để chạy script từ command line"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Xóa watermark/logo khỏi ảnh sử dụng API dewatermark.ai'
    )
    parser.add_argument(
        '--api-key',
        type=str,
        required=True,
        help='API Key từ dewatermark.ai'
    )
    parser.add_argument(
        '--image',
        type=str,
        help='Đường dẫn đến file ảnh cần xử lý'
    )
    parser.add_argument(
        '--images',
        type=str,
        nargs='+',
        help='Danh sách đường dẫn đến các file ảnh cần xử lý'
    )
    parser.add_argument(
        '--output',
        type=str,
        help='Đường dẫn để lưu ảnh kết quả (chỉ dùng với --image)'
    )
    parser.add_argument(
        '--output-dir',
        type=str,
        help='Thư mục để lưu ảnh kết quả (chỉ dùng với --images)'
    )
    
    args = parser.parse_args()
    
    # Khởi tạo API client
    api = DewatermarkAPI(args.api_key)
    
    # Xử lý ảnh đơn
    if args.image:
        api.remove_watermark(args.image, args.output)
    
    # Xử lý nhiều ảnh
    elif args.images:
        results = api.remove_watermark_batch(args.images, args.output_dir)
        print("\n📊 Kết quả:")
        for image_path, success in results.items():
            status = "✅" if success else "❌"
            print(f"  {status} {image_path}")
    else:
        parser.print_help()


if __name__ == '__main__':
    main()

