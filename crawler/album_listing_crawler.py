"""
Crawler để lấy tất cả link album từ trang listing của gaigu1.net/anh-sex.
Sử dụng Playwright để crawl nhiều trang và trích xuất tất cả link album.
"""

import asyncio
import json
import os
import random
import re
from datetime import datetime
from typing import List, Optional, Set
from urllib.parse import urljoin, urlparse, parse_qs, urlencode, urlunparse

from playwright.async_api import async_playwright, Browser


class AlbumListingCrawler:
    def __init__(
        self,
        delay_min: float = 1.0,
        delay_max: float = 2.5,
        headless: bool = False,
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

    async def extract_album_links_from_page(self, page, base_url: str) -> Set[str]:
        """
        Trích xuất tất cả link album từ trang hiện tại.
        
        Returns:
            Set các URL album
        """
        album_links = await page.evaluate(
            """
            (baseUrl) => {
                const links = new Set();
                const baseUrlObj = new URL(baseUrl);
                
                // Tìm tất cả link có chứa /album-anh-sex/
                document.querySelectorAll('a[href*="/album-anh-sex/"]').forEach(link => {
                    const href = link.getAttribute('href');
                    if (href) {
                        // Chuẩn hóa URL
                        let fullUrl;
                        if (href.startsWith('http')) {
                            fullUrl = href;
                        } else {
                            fullUrl = new URL(href, baseUrl).href;
                        }
                        
                        // Chỉ lấy link album (có format /album-anh-sex/ID/title)
                        if (fullUrl.includes('/album-anh-sex/') && /\/album-anh-sex\/\d+\//.test(fullUrl)) {
                            // Loại bỏ fragment và query params không cần thiết
                            const urlObj = new URL(fullUrl);
                            urlObj.hash = '';
                            // Loại bỏ query params để có URL sạch
                            urlObj.search = '';
                            links.add(urlObj.href);
                        }
                    }
                });
                
                return Array.from(links);
            }
            """,
            base_url
        )
        
        return set(album_links)

    async def get_total_pages(self, page) -> int:
        """Tìm tổng số trang có thể crawl."""
        try:
            # Thử nhiều cách để tìm pagination
            total_pages = await page.evaluate(
                """
                () => {
                    // Cách 1: Tìm trong pagination
                    const pagination = document.querySelector('.pagination') || 
                                      document.querySelector('[class*="pagination"]') ||
                                      document.querySelector('.page-numbers');
                    
                    if (pagination) {
                        const pageLinks = pagination.querySelectorAll('a, span');
                        let maxPage = 1;
                        pageLinks.forEach(el => {
                            const text = el.textContent?.trim() || '';
                            const num = parseInt(text);
                            if (!isNaN(num) && num > maxPage) {
                                maxPage = num;
                            }
                        });
                        return maxPage;
                    }
                    
                    // Cách 2: Tìm "Trang X / Y" hoặc "Page X of Y"
                    const pageInfo = document.body.textContent || '';
                    const match = pageInfo.match(/(?:trang|page)\s+\d+\s*[\/\-]\s*(\d+)/i);
                    if (match) {
                        return parseInt(match[1]);
                    }
                    
                    return 1;
                }
                """
            )
            return max(1, total_pages)
        except Exception as e:
            print(f"⚠️  Không tìm thấy pagination: {e}")
            return 1

    async def crawl_listing_page(self, url: str, page_num: Optional[int] = None) -> Set[str]:
        """
        Crawl một trang listing để lấy các link album.
        
        Args:
            url: URL trang listing (có thể có hoặc không có page parameter)
            page_num: Số trang (nếu None thì crawl trang hiện tại)
            
        Returns:
            Set các URL album
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
            # Xây dựng URL với page number nếu có
            if page_num and page_num > 1:
                # Format mới: luôn dùng ?page=2
                parsed = urlparse(url)
                query_params = parse_qs(parsed.query)
                query_params['page'] = [str(page_num)]
                new_query = urlencode(query_params, doseq=True)
                page_url = urlunparse((
                    parsed.scheme, parsed.netloc, parsed.path,
                    parsed.params, new_query, parsed.fragment
                ))
            else:
                page_url = url

            print(f"🔍 Đang crawl trang: {page_url}")
            await page.goto(page_url, wait_until="networkidle", timeout=60000)
            await asyncio.sleep(2)  # Đợi trang load đầy đủ

            # Scroll để load lazy content
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
            await page.wait_for_timeout(1500)

            # Trích xuất link album
            album_links = await self.extract_album_links_from_page(page, page_url)
            
            print(f"  ✅ Tìm thấy {len(album_links)} album link(s)")
            return album_links

        except Exception as e:
            print(f"❌ Lỗi crawl trang {page_url}: {e}")
            return set()
        finally:
            await page.close()

    async def crawl_all_albums(
        self, 
        base_url: str, 
        max_pages: Optional[int] = None,
        start_page: int = 1
    ) -> List[str]:
        """
        Crawl tất cả album từ trang listing, có thể crawl nhiều trang.
        
        Args:
            base_url: URL trang listing (ví dụ: https://gaigu1.net/anh-sex)
            max_pages: Số trang tối đa để crawl (None = crawl tất cả)
            start_page: Trang bắt đầu crawl
            
        Returns:
            Danh sách tất cả URL album (đã loại bỏ duplicate)
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

        all_links: Set[str] = set()
        
        try:
            # Crawl trang đầu tiên để lấy thông tin pagination
            print(f"🔍 Đang crawl trang đầu tiên: {base_url}")
            await page.goto(base_url, wait_until="networkidle", timeout=60000)
            await asyncio.sleep(2)
            
            # Lấy link từ trang đầu
            first_page_links = await self.extract_album_links_from_page(page, base_url)
            all_links.update(first_page_links)
            print(f"  ✅ Trang 1: {len(first_page_links)} album(s), tổng: {len(all_links)}")

            # Tìm tổng số trang
            total_pages = await self.get_total_pages(page)
            if max_pages:
                total_pages = min(total_pages, max_pages)
            
            print(f"📄 Tổng số trang cần crawl: {total_pages}")

            # Crawl các trang tiếp theo
            for page_num in range(start_page + 1, total_pages + 1):
                await page.close()  # Đóng page cũ
                page = await self.browser.new_page()  # Tạo page mới
                await page.set_extra_http_headers(
                    {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                        "Referer": base_url,
                    }
                )

                # Xây dựng URL trang - Format mới: luôn dùng ?page=2
                parsed = urlparse(base_url)
                query_params = parse_qs(parsed.query)
                query_params['page'] = [str(page_num)]
                new_query = urlencode(query_params, doseq=True)
                page_url = urlunparse((
                    parsed.scheme, parsed.netloc, parsed.path,
                    parsed.params, new_query, parsed.fragment
                ))

                try:
                    print(f"🔍 Đang crawl trang {page_num}/{total_pages}: {page_url}")
                    await page.goto(page_url, wait_until="networkidle", timeout=60000)
                    await asyncio.sleep(2)
                    
                    # Scroll để load lazy content
                    await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
                    await page.wait_for_timeout(1500)

                    # Trích xuất link
                    page_links = await self.extract_album_links_from_page(page, page_url)
                    before_count = len(all_links)
                    all_links.update(page_links)
                    new_count = len(all_links) - before_count
                    
                    print(f"  ✅ Trang {page_num}: {len(page_links)} album(s), mới: {new_count}, tổng: {len(all_links)}")

                    # Nếu không có link mới nào thì có thể đã hết
                    if new_count == 0 and page_num > start_page + 2:
                        print(f"⚠️  Không có link mới ở trang {page_num}, có thể đã hết. Dừng crawl.")
                        break

                    # Delay giữa các trang
                    if page_num < total_pages:
                        delay = random.uniform(self.delay_min, self.delay_max)
                        await asyncio.sleep(delay)

                except Exception as e:
                    print(f"❌ Lỗi crawl trang {page_num}: {e}")
                    continue

        finally:
            await page.close()

        # Chuyển từ Set sang List và sắp xếp
        result = sorted(list(all_links))
        print(f"\n✅ Hoàn thành! Tổng cộng: {len(result)} album link(s)")
        return result

    def save_to_file(self, links: List[str], filename: Optional[str] = None, format: str = "txt") -> str:
        """
        Lưu danh sách link vào file.
        
        Args:
            links: Danh sách URL
            filename: Tên file (None = tự động tạo)
            format: "txt" hoặc "json"
        """
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"album_links_{timestamp}.{format}"

        data_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(data_dir, exist_ok=True)
        filepath = os.path.join(data_dir, filename)

        if format == "json":
            data = {
                "urls": links,
                "total": len(links),
                "crawled_at": datetime.now().isoformat(),
            }
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        else:
            # Lưu dạng txt (mỗi dòng 1 URL)
            with open(filepath, "w", encoding="utf-8") as f:
                for link in links:
                    f.write(f"{link}\n")

        print(f"💾 Đã lưu {len(links)} link vào: {filepath}")
        return filepath


async def main():
    import sys

    base_url = "https://gaigu1.net/anh-sex"
    max_pages = 32  # Mặc định chỉ crawl 32 trang
    start_page = 1

    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    if len(sys.argv) > 2:
        try:
            max_pages = int(sys.argv[2])
        except ValueError:
            pass
    if len(sys.argv) > 3:
        try:
            start_page = int(sys.argv[3])
        except ValueError:
            pass

    crawler = AlbumListingCrawler(headless=False, delay_min=1.5, delay_max=3.0)
    try:
        print(f"\n🚀 Bắt đầu crawl album links từ: {base_url}")
        if max_pages:
            print(f"📄 Số trang tối đa: {max_pages}")
        print(f"{'='*60}\n")

        links = await crawler.crawl_all_albums(
            base_url=base_url,
            max_pages=max_pages,
            start_page=start_page
        )

        # Lưu vào cả 2 format
        txt_file = crawler.save_to_file(links, format="txt")
        json_file = crawler.save_to_file(links, format="json")
        
        print(f"\n{'='*60}")
        print(f"📊 KẾT QUẢ")
        print(f"{'='*60}")
        print(f"✅ Tổng số album link: {len(links)}")
        print(f"📁 File TXT: {txt_file}")
        print(f"📁 File JSON: {json_file}")
        
        if links:
            print(f"\n📋 Một số link đầu tiên:")
            for i, link in enumerate(links[:5], 1):
                print(f"  {i}. {link}")

    finally:
        await crawler.close_browser()


if __name__ == "__main__":
    asyncio.run(main())

