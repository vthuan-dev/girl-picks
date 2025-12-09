'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/admin/Button';
import { settingsApi, SystemSettings } from '@/modules/admin/api/settings.api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Tìm Gái gọi',
    siteDescription: 'Nền tảng đặt lịch dịch vụ giải trí',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
    maxFileSize: 5,
    allowedFileTypes: ['jpg', 'png', 'jpeg'],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    {
      id: 'general',
      label: 'Cài đặt chung',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'security',
      label: 'Bảo mật',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'storage',
      label: 'Lưu trữ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ),
    },
    {
      id: 'pages',
      label: 'Nội dung trang',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await settingsApi.getAll();
      setSettings(data);
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast.error('Không thể tải cài đặt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.update(settings);
      toast.success('Lưu cài đặt thành công');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'Không thể lưu cài đặt');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Cài đặt</h1>
          <p className="text-text-muted">Quản lý cài đặt hệ thống</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-background-light rounded-xl border border-secondary/30 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer mb-1 last:mb-0
                  ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-md'
                      : 'text-text hover:bg-background hover:text-primary'
                  }
                `}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="bg-background-light rounded-xl border border-secondary/30 p-12">
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-text-muted">Đang tải...</span>
              </div>
            </div>
          ) : (
            <div className="bg-background-light rounded-xl border border-secondary/30 p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-text mb-4">Cài đặt chung</h2>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Tên website
                      </label>
                      <input
                        type="text"
                        value={settings.siteName || ''}
                        onChange={(e) => updateSetting('siteName', e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-text"
                        placeholder="Nhập tên website"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Mô tả website
                      </label>
                      <textarea
                        value={settings.siteDescription || ''}
                        onChange={(e) => updateSetting('siteDescription', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-text resize-none"
                        placeholder="Nhập mô tả website"
                      />
                    </div>

                    <div className="flex items-center justify-between p-5 bg-background rounded-xl border border-secondary/30">
                      <div className="flex-1">
                        <p className="font-semibold text-text mb-1">Chế độ bảo trì</p>
                        <p className="text-sm text-text-muted">Tạm thời tắt website để bảo trì</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.maintenanceMode || false}
                          onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
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
                    <div className="flex items-center justify-between p-5 bg-background rounded-xl border border-secondary/30">
                      <div className="flex-1">
                        <p className="font-semibold text-text mb-1">Cho phép đăng ký</p>
                        <p className="text-sm text-text-muted">Cho phép người dùng mới đăng ký tài khoản</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.allowRegistration ?? true}
                          onChange={(e) => updateSetting('allowRegistration', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-secondary/50 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-background rounded-xl border border-secondary/30">
                      <div className="flex-1">
                        <p className="font-semibold text-text mb-1">Yêu cầu xác thực email</p>
                        <p className="text-sm text-text-muted">Người dùng phải xác thực email trước khi sử dụng</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.requireEmailVerification || false}
                          onChange={(e) => updateSetting('requireEmailVerification', e.target.checked)}
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
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.emailHost || ''}
                        onChange={(e) => updateSetting('emailHost', e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-text"
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-text mb-2">
                          Port
                        </label>
                        <input
                          type="number"
                          value={settings.emailPort || 587}
                          onChange={(e) => updateSetting('emailPort', parseInt(e.target.value) || 587)}
                          className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-text"
                          placeholder="587"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text mb-2">
                          Email gửi từ
                        </label>
                        <input
                          type="email"
                          value={settings.emailFrom || ''}
                          onChange={(e) => updateSetting('emailFrom', e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-text"
                          placeholder="noreply@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={settings.emailUser || ''}
                        onChange={(e) => updateSetting('emailUser', e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-text"
                        placeholder="your-email@gmail.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={settings.emailPassword || ''}
                        onChange={(e) => updateSetting('emailPassword', e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-text"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'storage' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-text mb-4">Lưu trữ</h2>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Nhà cung cấp lưu trữ
                      </label>
                      <select
                        value={settings.storageProvider || 'local'}
                        onChange={(e) => updateSetting('storageProvider', e.target.value as 'local' | 'cloudinary' | 's3')}
                        className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-pointer"
                      >
                        <option value="local">Local Storage</option>
                        <option value="cloudinary">Cloudinary</option>
                        <option value="s3">AWS S3</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Kích thước file tối đa (MB)
                      </label>
                      <input
                        type="number"
                        value={settings.maxFileSize || 5}
                        onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value) || 5)}
                        className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-text"
                        min="1"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Loại file được phép
                      </label>
                      <div className="flex flex-wrap gap-2 p-4 bg-background rounded-xl border border-secondary/30">
                        {(settings.allowedFileTypes || ['jpg', 'png', 'jpeg']).map((type, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm font-medium"
                          >
                            .{type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pages' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-text mb-4">Nội dung trang</h2>
                  
                  <div className="space-y-6">
                    {/* Quy định */}
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Nội dung trang Quy định
                      </label>
                      <p className="text-xs text-text-muted mb-2">Hỗ trợ HTML. Nội dung sẽ hiển thị tại /quy-dinh</p>
                      <textarea
                        value={settings.rulesContent || ''}
                        onChange={(e) => updateSetting('rulesContent', e.target.value)}
                        rows={10}
                        className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-text resize-y font-mono text-sm"
                        placeholder="<h2>Quy định sử dụng</h2>&#10;<p>Nội dung quy định...</p>"
                      />
                    </div>

                    {/* Điều khoản */}
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Nội dung trang Điều khoản
                      </label>
                      <p className="text-xs text-text-muted mb-2">Hỗ trợ HTML. Nội dung sẽ hiển thị tại /terms</p>
                      <textarea
                        value={settings.termsContent || ''}
                        onChange={(e) => updateSetting('termsContent', e.target.value)}
                        rows={10}
                        className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-text resize-y font-mono text-sm"
                        placeholder="<h2>Điều khoản sử dụng</h2>&#10;<p>Nội dung điều khoản...</p>"
                      />
                    </div>

                    {/* Chính sách bảo mật */}
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Nội dung trang Chính sách bảo mật
                      </label>
                      <p className="text-xs text-text-muted mb-2">Hỗ trợ HTML. Nội dung sẽ hiển thị tại /privacy</p>
                      <textarea
                        value={settings.privacyContent || ''}
                        onChange={(e) => updateSetting('privacyContent', e.target.value)}
                        rows={10}
                        className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-text resize-y font-mono text-sm"
                        placeholder="<h2>Chính sách bảo mật</h2>&#10;<p>Nội dung chính sách...</p>"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-secondary/30 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
