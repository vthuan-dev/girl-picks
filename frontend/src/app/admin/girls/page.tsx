'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/admin/Button';
import IconButton from '@/components/admin/IconButton';
import { girlsApi, Girl as AdminGirl } from '@/modules/admin/api/girls.api';
import { adminApi } from '@/modules/admin/api/admin.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import GirlsManagementLayout from '@/components/admin/GirlsManagementLayout';

export default function AdminGirlsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [verificationFilter, setVerificationFilter] = useState('Tất cả');
  type ExtendedGirl = AdminGirl & {
    phone?: string;
    price?: string | null;
    workingHours?: string | null;
    height?: string | number | null;
    weight?: string | number | null;
    measurements?: string | null;
    location?: string | null;
    province?: string | null;
    address?: string | null;
    services?: string[];
    tags?: string[];
  };

  const [girls, setGirls] = useState<ExtendedGirl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    active: 0,
    pending: 0,
  });

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createProfileModalOpen, setCreateProfileModalOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string; fullName: string } | null>(null);
  const [selectedGirl, setSelectedGirl] = useState<ExtendedGirl | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    age: 0,
    districts: [] as string[],
    isFeatured: false,
    isPremium: false,
  });

  // Create form state
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    bio: '',
    districts: '' as string, // comma separated input
    images: '' as string, // comma separated URLs (for backward compatibility)
    age: '',
  });
  
  // Image upload state for profile creation
  const [profileImages, setProfileImages] = useState<File[]>([]);
  const [profileImagePreviews, setProfileImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    loadGirls();
    loadStats();
  }, [statusFilter, verificationFilter, page, searchQuery]);

  const loadGirls = async () => {
    setIsLoading(true);
    try {
      const isActive =
        statusFilter === 'Tất cả'
          ? undefined
          : statusFilter === 'Hoạt động'
            ? true
            : statusFilter === 'Tạm khóa'
              ? false
              : undefined;

      const verificationStatus =
        verificationFilter === 'Tất cả'
          ? undefined
          : verificationFilter === 'Đã xác thực'
            ? 'VERIFIED'
            : verificationFilter === 'Chưa xác thực'
              ? 'PENDING'
              : undefined;

      const response = await girlsApi.getAllAdmin({
        search: searchQuery || undefined,
        isActive,
        verificationStatus,
        page,
        limit: 20,
      });

      if (response && Array.isArray(response.data)) {
        setGirls(response.data);
        setTotalPages(response.totalPages || 1);
      } else {
        console.error('Invalid response format:', response);
        setGirls([]);
        setTotalPages(1);
        toast.error('Dữ liệu không đúng định dạng');
      }
    } catch (error: any) {
      console.error('Error loading girls:', error);
      setGirls([]);
      setTotalPages(1);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách gái gọi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddNew = () => {
    setCreateForm({
      email: '',
      password: '',
      fullName: '',
      phone: '',
      bio: '',
      districts: '',
      images: '',
      age: '',
    });
    setCreateModalOpen(true);
  };

  const handleCreate = async () => {
    // Basic validate - chỉ cần email, password, fullName
    if (!createForm.email.trim() || !createForm.password.trim() || !createForm.fullName.trim()) {
      toast.error('Vui lòng nhập email, mật khẩu và họ tên');
      return;
    }
    
    // Validate password format (min 8 chars, uppercase, lowercase, number)
    const password = createForm.password.trim();
    if (password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      toast.error('Mật khẩu phải bao gồm chữ hoa, chữ thường và số');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createForm.email.trim())) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    setIsCreating(true);
    try {
      const result = await girlsApi.createAdmin({
        email: createForm.email.trim(),
        password: createForm.password.trim(),
        fullName: createForm.fullName.trim(),
        phone: createForm.phone.trim() || undefined,
      });
      
      // Backend returns { success: true, data: { user, needsProfileSetup } }
      // After unwrapResponse: { user, needsProfileSetup }
      const user = (result as any)?.user;
      
      if (!user || !user.id) {
        console.error('Invalid response format:', result);
        throw new Error('Định dạng phản hồi từ server không hợp lệ');
      }
      
      toast.success('Tạo tài khoản gái gọi thành công');
      setCreateModalOpen(false);
      
      // Luôn hỏi admin có muốn tạo profile không
      setSelectedUser({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      });
      setCreateProfileModalOpen(true);
      
      // Reload để cập nhật danh sách
      await loadGirls();
      await loadStats();
    } catch (error: any) {
      console.error('Create girl error:', error);
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('CONNECTION_REFUSED')) {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy trên port 8000 không.');
      } else if (error?.response?.status === 400) {
        // Validation error - show detailed message
        const errorData = error?.response?.data;
        let errorMessage = 'Xác thực thất bại.';
        
        // Check for errors array first (from ValidationExceptionFilter)
        if (errorData?.errors) {
          const errors = Array.isArray(errorData.errors) 
            ? errorData.errors 
            : [errorData.errors];
          errorMessage = `Xác thực thất bại: ${errors.join(', ')}`;
        } else if (errorData?.message) {
          // Fallback to message field
          errorMessage = Array.isArray(errorData.message)
            ? `Xác thực thất bại: ${errorData.message.join(', ')}`
            : `Xác thực thất bại: ${errorData.message}`;
        } else {
          errorMessage = 'Xác thực thất bại. Mật khẩu phải có ít nhất 8 ký tự bao gồm chữ hoa, chữ thường và số.';
        }
        
        toast.error(errorMessage);
      } else {
        toast.error(error?.response?.data?.message || error?.message || 'Không thể tạo tài khoản');
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Upload image helper function
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload/post', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      if (data.success && data.url) {
        // Convert relative URL to absolute URL
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        return `${baseUrl}${data.url}`;
      }
      throw new Error('Invalid response from upload');
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleCreateProfile = async () => {
    if (!selectedUser) return;
    
    setIsCreatingProfile(true);
    try {
      let imageUrls: string[] = [];
      
      // Upload images if files are selected
      if (profileImages.length > 0) {
        const loadingToast = toast.loading('Đang tải ảnh lên...');
        imageUrls = await Promise.all(profileImages.map((file) => uploadImage(file)));
        toast.dismiss(loadingToast);
      } else if (createForm.images.trim()) {
        // Fallback to URL input if no files uploaded
        imageUrls = createForm.images.split(',').map((d) => d.trim()).filter(Boolean);
      }
      
      await girlsApi.createGirlProfile(selectedUser.id, {
        bio: createForm.bio.trim() || undefined,
        age: createForm.age ? parseInt(createForm.age, 10) || undefined : undefined,
        districts: createForm.districts
          ? createForm.districts.split(',').map((d) => d.trim()).filter(Boolean)
          : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        name: createForm.fullName.trim(),
      });
      
      toast.success('Tạo hồ sơ thành công');
      setCreateProfileModalOpen(false);
      setSelectedUser(null);
      // Reset image state
      setProfileImages([]);
      setProfileImagePreviews([]);
      await loadGirls();
      await loadStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo hồ sơ');
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleCreateProfileFromUser = (userId: string) => {
    // Reset form và mở modal tạo profile
    setCreateForm({
      email: '',
      password: '',
      fullName: '',
      phone: '',
      bio: '',
      districts: '',
      images: '',
      age: '',
    });
    // Reset image state
    setProfileImages([]);
    setProfileImagePreviews([]);
    // Load user info nếu cần
    setSelectedUser({ id: userId, email: '', fullName: '' });
    setCreateProfileModalOpen(true);
  };
  
  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Validate file types
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast.error('Chỉ chấp nhận file ảnh');
    }
    
    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const sizeValidFiles = validFiles.filter(file => file.size <= maxSize);
    if (sizeValidFiles.length !== validFiles.length) {
      toast.error('Một số file vượt quá 5MB');
    }
    
    // Add to state
    const newFiles = [...profileImages, ...sizeValidFiles];
    setProfileImages(newFiles);
    
    // Create previews
    const newPreviews = sizeValidFiles.map(file => URL.createObjectURL(file));
    setProfileImagePreviews([...profileImagePreviews, ...newPreviews]);
    
    // Reset input
    e.target.value = '';
  };
  
  // Remove image
  const handleRemoveImage = (index: number) => {
    // Revoke preview URL to prevent memory leak
    URL.revokeObjectURL(profileImagePreviews[index]);
    
    setProfileImages(profileImages.filter((_, i) => i !== index));
    setProfileImagePreviews(profileImagePreviews.filter((_, i) => i !== index));
  };

  const loadStats = async () => {
    try {
      const dashboardStats = await adminApi.getDashboardStats();
      const allGirlsResponse = await girlsApi.getAllAdmin({ limit: 1000 });
      const allGirls = (allGirlsResponse?.data && Array.isArray(allGirlsResponse.data)) 
        ? allGirlsResponse.data 
        : [];
      
      setStats({
        total: allGirls.length,
        verified: allGirls.filter((g) => g.verificationStatus === 'VERIFIED').length,
        active: allGirls.filter((g) => g.isActive).length,
        pending: dashboardStats.pending?.verifications || 0,
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const handleView = async (id: string) => {
    setIsLoadingDetail(true);
    setViewModalOpen(true);
    try {
      const girl = await girlsApi.getDetailsAdmin(id);
      setSelectedGirl(girl as ExtendedGirl);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải chi tiết');
      setViewModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleEdit = async (id: string) => {
    setIsLoadingDetail(true);
    setEditModalOpen(true);
    try {
      const girl = await girlsApi.getDetailsAdmin(id);
      setSelectedGirl(girl as ExtendedGirl);
      setEditForm({
        name: girl.name || '',
        bio: girl.bio || '',
        age: girl.age || 0,
        districts: girl.districts || [],
        isFeatured: girl.isFeatured || false,
        isPremium: girl.isPremium || false,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải thông tin');
      setEditModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedGirl) return;
    
    setIsSaving(true);
    try {
      await girlsApi.updateAdmin(selectedGirl.id, editForm);
      toast.success('Cập nhật thành công');
      setEditModalOpen(false);
      setSelectedGirl(null);
      loadGirls();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    const girl = girls.find(g => g.id === id);
    if (girl) {
      setSelectedGirl(girl);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGirl) return;

    setIsDeleting(true);
    try {
      await girlsApi.deleteAdmin(selectedGirl.id);
      toast.success('Xóa gái gọi thành công');
      setDeleteModalOpen(false);
      setSelectedGirl(null);
      loadGirls();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa gái gọi');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await girlsApi.updateStatus(id, isActive);
      toast.success(isActive ? 'Kích hoạt thành công' : 'Tạm khóa thành công');
      loadGirls();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleApproveVerification = async (id: string) => {
    try {
      await girlsApi.approveVerification(id);
      toast.success('Duyệt xác thực thành công');
      loadGirls();
      loadStats();
      // Reload detail if viewing this girl
      if (selectedGirl && selectedGirl.id === id) {
        handleView(id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể duyệt xác thực');
    }
  };

  const handleRejectVerification = async (id: string) => {
    const reason = prompt('Nhập lý do từ chối (tùy chọn):');
    try {
      await girlsApi.rejectVerification(id, reason || 'Không đạt yêu cầu');
      toast.success('Từ chối xác thực thành công');
      loadGirls();
      loadStats();
      // Reload detail if viewing this girl
      if (selectedGirl && selectedGirl.id === id) {
        handleView(id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể từ chối xác thực');
    }
  };

  const statuses = ['Tất cả', 'Hoạt động', 'Tạm khóa'];
  const verifications = ['Tất cả', 'Đã xác thực', 'Chưa xác thực'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Quản lý Gái gọi</h1>
          <p className="text-text-muted">Quản lý tất cả gái gọi trong hệ thống</p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAddNew}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm gái gọi
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background-light rounded-xl border border-secondary/30 p-5 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Tổng số</p>
            <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
        </div>
        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Đã xác thực</p>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.verified}</p>
        </div>
        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Đang hoạt động</p>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.active}</p>
        </div>
        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Chờ duyệt</p>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.pending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background-light rounded-xl border border-secondary/30 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-text"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                  ${
                    statusFilter === status
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-background border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
                  }
                `}
              >
                {status}
              </button>
            ))}
            {verifications.map((verification) => (
              <button
                key={verification}
                onClick={() => setVerificationFilter(verification)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                  ${
                    verificationFilter === verification
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-background border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
                  }
                `}
              >
                {verification}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Girls Management Layout - 2 Columns */}
      <GirlsManagementLayout
        onCreateProfile={handleCreateProfileFromUser}
        onViewGirl={handleView}
        onEditGirl={handleEdit}
        onDeleteGirl={handleDeleteClick}
        onToggleStatus={handleToggleStatus}
        onApproveVerification={handleApproveVerification}
        onRejectVerification={handleRejectVerification}
      />

      {/* View Modal */}
      {viewModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewModalOpen(false);
              setSelectedGirl(null);
            }
          }}
        >
          <div className="bg-background-light rounded-2xl border border-secondary/30 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text">Chi tiết Gái gọi</h2>
                  <p className="text-sm text-text-muted">Thông tin đầy đủ</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedGirl(null);
                }}
                className="p-2 hover:bg-background rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : selectedGirl ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Tên</label>
                      <p className="text-text font-medium">{selectedGirl.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Tuổi</label>
                      <p className="text-text font-medium">{selectedGirl.age || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Email</label>
                      <p className="text-text font-medium">{selectedGirl.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Số điện thoại</label>
                      <p className="text-text font-medium">{selectedGirl.phone || selectedGirl.user?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Xác thực</label>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                        selectedGirl.verificationStatus === 'VERIFIED' 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {selectedGirl.verificationStatus === 'VERIFIED' ? 'Đã xác thực' : 'Chưa xác thực'}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Trạng thái</label>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                        selectedGirl.isActive 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {selectedGirl.isActive ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </div>
                  </div>

                  {/* Extra Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Giá</label>
                      <p className="text-text font-medium">{selectedGirl.price || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Giờ làm việc</label>
                      <p className="text-text font-medium">{selectedGirl.workingHours || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Chiều cao</label>
                      <p className="text-text font-medium">{selectedGirl.height || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Cân nặng</label>
                      <p className="text-text font-medium">{selectedGirl.weight || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Số đo</label>
                      <p className="text-text font-medium">{selectedGirl.measurements || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Khu vực / Tỉnh</label>
                      <p className="text-text font-medium">
                        {selectedGirl.location || selectedGirl.province || selectedGirl.address || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  {selectedGirl.bio && (
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Mô tả</label>
                      <p className="text-text bg-background p-4 rounded-lg border border-secondary/30">{selectedGirl.bio}</p>
                    </div>
                  )}

                  {/* Services */}
                  <div>
                    <label className="text-sm font-semibold text-text-muted mb-2 block">Dịch vụ</label>
                    {selectedGirl.services && selectedGirl.services.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedGirl.services.map((service, idx) => (
                          <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm">
                            {service}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-muted text-sm">N/A</p>
                    )}
                  </div>

                  {/* Districts */}
                  {selectedGirl.districts && selectedGirl.districts.length > 0 && (
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Khu vực</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedGirl.districts.map((district, idx) => (
                          <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm">
                            {district}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-background p-4 rounded-lg border border-secondary/30">
                      <p className="text-xs text-text-muted mb-1">Đánh giá</p>
                      <p className="text-2xl font-bold text-text">{selectedGirl.ratingAverage?.toFixed(1) || '0.0'}</p>
                    </div>
                    <div className="bg-background p-4 rounded-lg border border-secondary/30">
                      <p className="text-xs text-text-muted mb-1">Lượt xem</p>
                      <p className="text-2xl font-bold text-text">{selectedGirl.viewCount || 0}</p>
                    </div>
                    <div className="bg-background p-4 rounded-lg border border-secondary/30">
                      <p className="text-xs text-text-muted mb-1">Yêu thích</p>
                      <p className="text-2xl font-bold text-text">{selectedGirl.favoriteCount || 0}</p>
                    </div>
                    <div className="bg-background p-4 rounded-lg border border-secondary/30">
                      <p className="text-xs text-text-muted mb-1">Đánh giá</p>
                      <p className="text-2xl font-bold text-text">{selectedGirl.totalReviews || 0}</p>
                    </div>
                  </div>

                  {/* Verification Images - Hiển thị khi có yêu cầu xác thực */}
                  {(selectedGirl.verificationStatus === 'PENDING' || selectedGirl.verificationStatus === 'REJECTED' || 
                    selectedGirl.idCardFrontUrl || selectedGirl.idCardBackUrl || selectedGirl.selfieUrl) && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Ảnh xác thực danh tính (CCCD)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* CCCD Mặt trước */}
                        {selectedGirl.idCardFrontUrl && (
                          <div>
                            <label className="text-sm font-semibold text-text-muted mb-2 block">CCCD Mặt trước</label>
                            <div className="relative group">
                              <img
                                src={selectedGirl.idCardFrontUrl}
                                alt="CCCD mặt trước"
                                className="w-full h-48 object-contain rounded-lg border-2 border-secondary/30 bg-background p-2 cursor-pointer hover:border-primary transition-colors"
                                onClick={() => {
                                  setSelectedImageUrl(selectedGirl.idCardFrontUrl!);
                                  setSelectedImageTitle('CCCD Mặt trước');
                                  setImageViewerOpen(true);
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* CCCD Mặt sau */}
                        {selectedGirl.idCardBackUrl && (
                          <div>
                            <label className="text-sm font-semibold text-text-muted mb-2 block">CCCD Mặt sau</label>
                            <div className="relative group">
                              <img
                                src={selectedGirl.idCardBackUrl}
                                alt="CCCD mặt sau"
                                className="w-full h-48 object-contain rounded-lg border-2 border-secondary/30 bg-background p-2 cursor-pointer hover:border-primary transition-colors"
                                onClick={() => {
                                  setSelectedImageUrl(selectedGirl.idCardBackUrl!);
                                  setSelectedImageTitle('CCCD Mặt sau');
                                  setImageViewerOpen(true);
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Ảnh mặt mộc */}
                        {selectedGirl.selfieUrl && (
                          <div>
                            <label className="text-sm font-semibold text-text-muted mb-2 block">Ảnh mặt mộc</label>
                            <div className="relative group">
                              <img
                                src={selectedGirl.selfieUrl}
                                alt="Ảnh mặt mộc"
                                className="w-full h-48 object-contain rounded-lg border-2 border-secondary/30 bg-background p-2 cursor-pointer hover:border-primary transition-colors"
                                onClick={() => {
                                  setSelectedImageUrl(selectedGirl.selfieUrl!);
                                  setSelectedImageTitle('Ảnh mặt mộc');
                                  setImageViewerOpen(true);
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action buttons for verification */}
                      {selectedGirl.verificationStatus === 'PENDING' && (
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => handleApproveVerification(selectedGirl.id)}
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                          >
                            ✓ Duyệt xác thực
                          </button>
                          <button
                            onClick={() => handleRejectVerification(selectedGirl.id)}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                          >
                            ✗ Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Images */}
                  {selectedGirl.images && selectedGirl.images.length > 0 && (
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Hình ảnh</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedGirl.images.map((image, idx) => (
                          <img
                            key={idx}
                            src={image}
                            alt={`${selectedGirl.name} - ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-secondary/30"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-secondary/30">
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Ngày tạo</label>
                      <p className="text-text">
                        {selectedGirl.createdAt ? format(new Date(selectedGirl.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-text-muted mb-2 block">Ngày cập nhật</label>
                      <p className="text-text">
                        {selectedGirl.updatedAt ? format(new Date(selectedGirl.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-text-muted">
                  Không tìm thấy thông tin
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-secondary/30 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedGirl(null);
                }}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditModalOpen(false);
              setSelectedGirl(null);
            }
          }}
        >
          <div className="bg-background-light rounded-2xl border border-secondary/30 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text">Chỉnh sửa Gái gọi</h2>
                  <p className="text-sm text-text-muted">Cập nhật thông tin</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedGirl(null);
                }}
                className="p-2 hover:bg-background rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">Tên</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">Tuổi</label>
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">Mô tả</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">Khu vực (phân cách bằng dấu phẩy)</label>
                    <input
                      type="text"
                      value={editForm.districts.join(', ')}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        districts: e.target.value.split(',').map(d => d.trim()).filter(d => d) 
                      })}
                      placeholder="Quận 1, Quận 2, Quận 3"
                      className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isFeatured}
                        onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                        className="w-5 h-5 rounded border-secondary/50 text-primary focus:ring-primary/50"
                      />
                      <span className="text-text font-medium">Nổi bật</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isPremium}
                        onChange={(e) => setEditForm({ ...editForm, isPremium: e.target.checked })}
                        className="w-5 h-5 rounded border-secondary/50 text-primary focus:ring-primary/50"
                      />
                      <span className="text-text font-medium">Premium</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-secondary/30 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedGirl(null);
                }}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                isLoading={isSaving}
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteModalOpen && selectedGirl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDeleteModalOpen(false);
              setSelectedGirl(null);
            }
          }}
        >
          <div className="bg-background-light rounded-2xl border border-red-500/30 shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text">Xác nhận xóa</h2>
                  <p className="text-sm text-text-muted">Hành động này không thể hoàn tác</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-text mb-2">
                  Bạn có chắc chắn muốn xóa gái gọi <span className="font-semibold text-primary">{selectedGirl.name || 'N/A'}</span>?
                </p>
                <p className="text-sm text-text-muted">
                  Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setSelectedGirl(null);
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteConfirm}
                  isLoading={isDeleting}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setCreateModalOpen(false);
            }
          }}
        >
          <div className="bg-background-light rounded-2xl border border-secondary/30 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text">Thêm gái gọi</h2>
                  <p className="text-sm text-text-muted">Tạo tài khoản gái gọi mới</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 hover:bg-background rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Mật khẩu</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="••••••••"
                />
                <p className="mt-1.5 text-xs text-text-muted">
                  Phải có ít nhất 8 ký tự bao gồm chữ hoa, chữ thường và số
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Họ tên</label>
                <input
                  type="text"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Nguyễn Thị A"
                />
              </div>
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Số điện thoại (Tùy chọn)</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="09xxxxxxxx"
                  />
                </div>
              
              {/* Info Banner */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-600 flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    <strong>Lưu ý:</strong> Sau khi tạo tài khoản, bạn sẽ được hỏi có muốn cập nhật thông tin hồ sơ chi tiết (tuổi, mô tả, khu vực, ảnh...) không. 
                    Bạn có thể bỏ qua và cập nhật sau.
                  </span>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-secondary/30 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setCreateModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                isLoading={isCreating}
              >
                Tạo tài khoản
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Profile Modal */}
      {createProfileModalOpen && selectedUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // Clean up image previews
              profileImagePreviews.forEach(preview => URL.revokeObjectURL(preview));
              setProfileImages([]);
              setProfileImagePreviews([]);
              setCreateProfileModalOpen(false);
              setSelectedUser(null);
            }
          }}
        >
          <div className="bg-background-light rounded-2xl border border-secondary/30 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text">Tạo hồ sơ gái gọi</h2>
                  <p className="text-sm text-text-muted">Cập nhật thông tin cho {selectedUser.fullName || selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  // Clean up image previews
                  profileImagePreviews.forEach(preview => URL.revokeObjectURL(preview));
                  setProfileImages([]);
                  setProfileImagePreviews([]);
                  setCreateProfileModalOpen(false);
                  setSelectedUser(null);
                }}
                className="p-2 hover:bg-background rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Warning Banner */}
            <div className="mx-6 mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <p className="text-sm text-orange-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Tài khoản đã được tạo. Vui lòng cập nhật thông tin để hoàn tất hồ sơ.
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Tên hiển thị</label>
                <input
                  type="text"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Tên gái gọi"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Mô tả</label>
                <textarea
                  value={createForm.bio}
                  onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Giới thiệu ngắn..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Tuổi</label>
                  <input
                    type="number"
                    value={createForm.age}
                    onChange={(e) => setCreateForm({ ...createForm, age: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Khu vực (phân cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    value={createForm.districts}
                    onChange={(e) => setCreateForm({ ...createForm, districts: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="Quận 1, Quận 3, Thủ Đức"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Ảnh</label>
                
                {/* File Input */}
                <div className="mb-3">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-secondary/50 rounded-xl cursor-pointer bg-background hover:bg-background-light hover:border-primary/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-10 h-10 mb-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-text-muted">
                        <span className="font-semibold">Nhấn để chọn ảnh</span> hoặc kéo thả
                      </p>
                      <p className="text-xs text-text-muted">PNG, JPG, GIF (Tối đa 5MB mỗi ảnh)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>
                
                {/* Image Previews */}
                {profileImagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                    {profileImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-secondary/30 transition-transform group-hover:scale-105"
                        />
                        {/* Dark overlay on hover (desktop only) */}
                        <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 md:group-hover:opacity-100 transition-opacity"></div>
                        {/* Delete button - always visible on mobile, hover on desktop */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all transform scale-100 md:scale-90 md:group-hover:scale-100 z-10 touch-manipulation"
                          title="Xóa ảnh"
                          aria-label="Xóa ảnh"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        {/* Filename overlay */}
                        <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/70 text-white text-xs rounded truncate max-w-[calc(100%-4rem)]">
                          {profileImages[index]?.name || `Ảnh ${index + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Fallback URL input (optional) */}
                <details className="mt-3">
                  <summary className="text-sm text-text-muted cursor-pointer hover:text-text transition-colors">
                    Hoặc nhập URL ảnh (tùy chọn)
                  </summary>
                  <textarea
                    value={createForm.images}
                    onChange={(e) => setCreateForm({ ...createForm, images: e.target.value })}
                    rows={2}
                    className="mt-2 w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  />
                </details>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-secondary/30 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  // Clean up image previews
                  profileImagePreviews.forEach(preview => URL.revokeObjectURL(preview));
                  setProfileImages([]);
                  setProfileImagePreviews([]);
                  setCreateProfileModalOpen(false);
                  setSelectedUser(null);
                  loadGirls();
                  loadStats();
                }}
              >
                Bỏ qua
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateProfile}
                isLoading={isCreatingProfile}
              >
                Tạo hồ sơ
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Add button for mobile */}
      <div className="sm:hidden fixed bottom-20 right-5 z-40">
        <Button variant="primary" size="md" onClick={handleOpenAddNew}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm gái gọi
        </Button>
      </div>

      {/* Image Viewer Modal */}
      {imageViewerOpen && selectedImageUrl && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => {
            setImageViewerOpen(false);
            setSelectedImageUrl(null);
            setSelectedImageTitle('');
          }}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => {
                setImageViewerOpen(false);
                setSelectedImageUrl(null);
                setSelectedImageTitle('');
              }}
              className="absolute top-4 right-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image title */}
            {selectedImageTitle && (
              <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-black/50 rounded-lg text-white text-sm font-medium">
                {selectedImageTitle}
              </div>
            )}

            {/* Image */}
            <img
              src={selectedImageUrl}
              alt={selectedImageTitle || 'Ảnh xác thực'}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Download button */}
            <a
              href={selectedImageUrl}
              download
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-4 right-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              title="Tải xuống"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
