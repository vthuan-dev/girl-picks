"""
Crawler để crawl phim sex từ gaigu1.net/phim-sex
Sử dụng Playwright để crawl dữ liệu đầy đủ
"""

import asyncio
import json
import os
import re
import random
from datetime import datetime
from typing import List, Dict, Optional
from playwright.async_api import async_playwright, Browser, Page

class MovieCrawler:
    def __init__(self, max_concurrent: int = 3, delay_min: float = 2.0, delay_max: float = 5.0):
        """
        Args:
            max_concurrent: Số lượng requests đồng thời tối đa (mặc định: 3)
            delay_min: Delay tối thiểu giữa các requests (giây)
            delay_max: Delay tối đa giữa các requests (giây)
        """
        self.browser: Optional[Browser] = None
        self.playwright = None
        self.base_url = 'https://gaigu1.net/phim-sex'
        self.max_concurrent = max_concurrent
        self.delay_min = delay_min
        self.delay_max = delay_max
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.file_lock = asyncio.Lock()  # Lock để đảm bảo thread-safe khi ghi file
        
    async def init_browser(self):
        """Khởi tạo browser"""
        if not self.browser:
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
        return self.browser
    
    async def close_browser(self):
        """Đóng browser"""
        try:
            if self.browser:
                await self.browser.close()
            if self.playwright:
                await self.playwright.stop()
        except Exception as e:
            print(f"⚠️  Lỗi khi đóng browser: {e}")
    
    async def crawl_movies_list(self, page_number: int = 1, limit: int = 60) -> List[Dict]:
        """Crawl danh sách phim từ trang listing
        
        Args:
            page_number: Số trang (bắt đầu từ 1)
            limit: Số lượng phim tối đa (mặc định 60)
        """
        await self.init_browser()
        
        url = f"{self.base_url}?page={page_number}" if page_number > 1 else self.base_url
        print(f"🔍 Đang crawl: {url}")
        
        page = await self.browser.new_page()
        
        try:
            # Set realistic headers
            await page.set_extra_http_headers({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'https://gaigu1.net/',
            })
            
            await page.goto(url, wait_until='networkidle', timeout=60000)
            await asyncio.sleep(3)  # Wait for content to load
            
            # Wait for the content container - try multiple selectors
            try:
                await page.wait_for_selector('div.content-row, .row.content-row, [class*="content-row"], .col-6.col-sm-6.col-md-4', timeout=15000)
            except:
                print("⚠️  Không tìm thấy content-row, thử tiếp...")
                await asyncio.sleep(2)
            
            # Debug: Check page content
            page_title = await page.title()
            page_content = await page.content()
            print(f"📄 Page title: {page_title}")
            
            # Check pagination để detect số trang cuối cùng (chỉ check, không return ngay)
            max_page_from_pagination = await page.evaluate("""
                () => {
                    // Tìm pagination và lấy số trang cuối cùng
                    const pagination = document.querySelector('.pagination, [class*="pagination"]');
                    if (pagination) {
                        const pageLinks = pagination.querySelectorAll('a, button, [class*="page"]');
                        let maxPage = 0;
                        pageLinks.forEach(link => {
                            const text = link.textContent?.trim() || '';
                            const pageNum = parseInt(text);
                            if (!isNaN(pageNum) && pageNum > maxPage) {
                                maxPage = pageNum;
                            }
                        });
                        return maxPage;
                    }
                    return 0;
                }
            """)
            
            if max_page_from_pagination > 0:
                print(f"📊 Số trang tối đa từ pagination: {max_page_from_pagination}")
                if page_number > max_page_from_pagination:
                    print(f"⚠️  Trang {page_number} vượt quá số trang tối đa ({max_page_from_pagination}), dừng lại")
                    return []
            
            # Extract movies data trước, sau đó mới check "không tìm thấy"
            # Vì có thể text "không tìm thấy" nằm ở footer/header nhưng vẫn có data
            
            # Extract movies data using XPath and CSS selectors
            movies = await page.evaluate("""
                () => {
                    const results = [];
                    
                    // Tìm container bằng CSS selector (ưu tiên hơn XPath)
                    let container = document.querySelector('.content-left') || 
                                   document.querySelector('.row.content-row') ||
                                   document.querySelector('[class*="content-row"]');
                    
                    // Fallback: XPath nếu CSS không tìm được
                    if (!container) {
                        try {
                            const xpathResult = document.evaluate(
                                '/html/body/div[5]/div[1]/div[3]/div[1]/div[1]/div[1]',
                                document,
                                null,
                                XPathResult.FIRST_ORDERED_NODE_TYPE,
                                null
                            );
                            container = xpathResult.singleNodeValue;
                        } catch (e) {
                            console.log('XPath error:', e);
                        }
                    }
                    
                    console.log('Container found:', !!container);
                    
                    // Tìm TẤT CẢ cards trực tiếp từ container hoặc toàn trang
                    let cards = [];
                    
                    if (container) {
                        // Tìm tất cả cards có class col-6, col-md-4, etc. trong container
                        cards = Array.from(container.querySelectorAll(
                            'div.col-6.col-sm-6.col-md-4, ' +
                            'div[class*="col-6"][class*="col-md-4"], ' +
                            'div[class*="col-"]'
                        ));
                        console.log('Cards from container:', cards.length);
                        
                        // Filter: chỉ lấy cards có link /phim-sex-chi-tiet/
                        cards = cards.filter(card => {
                            const link = card.querySelector('a[href*="/phim-sex-chi-tiet"]');
                            return link !== null;
                        });
                        console.log('Cards with phim-sex-chi-tiet links:', cards.length);
                    }
                    
                    // Fallback: Nếu không có container hoặc không tìm được cards
                    if (cards.length === 0) {
                        // Tìm tất cả cards có class col-6 col-md-4 và có link /phim-sex-chi-tiet/
                        cards = Array.from(document.querySelectorAll(
                            'div.col-6.col-sm-6.col-md-4, ' +
                            'div[class*="col-6"][class*="col-md-4"]'
                        )).filter(card => {
                            const link = card.querySelector('a[href*="/phim-sex-chi-tiet"]');
                            return link !== null;
                        });
                        console.log('Cards from page-wide search:', cards.length);
                    }
                    
                    // Fallback 2: Tìm từ links và lấy parent card
                    if (cards.length === 0) {
                        const allLinks = Array.from(document.querySelectorAll('a[href*="/phim-sex-chi-tiet"]'));
                        console.log('Total phim-sex-chi-tiet links found:', allLinks.length);
                        
                        const uniqueCards = new Set();
                        allLinks.forEach(link => {
                            const href = link.getAttribute('href') || link.href || '';
                            if (href && href.includes('/phim-sex-chi-tiet/')) {
                                let card = link.closest('div[class*="col-"]');
                                if (card) {
                                    uniqueCards.add(card);
                                }
                            }
                        });
                        cards = Array.from(uniqueCards);
                        console.log('Cards from links:', cards.length);
                    }
                    
                    console.log('Final cards count:', cards.length);
                    
                    cards.forEach((card, index) => {
                        try {
                            const movie = {
                                title: '',
                                thumbnail: '',
                                duration: '',
                                views: 0,
                                rating: '',
                                detailUrl: '',
                                category: '',
                                uploadDate: ''
                            };
                            
                            // Extract detail URL - ưu tiên tìm link /phim-sex/ hoặc /phim-sex-chi-tiet/
                            let detailUrl = '';
                            
                            // Method 1: Nếu card chính là link
                            if (card.tagName === 'A' && card.href && (card.href.includes('/phim-sex/') || card.href.includes('/phim-sex-chi-tiet/'))) {
                                detailUrl = card.href;
                            }
                            
                            // Method 2: Tìm link /phim-sex/ hoặc /phim-sex-chi-tiet/ trong card (ưu tiên)
                            if (!detailUrl) {
                                const link = card.querySelector('a[href*="/phim-sex"]');
                                if (link) {
                                    detailUrl = link.getAttribute('href') || link.href || '';
                                }
                            }
                            
                            // Method 3: Tìm tất cả links trong card
                            if (!detailUrl) {
                                const allLinks = card.querySelectorAll('a');
                                for (let a of allLinks) {
                                    const href = a.getAttribute('href') || a.href || '';
                                    if (href && (href.includes('/phim-sex/') || href.includes('/phim-sex-chi-tiet/'))) {
                                        detailUrl = href;
                                        break;
                                    }
                                }
                            }
                            
                            // Method 4: Tìm từ onclick hoặc data attributes
                            if (!detailUrl) {
                                const onclick = card.getAttribute('onclick') || '';
                                const match = onclick.match(/\/phim-sex[^"'\s)]+/);
                                if (match) {
                                    detailUrl = match[0];
                                }
                            }
                            
                            // Normalize URL
                            if (detailUrl) {
                                if (detailUrl.startsWith('//')) {
                                    detailUrl = 'https:' + detailUrl;
                                } else if (detailUrl.startsWith('/')) {
                                    detailUrl = 'https://gaigu1.net' + detailUrl;
                                } else if (!detailUrl.startsWith('http')) {
                                    detailUrl = 'https://gaigu1.net/' + detailUrl;
                                }
                                movie.detailUrl = detailUrl;
                            }
                            
                            // Extract thumbnail if not already extracted
                            if (!movie.thumbnail) {
                                
                                // Extract thumbnail image
                                const img = card.querySelector('img');
                                if (img) {
                                    let src = img.getAttribute('src') || img.getAttribute('data-src') || img.src || '';
                                    if (src) {
                                        if (src.startsWith('//')) {
                                            src = 'https:' + src;
                                        } else if (src.startsWith('/')) {
                                            src = 'https://gaigu1.net' + src;
                                        } else if (!src.startsWith('http')) {
                                            src = 'https://gaigu1.net/' + src;
                                        }
                                        movie.thumbnail = src;
                                    }
                                }
                            }
                            
                            // Extract title - ưu tiên .content-title (theo HTML structure thực tế)
                            const titleSelectors = [
                                '.content-title',  // Chính xác nhất theo HTML structure
                                'span.content-title',
                                'a[href*="/phim-sex-chi-tiet"] .content-title',
                                'a[href*="/phim-sex-chi-tiet"] span',
                                'a[href*="/phim-sex-chi-tiet"]',  // Fallback: lấy text từ link
                            ];
                            
                            for (const selector of titleSelectors) {
                                const titleEl = card.querySelector(selector);
                                if (titleEl) {
                                    let titleText = titleEl.textContent?.trim() || titleEl.getAttribute('title') || '';
                                    // Loại bỏ các text không phải title (như "Đăng Nhập", "Đăng ký", etc.)
                                    if (titleText && 
                                        !titleText.toLowerCase().includes('đăng nhập') &&
                                        !titleText.toLowerCase().includes('đăng ký') &&
                                        !titleText.toLowerCase().includes('login') &&
                                        !titleText.toLowerCase().includes('register') &&
                                        titleText.length > 3) {  // Title phải có ít nhất 3 ký tự
                                        movie.title = titleText;
                                        break;
                                    }
                                }
                            }
                            
                            // Nếu vẫn chưa có title, thử lấy từ img alt hoặc title attribute
                            if (!movie.title) {
                                const img = card.querySelector('img');
                                if (img) {
                                    const imgTitle = img.getAttribute('title') || img.getAttribute('alt') || '';
                                    if (imgTitle && 
                                        !imgTitle.toLowerCase().includes('đăng nhập') &&
                                        !imgTitle.toLowerCase().includes('login') &&
                                        imgTitle.length > 3) {
                                        movie.title = imgTitle.trim();
                                    }
                                }
                            }
                            
                            // Extract duration - look for time format like "02:20", "00:26"
                            const durationSelectors = [
                                '[class*="duration"]',
                                '[class*="time"]',
                                '.video-duration',
                                '[style*="position: absolute"]',
                                '[class*="overlay"]'
                            ];
                            for (const selector of durationSelectors) {
                                const durationEl = card.querySelector(selector);
                                if (durationEl) {
                                    const durationText = durationEl.textContent?.trim();
                                    const durationMatch = durationText.match(/(\\d{1,2}:\\d{2})/);
                                    if (durationMatch) {
                                        movie.duration = durationMatch[1];
                                        break;
                                    }
                                }
                            }
                            
                            // Extract views - look for "X.XK lượt xem" or "XK lượt xem"
                            const viewsSelectors = [
                                '[class*="view"]',
                                '[class*="luot-xem"]',
                                '.views',
                                '[class*="viewed"]'
                            ];
                            for (const selector of viewsSelectors) {
                                const viewsEl = card.querySelector(selector);
                                if (viewsEl) {
                                    const viewsText = viewsEl.textContent?.trim() || '';
                                    // Extract views (e.g., "1.8K lượt xem" -> 1800, "35.2K" -> 35200)
                                    const viewsMatch = viewsText.match(/(\\d+[.,]?\\d*)\\s*K/i);
                                    if (viewsMatch) {
                                        const num = parseFloat(viewsMatch[1].replace(',', '.'));
                                        movie.views = Math.round(num * 1000);
                                        break;
                                    } else {
                                        const numMatch = viewsText.match(/(\\d+)/);
                                        if (numMatch) {
                                            movie.views = parseInt(numMatch[1]);
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            // Extract rating (e.g., "100%" with thumbs up)
                            const ratingSelectors = [
                                '[class*="rating"]',
                                '[class*="percent"]',
                                '.rating',
                                '[class*="thumbs"]'
                            ];
                            for (const selector of ratingSelectors) {
                                const ratingEl = card.querySelector(selector);
                                if (ratingEl) {
                                    movie.rating = ratingEl.textContent?.trim() || '';
                                    if (movie.rating) break;
                                }
                            }
                            
                            // Extract category/tags
                            const categoryEl = card.querySelector('[class*="category"], [class*="tag"], .category');
                            if (categoryEl) {
                                movie.category = categoryEl.textContent?.trim() || '';
                            }
                            
                            // Only add if we have at least title and thumbnail
                            if (movie.title && movie.title.length > 0 && movie.thumbnail) {
                                results.push(movie);
                            }
                        } catch (e) {
                            console.error('Error extracting movie:', e);
                        }
                    });
                    
                    return results;
                }
            """)
            
            # Debug: Print raw results
            print(f"📊 Raw results: {len(movies)} items")
            if len(movies) > 0:
                print(f"📝 Sample: {json.dumps(movies[0], ensure_ascii=False, indent=2)[:200]}...")
            
            # Filter and limit - relax requirements
            valid_movies = []
            for m in movies:
                # Chấp nhận nếu có detailUrl hoặc có title
                if (m.get('detailUrl') or m.get('title')) and m.get('thumbnail'):
                    valid_movies.append(m)
                elif m.get('detailUrl'):  # Chấp nhận nếu có detailUrl dù không có thumbnail
                    valid_movies.append(m)
            
            if limit:
                valid_movies = valid_movies[:limit]
            
            print(f"✅ Đã crawl được {len(valid_movies)} phim từ {len(movies)} items")
            
            # Nếu không có movies, check xem có phải do "không tìm thấy" không
            if len(valid_movies) == 0:
                # Check trong content area xem có thông báo "không tìm thấy"
                has_no_results = await page.evaluate("""
                    () => {
                        // Tìm content area chính (không phải footer/header)
                        const contentArea = document.querySelector('.content-row, .row.content-row, [class*="content-row"], main, .main-content, #content, .content');
                        if (contentArea) {
                            const text = contentArea.textContent?.toLowerCase() || '';
                            // Check xem có text "không tìm thấy" và không có cards
                            const hasNoResultsText = text.includes('không tìm thấy') || text.includes('không có') || text.includes('no results');
                            // Check xem có cards không
                            const hasCards = contentArea.querySelectorAll('a[href*="/phim-sex/"]').length > 0;
                            return hasNoResultsText && !hasCards;
                        }
                        return false;
                    }
                """)
                
                if has_no_results:
                    print(f"⚠️  Trang {page_number} có thông báo 'không tìm thấy' và không có cards")
                elif len(movies) > 0:
                    print(f"⚠️  Có {len(movies)} items nhưng không đủ điều kiện (cần detailUrl hoặc title + thumbnail)")
                    print(f"📋 Sample item: {json.dumps(movies[0] if movies else {}, ensure_ascii=False)}")
                else:
                    print(f"⚠️  Trang {page_number} không tìm thấy movies (có thể do selector sai hoặc bot detection)")
                    # Debug: In ra một số thông tin về page
                    debug_info = await page.evaluate("""
                        () => {
                            return {
                                hasPhimSexLinks: document.querySelectorAll('a[href*="/phim-sex/"]').length,
                                hasColElements: document.querySelectorAll('[class*="col-"]').length,
                                hasImages: document.querySelectorAll('img').length,
                                bodyTextLength: document.body?.textContent?.length || 0
                            };
                        }
                    """)
                    print(f"📊 Debug info: {json.dumps(debug_info, ensure_ascii=False)}")
            else:
                # In sample movie để debug
                if len(valid_movies) > 0:
                    print(f"📋 Sample movie: {valid_movies[0].get('title', 'N/A')[:50]}...")
            
            return valid_movies
            
        except Exception as e:
            print(f"❌ Lỗi khi crawl movies list: {str(e)}")
            import traceback
            traceback.print_exc()
            return []
        finally:
            await page.close()
    
    def save_to_json(self, movies: List[Dict], filename: str = None) -> Dict:
        """Lưu vào file JSON"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"crawled_movies_{timestamp}.json"
        
        # Tạo thư mục data nếu chưa có
        data_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(data_dir, exist_ok=True)
        
        filepath = os.path.join(data_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(movies, f, ensure_ascii=False, indent=2)
        
        print(f"💾 Đã lưu {len(movies)} phim vào {filepath}")
        return {"saved": len(movies), "file": filepath}
    
    async def crawl_all_listing_pages(self, start_page: int = 1, max_pages: int = None, save_interval: int = 50, concurrent_pages: int = 3):
        """Crawl tất cả các trang listing
        
        Args:
            start_page: Trang bắt đầu
            max_pages: Số trang tối đa (None = tự động detect)
            save_interval: Lưu file sau mỗi N trang (mặc định: 50)
        
        Returns:
            Dict: {"movies": List[Dict], "listing_file": str}
        """
        all_movies = []
        current_page = start_page
        
        # Tạo filename với timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        listing_file = f"listing_movies_{timestamp}.json"
        
        print(f"\n{'='*50}")
        print(f"📋 GIAI ĐOẠN 1: Crawl listing pages")
        if max_pages:
            print(f"   Từ trang {start_page} đến {start_page + max_pages - 1}")
        else:
            print(f"   Từ trang {start_page} (tự động detect số trang)")
        print(f"   💾 Lưu sau mỗi {save_interval} trang")
        print(f"   📁 File: {listing_file}")
        print(f"{'='*50}\n")
        
        consecutive_empty = 0  # Đếm số trang rỗng liên tiếp
        
        while True:
            if max_pages and current_page > start_page + max_pages - 1:
                break
            
            print(f"\n📄 Trang {current_page}")
            movies = await self.crawl_movies_list(current_page, 60)
            
            # Kiểm tra nếu trang rỗng
            if not movies or len(movies) == 0:
                consecutive_empty += 1
                print(f"⚠️  Trang {current_page} không có dữ liệu (lần {consecutive_empty})")
                
                # Nếu 2 trang liên tiếp rỗng → hết trang
                if consecutive_empty >= 2:
                    print(f"🛑 Đã hết trang (2 trang liên tiếp rỗng), dừng lại")
                    break
            else:
                consecutive_empty = 0  # Reset counter nếu có data
                all_movies.extend(movies)
                print(f"✅ Đã có tổng cộng {len(all_movies)} phim\n")
                
                # Lưu theo interval để không mất data nếu stop
                if current_page % save_interval == 0:
                    print(f"💾 Đang lưu checkpoint (sau {current_page} trang)...")
                    result = self.save_to_json(all_movies, listing_file)
                    print(f"✅ Đã lưu {len(all_movies)} phim vào {result.get('file', '')}\n")
            
            # Delay between pages (giảm xuống để nhanh hơn)
            if consecutive_empty == 0:  # Chỉ delay nếu có data
                print(f"⏳ Đợi 2 giây trước khi crawl trang tiếp theo...\n")
                await asyncio.sleep(2)  # Giảm từ 5s xuống 2s
            else:
                # Delay ngắn hơn nếu trang rỗng (có thể đang check)
                await asyncio.sleep(1)
            
            current_page += 1
        
        # Lưu lần cuối (tất cả data)
        print(f"💾 Đang lưu file cuối cùng...")
        result = self.save_to_json(all_movies, listing_file)
        
        print(f"\n✅ Hoàn thành crawl listing: {len(all_movies)} phim")
        print(f"💾 Đã lưu danh sách vào: {result.get('file', '')}\n")
        
        return {
            "movies": all_movies,
            "listing_file": result.get("file", "")
        }
    
    async def _crawl_one_movie_detail(self, movie: Dict, index: int, total: int, save_individual: bool = True, save_combined: bool = False, combined_file: str = None, all_details: list = None) -> tuple:
        """Crawl detail cho 1 phim (dùng trong concurrent crawling)
        
        Returns:
            (success: bool, movie: Dict)
        """
        async with self.semaphore:  # Giới hạn số lượng concurrent
            if not movie.get('detailUrl'):
                return (False, movie)
            
            movie_title = movie.get('title', 'N/A')[:40]
            print(f"[{index}/{total}] 🔍 Đang crawl: {movie_title}...")
            
            try:
                # Random delay để tránh pattern detection
                delay = random.uniform(self.delay_min, self.delay_max)
                await asyncio.sleep(delay)
                
                detail_data = await self.crawl_movie_detail(movie['detailUrl'])
                if detail_data:
                    # Merge detail data
                    detail_url = movie.get('detailUrl')
                    movie.update(detail_data)
                    movie['detailUrl'] = detail_url
                    
                    # Lưu vào file riêng nếu được yêu cầu
                    if save_individual:
                        filepath = self.save_movie_detail_to_file(movie)
                        if filepath:
                            print(f"[{index}/{total}] ✅ {movie_title[:30]}... → {os.path.basename(filepath)}")
                        else:
                            print(f"[{index}/{total}] ⚠️  Đã crawl nhưng không lưu được file")
                    
                    # Lưu vào combined file nếu được yêu cầu (incremental)
                    if save_combined and combined_file and all_details is not None:
                        async with self.file_lock:  # Thread-safe
                            all_details.append(movie)
                            # Lưu ngay sau mỗi item
                            try:
                                with open(combined_file, 'w', encoding='utf-8') as f:
                                    json.dump(all_details, f, ensure_ascii=False, indent=2)
                            except Exception as e:
                                print(f"⚠️  Lỗi khi lưu combined file: {e}")
                    
                    return (True, movie)
                else:
                    print(f"[{index}/{total}] ⚠️  Không crawl được: {movie_title[:30]}...")
                    return (False, movie)
            except Exception as e:
                print(f"[{index}/{total}] ❌ Lỗi: {movie_title[:30]}... - {str(e)}")
                return (False, movie)
    
    async def crawl_details_from_listing_file(self, listing_file: str, save_individual: bool = True, batch_size: int = None, save_combined: bool = False):
        """Đọc file listing và crawl detail cho từng phim (concurrent)
        
        Args:
            listing_file: Đường dẫn đến file JSON chứa danh sách phim
            save_individual: Nếu True, lưu mỗi phim vào file riêng với tên phim
            batch_size: Số lượng phim crawl mỗi batch (None = tất cả cùng lúc)
            save_combined: Nếu True, gộm tất cả vào 1 JSON file và lưu incremental
        """
        # Đọc file listing
        if not os.path.exists(listing_file):
            print(f"❌ Không tìm thấy file: {listing_file}")
            return None
        
        with open(listing_file, 'r', encoding='utf-8') as f:
            movies = json.load(f)
        
        # Lọc những phim có detailUrl
        valid_movies = [(i, movie) for i, movie in enumerate(movies, 1) if movie.get('detailUrl')]
        
        print(f"\n{'='*50}")
        print(f"🔍 GIAI ĐOẠN 2: Crawl detail cho {len(valid_movies)} phim")
        print(f"   Từ file: {listing_file}")
        print(f"   Lưu riêng từng file: {save_individual}")
        print(f"   Gộm vào 1 JSON: {save_combined}")
        print(f"   Concurrent: {self.max_concurrent} requests")
        print(f"   Delay: {self.delay_min}-{self.delay_max} giây")
        if batch_size:
            print(f"   Batch size: {batch_size}")
        print(f"{'='*50}\n")
        
        success_count = 0
        failed_count = 0
        
        # Tạo file combined nếu cần
        combined_file = None
        all_details = []
        if save_combined:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            combined_file = os.path.join("data", f"all_movies_details_{timestamp}.json")
            os.makedirs("data", exist_ok=True)
            print(f"💾 File gộm: {combined_file}\n")
        
        # Crawl theo batch hoặc tất cả cùng lúc
        if batch_size:
            # Crawl theo batch
            for batch_start in range(0, len(valid_movies), batch_size):
                batch_end = min(batch_start + batch_size, len(valid_movies))
                batch = valid_movies[batch_start:batch_end]
                
                print(f"\n📦 Batch {batch_start//batch_size + 1}: {len(batch)} phim\n")
                
                # Tạo tasks cho batch này
                tasks = [
                    self._crawl_one_movie_detail(movie, index, len(valid_movies), save_individual, save_combined, combined_file, all_details)
                    for index, movie in batch
                ]
                
                # Chờ tất cả tasks trong batch hoàn thành
                results = await asyncio.gather(*tasks)
                
                # Đếm kết quả
                for success, updated_movie in results:
                    if success:
                        success_count += 1
                    else:
                        failed_count += 1
                
                # Delay giữa các batch
                if batch_end < len(valid_movies):
                    batch_delay = random.uniform(5, 10)
                    print(f"\n⏳ Đợi {batch_delay:.1f} giây trước batch tiếp theo...\n")
                    await asyncio.sleep(batch_delay)
        else:
            # Crawl tất cả cùng lúc (giới hạn bởi semaphore)
            print(f"🚀 Bắt đầu crawl {len(valid_movies)} phim (concurrent: {self.max_concurrent})\n")
            
            tasks = [
                self._crawl_one_movie_detail(movie, index, len(valid_movies), save_individual, save_combined, combined_file, all_details)
                for index, movie in valid_movies
            ]
            
            results = await asyncio.gather(*tasks)
            
            # Đếm kết quả
            for success, updated_movie in results:
                if success:
                    success_count += 1
                else:
                    failed_count += 1
        
        # Lưu tất cả vào 1 file tổng hợp (nếu cần)
        if not save_individual:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            all_details_file = f"all_movie_details_{timestamp}.json"
            result = self.save_to_json(movies, all_details_file)
            print(f"\n💾 Đã lưu tất cả detail vào: {result.get('file', '')}")
        
        print(f"\n{'='*50}")
        print(f"✅ HOÀN THÀNH CRAWL DETAIL")
        print(f"   ✅ Thành công: {success_count}")
        print(f"   ❌ Thất bại: {failed_count}")
        if len(valid_movies) > 0:
            print(f"   📊 Tỷ lệ: {success_count/len(valid_movies)*100:.1f}%")
        print(f"{'='*50}\n")
        
        return {
            "total": len(valid_movies),
            "success": success_count,
            "failed": failed_count
        }
    
    async def crawl_movie_detail(self, detail_url: str) -> Optional[Dict]:
        """Crawl chi tiết phim từ detail page
        
        Args:
            detail_url: URL của trang detail phim
            
        Returns:
            Dict chứa thông tin chi tiết phim hoặc None nếu lỗi
        """
        await self.init_browser()
        
        print(f"🔍 Đang crawl detail: {detail_url}")
        
        page = await self.browser.new_page()
        
        try:
            # Set realistic headers
            await page.set_extra_http_headers({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'https://gaigu1.net/phim-sex',
            })
            
            await page.goto(detail_url, wait_until='networkidle', timeout=60000)
            await asyncio.sleep(3)  # Wait for video player to load
            
            # Check for captcha
            page_content = await page.content()
            if 'verify' in page_content.lower() and 'human' in page_content.lower():
                print("⚠️  Phát hiện captcha, đợi thêm...")
                await asyncio.sleep(5)
                await page.wait_for_selector('video, .video-player, [class*="video"]', timeout=10000)
            
            # Extract video details
            movie_detail = await page.evaluate("""
                () => {
                    const data = {
                        title: '',
                        description: '',
                        videoUrl: '',
                        videoSources: [],
                        poster: '',
                        duration: '',
                        views: 0,
                        rating: '',
                        category: '',
                        tags: [],
                        uploadDate: ''
                    };
                    
                    // Extract title - ưu tiên các selector chính xác
                    const titleSelectors = [
                        'h1',
                        '.content-title',
                        '[class*="content-title"]',
                        'h2',
                        '.title',
                        '[class*="title"]:not([class*="login"]):not([class*="register"])'
                    ];
                    
                    for (const selector of titleSelectors) {
                        const titleEl = document.querySelector(selector);
                        if (titleEl) {
                            let titleText = titleEl.textContent?.trim() || '';
                            // Loại bỏ các text không phải title
                            if (titleText && 
                                !titleText.toLowerCase().includes('đăng nhập') &&
                                !titleText.toLowerCase().includes('đăng ký') &&
                                !titleText.toLowerCase().includes('login') &&
                                !titleText.toLowerCase().includes('register') &&
                                !titleText.toLowerCase().includes('sign in') &&
                                !titleText.toLowerCase().includes('sign up') &&
                                titleText.length > 3) {
                                data.title = titleText;
                                break;
                            }
                        }
                    }
                    
                    // Fallback: Lấy từ URL nếu không tìm được title
                    if (!data.title || data.title.length < 3) {
                        const urlMatch = window.location.pathname.match(/phim-sex-chi-tiet\/\d+\/(.+)/);
                        if (urlMatch && urlMatch[1]) {
                            // Decode URL và format lại
                            data.title = decodeURIComponent(urlMatch[1]).replace(/-/g, ' ').trim();
                        }
                    }
                    
                    // Extract video element - ưu tiên video#video_html5_api
                    let videoEl = document.querySelector('video#video_html5_api');
                    
                    // Fallback: Tìm bằng XPath nếu CSS selector không tìm được
                    if (!videoEl) {
                        try {
                            const xpathResult = document.evaluate(
                                '/html/body/div[5]/div[3]/div[2]/div[1]/div[1]/div/video',
                                document,
                                null,
                                XPathResult.FIRST_ORDERED_NODE_TYPE,
                                null
                            );
                            videoEl = xpathResult.singleNodeValue;
                        } catch (e) {
                            console.log('XPath error:', e);
                        }
                    }
                    
                    // Fallback 2: Tìm bất kỳ video element nào
                    if (!videoEl) {
                        videoEl = document.querySelector('video.vjs-tech, video');
                    }
                    
                    if (videoEl) {
                        console.log('Video element found:', videoEl.id, videoEl.className);
                        // Helper function để normalize URL và validate
                        function normalizeVideoUrl(url) {
                            if (!url) return null;
                            
                            // Nếu đã là full URL (có http/https), giữ nguyên
                            if (url.startsWith('http://') || url.startsWith('https://')) {
                                return url;
                            }
                            
                            // Nếu là protocol-relative (//domain.com/...), thêm https:
                            if (url.startsWith('//')) {
                                return 'https:' + url;
                            }
                            
                            // Nếu là relative URL, thêm domain mặc định (nhưng thường video sẽ là full URL)
                            // Trong trường hợp này, video thường là full URL từ CDN
                            return 'https://gaigu1.net' + url;
                        }
                        
                        // Get main video URL from src attribute (đây là video chính)
                        const videoSrc = videoEl.getAttribute('src');
                        if (videoSrc) {
                            const normalizedUrl = normalizeVideoUrl(videoSrc);
                            if (normalizedUrl && normalizedUrl.includes('.mp4')) {
                                data.videoUrl = normalizedUrl;
                            }
                        }
                        
                        // Get poster image (thumbnail của video player)
                        const poster = videoEl.getAttribute('poster');
                        if (poster) {
                            data.poster = normalizeVideoUrl(poster);
                        }
                        
                        // Get all source elements for different qualities (720p, 480p, 360p)
                        const sources = videoEl.querySelectorAll('source');
                        console.log('Found sources:', sources.length);
                        
                        sources.forEach((source, index) => {
                            const src = source.getAttribute('src');
                            const type = source.getAttribute('type') || 'video/mp4';
                            const label = source.getAttribute('label') || '';
                            const res = source.getAttribute('res') || '';
                            
                            if (src) {
                                // Normalize URL - giữ nguyên domain từ HTML
                                const fullUrl = normalizeVideoUrl(src);
                                if (fullUrl && fullUrl.includes('.mp4')) {
                                    // Tạo label nếu không có (từ res hoặc từ URL)
                                    let qualityLabel = label || res || '';
                                    if (!qualityLabel && src.includes('_')) {
                                        // Extract quality từ filename: 77793_720p.mp4 -> 720p
                                        const qualityMatch = src.match(/_(\d+p)\.mp4/);
                                        if (qualityMatch) {
                                            qualityLabel = qualityMatch[1];
                                        }
                                    }
                                    
                                    data.videoSources.push({
                                        url: fullUrl,
                                        type: type,
                                        label: qualityLabel,
                                        resolution: res || qualityLabel
                                    });
                                    console.log(`Source ${index + 1}: ${qualityLabel} - ${fullUrl}`);
                                }
                            }
                        });
                        
                        // Sort sources by resolution (highest first)
                        data.videoSources.sort((a, b) => {
                            const resA = parseInt(a.resolution || a.label || '0');
                            const resB = parseInt(b.resolution || b.label || '0');
                            return resB - resA;
                        });
                        
                        // Nếu có videoUrl nhưng chưa có trong videoSources, thêm vào
                        if (data.videoUrl && data.videoSources.length === 0) {
                            data.videoSources.push({
                                url: data.videoUrl,
                                type: 'video/mp4',
                                label: 'SD',
                                resolution: '360'
                            });
                        }
                        
                        // Nếu videoUrl chưa có nhưng có sources, lấy source đầu tiên làm videoUrl
                        if (!data.videoUrl && data.videoSources.length > 0) {
                            data.videoUrl = data.videoSources[0].url;
                        }
                        
                        // Debug: Log domain để verify
                        if (data.videoUrl) {
                            try {
                                const urlObj = new URL(data.videoUrl);
                                console.log('Video domain:', urlObj.hostname);
                            } catch (e) {
                                console.log('Video URL:', data.videoUrl);
                            }
                        }
                    }
                    
                    // Extract description
                    const descEl = document.querySelector('[class*="description"], [class*="content"], .content p, [class*="bio"]');
                    if (descEl) {
                        data.description = descEl.textContent?.trim() || '';
                    }
                    
                    // Extract views
                    const viewsEl = document.querySelector('[class*="view"], [class*="luot-xem"], .views');
                    if (viewsEl) {
                        const viewsText = viewsEl.textContent?.trim() || '';
                        const viewsMatch = viewsText.match(/(\\d+[.,]?\\d*)\\s*K/i);
                        if (viewsMatch) {
                            const num = parseFloat(viewsMatch[1].replace(',', '.'));
                            data.views = Math.round(num * 1000);
                        } else {
                            const numMatch = viewsText.match(/(\\d+)/);
                            if (numMatch) {
                                data.views = parseInt(numMatch[1]);
                            }
                        }
                    }
                    
                    // Extract rating
                    const ratingEl = document.querySelector('[class*="rating"], [class*="percent"]');
                    if (ratingEl) {
                        data.rating = ratingEl.textContent?.trim() || '';
                    }
                    
                    // Extract category
                    const categoryEl = document.querySelector('[class*="category"], [class*="tag"], .category');
                    if (categoryEl) {
                        data.category = categoryEl.textContent?.trim() || '';
                    }
                    
                    // Extract tags
                    document.querySelectorAll('[class*="tag"], .hashtag, a[href*="tag"]').forEach(tag => {
                        const tagText = tag.textContent?.trim();
                        if (tagText && tagText.length > 0 && tagText.length < 50) {
                            data.tags.push(tagText);
                        }
                    });
                    
                    // Extract upload date
                    const dateEl = document.querySelector('[class*="date"], [class*="upload"], .date');
                    if (dateEl) {
                        data.uploadDate = dateEl.textContent?.trim() || '';
                    }
                    
                    return data;
                }
            """)
            
            if movie_detail.get('videoUrl') or movie_detail.get('videoSources'):
                print(f"✅ Đã crawl detail: {movie_detail.get('title', 'N/A')[:40]}... - {len(movie_detail.get('videoSources', []))} quality")
                return movie_detail
            else:
                print(f"⚠️  Không tìm thấy video URL")
                return None
                
        except Exception as e:
            print(f"❌ Lỗi khi crawl detail {detail_url}: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
        finally:
            await page.close()
    
    def save_movie_detail_to_file(self, movie: Dict) -> str:
        """Lưu detail của 1 phim vào file riêng với tên là title"""
        if not movie.get('title'):
            return None
        
        # Sanitize title để làm filename
        filename = self.sanitize_filename(movie['title'])
        filename = f"{filename}.json"
        
        # Tạo thư mục details nếu chưa có
        data_dir = os.path.join(os.path.dirname(__file__), "data", "movie_details")
        os.makedirs(data_dir, exist_ok=True)
        
        filepath = os.path.join(data_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(movie, f, ensure_ascii=False, indent=2)
        
        return filepath
    
    def sanitize_filename(self, name: str) -> str:
        """Chuyển tên phim thành filename hợp lệ"""
        # Loại bỏ emoji và ký tự đặc biệt
        name = re.sub(r'[^\w\s-]', '', name)
        # Thay khoảng trắng bằng dấu gạch dưới
        name = re.sub(r'\s+', '_', name)
        # Loại bỏ dấu gạch dưới liên tiếp
        name = re.sub(r'_+', '_', name)
        # Loại bỏ dấu gạch dưới ở đầu và cuối
        name = name.strip('_')
        # Giới hạn độ dài
        if len(name) > 100:
            name = name[:100]
        # Nếu rỗng, dùng tên mặc định
        if not name:
            name = "unknown"
        return name


async def main():
    """Main function"""
    import sys
    
    # Parse concurrent settings
    max_concurrent = 5  # Tăng từ 3 lên 5
    delay_min = 1.0     # Giảm từ 2.0 xuống 1.0
    delay_max = 2.0     # Giảm từ 5.0 xuống 2.0
    batch_size = None
    
    for i, arg in enumerate(sys.argv):
        if arg == '--concurrent' and i + 1 < len(sys.argv):
            max_concurrent = int(sys.argv[i + 1])
        elif arg == '--delay-min' and i + 1 < len(sys.argv):
            delay_min = float(sys.argv[i + 1])
        elif arg == '--delay-max' and i + 1 < len(sys.argv):
            delay_max = float(sys.argv[i + 1])
        elif arg == '--batch-size' and i + 1 < len(sys.argv):
            batch_size = int(sys.argv[i + 1])
    
    crawler = MovieCrawler(max_concurrent=max_concurrent, delay_min=delay_min, delay_max=delay_max)
    
    try:
        # Parse flags và loại bỏ chúng khỏi args
        detail_from_file = None
        used_indices = set()  # Track các index đã dùng cho flags
        
        for i, arg in enumerate(sys.argv):
            if arg in ['--detail-from-file', '--from-file'] and i + 1 < len(sys.argv):
                detail_from_file = sys.argv[i + 1]
                used_indices.add(i)
                used_indices.add(i + 1)
                break
            elif arg in ['--concurrent', '--delay-min', '--delay-max', '--batch-size']:
                used_indices.add(i)
                if i + 1 < len(sys.argv):
                    used_indices.add(i + 1)
        
        save_individual = '--save-individual' in sys.argv or '--individual' in sys.argv
        save_combined = '--save-combined' in sys.argv or '--combined' in sys.argv or '--gop' in sys.argv
        auto_mode = '--auto' in sys.argv or '--all' in sys.argv
        listing_only = '--listing-only' in sys.argv
        
        # Args chỉ chứa các số trang, không chứa flags và giá trị của flags
        # Loại bỏ tất cả flags và giá trị của chúng
        args = []
        skip_next = False
        flag_with_value = ['--concurrent', '--delay-min', '--delay-max', '--batch-size', '--detail-from-file', '--from-file']
        
        for i, arg in enumerate(sys.argv[1:], 1):
            if skip_next:
                skip_next = False
                continue
            
            # Nếu là flag có giá trị, skip giá trị tiếp theo
            if arg in flag_with_value:
                skip_next = True
                continue
            
            # Nếu là flag khác (--auto, --all, etc.), bỏ qua
            if arg.startswith('--') or arg.startswith('-'):
                continue
            
            # Chỉ thêm nếu không phải flag và không phải giá trị của flag
            # Và phải là số nguyên (số trang)
            if i not in used_indices:
                try:
                    # Thử parse để kiểm tra xem có phải số nguyên không
                    int(arg)
                    args.append(arg)
                except ValueError:
                    # Không phải số nguyên, bỏ qua (có thể là giá trị float của flag như "1.0")
                    pass
        
        # Mode 1: Crawl detail từ file listing
        if detail_from_file:
            print(f"🚀 CHIẾN LƯỢC: Crawl detail từ file listing")
            print(f"   📁 File: {detail_from_file}")
            print(f"   💾 Lưu riêng từng file: {save_individual}")
            print(f"   💾 Gộm vào 1 JSON: {save_combined}")
            print(f"   🔄 Concurrent: {max_concurrent}")
            print(f"   ⏱️  Delay: {delay_min}-{delay_max}s")
            if batch_size:
                print(f"   📦 Batch size: {batch_size}")
            print()
            result = await crawler.crawl_details_from_listing_file(detail_from_file, save_individual, batch_size, save_combined)
            print(f"\n{'='*50}")
            print("✅ HOÀN THÀNH!")
            print(f"{'='*50}")
            if result:
                print(f"📊 Tổng: {result.get('total', 0)}")
                print(f"✅ Thành công: {result.get('success', 0)}")
                print(f"❌ Thất bại: {result.get('failed', 0)}")
            return
        
        if len(args) > 0:
            if len(args) >= 2:
                start_page = int(args[0])
                end_page = int(args[1])
                print(f"🚀 Crawl phim từ trang {start_page} đến {end_page}\n")
                all_movies = []
                for page_num in range(start_page, end_page + 1):
                    print(f"\n📄 Trang {page_num}/{end_page}")
                    movies = await crawler.crawl_movies_list(page_num, 60)
                    all_movies.extend(movies)
                    print(f"✅ Đã có tổng cộng {len(all_movies)} phim\n")
                    if page_num < end_page:
                        await asyncio.sleep(5)
                
                result = crawler.save_to_json(all_movies)
                print(f"\n✅ Hoàn thành: {len(all_movies)} phim")
                print(f"💾 File: {result.get('file', '')}")
            else:
                page = int(args[0])
                print(f"🚀 Crawl phim trang {page}\n")
                movies = await crawler.crawl_movies_list(page, 60)
                result = crawler.save_to_json(movies)
                print(f"\n✅ Hoàn thành: {len(movies)} phim")
                print(f"💾 File: {result.get('file', '')}")
        else:
            # Auto mode: crawl all pages → sau đó crawl detail từng video
            if '--auto' in sys.argv or '--all' in sys.argv:
                max_pages = None
                if len(args) > 0:
                    try:
                        max_pages = int(args[0])
                    except:
                        pass
                
                print(f"\n{'='*60}")
                print(f"🚀 CHẾ ĐỘ TỰ ĐỘNG: Crawl listing → Detail từng video")
                print(f"{'='*60}")
                if max_pages:
                    print(f"   📋 Số trang listing tối đa: {max_pages}")
                else:
                    print(f"   📋 Crawl tất cả trang listing (tự động detect)")
                print(f"   🔍 Tự động crawl detail sau khi xong listing")
                print(f"   💾 Lưu ngay sau mỗi video (tới đâu lưu tới đó)")
                print(f"   🔄 Concurrent: {max_concurrent}")
                print(f"   ⏱️  Delay: {delay_min}-{delay_max}s")
                if batch_size:
                    print(f"   📦 Batch size: {batch_size}")
                print(f"{'='*60}\n")
                
                # Giai đoạn 1: Crawl listing
                listing_result = await crawler.crawl_all_listing_pages(1, max_pages)
                listing_file = listing_result.get('listing_file', '')
                
                if not listing_file or not os.path.exists(listing_file):
                    print("❌ Không tìm thấy file listing, dừng lại")
                    return
                
                print(f"\n{'='*60}")
                print(f"✅ Hoàn thành crawl listing: {len(listing_result.get('movies', []))} phim")
                print(f"💾 File: {listing_file}")
                print(f"{'='*60}\n")
                
                # Giai đoạn 2: Crawl detail từng video (tự động)
                print("⏳ Bắt đầu crawl detail sau 3 giây...\n")
                await asyncio.sleep(3)
                
                detail_result = await crawler.crawl_details_from_listing_file(
                    listing_file, 
                    save_individual=True,  # Luôn lưu riêng từng file
                    batch_size=batch_size,
                    save_combined=save_combined
                )
                
                print(f"\n{'='*60}")
                print("✅ HOÀN THÀNH TẤT CẢ!")
                print(f"{'='*60}")
                print(f"📊 Listing: {len(listing_result.get('movies', []))} phim")
                if detail_result:
                    print(f"📊 Detail - Thành công: {detail_result.get('success', 0)}")
                    print(f"📊 Detail - Thất bại: {detail_result.get('failed', 0)}")
                print(f"💾 File listing: {listing_file}")
                print(f"💾 Files detail: data/movie_details/*.json")
                print(f"{'='*60}\n")
                return
            else:
                # Default: crawl page 1
                print(f"🚀 Crawl phim trang 1 (mặc định)\n")
                movies = await crawler.crawl_movies_list(1, 60)
                result = crawler.save_to_json(movies)
                print(f"\n✅ Hoàn thành: {len(movies)} phim")
                print(f"💾 File: {result.get('file', '')}")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Đã dừng bởi người dùng")
    except Exception as e:
        import traceback
        print(f"\n❌ Lỗi: {str(e)}")
        traceback.print_exc()
    finally:
        await crawler.close_browser()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"❌ Lỗi chương trình: {e}")

