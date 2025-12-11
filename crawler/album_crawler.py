"""
Crawler để lấy ảnh từ trang album của gaigu1.net.
Sử dụng Playwright để tải trang và trích xuất tất cả ảnh trong album.
"""

import asyncio
import json
import os
import random
from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import urljoin, urlparse

from playwright.async_api import async_playwright, Browser


class AlbumCrawler:
    def __init__(
        self,
        delay_min: float = 1.0,
        delay_max: float = 2.5,
        headless: bool = False,  # mở Chrome thật khi cần debug
    ):
        self.browser: Optional[Browser] = None
        self.playwright = None
        self.delay_min = delay_min
        self.delay_max = delay_max
        self.headless = headless

    async def init_browser(self):
        if not self.browser:
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                headless=self.headless, args=["--no-sandbox", "--disable-setuid-sandbox"]
            )
        return self.browser

    async def close_browser(self):
        try:
            if self.browser:
                await self.browser.close()
            if self.playwright:
                await self.playwright.stop()
        except Exception as e:
            print(f"⚠️  Lỗi khi đóng browser: {e}")

    async def crawl_album_images(self, url: str) -> Dict:
        """
        Crawl tất cả ảnh từ trang album.
        
        Args:
            url: URL của trang album cần crawl
            
        Returns:
            Dict chứa thông tin album và danh sách ảnh

        Args:
            url: URL của trang album (ví dụ: https://gaigu1.net/album-anh-sex/24062/...)

        Returns:
            Dict chứa thông tin album và danh sách ảnh
        """
        await self.init_browser()
        page = await self.browser.new_page()
        await page.set_extra_http_headers(
            {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                "Referer": "https://gaigu1.net/",
            }
        )

        try:
            print(f"🔍 Đang crawl album: {url}")
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(1)  # Giảm thời gian chờ

            # Lấy thông tin album (title, description, etc.)
            album_info = await page.evaluate(
                """
                () => {
                    const title = document.querySelector('h1')?.textContent?.trim() || 
                                  document.querySelector('.album-title')?.textContent?.trim() || 
                                  document.querySelector('title')?.textContent?.trim() || '';
                    
                    const description = document.querySelector('.album-description')?.textContent?.trim() || 
                                      document.querySelector('.description')?.textContent?.trim() || '';
                    
                    return { title, description };
                }
                """
            )

            # Thử nhiều cách để lấy ảnh
            # 1. Tìm trong gallery/swiper
            # 2. Tìm tất cả img có data-src hoặc src
            # 3. Tìm trong các container phổ biến
            images = await page.evaluate(
                """
                () => {
                    const imageUrls = new Set();
                    const baseUrl = window.location.origin;

                    // Cách 1: Tìm trong gallery/swiper
                    const gallerySelectors = [
                        '.gallery img',
                        '.swiper-wrapper img',
                        '.album-gallery img',
                        '.photo-gallery img',
                        '.image-gallery img',
                        '[class*="gallery"] img',
                        '[class*="swiper"] img',
                    ];

                    gallerySelectors.forEach(selector => {
                        document.querySelectorAll(selector).forEach(img => {
                            const src = img.getAttribute('data-src') || 
                                       img.getAttribute('data-lazy') ||
                                       img.getAttribute('src') || '';
                            if (src && !src.startsWith('data:')) {
                                const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
                                imageUrls.add(fullUrl);
                            }
                        });
                    });

                    // Cách 2: Tìm tất cả img trong các container chính
                    const mainContainers = [
                        '.album-content',
                        '.album-images',
                        '.content',
                        '.main-content',
                        '[class*="album"]',
                    ];

                    mainContainers.forEach(containerSelector => {
                        const container = document.querySelector(containerSelector);
                        if (container) {
                            container.querySelectorAll('img').forEach(img => {
                                const src = img.getAttribute('data-src') || 
                                           img.getAttribute('data-lazy') ||
                                           img.getAttribute('src') || '';
                                if (src && !src.startsWith('data:') && !src.includes('logo') && !src.includes('icon')) {
                                    const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
                                    imageUrls.add(fullUrl);
                                }
                            });
                        }
                    });

                    // Cách 3: Tìm tất cả img trên trang (fallback)
                    if (imageUrls.size === 0) {
                        document.querySelectorAll('img').forEach(img => {
                            const src = img.getAttribute('data-src') || 
                                       img.getAttribute('data-lazy') ||
                                       img.getAttribute('src') || '';
                            if (src && !src.startsWith('data:') && 
                                !src.includes('logo') && 
                                !src.includes('icon') &&
                                !src.includes('avatar') &&
                                img.offsetWidth > 100 &&  // Lọc ảnh nhỏ (icon, avatar)
                                img.offsetHeight > 100) {
                                const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
                                imageUrls.add(fullUrl);
                            }
                        });
                    }

                    return Array.from(imageUrls);
                }
                """
            )

            # Thử scroll để load thêm ảnh lazy load
            if len(images) < 10:  # Nếu có ít ảnh, thử scroll
                print("📜 Đang scroll để load thêm ảnh...")
                for i in range(3):  # Giảm số lần scroll
                    await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
                    await page.wait_for_timeout(1000)  # Giảm thời gian chờ
                    
                    # Lấy lại danh sách ảnh sau khi scroll
                    new_images = await page.evaluate(
                        """
                        () => {
                            const imageUrls = new Set();
                            const baseUrl = window.location.origin;
                            document.querySelectorAll('img').forEach(img => {
                                const src = img.getAttribute('data-src') || 
                                           img.getAttribute('data-lazy') ||
                                           img.getAttribute('src') || '';
                                if (src && !src.startsWith('data:') && 
                                    !src.includes('logo') && 
                                    !src.includes('icon') &&
                                    !src.includes('avatar') &&
                                    img.offsetWidth > 100 &&
                                    img.offsetHeight > 100) {
                                    const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
                                    imageUrls.add(fullUrl);
                                }
                            });
                            return Array.from(imageUrls);
                        }
                        """
                    )
                    if len(new_images) > len(images):
                        images = new_images
                        print(f"  📸 Tìm thấy {len(images)} ảnh sau scroll {i+1}")
                    else:
                        break

            # Lọc và chuẩn hóa URL
            cleaned_images = []
            for img_url in images:
                # Loại bỏ các tham số resize/crop nếu có
                cleaned_url = img_url.split('?')[0] if '?' in img_url else img_url
                if cleaned_url not in cleaned_images:
                    cleaned_images.append(cleaned_url)

            result = {
                "url": url,
                "title": album_info.get("title", ""),
                "description": album_info.get("description", ""),
                "images": cleaned_images,
                "total_images": len(cleaned_images),
                "crawled_at": datetime.now().isoformat(),
            }

            print(f"✅ Thu được {len(cleaned_images)} ảnh từ album")
            return result

        except Exception as e:
            print(f"❌ Lỗi crawl album {url}: {e}")
            return {
                "url": url,
                "error": str(e),
                "images": [],
                "total_images": 0,
            }
        finally:
            await page.close()

    def save_to_json(self, data: Dict, filename: Optional[str] = None, output_folder: Optional[str] = None) -> str:
        """Lưu dữ liệu album vào file JSON. Mỗi album = 1 file JSON riêng."""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            # Tạo tên file từ title hoặc URL
            title = data.get("title", "")
            if title:
                # Làm sạch title để làm tên file
                import re
                safe_title = re.sub(r'[^\w\s-]', '', title).strip()[:50]
                safe_title = re.sub(r'[-\s]+', '-', safe_title)
                filename = f"album_{safe_title}_{timestamp}.json"
            else:
                # Fallback: dùng URL
                url_part = data.get("url", "").split("/")[-1][:50] if data.get("url") else "album"
                filename = f"album_{url_part}_{timestamp}.json"

        # Sử dụng output_folder nếu được chỉ định, nếu không thì dùng folder data mặc định
        if output_folder:
            data_dir = os.path.join(os.path.dirname(__file__), "data", output_folder)
        else:
            data_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(data_dir, exist_ok=True)
        filepath = os.path.join(data_dir, filename)

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"💾 Đã lưu album vào: {filepath}")
        return filepath

    async def crawl_single_album(self, url: str, idx: int, total: int, output_folder: str) -> Dict:
        """Crawl một album đơn lẻ."""
        try:
            print(f"📦 Album {idx}/{total}: {url}")
            album_data = await self.crawl_album_images(url)
            
            if album_data.get("error"):
                print(f"❌ Lỗi khi crawl album {idx}: {album_data.get('error')}")
                return {
                    "url": url,
                    "success": False,
                    "error": album_data.get("error"),
                }
            else:
                filepath = self.save_to_json(album_data, output_folder=output_folder)
                return {
                    "url": url,
                    "success": True,
                    "filepath": filepath,
                    "total_images": album_data.get("total_images", 0),
                }
        except Exception as e:
            print(f"❌ Lỗi khi crawl album {idx}: {e}")
            return {
                "url": url,
                "success": False,
                "error": str(e),
            }

    async def crawl_multiple_albums(self, urls: List[str], output_folder: Optional[str] = None, max_concurrent: int = 3) -> List[Dict]:
        """
        Crawl nhiều album, mỗi album lưu thành 1 file JSON riêng.
        Hỗ trợ crawl đồng thời để tăng tốc độ.
        
        Args:
            urls: Danh sách URL các album cần crawl
            output_folder: Tên folder để lưu các album (tùy chọn)
            max_concurrent: Số lượng album crawl đồng thời (mặc định: 3)
            
        Returns:
            Danh sách kết quả crawl của từng album
        """
        total = len(urls)
        
        # Tạo folder riêng nếu chưa có
        if not output_folder:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_folder = f"albums_batch_{timestamp}"
        
        output_path = os.path.join(os.path.dirname(__file__), "data", output_folder)
        os.makedirs(output_path, exist_ok=True)
        print(f"\n📁 Lưu album vào folder: {output_folder}\n")
        print(f"🚀 Bắt đầu crawl {total} album(s) với {max_concurrent} luồng đồng thời...\n")
        
        # Tạo semaphore để giới hạn số lượng crawl đồng thời
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def crawl_with_semaphore(url: str, idx: int):
            async with semaphore:
                # Delay ngẫu nhiên nhỏ để tránh quá tải
                if idx > 1:
                    delay = random.uniform(self.delay_min, self.delay_max)
                    await asyncio.sleep(delay)
                return await self.crawl_single_album(url, idx, total, output_folder)
        
        # Tạo tất cả tasks
        tasks = [crawl_with_semaphore(url, idx) for idx, url in enumerate(urls, 1)]
        
        # Chạy tất cả tasks và đợi kết quả
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Xử lý exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append({
                    "url": urls[i],
                    "success": False,
                    "error": str(result),
                })
            else:
                processed_results.append(result)
        
        return processed_results


async def main():
    import sys

    # Nhận nhiều URL từ command line arguments
    # Cách 1: Truyền nhiều URL làm tham số
    # python album_crawler.py "url1" "url2" "url3"
    urls = []
    
    if len(sys.argv) > 1:
        # Nếu tham số đầu tiên là file (có extension .txt hoặc .json)
        first_arg = sys.argv[1]
        if first_arg.endswith('.txt') or first_arg.endswith('.json'):
            # Đọc danh sách URL từ file
            try:
                with open(first_arg, 'r', encoding='utf-8') as f:
                    if first_arg.endswith('.json'):
                        # Nếu là JSON, đọc như array
                        data = json.load(f)
                        if isinstance(data, list):
                            urls = data
                        elif isinstance(data, dict) and 'urls' in data:
                            urls = data['urls']
                    else:
                        # Nếu là TXT, đọc từng dòng
                        urls = [line.strip() for line in f if line.strip() and not line.strip().startswith('#')]
                print(f"📄 Đã đọc {len(urls)} URL từ file: {first_arg}")
            except Exception as e:
                print(f"❌ Lỗi đọc file {first_arg}: {e}")
                return
        else:
            # Lấy tất cả tham số làm URL
            urls = sys.argv[1:]
    else:
        # URL mặc định để test
        urls = ["https://gaigu1.net/album-anh-sex/24062/m%E1%BB%B9-anh-t%C3%A2y-ninh-nyc-b%E1%BB%93n-ch%E1%BB%A9a-tinh-n%C4%83m-c3"]

    if not urls:
        print("❌ Không có URL nào để crawl!")
        print("\nCách sử dụng:")
        print("  python album_crawler.py <url1> <url2> <url3> ...")
        print("  python album_crawler.py urls.txt  # Đọc từ file txt (mỗi dòng 1 URL)")
        print("  python album_crawler.py urls.json  # Đọc từ file json (array URLs)")
        return

    # Bật headless mode và giảm delay để tăng tốc độ
    crawler = AlbumCrawler(headless=True, delay_min=0.5, delay_max=1.0)
    try:
        # Tạo tên folder riêng cho batch này
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_folder = f"albums_batch_{timestamp}"
        
        # Crawl với 5 luồng đồng thời để tăng tốc độ
        results = await crawler.crawl_multiple_albums(urls, output_folder=output_folder, max_concurrent=5)
        
        # Tổng kết
        print(f"\n{'='*60}")
        print(f"📊 TỔNG KẾT")
        print(f"{'='*60}")
        success_count = sum(1 for r in results if r.get("success"))
        total_images = sum(r.get("total_images", 0) for r in results if r.get("success"))
        
        print(f"✅ Thành công: {success_count}/{len(results)} album")
        print(f"📸 Tổng số ảnh: {total_images}")
        print(f"❌ Thất bại: {len(results) - success_count} album")
        print(f"\n📁 Tất cả album đã được lưu vào folder: crawler/data/{output_folder}/")
        
        if success_count > 0:
            print(f"\n📄 Một số file đã lưu (hiển thị 5 file đầu):")
            for r in results[:5]:
                if r.get("success"):
                    print(f"  - {os.path.basename(r.get('filepath'))} ({r.get('total_images', 0)} ảnh)")
            if success_count > 5:
                print(f"  ... và {success_count - 5} file khác")
        
    finally:
        await crawler.close_browser()


if __name__ == "__main__":
    asyncio.run(main())

