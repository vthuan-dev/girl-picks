"""
Crawler để lấy tất cả link gái chat sex từ trang listing của gaigu1.net/chat-sex.
Sử dụng Playwright để crawl nhiều trang và trích xuất tất cả link.
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


class ChatSexListingCrawler:
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

    async def extract_chat_sex_links_from_page(self, page, base_url: str) -> Set[str]:
        """
        Trích xuất tất cả link gái chat sex từ trang hiện tại.
        Sử dụng XPath: /html/body/div[5]/div[1]/div[3]/div[1]
        
        Returns:
            Set các URL gái chat sex
        """
        chat_links = await page.evaluate(
            """
            (baseUrl) => {
                const links = new Set();
                
                // Sử dụng XPath để tìm container listing
                // XPath: /html/body/div[5]/div[1]/div[3]/div[1]
                const xpath = '/html/body/div[5]/div[1]/div[3]/div[1]';
                const result = document.evaluate(
                    xpath,
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                );
                const container = result.singleNodeValue;
                
                if (!container) {
                    console.warn('Không tìm thấy container listing với XPath:', xpath);
                    // Fallback: tìm tất cả link có chứa /chat-sex/
                    document.querySelectorAll('a[href*="/chat-sex/"]').forEach(link => {
                        const href = link.getAttribute('href');
                        if (href) {
                            let fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
                            if (fullUrl.includes('/chat-sex/') && /\/chat-sex\/\d+/.test(fullUrl)) {
                                const urlObj = new URL(fullUrl);
                                urlObj.hash = '';
                                urlObj.search = '';
                                links.add(urlObj.href);
                            }
                        }
                    });
                    return Array.from(links);
                }
                
                // Tìm tất cả link trong container
                container.querySelectorAll('a[href*="/chat-sex/"]').forEach(link => {
                    const href = link.getAttribute('href');
                    if (href) {
                        // Chuẩn hóa URL
                        let fullUrl;
                        if (href.startsWith('http')) {
                            fullUrl = href;
                        } else {
                            fullUrl = new URL(href, baseUrl).href;
                        }
                        
                        // Chỉ lấy link chat sex (có format /chat-sex/ID/title hoặc /chat-sex/ID)
                        if (fullUrl.includes('/chat-sex/') && /\/chat-sex\/\d+/.test(fullUrl)) {
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
        
        return set(chat_links)

    async def get_total_pages(self, page) -> int:
        """Tìm tổng số trang có thể crawl."""
        try:
            total_pages = await page.evaluate(
                """
                () => {
                    // Cách 1: Tìm trong pagination
                    const pagination = document.querySelector('.pagination') || 
                                     document.querySelector('.page-numbers') ||
                                     document.querySelector('.paging') ||
                                     document.querySelector('[class*="pagination"]') ||
                                     document.querySelector('[class*="paging"]');
                    
                    if (pagination) {
                        const pageLinks = pagination.querySelectorAll('a, span');
                        let maxPage = 1;
                        pageLinks.forEach(link => {
                            const text = link.textContent.trim();
                            const pageNum = parseInt(text);
                            if (!isNaN(pageNum) && pageNum > maxPage) {
                                maxPage = pageNum;
                            }
                        });
                        if (maxPage > 1) return maxPage;
                    }
                    
                    // Cách 2: Tìm "Trang X / Y" hoặc "Page X of Y"
                    const pageInfo = document.body.innerText;
                    const match = pageInfo.match(/(?:trang|page)\s+(\d+)\s*(?:\/|of)\s*(\d+)/i);
                    if (match && match[2]) {
                        return parseInt(match[2]);
                    }
                    
                    // Cách 3: Tìm "Next" button và đếm
                    const nextButtons = document.querySelectorAll('a[href*="page="], a.next, a[class*="next"]');
                    if (nextButtons.length > 0) {
                        // Thử tìm số trang cuối trong URL
                        let maxPage = 1;
                        nextButtons.forEach(btn => {
                            const href = btn.getAttribute('href');
                            if (href) {
                                const pageMatch = href.match(/page[=_](\d+)/i);
                                if (pageMatch) {
                                    const pageNum = parseInt(pageMatch[1]);
                                    if (pageNum > maxPage) maxPage = pageNum;
                                }
                            }
                        });
                        return maxPage;
                    }
                    
                    return 1;
                }
                """
            )
            return max(1, total_pages)
        except Exception as e:
            print(f"⚠️  Không thể xác định tổng số trang: {e}")
            return 1

    async def crawl_listing_page(self, url: str, page_num: int = 1) -> Set[str]:
        """
        Crawl một trang listing cụ thể.
        
        Args:
            url: URL base của trang listing
            page_num: Số trang cần crawl
            
        Returns:
            Set các URL gái chat sex
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
            # Tạo URL với page number
            if page_num > 1:
                parsed_url = urlparse(url)
                query_params = parse_qs(parsed_url.query)
                query_params['page'] = [str(page_num)]
                new_query = urlencode(query_params, doseq=True)
                full_url = urlunparse((
                    parsed_url.scheme,
                    parsed_url.netloc,
                    parsed_url.path,
                    parsed_url.params,
                    new_query,
                    parsed_url.fragment
                ))
            else:
                full_url = url

            print(f"📄 Đang crawl trang {page_num}: {full_url}")
            await page.goto(full_url, wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(random.uniform(self.delay_min, self.delay_max))

            # Trích xuất links
            links = await self.extract_chat_sex_links_from_page(page, full_url)
            print(f"   ✓ Tìm thấy {len(links)} link gái chat sex")

            return links

        except Exception as e:
            print(f"❌ Lỗi khi crawl trang {page_num}: {e}")
            return set()
        finally:
            await page.close()

    async def crawl_all_pages(self, base_url: str, max_pages: Optional[int] = None) -> List[str]:
        """
        Crawl tất cả các trang listing.
        
        Args:
            base_url: URL base của trang listing (ví dụ: https://gaigu1.net/chat-sex)
            max_pages: Số trang tối đa cần crawl (None = crawl tất cả)
            
        Returns:
            List các URL gái chat sex (đã loại bỏ duplicate)
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
            print(f"🔍 Đang kiểm tra tổng số trang: {base_url}")
            await page.goto(base_url, wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(1)

            total_pages = await self.get_total_pages(page)
            if max_pages:
                total_pages = min(total_pages, max_pages)
            
            print(f"📊 Tổng số trang: {total_pages}")
            await page.close()

        except Exception as e:
            print(f"⚠️  Không thể xác định tổng số trang: {e}")
            total_pages = 1
            await page.close()

        # Crawl từng trang
        all_links = set()
        for page_num in range(1, total_pages + 1):
            links = await self.crawl_listing_page(base_url, page_num)
            all_links.update(links)
            print(f"📊 Tổng cộng: {len(all_links)} link (sau trang {page_num})")

        return sorted(list(all_links))


async def main():
    """Main function để chạy crawler."""
    base_url = "https://gaigu1.net/chat-sex"
    
    crawler = ChatSexListingCrawler(
        delay_min=1.0,
        delay_max=2.5,
        headless=False  # Set True nếu không muốn thấy browser
    )

    try:
        print("=" * 60)
        print("🚀 BẮT ĐẦU CRAWL CHAT SEX LISTING")
        print("=" * 60)
        
        # Crawl tất cả trang (hoặc set max_pages để test)
        links = await crawler.crawl_all_pages(base_url, max_pages=None)
        
        print("=" * 60)
        print(f"✅ HOÀN TẤT! Tổng cộng: {len(links)} link gái chat sex")
        print("=" * 60)

        # Lưu kết quả
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"data/chat_sex_links_{timestamp}.json"
        
        os.makedirs("data", exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(links, f, ensure_ascii=False, indent=2)
        
        print(f"💾 Đã lưu vào: {output_file}")
        
        # Cũng lưu dạng text để dễ xem
        txt_file = f"data/chat_sex_links_{timestamp}.txt"
        with open(txt_file, "w", encoding="utf-8") as f:
            for link in links:
                f.write(f"{link}\n")
        
        print(f"💾 Đã lưu text vào: {txt_file}")

    except KeyboardInterrupt:
        print("\n⚠️  Đã dừng bởi người dùng")
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await crawler.close_browser()


if __name__ == "__main__":
    asyncio.run(main())

