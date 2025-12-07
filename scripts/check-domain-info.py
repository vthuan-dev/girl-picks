#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script để kiểm tra thông tin domain gaigu1.net
Sử dụng whois library hoặc API
"""

import subprocess
import sys
import json
import os
from datetime import datetime

# Set UTF-8 encoding for Windows
if sys.platform == 'win32':
    os.system('chcp 65001 >nul 2>&1')

def check_domain_whois(domain):
    """Check domain info using whois command"""
    try:
        # Try using whois command if available
        result = subprocess.run(
            ['whois', domain],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.stdout
    except FileNotFoundError:
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def check_domain_via_api(domain):
    """Check domain via web API"""
    import urllib.request
    import urllib.parse
    
    try:
        # Use whoisxmlapi.com free API
        url = f"https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=demo&domainName={domain}&outputFormat=JSON"
        
        with urllib.request.urlopen(url, timeout=10) as response:
            data = json.loads(response.read())
            return data
    except Exception as e:
        print(f"API Error: {e}")
        return None

def parse_whois_info(whois_text):
    """Parse whois text to extract key information"""
    if not whois_text:
        return None
    
    info = {
        'creation_date': None,
        'expiration_date': None,
        'registrar': None,
        'status': None,
    }
    
    lines = whois_text.lower()
    
    # Try to find creation date
    for line in whois_text.split('\n'):
        if 'creation date' in line.lower() or 'created' in line.lower():
            info['creation_date'] = line.strip()
        if 'expiration date' in line.lower() or 'expires' in line.lower() or 'expiry' in line.lower():
            info['expiration_date'] = line.strip()
        if 'registrar:' in line.lower():
            info['registrar'] = line.strip()
        if 'status:' in line.lower():
            info['status'] = line.strip()
    
    return info

def main():
    domain = 'gaigu1.net'
    
    print(f"🔍 Đang kiểm tra thông tin domain: {domain}\n")
    print("=" * 60)
    
    # Method 1: Try whois command
    print("\n📋 Method 1: Using whois command...")
    whois_text = check_domain_whois(domain)
    
    if whois_text:
        print("✅ Found whois information:")
        print("-" * 60)
        
        # Extract key info
        info = parse_whois_info(whois_text)
        if info:
            for key, value in info.items():
                if value:
                    print(f"{key.replace('_', ' ').title()}: {value}")
        
        # Show first 30 lines
        lines = whois_text.split('\n')[:30]
        print("\n📄 Full whois output (first 30 lines):")
        print("-" * 60)
        for line in lines:
            if line.strip():
                print(line)
    else:
        print("❌ whois command not available")
    
    # Method 2: Try API
    print("\n\n📋 Method 2: Using API...")
    api_data = check_domain_via_api(domain)
    
    if api_data:
        print("✅ Found API information:")
        print("-" * 60)
        if 'WhoisRecord' in api_data:
            record = api_data['WhoisRecord']
            if 'createdDate' in record:
                print(f"Creation Date: {record['createdDate']}")
            if 'expiresDate' in record:
                print(f"Expiration Date: {record['expiresDate']}")
            if 'registrarName' in record:
                print(f"Registrar: {record['registrarName']}")
    else:
        print("❌ API not available")
    
    print("\n" + "=" * 60)
    print("\n💡 Cách khác để kiểm tra:")
    print("1. Truy cập: https://whois.net/gaigu1.net")
    print("2. Truy cập: https://www.whois.com/whois/gaigu1.net")
    print("3. Truy cập: https://lookup.icann.org/")
    print("4. Sử dụng command: nslookup gaigu1.net")
    
    print("\n📝 Lưu ý:")
    print("- Domain .net là domain quốc tế")
    print("- Thông tin có thể bị ẩn nếu domain có privacy protection")
    print("- Cần kiểm tra email từ registrar để biết chính xác ngày đăng ký")

if __name__ == '__main__':
    main()

