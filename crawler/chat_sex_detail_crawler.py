"""
Crawler để lấy thông tin chi tiết của gái chat sex từ gaigu1.net/chat-sex.
Sử dụng Playwright để tải trang và trích xuất thông tin.
"""

import asyncio
import json
import os
import random
from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import urljoin, urlparse

from playwright.async_api import async_playwright, Browser


class ChatSexDetailCrawler:
    def __init__(
        self,
        delay_min: float = 0.3,
        delay_max: float = 0.8,
        headless: bool = True,
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

    async def crawl_chat_sex_detail(self, url: str) -> Dict:
        """
        Crawl thông tin chi tiết của gái chat sex.
        
        Args:
            url: URL của trang gái chat sex cần crawl
            
        Returns:
            Dict chứa thông tin chi tiết
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
            print(f"🔍 Đang crawl: {url}")
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await asyncio.sleep(random.uniform(self.delay_min, self.delay_max))

            # Lấy thông tin chi tiết từ container XPath: /html/body/div[5]/div[4]/div[3]
            detail_info = await page.evaluate(
                """
                () => {
                    const data = {
                        url: window.location.href,
                        title: '',
                        name: '',
                        age: null,
                        location: '',
                        price: '',
                        description: '',
                        images: [],
                        phone: '',
                        zalo: '',
                        telegram: '',
                        services: [],
                        workingHours: '',
                        verified: false,
                        rating: null,
                        viewCount: 0,
                        tags: []
                    };

                    // Sử dụng XPath để tìm container detail
                    // XPath: /html/body/div[5]/div[4]/div[3]
                    const xpath = '/html/body/div[5]/div[4]/div[3]';
                    const result = document.evaluate(
                        xpath,
                        document,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null
                    );
                    const detailContainer = result.singleNodeValue;

                    // Nếu không tìm thấy container, fallback về cách cũ
                    const container = detailContainer || document.body;

                    // Lấy title
                    data.title = container.querySelector('h1')?.textContent?.trim() || 
                                container.querySelector('.title')?.textContent?.trim() || 
                                document.querySelector('title')?.textContent?.trim() || '';

                    // Lấy tên (có thể từ title hoặc element riêng)
                    data.name = container.querySelector('.name')?.textContent?.trim() ||
                               container.querySelector('[class*="name"]')?.textContent?.trim() ||
                               data.title.split('-')[0]?.trim() ||
                               data.title;

                    // Lấy tuổi
                    const ageText = document.body.innerText.match(/(?:tuổi|age)[\s:]*(\d+)/i);
                    if (ageText) {
                        data.age = parseInt(ageText[1]);
                    }

                    // Lấy địa điểm (từ container)
                    data.location = container.querySelector('.location')?.textContent?.trim() ||
                                  container.querySelector('[class*="location"]')?.textContent?.trim() ||
                                  container.querySelector('[class*="address"]')?.textContent?.trim() ||
                                  '';

                    // Lấy giá (từ container)
                    const containerText = container.innerText || container.textContent || '';
                    const priceText = containerText.match(/(?:giá|price)[\s:]*([\d.,]+)/i);
                    if (priceText) {
                        data.price = priceText[1];
                    }

                    // Lấy mô tả (từ container)
                    data.description = container.querySelector('.description')?.textContent?.trim() ||
                                     container.querySelector('[class*="description"]')?.textContent?.trim() ||
                                     container.querySelector('.content')?.textContent?.trim() ||
                                     '';

                    // Lấy ảnh (từ container)
                    const imageSelectors = [
                        'img[src*="chat"]',
                        'img[data-src*="chat"]',
                        '.gallery img',
                        '.images img',
                        '[class*="image"] img',
                        '[class*="photo"] img',
                        'img[src*="gaigu1.net"]',
                        'img'
                    ];
                    
                    const imageSet = new Set();
                    imageSelectors.forEach(selector => {
                        container.querySelectorAll(selector).forEach(img => {
                            let src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
                            if (src) {
                                if (src.startsWith('//')) {
                                    src = 'https:' + src;
                                } else if (src.startsWith('/')) {
                                    src = window.location.origin + src;
                                }
                                if (src.includes('gaigu1.net') && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar')) {
                                    imageSet.add(src);
                                }
                            }
                        });
                    });
                    data.images = Array.from(imageSet);

                    // Lấy số điện thoại (từ container)
                    const phoneMatch = containerText.match(/(?:0|\+84)[\d\s\-]{9,11}/);
                    if (phoneMatch) {
                        data.phone = phoneMatch[0].replace(/[\s\-]/g, '');
                    }

                    // Lấy Zalo (từ container)
                    const zaloMatch = containerText.match(/zalo[:\s]*([\d\w]+)/i);
                    if (zaloMatch) {
                        data.zalo = zaloMatch[1];
                    }

                    // Lấy Telegram (từ container)
                    const telegramMatch = containerText.match(/telegram[:\s]*([\d\w@]+)/i);
                    if (telegramMatch) {
                        data.telegram = telegramMatch[1];
                    }

                    // Lấy dịch vụ (từ container)
                    const serviceElements = container.querySelectorAll('[class*="service"], [class*="dich-vu"]');
                    serviceElements.forEach(el => {
                        const serviceText = el.textContent?.trim();
                        if (serviceText) {
                            data.services.push(serviceText);
                        }
                    });

                    // Lấy giờ làm việc (từ container)
                    const hoursMatch = containerText.match(/(?:giờ|hours?)[\s:]*([\d\s\-:]+)/i);
                    if (hoursMatch) {
                        data.workingHours = hoursMatch[1];
                    }

                    // Kiểm tra verified (từ container)
                    data.verified = !!container.querySelector('[class*="verified"], [class*="check"]');

                    // Lấy rating (từ container)
                    const ratingEl = container.querySelector('[class*="rating"], [class*="star"]');
                    if (ratingEl) {
                        const ratingText = ratingEl.textContent?.match(/([\d.]+)/);
                        if (ratingText) {
                            data.rating = parseFloat(ratingText[1]);
                        }
                    }

                    // Lấy view count (từ container)
                    const viewMatch = containerText.match(/(?:lượt xem|views?)[\s:]*(\d+)/i);
                    if (viewMatch) {
                        data.viewCount = parseInt(viewMatch[1]);
                    }

                    // Lấy tags (từ container)
                    const tagElements = container.querySelectorAll('[class*="tag"], .tags a, [class*="label"]');
                    tagElements.forEach(tag => {
                        const tagText = tag.textContent?.trim();
                        if (tagText) {
                            data.tags.push(tagText);
                        }
                    });

                    return data;
                }
                """
            )

            detail_info['crawled_at'] = datetime.now().isoformat()
            detail_info['total_images'] = len(detail_info.get('images', []))

            print(f"   ✓ Tìm thấy: {detail_info.get('name', 'N/A')} - {len(detail_info.get('images', []))} ảnh")
            
            return detail_info

        except Exception as e:
            print(f"❌ Lỗi khi crawl {url}: {e}")
            return {
                'url': url,
                'error': str(e),
                'crawled_at': datetime.now().isoformat()
            }
        finally:
            await page.close()

    async def crawl_multiple(self, urls: List[str], output_dir: str = "data/chat_sex_details", batch_size: int = 5) -> List[Dict]:
        """
        Crawl nhiều URL với concurrent requests để tăng tốc.
        
        Args:
            urls: List các URL cần crawl
            output_dir: Thư mục để lưu file JSON
            batch_size: Số request đồng thời
            
        Returns:
            List các dict chứa thông tin chi tiết
        """
        os.makedirs(output_dir, exist_ok=True)
        results = []
        
        # Crawl theo batch để tăng tốc
        for batch_start in range(0, len(urls), batch_size):
            batch_end = min(batch_start + batch_size, len(urls))
            batch_urls = urls[batch_start:batch_end]
            
            print(f"[{batch_start + 1}-{batch_end}/{len(urls)}] Đang crawl batch {batch_start // batch_size + 1}...")
            
            # Crawl đồng thời trong batch
            batch_tasks = [self.crawl_chat_sex_detail(url) for url in batch_urls]
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            for idx, (url, detail) in enumerate(zip(batch_urls, batch_results)):
                if isinstance(detail, Exception):
                    print(f"   ❌ Lỗi {url}: {detail}")
                    detail = {'url': url, 'error': str(detail), 'crawled_at': datetime.now().isoformat()}
                
                results.append(detail)
                
                # Lưu từng file riêng
                if 'error' not in detail:
                    filename = url.split('/')[-1] or url.split('/')[-2]
                    filename = filename.replace('/', '_').replace('?', '_')
                    output_file = os.path.join(output_dir, f"chat_sex_{filename}.json")
                    with open(output_file, "w", encoding="utf-8") as f:
                        json.dump(detail, f, ensure_ascii=False, indent=2)
            
            # Delay ngắn giữa các batch
            if batch_end < len(urls):
                await asyncio.sleep(0.5)
        
        return results


async def main():
    """Main function để chạy crawler."""
    # Đọc danh sách links từ file JSON
    import glob
    
    # Tìm file links mới nhất
    link_files = glob.glob("data/chat_sex_links_*.json")
    if not link_files:
        print("❌ Không tìm thấy file links. Hãy chạy chat_sex_listing_crawler.py trước!")
        return
    
    latest_link_file = max(link_files, key=os.path.getctime)
    print(f"📂 Đọc links từ: {latest_link_file}")
    
    with open(latest_link_file, "r", encoding="utf-8") as f:
        urls = json.load(f)
    
    print(f"📊 Tổng cộng: {len(urls)} URL cần crawl")
    
    crawler = ChatSexDetailCrawler(
        delay_min=0.3,
        delay_max=0.8,
        headless=True  # Không mở Chrome
    )

    try:
        print("=" * 60)
        print("🚀 BẮT ĐẦU CRAWL CHAT SEX DETAILS")
        print("=" * 60)
        
        # Crawl tất cả
        results = await crawler.crawl_multiple(urls)
        
        # Lưu tổng hợp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"data/chat_sex_details_all_{timestamp}.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print("=" * 60)
        print(f"✅ HOÀN TẤT! Đã crawl {len(results)} gái chat sex")
        print(f"💾 Đã lưu vào: {output_file}")
        print("=" * 60)

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

