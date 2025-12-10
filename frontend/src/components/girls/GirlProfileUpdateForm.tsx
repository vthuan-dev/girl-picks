'use client';

import { useState, useRef } from 'react';
import { girlsApi } from '@/modules/girls/api/girls.api';
import { Girl } from '@/types/girl';
import toast from 'react-hot-toast';

interface GirlProfileUpdateFormProps {
  girl: Girl;
  onUpdate?: (girl: Girl) => void;
}

export default function GirlProfileUpdateForm({ girl, onUpdate }: GirlProfileUpdateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: girl.bio || '',
    age: girl.age || '',
    height: girl.height || '',
    weight: girl.weight || '',
    measurements: girl.measurements || '',
    origin: girl.origin || '',
    address: girl.address || '',
    price: girl.price || '',
    workingHours: girl.workingHours || '',
    services: (girl.services || []).join(', '),
    images: (girl.images || []).join(', '),
  });

  // CCCD upload states
  const [idCardFront, setIdCardFront] = useState<File | null>(null);
  const [idCardBack, setIdCardBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [idCardFrontPreview, setIdCardFrontPreview] = useState<string | null>(girl.idCardFrontUrl || null);
  const [idCardBackPreview, setIdCardBackPreview] = useState<string | null>(girl.idCardBackUrl || null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(girl.selfieUrl || null);

  const idCardFrontRef = useRef<HTMLInputElement>(null);
  const idCardBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

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
      throw new Error('Invalid response');
    } catch (error) {
      console.error('Upload error:', error);
      // Fallback: convert to base64 data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      // Prepare update data
      const updateData = {
        ...formData,
        age: formData.age ? parseInt(formData.age.toString()) : undefined,
        services: formData.services ? formData.services.split(',').map(s => s.trim()).filter(Boolean) : [],
        images: formData.images ? formData.images.split(',').map(s => s.trim()).filter(Boolean) : [],
        idCardFrontUrl: idCardFrontUrl!,
        idCardBackUrl: idCardBackUrl!,
        selfieUrl: selfieUrl!,
      };

      const response = await girlsApi.updateProfile(updateData);
      
      // Backend returns { success: true, data: {...} } or direct data
      const girlData = (response as any).data || response;
      toast.success('Cập nhật hồ sơ thành công! Hồ sơ của bạn đang chờ admin duyệt.');
      onUpdate?.(girlData as Girl);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
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
          <label className="block text-sm font-medium text-text mb-2">Ảnh (URL, phân cách bằng dấu phẩy)</label>
          <textarea
            value={formData.images}
            onChange={(e) => setFormData({ ...formData, images: e.target.value })}
            rows={3}
            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
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

