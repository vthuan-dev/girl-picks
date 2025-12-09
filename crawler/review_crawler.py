"""
Crawler để lấy review từ gaigu1.net (các khối .card-sub.card-sub-review).
Sử dụng Playwright để tải trang và trích xuất dữ liệu.
"""

import asyncio
import json
import os
import random
from datetime import datetime
from typing import Dict, List, Optional

from playwright.async_api import async_playwright, Browser


class ReviewCrawler:
    def __init__(
        self,
        max_concurrent: int = 3,
        delay_min: float = 1.0,
        delay_max: float = 2.5,
        headless: bool = False,  # mở Chrome thật khi cần debug
    ):
        self.browser: Optional[Browser] = None
        self.playwright = None
        self.max_concurrent = max_concurrent
        self.delay_min = delay_min
        self.delay_max = delay_max
        self.semaphore = asyncio.Semaphore(max_concurrent)
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

    async def _extract_reviews_from_html(self, html: str) -> List[Dict]:
        """Dùng một trang tạm thời để parse HTML và trích xuất review."""
        await self.init_browser()
        page = await self.browser.new_page()
        try:
            await page.set_content(html)
            reviews = await page.evaluate(
                """
                () => {
                  const data = [];
                  document.querySelectorAll('.card-sub.card-sub-review').forEach((card) => {
                    const reviewer = card.querySelector('.inf-owner a[href*="/user/"]')?.textContent?.trim() || '';
                    const dateText = card.querySelector('.inf-owner span')?.textContent || '';
                    const date = (dateText.split('•')[1] || '').trim();
                    const rating = card.querySelectorAll('.nf-since-owner .fa-star.pink').length;
                    const pTags = card.querySelectorAll('p');
                    const content = pTags[0]?.textContent?.trim() || '';

                    const tags = [];
                    if (pTags[1]) {
                      pTags[1].querySelectorAll('a').forEach((a) => tags.push(a.textContent.trim()));
                    }

                    const images = [];
                    card.querySelectorAll('.img-reviews img').forEach((img) => {
                      const src = img.getAttribute('src') || '';
                      if (src) images.push(src);
                    });

                    const originalLink = card.querySelector('.content-rating a[href*="/gai-goi/"]')?.getAttribute('href') || '';
                    const likes = (card.querySelector('[id^="likes_review_"]')?.textContent || '').trim();
                    const dislikes = (card.querySelector('[id^="dislikes_review_"]')?.textContent || '').trim();

                    data.push({ reviewer, date, rating, content, tags, images, originalLink, likes, dislikes });
                  });
                  return data;
                }
                """
            )
            return reviews
        finally:
            await page.close()

    async def crawl_reviews_api(self, base_url: str = "https://gaigu1.net", limit: int = 200, max_pages: int = 20) -> List[Dict]:
        """
        Gọi trực tiếp endpoint load_newfeeds_review để lấy nhiều review.
        """
        await self.init_browser()
        api_url = f"{base_url.rstrip('/')}/ajax/load_newfeeds_review"
        all_reviews: List[Dict] = []
        seen_keys = set()

        # Tạo một page để lấy cookie/session trước khi gọi fetch
        page = await self.browser.new_page()
        await page.set_extra_http_headers(
            {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
            }
        )
        await page.goto(base_url, wait_until="domcontentloaded", timeout=45000)

        try:
            for page_num in range(1, max_pages + 1):
                html = ""
                status = 0
                try:
                    # Gọi qua fetch trong page để include cookie/clearance, credentials: include
                    result = await page.evaluate(
                        """async ({ apiUrl, pageNum, origin, referer }) => {
                            const form = new URLSearchParams();
                            form.set('page', pageNum.toString());
                            form.set('p', pageNum.toString());
                            const res = await fetch(apiUrl, {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                    'X-Requested-With': 'XMLHttpRequest',
                                    'Origin': origin,
                                    'Referer': referer,
                                    'Accept': '*/*',
                                },
                                body: form
                            });
                            const text = await res.text();
                            return { status: res.status, text };
                        }""",
                        {"apiUrl": api_url, "pageNum": page_num, "origin": base_url, "referer": base_url},
                    )
                    status = result.get("status", 0)
                    html = result.get("text", "")
                except Exception as e:
                    print(f"⚠️ Lỗi fetch API page {page_num}: {e}")

                if status == 403:
                    print(f"⚠️ API page {page_num} trả 403, dừng (có thể bị WAF/captcha).")
                    break

                if not html or len(html) < 20:
                    print(f"⚠️ Trang API {page_num} không có dữ liệu, dừng.")
                    break

                reviews = await self._extract_reviews_from_html(html)
                added = 0
                for r in reviews:
                    key = f"{r.get('reviewer','')}|{r.get('date','')}|{r.get('content','')}"
                    if key not in seen_keys:
                        seen_keys.add(key)
                        all_reviews.append(r)
                        added += 1
                        if len(all_reviews) >= limit:
                            break

                print(f"API page {page_num}: +{added}, tổng {len(all_reviews)}")
                if added == 0:
                    print("⚠️ Không có review mới, dừng.")
                    break
                if len(all_reviews) >= limit:
                    break

                await asyncio.sleep(random.uniform(self.delay_min, self.delay_max))

            print(f"✅ API thu được {len(all_reviews)} review (target {limit})")
            return all_reviews
        finally:
            await page.close()

    async def crawl_reviews_page(self, url: str, limit: int = 200, max_scrolls: int = 60) -> List[Dict]:
        """
        Crawl review từ 1 trang, cố gắng scroll / load-more để lấy ~limit review.

        Args:
            url: Trang cần crawl (ví dụ: https://gaigu1.net/)
            limit: Số review tối đa muốn lấy
            max_scrolls: Số lần scroll / click "xem thêm" tối đa
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
            await page.goto(url, wait_until="networkidle", timeout=60000)
            await asyncio.sleep(2)

            all_reviews: List[Dict] = []
            seen_keys = set()
            last_count = 0

            for i in range(max_scrolls):
                # Scroll xuống cuối trang để load thêm review (nếu có)
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
                await page.wait_for_timeout(1500)

                # Thử click các nút "xem thêm" nếu tồn tại (ưu tiên #nf_show_more)
                try:
                    load_more = page.locator('#nf_show_more')
                    if await load_more.count() > 0:
                        await load_more.first.click(timeout=3000)
                        await page.wait_for_timeout(7000)  # đợi lâu hơn theo yêu cầu
                    else:
                        await page.evaluate(
                            """
                            () => {
                              const selectors = [
                                '.nf-load-more',
                                '.btn-view-more',
                                '.btn-load-more',
                                '.load-more',
                                'a[href="#more-review"]'
                              ];
                              for (const sel of selectors) {
                                const btn = document.querySelector(sel);
                                if (btn && !btn.dataset._clicked) {
                                  btn.dataset._clicked = '1';
                                  btn.click();
                                  break;
                                }
                              }
                            }
                            """
                        )
                        await page.wait_for_timeout(7000)
                except Exception:
                    pass

                reviews = await page.evaluate(
                    """
                    () => {
                      const data = [];
                      document.querySelectorAll('.card-sub.card-sub-review').forEach((card) => {
                        const reviewer = card.querySelector('.inf-owner a[href*="/user/"]')?.textContent?.trim() || '';
                        const dateText = card.querySelector('.inf-owner span')?.textContent || '';
                        const date = (dateText.split('•')[1] || '').trim();
                        const rating = card.querySelectorAll('.nf-since-owner .fa-star.pink').length;
                        const pTags = card.querySelectorAll('p');
                        const content = pTags[0]?.textContent?.trim() || '';

                        const tags = [];
                        if (pTags[1]) {
                          pTags[1].querySelectorAll('a').forEach((a) => tags.push(a.textContent.trim()));
                        }

                        const images = [];
                        card.querySelectorAll('.img-reviews img').forEach((img) => {
                          const src = img.getAttribute('src') || '';
                          if (src) images.push(src);
                        });

                        const originalLink = card.querySelector('.content-rating a[href*="/gai-goi/"]')?.getAttribute('href') || '';
                        const likes = (card.querySelector('[id^="likes_review_"]')?.textContent || '').trim();
                        const dislikes = (card.querySelector('[id^="dislikes_review_"]')?.textContent || '').trim();

                        data.push({ reviewer, date, rating, content, tags, images, originalLink, likes, dislikes });
                      });
                      return data;
                    }
                    """
                )

                added_this_round = 0
                for r in reviews:
                    key = f"{r.get('reviewer','')}|{r.get('date','')}|{r.get('content','')}"
                    if key not in seen_keys:
                        seen_keys.add(key)
                        all_reviews.append(r)
                        added_this_round += 1
                        if len(all_reviews) >= limit:
                            break

                print(f"🔁 Vòng {i+1}: tổng {len(all_reviews)} review (mới {added_this_round})")

                if len(all_reviews) >= limit:
                    break

                # Nếu không load thêm được review nào nữa thì dừng
                if len(all_reviews) <= last_count:
                    print("⚠️ Không thấy thêm review mới, dừng scroll.")
                    break
                last_count = len(all_reviews)

                # Random delay nhỏ để tránh pattern bot
                await asyncio.sleep(random.uniform(self.delay_min, self.delay_max))

            print(f"✅ Thu được {len(all_reviews)} review (target {limit})")
            return all_reviews
        except Exception as e:
            print(f"❌ Lỗi crawl {url}: {e}")
            return []
        finally:
            await page.close()

    def save_to_json(self, reviews: List[Dict], filename: Optional[str] = None) -> str:
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"reviews_{timestamp}.json"

        data_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(data_dir, exist_ok=True)
        filepath = os.path.join(data_dir, filename)

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(reviews, f, ensure_ascii=False, indent=2)

        print(f"💾 Đã lưu {len(reviews)} review vào {filepath}")
        return filepath


async def main():
    import sys

    url = "https://gaigu1.net/"
    limit = 200
    use_api = True

    if len(sys.argv) > 1:
        url = sys.argv[1]
    if len(sys.argv) > 2:
        try:
            limit = int(sys.argv[2])
        except ValueError:
            pass
    if len(sys.argv) > 3:
        use_api = sys.argv[3].lower() not in ["false", "0", "no"]

    crawler = ReviewCrawler(max_concurrent=3, delay_min=1.0, delay_max=2.5)
    try:
        if use_api:
            reviews = await crawler.crawl_reviews_api(base_url=url, limit=limit)
            if len(reviews) < limit // 2:
                # fallback sang scroll nếu API trả ít
                extra = await crawler.crawl_reviews_page(url, limit=limit - len(reviews))
                reviews.extend(extra)
        else:
            reviews = await crawler.crawl_reviews_page(url, limit=limit)
        crawler.save_to_json(reviews)
    finally:
        await crawler.close_browser()


if __name__ == "__main__":
    asyncio.run(main())

