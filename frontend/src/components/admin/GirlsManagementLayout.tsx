'use client';

import { useState, useEffect } from 'react';
import { girlsApi, Girl } from '@/modules/admin/api/girls.api';
import toast from 'react-hot-toast';
import IconButton from '@/components/admin/IconButton';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface UserWithoutProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  isActive: boolean;
}

interface GirlsManagementLayoutProps {
  onCreateProfile: (userId: string) => void;
  onViewGirl: (id: string) => void;
  onEditGirl: (id: string) => void;
  onDeleteGirl: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onApproveVerification: (id: string) => void;
  onRejectVerification: (id: string) => void;
}

export default function GirlsManagementLayout({
  onCreateProfile,
  onViewGirl,
  onEditGirl,
  onDeleteGirl,
  onToggleStatus,
  onApproveVerification,
  onRejectVerification,
}: GirlsManagementLayoutProps) {
  const [girls, setGirls] = useState<Girl[]>([]);
  const [usersWithoutProfile, setUsersWithoutProfile] = useState<UserWithoutProfile[]>([]);
  const [isLoadingGirls, setIsLoadingGirls] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadGirls();
    loadUsersWithoutProfile();
  }, [searchQuery]);

  const loadGirls = async () => {
    setIsLoadingGirls(true);
    try {
      const response = await girlsApi.getAllAdmin({
        search: searchQuery || undefined,
        page: 1,
        limit: 50,
      });
      if (response && Array.isArray(response.data)) {
        setGirls(response.data);
      }
    } catch (error: any) {
      toast.error('Không thể tải danh sách gái gọi');
    } finally {
      setIsLoadingGirls(false);
    }
  };

  const loadUsersWithoutProfile = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await girlsApi.getGirlsWithoutProfile({
        page: 1,
        limit: 50,
      });
      if (response && Array.isArray(response.data)) {
        setUsersWithoutProfile(response.data);
      }
    } catch (error: any) {
      toast.error('Không thể tải danh sách users chưa có profile');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const filteredGirls = girls.filter((girl) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      girl.name?.toLowerCase().includes(query) ||
      girl.user?.email.toLowerCase().includes(query) ||
      girl.user?.phone?.toLowerCase().includes(query)
    );
  });

  const filteredUsers = usersWithoutProfile.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Girls with Full Profile */}
      <div className="bg-background-light rounded-xl border border-secondary/30 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-text flex items-center gap-2">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Đã có đủ thông tin
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {filteredGirls.length} gái gọi đã có profile đầy đủ
            </p>
          </div>
          <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-semibold">
            {filteredGirls.length}
          </span>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Girls List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {isLoadingGirls ? (
            <div className="text-center py-8 text-text-muted">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Đang tải...</p>
            </div>
          ) : filteredGirls.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <p>Không có gái gọi nào</p>
            </div>
          ) : (
            filteredGirls.map((girl) => (
              <div
                key={girl.id}
                className="bg-background rounded-lg border border-secondary/30 p-4 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => onViewGirl(girl.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                    {girl.images && Array.isArray(girl.images) && girl.images.length > 0 ? (
                      <img
                        src={girl.images[0]}
                        alt={girl.name || 'Girl'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-pink-500 font-bold text-lg">
                        {girl.name?.charAt(0) || 'G'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text truncate">{girl.name || 'N/A'}</p>
                        {girl.user && (
                          <p className="text-sm text-text-muted truncate">{girl.user.email}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {girl.needsReverify && (
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded text-xs font-medium">
                            Chờ duyệt lại
                          </span>
                        )}
                        {girl.verificationStatus === 'PENDING' && (
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onApproveVerification(girl.id);
                              }}
                              className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs hover:bg-green-500/30 transition-colors"
                              title="Duyệt"
                            >
                              ✓
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRejectVerification(girl.id);
                              }}
                              className="px-2 py-1 bg-red-500/20 text-red-500 rounded text-xs hover:bg-red-500/30 transition-colors"
                              title="Từ chối"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {girl.verificationStatus === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-500 rounded text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Đã xác thực
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Chưa xác thực
                        </span>
                      )}
                      <span className="text-xs text-text-muted">
                        ★ {girl.ratingAverage?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Users without Profile */}
      <div className="bg-background-light rounded-xl border border-secondary/30 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-text flex items-center gap-2">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Chưa có đủ thông tin
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {filteredUsers.length} tài khoản chưa có profile
            </p>
          </div>
          <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs font-semibold">
            {filteredUsers.length}
          </span>
        </div>

        {/* Warning Banner */}
        <div className="mb-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
          <p className="text-sm text-orange-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Cần cập nhật thông tin để hoàn tất hồ sơ
          </p>
        </div>

        {/* Users List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {isLoadingUsers ? (
            <div className="text-center py-8 text-text-muted">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Đang tải...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <p>Tất cả đã có đủ thông tin</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-background rounded-lg border border-secondary/30 p-4 hover:border-orange-500/50 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-orange-500 font-bold text-lg">
                        {user.fullName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text truncate">{user.fullName}</p>
                    <p className="text-sm text-text-muted truncate">{user.email}</p>
                    {user.phone && (
                      <p className="text-xs text-text-muted mt-1">{user.phone}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => onCreateProfile(user.id)}
                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors font-medium"
                      >
                        Tạo hồ sơ
                      </button>
                      <span className="text-xs text-text-muted">
                        {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

