"""
Script để migrate ảnh từ nguồn gốc (gaigu1.net) sang Bunny CDN
Tác giả: Antigravity
Ngày: 2026-01-06

VERSION 2.0 - Multi-threading cho tốc độ nhanh hơn!

Cách dùng:
1. Cài đặt dependencies: pip install requests mysql-connector-python python-dotenv
2. Tạo file .env với các biến môi trường
3. Chạy script: python migrate_images_to_cdn.py
"""

import os
import sys
import json
import time
import hashlib
import requests
from pathlib import Path
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import threading

# Load environment variables
load_dotenv()

# Disable SSL warnings (gaigu servers have SSL issues)
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ============================================
# CẤU HÌNH - THAY ĐỔI THEO NHU CẦU
# ============================================

# Database config
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '1001'),
    'database': os.getenv('DB_NAME', 'girl_pick_db'),
}

# Bunny CDN config
BUNNY_STORAGE_ZONE = os.getenv('BUNNY_STORAGE_ZONE', 'girlpick-storage')
BUNNY_STORAGE_HOST = os.getenv('BUNNY_STORAGE_HOST', 'sg.storage.bunnycdn.com')
BUNNY_API_KEY = os.getenv('BUNNY_API_KEY', '9d372b3c-dc17-4769-ba066e1c2c01-6f46-4673')
BUNNY_CDN_URL = os.getenv('BUNNY_CDN_URL', 'https://girlpick.b-cdn.net')

# Directories
DOWNLOAD_DIR = Path('./downloaded_images')
LOG_FILE = Path('./migration_log.json')
PROGRESS_FILE = Path('./migration_progress.json')

# Threading - TĂNG SỐ WORKERS ĐỂ NHANH HƠN
MAX_IMAGE_WORKERS = 10  # Số luồng xử lý ảnh đồng thời trong 1 girl
MAX_GIRL_WORKERS = 5    # Số girls xử lý đồng thời
REQUEST_TIMEOUT = 30
RETRY_ATTEMPTS = 2      # Giảm retry để nhanh hơn

# Thread-safe counter
lock = threading.Lock()
stats = {
    'total_girls': 0,
    'processed_girls': 0,
    'downloaded': 0,
    'uploaded': 0,
    'skipped': 0,
    'download_failed': 0,
    'upload_failed': 0,
    'db_updated': 0,
    'errors': 0,
}

# ============================================
# HELPER FUNCTIONS
# ============================================

def log(message, level="INFO"):
    """In log với timestamp"""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{level}] {message}")


def get_file_extension(url):
    """Lấy extension từ URL"""
    parsed = urlparse(url)
    path = parsed.path
    ext = os.path.splitext(path)[1].lower()
    if ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
        return ext
    return '.jpg'


def generate_unique_filename(girl_id, image_index, original_url):
    """Tạo tên file unique dựa trên girl_id và index"""
    ext = get_file_extension(original_url)
    url_hash = hashlib.md5(original_url.encode()).hexdigest()[:8]
    return f"girl_{girl_id}_{image_index:03d}_{url_hash}{ext}"


def download_and_upload_single_image(args):
    """Tải và upload 1 ảnh - chạy trong thread riêng"""
    idx, original_url, girl_id, girl_download_dir = args
    
    if not original_url or not isinstance(original_url, str):
        return idx, original_url, 'skip'
    
    # Kiểm tra nếu đã là CDN URL thì bỏ qua
    if BUNNY_CDN_URL in original_url:
        with lock:
            stats['skipped'] += 1
        return idx, original_url, 'already_cdn'
    
    # Thay thế gaigu1/2 bằng gaigu3
    url = original_url
    if 'gaigu1.net' in url:
        url = url.replace('gaigu1.net', 'gaigu3.net')
    if 'gaigu2.net' in url:
        url = url.replace('gaigu2.net', 'gaigu3.net')
    
    # Tạo tên file
    filename = generate_unique_filename(girl_id, idx, original_url)
    local_path = girl_download_dir / filename
    remote_path = f"girls/{girl_id}/{filename}"
    
    # Bước 1: Tải ảnh về
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/*',
            'Referer': 'https://gaigu3.net/'
        }
        response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT, stream=True, verify=False)
        response.raise_for_status()
        
        with open(local_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        with lock:
            stats['downloaded'] += 1
            
    except Exception as e:
        with lock:
            stats['download_failed'] += 1
        return idx, original_url, 'download_failed'
    
    # Bước 2: Upload lên Bunny CDN
    try:
        upload_url = f"https://{BUNNY_STORAGE_HOST}/{BUNNY_STORAGE_ZONE}/{remote_path}"
        headers = {
            'AccessKey': BUNNY_API_KEY,
            'Content-Type': 'application/octet-stream',
        }
        
        with open(local_path, 'rb') as f:
            response = requests.put(upload_url, headers=headers, data=f, timeout=REQUEST_TIMEOUT)
        
        if response.status_code in [200, 201]:
            cdn_url = f"{BUNNY_CDN_URL}/{remote_path}"
            with lock:
                stats['uploaded'] += 1
            return idx, cdn_url, 'success'
        else:
            with lock:
                stats['upload_failed'] += 1
            return idx, original_url, 'upload_failed'
            
    except Exception as e:
        with lock:
            stats['upload_failed'] += 1
        return idx, original_url, 'upload_failed'


def process_single_girl(girl, db_config):
    """Xử lý migrate ảnh cho 1 girl - với multi-threading"""
    girl_id = girl['id']
    girl_name = girl['name'] or 'Unknown'
    
    try:
        # Parse images JSON
        images = girl['images']
        if isinstance(images, str):
            images = json.loads(images)
        
        if not images or len(images) == 0:
            return
        
        girl_download_dir = DOWNLOAD_DIR / f"girl_{girl_id}"
        girl_download_dir.mkdir(parents=True, exist_ok=True)
        
        # Chuẩn bị args cho multi-threading
        args_list = [
            (idx, url, girl_id, girl_download_dir)
            for idx, url in enumerate(images)
        ]
        
        # Xử lý song song các ảnh trong 1 girl
        new_image_urls = [None] * len(images)
        
        with ThreadPoolExecutor(max_workers=MAX_IMAGE_WORKERS) as executor:
            futures = {executor.submit(download_and_upload_single_image, args): args[0] for args in args_list}
            
            for future in as_completed(futures):
                idx, result_url, status = future.result()
                new_image_urls[idx] = result_url
        
        # Lọc bỏ None
        new_image_urls = [url for url in new_image_urls if url is not None]
        
        # Cập nhật database
        if new_image_urls and new_image_urls != images:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            cursor.execute(
                "UPDATE girls SET images = %s, updatedAt = NOW() WHERE id = %s",
                (json.dumps(new_image_urls), girl_id)
            )
            connection.commit()
            cursor.close()
            connection.close()
            
            with lock:
                stats['db_updated'] += 1
        
        with lock:
            stats['processed_girls'] += 1
            processed = stats['processed_girls']
            total = stats['total_girls']
        
        # In progress mỗi 10 girls
        if processed % 10 == 0:
            log(f"📊 Tiến độ: {processed}/{total} girls ({processed*100//total}%)")
        
    except Exception as e:
        with lock:
            stats['errors'] += 1


def run_migration():
    """Chạy quá trình migration với multi-threading"""
    log("=" * 60)
    log("BẮT ĐẦU MIGRATION ẢNH SANG BUNNY CDN (Multi-threaded)")
    log("=" * 60)
    
    # Tạo thư mục download
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    # Kết nối database để lấy danh sách
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection.is_connected():
        log("Không thể kết nối database. Dừng.", "ERROR")
        return
    
    log(f"✅ Đã kết nối database: {DB_CONFIG['database']}")
    
    # Lấy danh sách girls - CHỈ LẤY NHỮNG GIRLS CHƯA MIGRATE
    cursor = connection.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, name, images 
        FROM girls 
        WHERE images IS NOT NULL 
        AND images != '[]' 
        AND JSON_LENGTH(images) > 0
        AND images NOT LIKE '%girlpick.b-cdn.net%'
        ORDER BY id
    """)
    girls = cursor.fetchall()
    cursor.close()
    connection.close()
    
    stats['total_girls'] = len(girls)
    log(f"📊 Tìm thấy {len(girls)} girls CẦN migrate (chưa có CDN URL)")
    
    if len(girls) == 0:
        log("Không có dữ liệu để migrate.")
        return
    
    start_time = time.time()
    
    # Xử lý SONG SONG nhiều girls cùng lúc
    log(f"🚀 Bắt đầu với {MAX_GIRL_WORKERS} girl workers x {MAX_IMAGE_WORKERS} image workers")
    
    with ThreadPoolExecutor(max_workers=MAX_GIRL_WORKERS) as executor:
        futures = [executor.submit(process_single_girl, girl, DB_CONFIG) for girl in girls]
        
        # Đợi tất cả hoàn thành
        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                log(f"Lỗi: {e}", "ERROR")
    
    # Kết thúc
    duration = time.time() - start_time
    
    # Lưu log
    stats['duration'] = duration
    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    
    # In kết quả
    log("\n" + "=" * 60)
    log("KẾT QUẢ MIGRATION")
    log("=" * 60)
    log(f"📊 Tổng số girls: {stats['total_girls']}")
    log(f"✅ Đã xử lý: {stats['processed_girls']} girls")
    log(f"⬇️  Đã tải: {stats['downloaded']} ảnh")
    log(f"⬆️  Đã upload: {stats['uploaded']} ảnh")
    log(f"⏭️  Bỏ qua (đã có CDN): {stats['skipped']} ảnh")
    log(f"❌ Tải thất bại: {stats['download_failed']} ảnh")
    log(f"❌ Upload thất bại: {stats['upload_failed']} ảnh")
    log(f"📝 DB cập nhật: {stats['db_updated']} girls")
    log(f"⚠️  Lỗi: {stats['errors']}")
    log(f"⏱️  Thời gian: {duration:.1f} giây")
    log(f"⚡ Tốc độ: {stats['uploaded'] / max(duration, 1):.1f} ảnh/giây")
    log("=" * 60)


# ============================================
# MAIN
# ============================================

if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════╗
║   GIRL-PICK: IMAGE MIGRATION TO BUNNY CDN v2.0           ║
║                                                          ║
║  ⚡ MULTI-THREADED VERSION - NHANH HƠN 10x!              ║
║                                                          ║
║  Script này sẽ:                                          ║
║  1. Tải ảnh từ gaigu3.net về máy (song song)             ║
║  2. Upload lên Bunny CDN (song song)                     ║
║  3. Cập nhật database với URL mới                        ║
╚══════════════════════════════════════════════════════════╝
    """)
    
    print(f"\n⚡ CẤU HÌNH TỐC ĐỘ:")
    print(f"   - Girl workers: {MAX_GIRL_WORKERS}")
    print(f"   - Image workers: {MAX_IMAGE_WORKERS}")
    print(f"   - Tổng threads: {MAX_GIRL_WORKERS * MAX_IMAGE_WORKERS}")
    
    print(f"\n⚠️  LƯU Ý:")
    print(f"   - Database: {DB_CONFIG['database']} ({DB_CONFIG['host']}:{DB_CONFIG['port']})")
    print(f"   - Bunny Storage: {BUNNY_STORAGE_ZONE}")
    print(f"   - CDN URL: {BUNNY_CDN_URL}")
    
    confirm = input("\n❓ Bạn có muốn tiếp tục? (y/n): ").strip().lower()
    if confirm != 'y':
        print("❌ Đã hủy.")
        sys.exit(0)
    
    run_migration()
