'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CrawlerPage() {
  const [copied, setCopied] = useState<string | null>(null);
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Đã copy!');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-light to-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-xl shadow-primary/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">Crawler Management</h1>
          <p className="text-text-muted">Crawl dữ liệu từ gaigu1.net/gai-goi</p>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-yellow-500/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-primary/30 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-text mb-2">Hướng dẫn sử dụng Python Crawler</h2>
              <p className="text-text-muted text-sm mb-4">
                Crawler được viết bằng Python và chạy độc lập. Sử dụng các lệnh dưới đây để crawl dữ liệu.
              </p>
            </div>
          </div>
        </div>

        {/* Installation */}
        <div className="bg-background-light/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-secondary/30 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-text mb-2">1. Cài đặt</h2>
              <div className="space-y-3">
                <div className="bg-background rounded-lg p-4 border border-secondary/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-text-muted">Cài đặt dependencies</span>
                    <button
                      onClick={() => copyToClipboard('cd crawler\npip install -r requirements.txt\nplaywright install chromium', 'install')}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm transition-colors"
                    >
                      {copied === 'install' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <code className="text-sm text-text-muted font-mono block whitespace-pre-wrap">
{`cd crawler
pip install -r requirements.txt
playwright install chromium`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Commands */}
        <div className="bg-background-light/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-secondary/30 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-text mb-2">2. Chạy Crawler</h2>
              <div className="space-y-3">
                <div className="bg-background rounded-lg p-4 border border-secondary/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-text-muted">Crawl trang 1 (mặc định)</span>
                    <button
                      onClick={() => copyToClipboard('cd crawler\npython main.py', 'cmd1')}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm transition-colors"
                    >
                      {copied === 'cmd1' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <code className="text-sm text-text-muted font-mono block">
                    cd crawler{'\n'}python main.py
                  </code>
                </div>

                <div className="bg-background rounded-lg p-4 border border-secondary/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-text-muted">Crawl trang cụ thể</span>
                    <button
                      onClick={() => copyToClipboard('cd crawler\npython main.py 1 30', 'cmd2')}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm transition-colors"
                    >
                      {copied === 'cmd2' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <code className="text-sm text-text-muted font-mono block">
                    cd crawler{'\n'}python main.py 1 30
                  </code>
                  <p className="text-xs text-text-muted mt-2">Trang 1, limit 30 items</p>
                </div>

                <div className="bg-background rounded-lg p-4 border border-secondary/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-text-muted">Crawl nhiều trang</span>
                    <button
                      onClick={() => copyToClipboard('cd crawler\npython main.py 1 5', 'cmd3')}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm transition-colors"
                    >
                      {copied === 'cmd3' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <code className="text-sm text-text-muted font-mono block">
                    cd crawler{'\n'}python main.py 1 5
                  </code>
                  <p className="text-xs text-text-muted mt-2">Crawl từ trang 1 đến trang 5</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-400 mb-1">Lưu ý</h3>
              <ul className="text-sm text-text-muted space-y-1 list-disc list-inside">
                <li>Dữ liệu sẽ được lưu tự động vào file JSON trong thư mục <code className="bg-background-light px-1.5 py-0.5 rounded">crawler/data/</code></li>
                <li>Tên file: <code className="bg-background-light px-1.5 py-0.5 rounded">crawled_girls_YYYYMMDD_HHMMSS.json</code></li>
                <li>Crawler sẽ tự động delay 5 giây giữa các trang khi crawl nhiều trang</li>
                <li>Khi crawl nhiều trang, tất cả dữ liệu sẽ được lưu vào một file JSON duy nhất</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

