"""
Script test để crawl một URL detail cụ thể
"""

import asyncio
import json
import sys
import os
from datetime import datetime
from main import GirlCrawler

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

async def test_detail_url(url: str):
    """Test crawl một URL detail"""
    crawler = GirlCrawler()
    
    try:
        print(f"Dang test crawl detail: {url}\n")
        detail_data = await crawler.crawl_girl_detail(url)
        
        if detail_data:
            print(f"\n{'='*50}")
            print("KET QUA CRAWL:")
            print(f"{'='*50}\n")
            print(json.dumps(detail_data, ensure_ascii=False, indent=2))
            
            # Lưu vào file
            data_dir = os.path.join(os.path.dirname(__file__), "data")
            os.makedirs(data_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"test_detail_{timestamp}.json"
            filepath = os.path.join(data_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(detail_data, f, ensure_ascii=False, indent=2)
            
            print(f"\nDa luu vao: {filepath}")
        else:
            print("Khong crawl duoc du lieu")
            
    except Exception as e:
        import traceback
        print(f"Loi: {str(e)}")
        traceback.print_exc()
    finally:
        await crawler.close_browser()

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "https://gaigu1.net/gai-goi/30725/%E2%9D%A4%EF%B8%8FYen-Nhi%E2%9D%A4%EF%B8%8FHang-Moi-Cho-Anh-Em---Cuc-Ky-Goi-Cam"
    asyncio.run(test_detail_url(url))

