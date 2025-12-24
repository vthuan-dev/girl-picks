'use client';

import { useState, useRef, useEffect } from 'react';
import { girlsApi } from '@/modules/girls/api/girls.api';
import { Girl } from '@/types/girl';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

interface GirlProfileUpdateFormProps {
  girl: Girl;
  onUpdate?: (girl: Girl) => void;
}

export default function GirlProfileUpdateForm({ girl, onUpdate }: GirlProfileUpdateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);

  // Ưu tiên điền sẵn địa chỉ/khu vực từ dữ liệu hiện có
  const initialAddress = (() => {
    if (girl.address && girl.address.trim()) return girl.address;
    if (girl.location && girl.location.trim()) return girl.location;
    const districtName = (girl as any).district?.name || '';
    const provinceName = (girl as any).province || '';
    if (districtName && provinceName) return `${districtName}, ${provinceName}`;
    if (districtName) return districtName;
    if (provinceName) return provinceName;
    return '';
  })();
  const [formData, setFormData] = useState({
    phone: girl.phone || '',
    bio: girl.bio || '',
    age: girl.age || '',
    height: girl.height || '',
    weight: girl.weight || '',
    measurements: girl.measurements || '',
    origin: girl.origin || '',
    address: initialAddress,
    price: girl.price || '',
    workingHours: girl.workingHours || '',
    services: (girl.services || []).join(', '),
  });

  // Fallback danh sách tỉnh/thành
  const defaultLocations = [
    'Sài Gòn', 'Hà Nội', 'Bình Dương', 'Đà Nẵng', 'Đồng Nai', 'Lâm Đồng',
    'Bà Rịa Vũng Tàu', 'Khánh Hòa', 'Long An', 'Cần Thơ', 'Đắk Lắk', 'Bình Thuận',
    'Thừa Thiên Huế', 'Bình Phước', 'Bình Định', 'Đồng Tháp', 'Bến Tre', 'Kiên Giang',
    'Tiền Giang', 'An Giang', 'Trà Vinh', 'Vĩnh Long', 'Phú Yên', 'Bạc Liêu',
    'Hải Phòng', 'Hậu Giang', 'Sóc Trăng', 'Ninh Thuận', 'Nghệ An',
  ];

  // Load danh sách tỉnh có gái từ API (có count)
  useEffect(() => {
    let mounted = true;
    const fetchLocations = async () => {
      try {
        const provinceCounts = await girlsApi.getCountByProvince();
        const list = (provinceCounts || [])
          .filter(({ count }) => count > 0)
          .sort((a, b) => b.count - a.count)
          .map(({ province }) => province);
        if (!mounted) return;
        setLocations(list.length > 0 ? list : defaultLocations);
      } catch (err) {
        console.error('Load provinces error:', err);
        if (mounted) setLocations(defaultLocations);
      }
    };
    fetchLocations();
    return () => { mounted = false; };
  }, []);

  // CCCD upload states
  const [idCardFront, setIdCardFront] = useState<File | null>(null);
  const [idCardBack, setIdCardBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [idCardFrontPreview, setIdCardFrontPreview] = useState<string | null>(girl.idCardFrontUrl || null);
  const [idCardBackPreview, setIdCardBackPreview] = useState<string | null>(girl.idCardBackUrl || null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(girl.selfieUrl || null);

  // Profile images upload states
  const [profileImages, setProfileImages] = useState<File[]>([]);
  const [profileImagePreviews, setProfileImagePreviews] = useState<string[]>(girl.images || []);
  const [existingImages, setExistingImages] = useState<string[]>(girl.images || []);

  const idCardFrontRef = useRef<HTMLInputElement>(null);
  const idCardBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const profileImagesRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    file: File | null,
    setter: (file: File | null) => void,
    previewSetter: (url: string | null) => void,
  ) => {
    if (file) {
      setter(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previewSetter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const base64Data = await fileToBase64(file);
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('accessToken')}`,
        },
        body: JSON.stringify({ url: base64Data }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      // Backend returns results like { url: '/api/uploads/...' }
      if (data.url) {
        return data.url;
      }
      throw new Error('Invalid response');
    } catch (error) {
      console.error('Upload error:', error);
      // Fallback: convert to base64 data URL if upload fails (for preview)
      return fileToBase64(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    // Validate required CCCD fields
    if (!idCardFront && !idCardFrontPreview) {
      toast.error('Vui lòng upload ảnh CCCD mặt trước');
      return;
    }
    if (!idCardBack && !idCardBackPreview) {
      toast.error('Vui lòng upload ảnh CCCD mặt sau');
      return;
    }
    if (!selfie && !selfiePreview) {
      toast.error('Vui lòng upload ảnh mặt mộc');
      return;
    }

    setIsLoading(true);
    try {
      // Upload images if new files are selected
      let idCardFrontUrl = idCardFrontPreview;
      let idCardBackUrl = idCardBackPreview;
      let selfieUrl = selfiePreview;

      if (idCardFront) {
        idCardFrontUrl = await uploadImage(idCardFront);
      }
      if (idCardBack) {
        idCardBackUrl = await uploadImage(idCardBack);
      }
      if (selfie) {
        selfieUrl = await uploadImage(selfie);
      }

      // Upload profile images if new files are selected
      let imageUrls = [...existingImages];
      if (profileImages.length > 0) {
        try {
          const uploadedUrls = await Promise.all(
            profileImages.map(file => uploadImage(file))
          );
          imageUrls = [...existingImages, ...uploadedUrls];
        } catch (error) {
          console.error('Error uploading images:', error);
          toast.error('Có lỗi khi upload ảnh. Vui lòng thử lại.');
          throw error;
        }
      }

      // Chuẩn hóa dịch vụ thành mảng
      const servicesArray =
        typeof formData.services === 'string'
          ? formData.services
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
          : [];

      // Prepare update data - only include fields allowed by backend DTO
      const updateData: any = {
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        age: formData.age ? parseInt(formData.age.toString()) : undefined,
        height: formData.height || undefined,
        weight: formData.weight || undefined,
        measurements: formData.measurements || undefined,
        origin: formData.origin || undefined,
        address: formData.address || undefined,
        price: formData.price || undefined,
        services: servicesArray.length > 0 ? servicesArray : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        idCardFrontUrl: idCardFrontUrl!,
        idCardBackUrl: idCardBackUrl!,
        selfieUrl: selfieUrl!,
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const response = await girlsApi.updateProfile(updateData);

      // Backend returns { success: true, data: {...} } or direct data
      const girlData = (response as any).data || response;
      toast.success('Cập nhật hồ sơ thành công! Hồ sơ của bạn đang chờ admin duyệt.');
      onUpdate?.(girlData as Girl);
    } catch (error: any) {
      console.error('Update profile error:', error);

      // Handle validation errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        let errorMessage = 'Cập nhật thất bại';

        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Display validation errors
          const errorList = errorData.errors.map((err: string) => {
            // Translate common validation errors
            if (err.includes('workingHours')) {
              return 'Trường "Giờ làm việc" không được hỗ trợ trong cập nhật hồ sơ';
            }
            if (err.includes('services')) {
              return 'Trường "Dịch vụ" không được hỗ trợ trong cập nhật hồ sơ';
            }
            return err;
          }).join(', ');

          errorMessage = `Lỗi xác thực: ${errorList}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        toast.error(errorMessage, { duration: 5000 });
      } else {
        toast.error(error.response?.data?.message || error.message || 'Cập nhật thất bại');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* CCCD Upload Section - Required */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Xác thực danh tính (Bắt buộc)
        </h3>
        <p className="text-sm text-text-muted mb-4">
          Khi cập nhật hồ sơ, bạn phải upload lại 3 ảnh sau để admin xác thực:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CCCD Mặt trước */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              CCCD Mặt trước *
            </label>
            <input
              ref={idCardFrontRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(
                e.target.files?.[0] || null,
                setIdCardFront,
                setIdCardFrontPreview,
              )}
              className="hidden"
            />
            <div
              onClick={() => idCardFrontRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-secondary rounded-lg p-4 hover:border-primary transition-colors"
            >
              {idCardFrontPreview ? (
                <img src={idCardFrontPreview} alt="CCCD mặt trước" className="w-full h-32 object-cover rounded" />
              ) : (
                <div className="text-center py-8 text-text-muted">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Click để upload</p>
                </div>
              )}
            </div>
          </div>

          {/* CCCD Mặt sau */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              CCCD Mặt sau *
            </label>
            <input
              ref={idCardBackRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(
                e.target.files?.[0] || null,
                setIdCardBack,
                setIdCardBackPreview,
              )}
              className="hidden"
            />
            <div
              onClick={() => idCardBackRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-secondary rounded-lg p-4 hover:border-primary transition-colors"
            >
              {idCardBackPreview ? (
                <img src={idCardBackPreview} alt="CCCD mặt sau" className="w-full h-32 object-cover rounded" />
              ) : (
                <div className="text-center py-8 text-text-muted">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Click để upload</p>
                </div>
              )}
            </div>
          </div>

          {/* Ảnh mặt mộc */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Ảnh mặt mộc *
            </label>
            <input
              ref={selfieRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(
                e.target.files?.[0] || null,
                setSelfie,
                setSelfiePreview,
              )}
              className="hidden"
            />
            <div
              onClick={() => selfieRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-secondary rounded-lg p-4 hover:border-primary transition-colors"
            >
              {selfiePreview ? (
                <img src={selfiePreview} alt="Ảnh mặt mộc" className="w-full h-32 object-cover rounded" />
              ) : (
                <div className="text-center py-8 text-text-muted">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-sm">Click để upload</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-text">Thông tin hồ sơ</h3>

        <div>
          <label className="block text-sm font-medium text-text mb-2">Số điện thoại (bắt buộc)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Nhập số điện thoại"
            className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">Bio/Giới thiệu</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Tuổi</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Chiều cao</label>
            <input
              type="text"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              placeholder="160cm"
              className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Cân nặng</label>
            <input
              type="text"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="52kg"
              className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Số đo</label>
            <input
              type="text"
              value={formData.measurements}
              onChange={(e) => setFormData({ ...formData, measurements: e.target.value })}
              placeholder="89-64-92"
              className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text mb-2">
              Địa chỉ / Khu vực / Tỉnh
            </label>
            <select
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Chọn khu vực/tỉnh</option>
              {/* Nếu giá trị hiện tại không có trong danh sách options (ví dụ địa chỉ cũ), vẫn hiển thị */}
              {formData.address && !locations.includes(formData.address) && (
                <option value={formData.address}>{formData.address}</option>
              )}
              {(locations.length > 0 ? locations : defaultLocations).map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
              <option value="Khác">Khác</option>
            </select>
            {formData.address === 'Khác' && (
              <p className="mt-2 text-xs text-text-muted">
                Liên hệ admin để được thêm tỉnh/thành phù hợp với khu vực của bạn nhé baby.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Giá</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="500K"
              className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Giờ làm việc</label>
            <input
              type="text"
              value={formData.workingHours}
              onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
              placeholder="24/24"
              className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">Dịch vụ (phân cách bằng dấu phẩy)</label>
          <input
            type="text"
            value={formData.services}
            onChange={(e) => setFormData({ ...formData, services: e.target.value })}
            placeholder="Hôn môi, Vét máng, BJ"
            className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">Ảnh hồ sơ</label>
          <input
            ref={profileImagesRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setProfileImages(prev => [...prev, ...files]);

              // Create previews
              files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setProfileImagePreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
              });
            }}
            className="hidden"
          />
          <div
            onClick={() => profileImagesRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-secondary rounded-lg p-4 hover:border-primary transition-colors mb-4"
          >
            <div className="text-center py-4 text-text-muted">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Click để chọn ảnh (có thể chọn nhiều ảnh)</p>
            </div>
          </div>

          {/* Image Previews */}
          {profileImagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profileImagePreviews.map((preview, index) => {
                const isExisting = index < existingImages.length;
                const handleRemove = () => {
                  if (isExisting) {
                    // Remove from existing images
                    const newExisting = existingImages.filter((_, i) => i !== index);
                    setExistingImages(newExisting);
                    // Update previews: keep existing (minus removed) + new files
                    const newPreviews = [
                      ...newExisting,
                      ...profileImagePreviews.slice(existingImages.length)
                    ];
                    setProfileImagePreviews(newPreviews);
                  } else {
                    // Remove from new files
                    const fileIndex = index - existingImages.length;
                    const newFiles = profileImages.filter((_, i) => i !== fileIndex);
                    setProfileImages(newFiles);
                    // Update previews: keep existing + new files (minus removed)
                    const newPreviews = [
                      ...existingImages,
                      ...profileImagePreviews.slice(existingImages.length).filter((_, i) => i !== fileIndex)
                    ];
                    setProfileImagePreviews(newPreviews);
                  }
                };

                return (
                  <div key={`${isExisting ? 'existing' : 'new'}-${index}`} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-secondary"
                    />
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status Info */}
      {girl.verificationStatus === 'PENDING' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-sm text-yellow-600">
            ⏳ Hồ sơ của bạn đang chờ admin duyệt. Vui lòng đợi trong giây lát.
          </p>
        </div>
      )}

      {girl.verificationStatus === 'REJECTED' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-sm text-red-600">
            ❌ Hồ sơ của bạn đã bị từ chối. Vui lòng cập nhật lại thông tin và upload lại ảnh CCCD.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
      </button>
    </form>
  );
}

