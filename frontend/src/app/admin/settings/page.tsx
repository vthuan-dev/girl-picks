'use client';

import { useState } from 'react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'Tìm Gái gọi',
    siteDescription: 'Nền tảng đặt lịch dịch vụ giải trí',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxFileSize: 5,
    allowedFileTypes: ['jpg', 'png', 'jpeg'],
  });

  const tabs = [
    { id: 'general', label: 'Cài đặt chung', icon: '⚙️' },
    { id: 'security', label: 'Bảo mật', icon: '🔒' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'storage', label: 'Lưu trữ', icon: '💾' },
  ];

  const handleSave = () => {
    // Handle save logic
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Cài đặt</h1>
        <p className="text-text-muted">Quản lý cài đặt hệ thống</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-background-light rounded-lg border border-secondary/30 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer mb-1 last:mb-0
                  ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-text hover:bg-background'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-background-light rounded-lg border border-secondary/30 p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text mb-4">Cài đặt chung</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Tên website
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Mô tả website
                    </label>
                    <textarea
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-text resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-secondary/30">
                    <div>
                      <p className="font-medium text-text">Chế độ bảo trì</p>
                      <p className="text-sm text-text-muted">Tạm thời tắt website để bảo trì</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary/50 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text mb-4">Bảo mật</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-secondary/30">
                    <div>
                      <p className="font-medium text-text">Cho phép đăng ký</p>
                      <p className="text-sm text-text-muted">Cho phép người dùng mới đăng ký tài khoản</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.allowRegistration}
                        onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary/50 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-secondary/30">
                    <div>
                      <p className="font-medium text-text">Yêu cầu xác thực email</p>
                      <p className="text-sm text-text-muted">Người dùng phải xác thực email trước khi sử dụng</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.requireEmailVerification}
                        onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary/50 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text mb-4">Cài đặt Email</h2>
                <div className="p-8 text-center border-2 border-dashed border-secondary/30 rounded-lg">
                  <p className="text-text-muted">Cài đặt email sẽ được tích hợp sau</p>
                </div>
              </div>
            )}

            {activeTab === 'storage' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text mb-4">Lưu trữ</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Kích thước file tối đa (MB)
                    </label>
                    <input
                      type="number"
                      value={settings.maxFileSize}
                      onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Loại file được phép
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {settings.allowedFileTypes.map((type, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm font-medium"
                        >
                          .{type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 pt-6 border-t border-secondary/30 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

