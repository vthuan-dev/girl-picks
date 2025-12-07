import apiClient from '@/lib/api/client';

export interface SystemSettings {
  siteName?: string;
  siteDescription?: string;
  maintenanceMode?: boolean;
  allowRegistration?: boolean;
  requireEmailVerification?: boolean;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  emailHost?: string;
  emailPort?: number;
  emailUser?: string;
  emailPassword?: string;
  emailFrom?: string;
  storageProvider?: 'local' | 'cloudinary' | 's3';
  storageConfig?: Record<string, any>;
}

export const settingsApi = {
  // Get all settings
  getAll: async (): Promise<SystemSettings> => {
    try {
      const response = await apiClient.get<any>('/admin/settings');
      const responseData = response.data;
      
      // Handle wrapped response
      if (responseData.success && responseData.data) {
        return responseData.data;
      }
      
      // If already unwrapped, return directly
      if (responseData.siteName !== undefined || responseData.maintenanceMode !== undefined) {
        return responseData;
      }
      
      // Return default settings if no data
      return {};
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      // Return default settings on error
      return {
        siteName: 'Tìm Gái gọi',
        siteDescription: 'Nền tảng đặt lịch dịch vụ giải trí',
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: false,
        maxFileSize: 5,
        allowedFileTypes: ['jpg', 'png', 'jpeg'],
      };
    }
  },

  // Update settings
  update: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    const response = await apiClient.patch<any>('/admin/settings', settings);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.siteName !== undefined || responseData.maintenanceMode !== undefined) {
      return responseData;
    }
    
    throw new Error('Invalid response format from server');
  },
};

