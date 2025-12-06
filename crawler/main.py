"""
Crawler để crawl dữ liệu từ gaigu1.net/gai-goi
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

class GirlCrawler:
    def __init__(self, max_concurrent: int = 3, delay_min: float = 2.0, delay_max: float = 5.0):
        """
        Args:
            max_concurrent: Số lượng requests đồng thời tối đa (mặc định: 3)
            delay_min: Delay tối thiểu giữa các requests (giây)
            delay_max: Delay tối đa giữa các requests (giây)
        """
        self.browser: Optional[Browser] = None
        self.playwright = None
        self.base_url = 'https://gaigu1.net/gai-goi'
        self.max_concurrent = max_concurrent
        self.delay_min = delay_min
        self.delay_max = delay_max
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.file_lock = asyncio.Lock()  # Lock để đảm bảo thread-safe khi ghi file
        
    async def init_browser(self):
        """Khởi tạo browser"""
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
    
    async def crawl_girls_list(self, page_number: int = 1, limit: int = 60) -> List[Dict]:
        """Crawl danh sách girls từ trang listing"""
        if not self.browser:
            await self.init_browser()
        
        page = await self.browser.new_page()
        
        # Set user agent để tránh bị block
        await page.set_extra_http_headers({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        
        girls = []
        
        try:
            print(f"🔍 Đang crawl trang {page_number}...")
            
            # Navigate to page
            url = f"{self.base_url}?page={page_number}" if page_number > 1 else self.base_url
            print(f"📡 Đang truy cập: {url}")
            
            # Wait for full page load (including all resources)
            await page.goto(url, wait_until='networkidle', timeout=60000)
            
            # Wait a bit more for any lazy-loaded content
            await page.wait_for_timeout(3000)
            
            # Scroll to trigger lazy loading if any
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(2000)
            
            # Scroll back up
            await page.evaluate("window.scrollTo(0, 0)")
            await page.wait_for_timeout(1000)
            
            # Debug: Check page content
            page_title = await page.title()
            print(f"📄 Tiêu đề trang: {page_title}")
            
            # Check if data is loaded in HTML
            cards_count = await page.evaluate("document.querySelectorAll('div.list-escorts').length")
            print(f"📋 Tìm thấy {cards_count} cards trên trang")
            
            # Try to find any images on the page
            img_count = await page.evaluate("document.querySelectorAll('img').length")
            print(f"🖼️  Tìm thấy {img_count} ảnh trên trang")
            
            # Check if there are any API calls being made (for debugging)
            # Note: This website uses SSR, so data is already in HTML
            
            # Extract girls data - using actual HTML structure
            girls = await page.evaluate("""
                () => {
                    const results = [];
                    
                    // Find all profile cards using the actual class structure
                    const cards = document.querySelectorAll('div.list-escorts');
                    console.log('Total cards found:', cards.length);
                    
                    cards.forEach((card) => {
                        try {
                            const girl = {
                                name: '',
                                images: [],
                                tags: [],
                                isAvailable: true,
                                location: '',
                                province: '',
                                rating: 0,
                                totalReviews: 0,
                                verified: false,
                                bio: '',
                                age: null,
                                price: '',
                                detailUrl: '',
                                views: 0
                            };
                            
                            // Extract detail URL from the main link
                            const mainLink = card.querySelector('a[href*="/gai-goi/"]');
                            if (mainLink) {
                                const href = mainLink.getAttribute('href');
                                if (href) {
                                    girl.detailUrl = href.startsWith('http') ? href : 'https://gaigu1.net' + href;
                                }
                            }
                            
                            // Extract name from content-title
                            const nameEl = card.querySelector('.content-title');
                            if (nameEl) {
                                girl.name = nameEl.textContent?.trim() || '';
                            }
                            
                            // Extract images - only from the card, not sidebar
                            const imgEl = card.querySelector('img.img-escort-res');
                            if (imgEl) {
                                let src = imgEl.getAttribute('src') || imgEl.src;
                                if (src) {
                                    if (src.startsWith('//')) {
                                        src = 'https:' + src;
                                    } else if (src.startsWith('/')) {
                                        src = 'https://gaigu1.net' + src;
                                    } else if (!src.startsWith('http')) {
                                        src = 'https://gaigu1.net/' + src;
                                    }
                                    girl.images.push(src);
                                }
                            }
                            
                            // Extract location from es-city
                            const locationEl = card.querySelector('.es-city a');
                            if (locationEl) {
                                girl.location = locationEl.textContent?.trim() || '';
                                // Try to extract province from location link
                                const locationHref = locationEl.getAttribute('href') || '';
                                if (locationHref.includes('/sai-gon/')) {
                                    girl.province = 'Sài Gòn';
                                } else if (locationHref.includes('/ha-noi/')) {
                                    girl.province = 'Hà Nội';
                                } else if (locationHref.includes('/da-nang/')) {
                                    girl.province = 'Đà Nẵng';
                                } else if (locationHref.includes('/binh-duong/')) {
                                    girl.province = 'Bình Dương';
                                } else if (locationHref.includes('/dong-nai/')) {
                                    girl.province = 'Đồng Nai';
                                }
                            }
                            
                            // Extract price from left-price
                            const priceEl = card.querySelector('.left-price');
                            if (priceEl) {
                                const priceText = priceEl.textContent?.trim() || '';
                                // Extract price (e.g., "600K" from "600K" or " 600K")
                                const priceMatch = priceText.match(/(\\d+[.,]?\\d*\\s*K|\\d+[.,]?\\d*\\s*tr)/i);
                                if (priceMatch) {
                                    girl.price = priceMatch[1].trim();
                                }
                            }
                            
                            // Extract rating from content-rating
                            const ratingEl = card.querySelector('.content-rating');
                            if (ratingEl) {
                                const ratingText = ratingEl.textContent || '';
                                // Count filled stars (not white/gray)
                                const filledStars = ratingEl.querySelectorAll('i.fa-star:not(.white), i.fa-star[style*="color:"]:not([style*="#909090"])').length;
                                // Or extract from text like "(0)" or "(2)"
                                const reviewMatch = ratingText.match(/\\((\\d+)\\)/);
                                if (reviewMatch) {
                                    girl.totalReviews = parseInt(reviewMatch[1]);
                                }
                                // If we have filled stars, use that as rating
                                if (filledStars > 0) {
                                    girl.rating = filledStars;
                                }
                            }
                            
                            // Extract views from viewed-in
                            const viewsEl = card.querySelector('.viewed-in');
                            if (viewsEl) {
                                const viewsText = viewsEl.textContent?.trim() || '';
                                // Extract views (e.g., "1.2K" -> 1200, "8.7K" -> 8700)
                                const viewsMatch = viewsText.match(/(\\d+[.,]?\\d*)\\s*K/i);
                                if (viewsMatch) {
                                    const num = parseFloat(viewsMatch[1].replace(',', '.'));
                                    girl.views = Math.round(num * 1000);
                                } else {
                                    const numMatch = viewsText.match(/(\\d+)/);
                                    if (numMatch) {
                                        girl.views = parseInt(numMatch[1]);
                                    }
                                }
                            }
                            
                            // Check verified status - look for verified badge or label
                            const verifiedEl = card.querySelector('.label-public, [class*="verified"], [class*="check"]');
                            if (verifiedEl) {
                                girl.verified = true;
                            }
                            
                            // Extract tags if available (might be in a separate section)
                            const tagEls = card.querySelectorAll('[class*="tag"], .hashtag, a[href*="tag"]');
                            tagEls.forEach(tag => {
                                const tagText = tag.textContent?.trim();
                                if (tagText && tagText.length > 0 && tagText.length < 50) {
                                    if (!girl.tags.includes(tagText)) {
                                        girl.tags.push(tagText);
                                    }
                                }
                            });
                            
                            // Only add if we have at least name and image
                            if (girl.name && girl.name.length > 0 && girl.images.length > 0) {
                                // Filter out invalid names (like "Sài Gòn", "Tags phổ biến")
                                const invalidNames = ['Sài Gòn', 'Hà Nội', 'Bình Dương', 'Đà Nẵng', 'Đồng Nai', 
                                                    'Tags phổ biến', 'Gái gọi', 'Gaigu', 'Gaigoi'];
                                if (!invalidNames.includes(girl.name)) {
                                    results.push(girl);
                                }
                            }
                        } catch (e) {
                            console.error('Error extracting girl:', e);
                        }
                    });
                    
                    console.log('Total girls extracted:', results.length);
                    return results;
                }
            """)
            
            print(f"✅ Đã crawl được {len(girls)} girls từ trang {page_number}")
            
            # Debug: Print sample if found
            if len(girls) > 0:
                print(f"📝 Sample: {girls[0].get('name', 'N/A')} - {len(girls[0].get('images', []))} ảnh")
            else:
                # Try to get page HTML structure for debugging
                html_snippet = await page.evaluate("""
                    () => {
                        const body = document.body.innerHTML.substring(0, 1000);
                        return body;
                    }
                """)
                print(f"⚠️  Không tìm thấy dữ liệu. HTML snippet: {html_snippet[:200]}...")
            
            return girls[:limit]
            
        except Exception as e:
            print(f"❌ Lỗi khi crawl trang {page_number}: {str(e)}")
            return []
        finally:
            await page.close()
    
    async def crawl_girl_detail(self, url: str) -> Optional[Dict]:
        """Crawl thông tin chi tiết từ trang detail"""
        if not self.browser:
            await self.init_browser()
        
        page = await self.browser.new_page()
        
        # Set realistic headers to avoid bot detection
        await page.set_extra_http_headers({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://gaigu1.net/gai-goi',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1'
        })
        
        try:
            print(f"🔍 Đang crawl detail: {url}")
            await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            await page.wait_for_timeout(3000)
            
            # Check if blocked by captcha
            page_content = await page.content()
            if 'verify' in page_content.lower() and 'human' in page_content.lower():
                print("⚠️  Phát hiện captcha, đợi thêm 5 giây...")
                await page.wait_for_timeout(5000)
                # Try to wait for content to load
                try:
                    await page.wait_for_selector('.attributes, h1, [class*="gallery"]', timeout=10000)
                except:
                    pass
            
            # Scroll to load lazy images
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(2000)
            
            girl = await page.evaluate("""
                () => {
                    const data = {
                        name: '',
                        images: [],
                        tags: [],
                        bio: '',
                        location: '',
                        province: '',
                        rating: 0,
                        totalReviews: 0,
                        verified: false,
                        age: null,
                        price: '',
                        phone: '',
                        password: '',
                        birthYear: null,
                        height: '',
                        weight: '',
                        measurements: '',
                        origin: '',
                        address: '',
                        workingHours: '',
                        services: []
                    };
                    
                    // Extract name - try multiple selectors
                    const nameSelectors = ['h1', 'h2', '.content-title', '[class*="title"]', '[class*="name"]'];
                    for (const selector of nameSelectors) {
                        const nameEl = document.querySelector(selector);
                        if (nameEl) {
                            const nameText = nameEl.textContent?.trim();
                            if (nameText && nameText.length > 2) {
                                data.name = nameText;
                                break;
                            }
                        }
                    }
                    
                    // Extract all images from gallery using XPath: /html/body/div[7]/div[3]
                    let galleryContainer = null;
                    
                    // Try XPath first: /html/body/div[7]/div[3] (gallery container)
                    try {
                        const xpathResult = document.evaluate('/html/body/div[7]/div[3]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                        galleryContainer = xpathResult.singleNodeValue;
                    } catch (e) {
                        console.log('XPath not available, trying selectors');
                    }
                    
                    // If XPath doesn't work, try common selectors
                    if (!galleryContainer) {
                        const selectors = [
                            '.gallery',
                            '.photo-gallery',
                            '[class*="gallery"]',
                            '[class*="photo"]',
                            '.thumb-overlay',
                            '.preview',
                            '[id*="preview"]',
                            '.main-image',
                            '.image-gallery'
                        ];
                        for (const selector of selectors) {
                            const el = document.querySelector(selector);
                            if (el && el.querySelectorAll('img').length > 0) {
                                galleryContainer = el;
                                break;
                            }
                        }
                    }
                    
                    // Extract images from gallery container
                    if (galleryContainer) {
                        galleryContainer.querySelectorAll('img').forEach(img => {
                            let src = img.src || 
                                     img.getAttribute('src') || 
                                     img.getAttribute('data-src') || 
                                     img.getAttribute('data-lazy-src') ||
                                     img.getAttribute('data-original') ||
                                     img.getAttribute('data-lazy');
                            if (src) {
                                const lowerSrc = src.toLowerCase();
                                if (!lowerSrc.includes('placeholder') && 
                                    !lowerSrc.includes('logo') && 
                                    !lowerSrc.includes('icon') &&
                                    !lowerSrc.includes('avatar') &&
                                    !lowerSrc.includes('favicon') &&
                                    !lowerSrc.includes('banner')) {
                                    if (src.startsWith('//')) {
                                        src = 'https:' + src;
                                    } else if (src.startsWith('/')) {
                                        src = 'https://gaigu1.net' + src;
                                    } else if (!src.startsWith('http')) {
                                        src = 'https://gaigu1.net/' + src;
                                    }
                                    if (!data.images.includes(src)) {
                                        data.images.push(src);
                                    }
                                }
                            }
                        });
                    }
                    
                    // If still no images, try to find all images that contain photo/tmb/media in path
                    if (data.images.length === 0) {
                        document.querySelectorAll('img').forEach(img => {
                            let src = img.src || img.getAttribute('src') || img.getAttribute('data-src');
                            if (src) {
                                const lowerSrc = src.toLowerCase();
                                // Only include images that look like photos (contain photo, tmb, media)
                                if ((lowerSrc.includes('photo') || lowerSrc.includes('tmb') || lowerSrc.includes('media')) &&
                                    !lowerSrc.includes('placeholder') && 
                                    !lowerSrc.includes('logo') && 
                                    !lowerSrc.includes('icon') && 
                                    !lowerSrc.includes('avatar') && 
                                    !lowerSrc.includes('favicon') &&
                                    !lowerSrc.includes('banner')) {
                                    if (src.startsWith('//')) {
                                        src = 'https:' + src;
                                    } else if (src.startsWith('/')) {
                                        src = 'https://gaigu1.net' + src;
                                    } else if (!src.startsWith('http')) {
                                        src = 'https://gaigu1.net/' + src;
                                    }
                                    if (!data.images.includes(src)) {
                                        data.images.push(src);
                                    }
                                }
                            }
                        });
                    }
                    
                    // Extract attributes from .attributes section
                    // Try XPath first: /html/body/div[5]/div[6]/div[3]/div[1]/div[2] (attributes container)
                    let attributesSection = null;
                    try {
                        const xpathResult = document.evaluate('/html/body/div[5]/div[6]/div[3]/div[1]/div[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                        attributesSection = xpathResult.singleNodeValue;
                    } catch (e) {
                        // Fallback to selector
                        attributesSection = document.querySelector('.attributes');
                    }
                    
                    if (attributesSection) {
                        // Extract price
                        const priceRow = Array.from(attributesSection.querySelectorAll('.col-md-4')).find(el => 
                            el.textContent?.trim() === 'Giá'
                        );
                        if (priceRow) {
                            const priceValue = priceRow.nextElementSibling;
                            if (priceValue) {
                                data.price = priceValue.textContent?.trim() || '';
                            }
                        }
                        
                        // Extract phone
                        const phoneRow = Array.from(attributesSection.querySelectorAll('.col-md-4')).find(el => 
                            el.textContent?.trim() === 'Số điện thoại'
                        );
                        if (phoneRow) {
                            const phoneValue = phoneRow.nextElementSibling;
                            if (phoneValue) {
                                const phoneLink = phoneValue.querySelector('a[href^="tel:"]');
                                if (phoneLink) {
                                    data.phone = phoneLink.textContent?.trim() || phoneLink.getAttribute('href')?.replace('tel:', '') || '';
                                } else {
                                    data.phone = phoneValue.textContent?.trim() || '';
                                }
                            }
                        }
                        
                        // Extract password
                        const passRow = Array.from(attributesSection.querySelectorAll('.col-md-4')).find(el => 
                            el.textContent?.trim() === 'Pass'
                        );
                        if (passRow) {
                            const passValue = passRow.nextElementSibling;
                            if (passValue) {
                                data.password = passValue.textContent?.trim() || '';
                            }
                        }
                        
                        // Extract birth year
                        const birthRow = Array.from(attributesSection.querySelectorAll('.col-md-4')).find(el => 
                            el.textContent?.trim() === 'Năm sinh'
                        );
                        if (birthRow) {
                            const birthValue = birthRow.nextElementSibling;
                            if (birthValue) {
                                const birthText = birthValue.textContent?.trim() || '';
                                const yearMatch = birthText.match(/(\\d{4})/);
                                if (yearMatch) {
                                    data.birthYear = parseInt(yearMatch[1]);
                                    // Calculate age
                                    const currentYear = new Date().getFullYear();
                                    data.age = currentYear - data.birthYear;
                                }
                            }
                        }
                        
                        // Extract height
                        const heightRow = Array.from(attributesSection.querySelectorAll('.col-md-4')).find(el => 
                            el.textContent?.trim() === 'Chiều cao'
                        );
                        if (heightRow) {
                            const heightValue = heightRow.nextElementSibling;
                            if (heightValue) {
                                data.height = heightValue.textContent?.trim() || '';
                            }
                        }
                        
                        // Extract weight
                        const weightRow = Array.from(attributesSection.querySelectorAll('.col-md-4')).find(el => 
                            el.textContent?.trim() === 'Cân nặng'
                        );
                        if (weightRow) {
                            const weightValue = weightRow.nextElementSibling;
                            if (weightValue) {
                                data.weight = weightValue.textContent?.trim() || '';
                            }
                        }
                        
                        // Extract measurements (3 vòng)
                        const measureRow = Array.from(attributesSection.querySelectorAll('.col-md-4')).find(el => 
                            el.textContent?.trim() === 'Số đo 3 vòng'
                        );
                        if (measureRow) {
                            const measureValue = measureRow.nextElementSibling;
                            if (measureValue) {
                                data.measurements = measureValue.textContent?.trim() || '';
                            }
                        }
                        
                        // Extract origin
                        const originRow = Array.from(attributesSection.querySelectorAll('.col-md-4')).find(el => 
                            el.textContent?.trim() === 'Xuất xứ'
                        );
                        if (originRow) {
                            const originValue = originRow.nextElementSibling;
                            if (originValue) {
                                data.origin = originValue.textContent?.trim() || '';
                            }
                        }
                        
                        // Extract location/area
                        const areaRow = Array.from(attributesSection.querySelectorAll('.col-md-4')).find(el => 
                            el.textContent?.trim() === 'Khu vực'
                        );
                        if (areaRow) {
                            const areaValue = areaRow.nextElementSibling;
                            if (areaValue) {
                                const areaText = areaValue.textContent?.trim() || '';
                                data.location = areaText;
                                // Extract province
                                if (areaText.includes('Sài Gòn') || areaText.includes('Hồ Chí Minh')) {
                                    data.province = 'Sài Gòn';
                                } else if (areaText.includes('Hà Nội')) {
                                    data.province = 'Hà Nội';
                                } else if (areaText.includes('Đà Nẵng')) {
                                    data.province = 'Đà Nẵng';
                                } else if (areaText.includes('Bình Dương')) {
                                    data.province = 'Bình Dương';
                                } else if (areaText.includes('Đồng Nai')) {
                                    data.province = 'Đồng Nai';
                                }
                            }
                        }
                        
                        // Extract address
                        const addressRow = Array.from(attributesSection.querySelectorAll('.col-md-4')).find(el => 
                            el.textContent?.trim() === 'Địa chỉ'
                        );
                        if (addressRow) {
                            const addressValue = addressRow.nextElementSibling;
                            if (addressValue) {
                                data.address = addressValue.textContent?.trim() || '';
                            }
                        }
                        
                        // Extract working hours
                        const workRow = Array.from(attributesSection.querySelectorAll('.col-md-4')).find(el => 
                            el.textContent?.trim() === 'Làm việc'
                        );
                        if (workRow) {
                            const workValue = workRow.nextElementSibling;
                            if (workValue) {
                                data.workingHours = workValue.textContent?.trim() || '';
                            }
                        }
                        
                        // Extract services
                        const serviceRow = Array.from(attributesSection.querySelectorAll('.col-md-4')).find(el => 
                            el.textContent?.trim() === 'Dịch vụ'
                        );
                        if (serviceRow) {
                            const serviceValue = serviceRow.nextElementSibling;
                            if (serviceValue) {
                                const serviceSpans = serviceValue.querySelectorAll('span, .a-attr span');
                                serviceSpans.forEach(span => {
                                    const serviceText = span.textContent?.trim();
                                    if (serviceText) {
                                        data.services.push(serviceText);
                                    }
                                });
                            }
                        }
                    }
                    
                    // Extract bio/description
                    const bioEl = document.querySelector('[class*="bio"], [class*="description"], [class*="content"] p, .content p');
                    if (bioEl) {
                        data.bio = bioEl.textContent?.trim() || '';
                    }
                    
                    // Extract rating
                    const ratingEl = document.querySelector('[class*="rating"], .content-rating');
                    if (ratingEl) {
                        const ratingText = ratingEl.textContent || '';
                        const reviewMatch = ratingText.match(/\\((\\d+)\\)/);
                        if (reviewMatch) {
                            data.totalReviews = parseInt(reviewMatch[1]);
                        }
                        // Count filled stars
                        const filledStars = ratingEl.querySelectorAll('i.fa-star:not(.white), i.fa-star[style*="color:"]:not([style*="#909090"])').length;
                        if (filledStars > 0) {
                            data.rating = filledStars;
                        }
                    }
                    
                    // Extract verified
                    data.verified = !!document.querySelector('[class*="verified"], [class*="check"], .label-public');
                    
                    // Extract tags
                    document.querySelectorAll('[class*="tag"], .hashtag, a[href*="tag"]').forEach(tag => {
                        const tagText = tag.textContent?.trim();
                        if (tagText) {
                            data.tags.push(tagText);
                        }
                    });
                    
                    return data;
                }
            """)
            
            print(f"✅ Đã crawl detail: {girl.get('name', 'N/A')} - {len(girl.get('images', []))} ảnh")
            return girl
            
        except Exception as e:
            print(f"❌ Lỗi khi crawl detail {url}: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
        finally:
            await page.close()
    
    def sanitize_filename(self, name: str) -> str:
        """Chuyển tên gái thành filename hợp lệ"""
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
    
    def save_to_json(self, girls: List[Dict], filename: str = None) -> Dict:
        """Lưu vào file JSON"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"crawled_girls_{timestamp}.json"
        
        # Tạo thư mục data nếu chưa có
        data_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(data_dir, exist_ok=True)
        
        filepath = os.path.join(data_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(girls, f, ensure_ascii=False, indent=2)
        
        print(f"💾 Đã lưu {len(girls)} girls vào {filepath}")
        return {"saved": len(girls), "file": filepath}
    
    def save_girl_detail_to_file(self, girl: Dict) -> str:
        """Lưu detail của 1 gái vào file riêng với tên là tên gái"""
        if not girl.get('name'):
            return None
        
        # Sanitize tên để làm filename
        filename = self.sanitize_filename(girl['name'])
        filename = f"{filename}.json"
        
        # Tạo thư mục details nếu chưa có
        data_dir = os.path.join(os.path.dirname(__file__), "data", "details")
        os.makedirs(data_dir, exist_ok=True)
        
        filepath = os.path.join(data_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(girl, f, ensure_ascii=False, indent=2)
        
        return filepath
    
    async def crawl_and_save(self, page_number: int = 1, limit: int = 60, crawl_details: bool = False):
        """Crawl và lưu dữ liệu vào JSON
        
        Strategy:
        1. Crawl listing page để lấy danh sách girls với detailUrl
        2. Nếu crawl_details=True: Crawl detail page cho mỗi girl
        """
        # Giai đoạn 1: Crawl listing page
        girls = await self.crawl_girls_list(page_number, limit)
        
        # Giai đoạn 2: Crawl detail pages nếu được yêu cầu
        if crawl_details:
            print(f"\n{'='*50}")
            print(f"🔍 GIAI ĐOẠN 2: Crawl detail cho {len(girls)} girls")
            print(f"{'='*50}\n")
            
            for i, girl in enumerate(girls, 1):
                if girl.get('detailUrl'):
                    print(f"[{i}/{len(girls)}] Đang crawl detail: {girl.get('name', 'N/A')[:30]}...")
                    detail_data = await self.crawl_girl_detail(girl['detailUrl'])
                    if detail_data:
                        # Merge detail data into girl data (detail data có priority)
                        # Giữ lại detailUrl từ listing
                        detail_url = girl.get('detailUrl')
                        girl.update(detail_data)
                        girl['detailUrl'] = detail_url  # Đảm bảo giữ lại detailUrl
                    else:
                        print(f"⚠️  Không crawl được detail cho: {girl.get('name', 'N/A')}")
                    
                    # Delay để tránh bị block (2-3 giây)
                    if i < len(girls):
                        await asyncio.sleep(2)
                else:
                    print(f"⚠️  Girl {i} không có detailUrl, bỏ qua")
        
        result = self.save_to_json(girls)
        
        return {
            "crawled": len(girls),
            "saved": result.get("saved", 0),
            "file": result.get("file", "")
        }
    
    async def crawl_multiple_pages(self, start_page: int = 1, end_page: int = 5, crawl_details: bool = False):
        """Crawl nhiều trang và lưu vào một file JSON
        
        Strategy:
        1. Crawl tất cả listing pages trước (nhanh)
        2. Sau đó crawl detail cho tất cả girls (nếu crawl_details=True)
        """
        all_girls = []
        
        # Giai đoạn 1: Crawl tất cả listing pages
        print(f"\n{'='*50}")
        print(f"📋 GIAI ĐOẠN 1: Crawl listing pages {start_page} đến {end_page}")
        print(f"{'='*50}\n")
        
        for page_num in range(start_page, end_page + 1):
            print(f"\n📄 Trang {page_num}/{end_page}")
            girls = await self.crawl_girls_list(page_num, 60)
            all_girls.extend(girls)
            print(f"✅ Đã có tổng cộng {len(all_girls)} girls\n")
            
            # Delay between pages
            if page_num < end_page:
                print(f"⏳ Đợi 5 giây trước khi crawl trang tiếp theo...\n")
                await asyncio.sleep(5)
        
        # Giai đoạn 2: Crawl detail nếu được yêu cầu
        if crawl_details:
            print(f"\n{'='*50}")
            print(f"🔍 GIAI ĐOẠN 2: Crawl detail cho {len(all_girls)} girls")
            print(f"{'='*50}\n")
            
            for i, girl in enumerate(all_girls, 1):
                if girl.get('detailUrl'):
                    print(f"[{i}/{len(all_girls)}] Đang crawl detail: {girl.get('name', 'N/A')[:40]}...")
                    detail_data = await self.crawl_girl_detail(girl['detailUrl'])
                    if detail_data:
                        detail_url = girl.get('detailUrl')
                        girl.update(detail_data)
                        girl['detailUrl'] = detail_url
                    else:
                        print(f"⚠️  Không crawl được detail")
                    
                    # Delay để tránh bị block
                    if i < len(all_girls):
                        await asyncio.sleep(2)
                else:
                    print(f"⚠️  Girl {i} không có detailUrl")
        
        # Save all to one JSON file
        result = self.save_to_json(all_girls)
        
        return {
            "totalCrawled": len(all_girls),
            "totalSaved": result.get("saved", 0),
            "file": result.get("file", "")
        }
    
    async def crawl_all_listing_pages(self, start_page: int = 1, max_pages: int = None):
        """Crawl tất cả các trang listing (có thể detect số trang tối đa)
        
        Returns:
            Dict: {"girls": List[Dict], "listing_file": str}
        """
        all_girls = []
        current_page = start_page
        
        print(f"\n{'='*50}")
        print(f"📋 GIAI ĐOẠN 1: Crawl listing pages")
        if max_pages:
            print(f"   Từ trang {start_page} đến {start_page + max_pages - 1}")
        else:
            print(f"   Từ trang {start_page} (tự động detect số trang)")
        print(f"{'='*50}\n")
        
        while True:
            if max_pages and current_page > start_page + max_pages - 1:
                break
            
            print(f"\n📄 Trang {current_page}")
            girls = await self.crawl_girls_list(current_page, 60)
            
            if not girls or len(girls) == 0:
                print(f"⚠️  Trang {current_page} không có dữ liệu, dừng lại")
                break
            
            all_girls.extend(girls)
            print(f"✅ Đã có tổng cộng {len(all_girls)} girls\n")
            
            # Delay between pages
            print(f"⏳ Đợi 5 giây trước khi crawl trang tiếp theo...\n")
            await asyncio.sleep(5)
            
            current_page += 1
        
        # Lưu danh sách listing
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        listing_file = f"listing_{timestamp}.json"
        result = self.save_to_json(all_girls, listing_file)
        
        print(f"\n✅ Hoàn thành crawl listing: {len(all_girls)} girls")
        print(f"💾 Đã lưu danh sách vào: {result.get('file', '')}\n")
        
        return {
            "girls": all_girls,
            "listing_file": result.get("file", "")
        }
    
    async def _crawl_one_girl_detail(self, girl: Dict, index: int, total: int, save_individual: bool = True, save_combined: bool = False, combined_file: str = None, all_details: list = None) -> tuple:
        """Crawl detail cho 1 gái (dùng trong concurrent crawling)
        
        Returns:
            (success: bool, girl: Dict)
        """
        async with self.semaphore:  # Giới hạn số lượng concurrent
            if not girl.get('detailUrl'):
                return (False, girl)
            
            girl_name = girl.get('name', 'N/A')[:40]
            print(f"[{index}/{total}] 🔍 Đang crawl: {girl_name}...")
            
            try:
                # Random delay để tránh pattern detection
                delay = random.uniform(self.delay_min, self.delay_max)
                await asyncio.sleep(delay)
                
                detail_data = await self.crawl_girl_detail(girl['detailUrl'])
                if detail_data:
                    # Merge detail data
                    detail_url = girl.get('detailUrl')
                    girl.update(detail_data)
                    girl['detailUrl'] = detail_url
                    
                    # Lưu vào file riêng nếu được yêu cầu
                    if save_individual:
                        filepath = self.save_girl_detail_to_file(girl)
                        if filepath:
                            print(f"[{index}/{total}] ✅ {girl_name[:30]}... → {os.path.basename(filepath)}")
                    
                    # Lưu vào combined file nếu được yêu cầu (incremental)
                    if save_combined and combined_file and all_details is not None:
                        async with self.file_lock:  # Thread-safe
                            all_details.append(girl)
                            # Lưu ngay sau mỗi item
                            try:
                                with open(combined_file, 'w', encoding='utf-8') as f:
                                    json.dump(all_details, f, ensure_ascii=False, indent=2)
                            except Exception as e:
                                print(f"⚠️  Lỗi khi lưu combined file: {e}")
                    
                    return (True, girl)
                else:
                    print(f"[{index}/{total}] ⚠️  Không crawl được: {girl_name[:30]}...")
                    return (False, girl)
            except Exception as e:
                print(f"[{index}/{total}] ❌ Lỗi: {girl_name[:30]}... - {str(e)}")
                return (False, girl)
    
    async def crawl_details_from_listing_file(self, listing_file: str, save_individual: bool = True, batch_size: int = None, save_combined: bool = False):
        """Đọc file listing và crawl detail cho từng gái (concurrent)
        
        Args:
            listing_file: Đường dẫn đến file JSON chứa danh sách girls
            save_individual: Nếu True, lưu mỗi gái vào file riêng với tên gái
            batch_size: Số lượng girls crawl mỗi batch (None = tất cả cùng lúc)
            save_combined: Nếu True, gộm tất cả vào 1 JSON file và lưu incremental
        """
        # Đọc file listing
        if not os.path.exists(listing_file):
            print(f"❌ Không tìm thấy file: {listing_file}")
            return None
        
        with open(listing_file, 'r', encoding='utf-8') as f:
            girls = json.load(f)
        
        # Lọc những girls có detailUrl
        valid_girls = [(i, girl) for i, girl in enumerate(girls, 1) if girl.get('detailUrl')]
        
        print(f"\n{'='*50}")
        print(f"🔍 GIAI ĐOẠN 2: Crawl detail cho {len(valid_girls)} girls")
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
            combined_file = os.path.join("data", f"all_girls_details_{timestamp}.json")
            os.makedirs("data", exist_ok=True)
            print(f"💾 File gộm: {combined_file}\n")
        
        # Crawl theo batch hoặc tất cả cùng lúc
        if batch_size:
            # Crawl theo batch
            for batch_start in range(0, len(valid_girls), batch_size):
                batch_end = min(batch_start + batch_size, len(valid_girls))
                batch = valid_girls[batch_start:batch_end]
                
                print(f"\n📦 Batch {batch_start//batch_size + 1}: {len(batch)} girls\n")
                
                # Tạo tasks cho batch này
                tasks = [
                    self._crawl_one_girl_detail(girl, index, len(valid_girls), save_individual, save_combined, combined_file, all_details)
                    for index, girl in batch
                ]
                
                # Chờ tất cả tasks trong batch hoàn thành
                results = await asyncio.gather(*tasks)
                
                # Đếm kết quả
                for success, updated_girl in results:
                    if success:
                        success_count += 1
                    else:
                        failed_count += 1
                
                # Delay giữa các batch
                if batch_end < len(valid_girls):
                    batch_delay = random.uniform(5, 10)
                    print(f"\n⏳ Đợi {batch_delay:.1f} giây trước batch tiếp theo...\n")
                    await asyncio.sleep(batch_delay)
        else:
            # Crawl tất cả cùng lúc (giới hạn bởi semaphore)
            print(f"🚀 Bắt đầu crawl {len(valid_girls)} girls (concurrent: {self.max_concurrent})\n")
            
            tasks = [
                self._crawl_one_girl_detail(girl, index, len(valid_girls), save_individual, save_combined, combined_file, all_details)
                for index, girl in valid_girls
            ]
            
            results = await asyncio.gather(*tasks)
            
            # Đếm kết quả
            for success, updated_girl in results:
                if success:
                    success_count += 1
                else:
                    failed_count += 1
        
        # Lưu tất cả vào 1 file tổng hợp (nếu cần và chưa lưu incremental)
        if not save_individual and not save_combined:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            all_details_file = f"all_details_{timestamp}.json"
            result = self.save_to_json(girls, all_details_file)
            print(f"\n💾 Đã lưu tất cả detail vào: {result.get('file', '')}")
        
        # Nếu đã lưu incremental, chỉ thông báo
        if save_combined and combined_file:
            print(f"\n💾 Đã lưu tất cả {len(all_details)} girls vào: {combined_file}")
        
        print(f"\n{'='*50}")
        print(f"✅ HOÀN THÀNH CRAWL DETAIL")
        print(f"   ✅ Thành công: {success_count}")
        print(f"   ❌ Thất bại: {failed_count}")
        if len(valid_girls) > 0:
            print(f"   📊 Tỷ lệ: {success_count/len(valid_girls)*100:.1f}%")
        print(f"{'='*50}\n")
        
        return {
            "total": len(valid_girls),
            "success": success_count,
            "failed": failed_count
        }


async def main():
    """Main function"""
    import sys
    
    # Parse concurrent settings
    max_concurrent = 3  # Mặc định
    delay_min = 2.0
    delay_max = 5.0
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
    
    crawler = GirlCrawler(max_concurrent=max_concurrent, delay_min=delay_min, delay_max=delay_max)
    
    try:
        # Parse arguments
        args = [arg for arg in sys.argv[1:] if not arg.startswith('--') and not arg.startswith('-')]
        flags = [arg for arg in sys.argv[1:] if arg.startswith('--') or arg.startswith('-')]
        
        # Parse flags
        crawl_details = '--detail' in sys.argv or '-d' in sys.argv
        listing_only = '--listing-only' in sys.argv or '--all-listing' in sys.argv
        auto_mode = '--auto' in sys.argv or '--full' in sys.argv  # Tự động crawl listing + detail
        detail_from_file = None
        for i, arg in enumerate(sys.argv):
            if arg in ['--detail-from-file', '--from-file'] and i + 1 < len(sys.argv):
                detail_from_file = sys.argv[i + 1]
                break
        save_individual = '--save-individual' in sys.argv or '--individual' in sys.argv
        save_combined = '--save-combined' in sys.argv or '--combined' in sys.argv or '--gop' in sys.argv
        auto_mode = '--auto' in sys.argv or '--full' in sys.argv  # Tự động crawl listing + detail
        
        # Mode 0: Auto mode - Tự động crawl listing + detail
        if auto_mode:
            max_pages = None
            if len(args) > 0:
                try:
                    max_pages = int(args[0])
                except:
                    pass
            
            print(f"\n{'='*60}")
            print(f"🚀 CHẾ ĐỘ TỰ ĐỘNG: Crawl listing + detail")
            print(f"{'='*60}")
            if max_pages:
                print(f"   📋 Số trang listing tối đa: {max_pages}")
            else:
                print(f"   📋 Crawl tất cả trang listing (tự động detect)")
            print(f"   🔍 Tự động crawl detail sau khi xong listing")
            print(f"   💾 Lưu riêng từng file: {save_individual}")
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
            print(f"✅ Hoàn thành crawl listing: {len(listing_result.get('girls', []))} girls")
            print(f"💾 File: {listing_file}")
            print(f"{'='*60}\n")
            
            # Hỏi xác nhận (có thể bỏ qua nếu muốn)
            print("⏳ Bắt đầu crawl detail sau 3 giây...\n")
            await asyncio.sleep(3)
            
            # Giai đoạn 2: Crawl detail
            detail_result = await crawler.crawl_details_from_listing_file(
                listing_file, 
                save_individual, 
                batch_size,
                save_combined
            )
            
            print(f"\n{'='*60}")
            print("✅ HOÀN THÀNH TẤT CẢ!")
            print(f"{'='*60}")
            print(f"📊 Listing: {len(listing_result.get('girls', []))} girls")
            if detail_result:
                print(f"📊 Detail - Thành công: {detail_result.get('success', 0)}")
                print(f"📊 Detail - Thất bại: {detail_result.get('failed', 0)}")
            print(f"💾 File listing: {listing_file}")
            if save_individual:
                print(f"💾 Files detail: data/details/*.json")
            print(f"{'='*60}\n")
            return
        
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
        
        # Mode 2: Chỉ crawl listing (tất cả trang)
        if listing_only:
            max_pages = None
            if len(args) > 0:
                max_pages = int(args[0])
            
            print(f"🚀 CHIẾN LƯỢC: Crawl listing only")
            if max_pages:
                print(f"   📋 Số trang tối đa: {max_pages}")
            else:
                print(f"   📋 Crawl tất cả trang (tự động detect)")
            print()
            
            result = await crawler.crawl_all_listing_pages(1, max_pages)
            print(f"\n{'='*50}")
            print("✅ HOÀN THÀNH!")
            print(f"{'='*50}")
            print(f"📊 Tổng crawl: {len(result.get('girls', []))} girls")
            print(f"💾 File listing: {result.get('listing_file', 'N/A')}")
            print(f"\n💡 Để crawl detail, chạy:")
            print(f"   python main.py --detail-from-file \"{result.get('listing_file', '')}\" --save-individual")
            return
        
        # Mode 3: Crawl bình thường (có thể kèm detail)
        if len(args) > 0:
            if len(args) >= 2:
                start_page = int(args[0])
                end_page = int(args[1])
                print(f"🚀 CHIẾN LƯỢC CRAWL:")
                print(f"   📋 Listing pages: {start_page} đến {end_page}")
                print(f"   🔍 Crawl detail: {crawl_details}")
                if crawl_details and save_individual:
                    print(f"   💾 Lưu riêng từng file: {save_individual}")
                print()
                
                if crawl_details and save_individual:
                    # Crawl listing trước
                    all_girls = []
                    for page_num in range(start_page, end_page + 1):
                        print(f"\n📄 Trang {page_num}/{end_page}")
                        girls = await crawler.crawl_girls_list(page_num, 60)
                        all_girls.extend(girls)
                        print(f"✅ Đã có tổng cộng {len(all_girls)} girls\n")
                        if page_num < end_page:
                            await asyncio.sleep(5)
                    
                    # Crawl detail và lưu riêng
                    print(f"\n{'='*50}")
                    print(f"🔍 Crawl detail cho {len(all_girls)} girls")
                    print(f"{'='*50}\n")
                    
                    for i, girl in enumerate(all_girls, 1):
                        if girl.get('detailUrl'):
                            print(f"[{i}/{len(all_girls)}] {girl.get('name', 'N/A')[:40]}...")
                            detail_data = await crawler.crawl_girl_detail(girl['detailUrl'])
                            if detail_data:
                                detail_url = girl.get('detailUrl')
                                girl.update(detail_data)
                                girl['detailUrl'] = detail_url
                                filepath = crawler.save_girl_detail_to_file(girl)
                                if filepath:
                                    print(f"   ✅ {os.path.basename(filepath)}")
                            await asyncio.sleep(2)
                    
                    result = {"totalCrawled": len(all_girls)}
                else:
                    result = await crawler.crawl_multiple_pages(start_page, end_page, crawl_details)
            else:
                page = int(args[0])
                limit = int(args[1]) if len(args) > 1 else 60
                print(f"🚀 CHIẾN LƯỢC CRAWL:")
                print(f"   📋 Listing page: {page} (limit: {limit})")
                print(f"   🔍 Crawl detail: {crawl_details}\n")
                result = await crawler.crawl_and_save(page, limit, crawl_details)
        else:
            # Default: crawl page 1
            print(f"🚀 CHIẾN LƯỢC CRAWL:")
            print(f"   📋 Listing page: 1 (mặc định)")
            print(f"   🔍 Crawl detail: {crawl_details}\n")
            result = await crawler.crawl_and_save(1, 60, crawl_details)
        
        print(f"\n{'='*50}")
        print("✅ HOÀN THÀNH!")
        print(f"{'='*50}")
        print(f"📊 Tổng crawl: {result.get('totalCrawled', result.get('crawled', 0))} girls")
        print(f"💾 Đã lưu vào: {result.get('file', 'N/A')}")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Đã dừng bởi người dùng")
    except Exception as e:
        import traceback
        print(f"\n❌ Lỗi: {str(e)}")
        traceback.print_exc()
    finally:
        try:
            await crawler.close_browser()
        except Exception as e:
            print(f"⚠️  Lỗi khi đóng browser: {e}")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"❌ Lỗi chương trình: {e}")

