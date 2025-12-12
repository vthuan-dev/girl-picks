"""
Script để import dữ liệu chat sex từ JSON vào database.
Sử dụng API backend để import.
"""

import json
import os
import sys
import requests
from typing import List, Dict
from datetime import datetime

# Thêm thư mục backend vào path để import
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend', 'src'))

def load_json_data(file_path: str) -> List[Dict]:
    """Load dữ liệu từ file JSON."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def transform_to_dto(crawled_data: Dict) -> Dict:
    """Transform dữ liệu từ crawler thành DTO cho API."""
    return {
        'name': crawled_data.get('name', '') or crawled_data.get('title', 'Unknown'),
        'title': crawled_data.get('title', ''),
        'age': crawled_data.get('age'),
        'bio': crawled_data.get('description', ''),
        'phone': crawled_data.get('phone', ''),
        'zalo': crawled_data.get('zalo', ''),
        'telegram': crawled_data.get('telegram', ''),
        'location': crawled_data.get('location', ''),
        'province': None,  # Có thể parse từ location nếu cần
        'address': crawled_data.get('location', ''),
        'price': crawled_data.get('price', ''),
        'services': crawled_data.get('services', []),
        'workingHours': crawled_data.get('workingHours', ''),
        'images': crawled_data.get('images', []),
        'coverImage': crawled_data.get('images', [])[0] if crawled_data.get('images') else None,
        'tags': [tag for tag in crawled_data.get('tags', []) if tag and tag not in ['Color', 'Transparency', 'Font Size', 'Text Edge Style', 'Font Family']],
        'isVerified': crawled_data.get('verified', False),
        'isFeatured': False,
        'isActive': True,
        'isAvailable': True,
        'rating': crawled_data.get('rating'),
        'sourceUrl': crawled_data.get('url', ''),
    }

def import_to_api(
    api_url: str,
    token: str,
    dtos: List[Dict],
    batch_size: int = 10
) -> Dict:
    """Import dữ liệu vào API theo batch."""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}',
    }
    
    results = {
        'success': 0,
        'failed': 0,
        'errors': [],
    }
    
    # Import theo batch
    for i in range(0, len(dtos), batch_size):
        batch = dtos[i:i + batch_size]
        print(f"Đang import batch {i // batch_size + 1} ({len(batch)} items)...")
        
        try:
            response = requests.post(
                f'{api_url}/bulk',
                json=batch,
                headers=headers,
                timeout=60,
            )
            
            if response.status_code == 201:
                data = response.json()
                results['success'] += data.get('success', 0)
                results['failed'] += data.get('failed', 0)
                if data.get('errors'):
                    results['errors'].extend(data['errors'])
                print(f"  ✓ Thành công: {data.get('success', 0)}, Thất bại: {data.get('failed', 0)}")
            else:
                print(f"  ❌ Lỗi HTTP {response.status_code}: {response.text}")
                results['failed'] += len(batch)
                results['errors'].extend([
                    {'data': dto, 'error': f'HTTP {response.status_code}: {response.text}'}
                    for dto in batch
                ])
        except Exception as e:
            print(f"  ❌ Lỗi: {e}")
            results['failed'] += len(batch)
            results['errors'].extend([
                {'data': dto, 'error': str(e)}
                for dto in batch
            ])
    
    return results

def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Import chat sex data to database')
    parser.add_argument('--file', '-f', required=True, help='Path to JSON file')
    parser.add_argument('--api-url', default='http://localhost:3000/api/chat-sex', help='API URL')
    parser.add_argument('--token', required=True, help='JWT token for authentication')
    parser.add_argument('--batch-size', type=int, default=10, help='Batch size for import')
    parser.add_argument('--dry-run', action='store_true', help='Dry run (no actual import)')
    
    args = parser.parse_args()
    
    # Load data
    print(f"📂 Đang đọc file: {args.file}")
    crawled_data = load_json_data(args.file)
    print(f"📊 Tổng cộng: {len(crawled_data)} items")
    
    # Transform
    print("🔄 Đang transform dữ liệu...")
    dtos = [transform_to_dto(item) for item in crawled_data]
    
    # Filter out invalid data
    valid_dtos = [dto for dto in dtos if dto['name'] and dto['name'] != 'Unknown']
    print(f"✓ Dữ liệu hợp lệ: {len(valid_dtos)}/{len(dtos)}")
    
    if args.dry_run:
        print("\n🔍 DRY RUN - Không import thực sự")
        print(f"\nMẫu dữ liệu (5 items đầu):")
        for i, dto in enumerate(valid_dtos[:5], 1):
            print(f"\n{i}. {dto['name']}")
            print(f"   Phone: {dto['phone']}")
            print(f"   Zalo: {dto['zalo']}")
            print(f"   Images: {len(dto['images'])}")
        return
    
    # Import
    print(f"\n🚀 Bắt đầu import vào {args.api_url}...")
    results = import_to_api(args.api_url, args.token, valid_dtos, args.batch_size)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 KẾT QUẢ IMPORT")
    print("=" * 60)
    print(f"✅ Thành công: {results['success']}")
    print(f"❌ Thất bại: {results['failed']}")
    
    if results['errors']:
        print(f"\n⚠️  Có {len(results['errors'])} lỗi:")
        for error in results['errors'][:10]:  # Show first 10 errors
            print(f"  - {error.get('error', 'Unknown error')}")
        if len(results['errors']) > 10:
            print(f"  ... và {len(results['errors']) - 10} lỗi khác")
    
    print("=" * 60)

if __name__ == '__main__':
    main()

