import apiClient from '@/lib/api/client';

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';
export type ReportReason = 
  | 'INAPPROPRIATE_CONTENT'
  | 'SPAM'
  | 'HARASSMENT'
  | 'FAKE_PROFILE'
  | 'SCAM'
  | 'OTHER';

export interface Report {
  id: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  reportedUserId?: string;
  reportedPostId?: string;
  reportedReviewId?: string;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    fullName: string;
    email: string;
  };
  reportedUser?: {
    id: string;
    fullName: string;
    email: string;
  };
  reviewedBy?: {
    id: string;
    fullName: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const reportsApi = {
  // Get all reports (Admin only)
  getAll: async (status?: ReportStatus, page = 1, limit = 20): Promise<PaginatedResponse<Report>> => {
    const params = new URLSearchParams();
    if (status) {
      params.append('status', status);
    }
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await apiClient.get<any>(
      `/admin/reports?${params.toString()}`
    );
    const responseData = response.data;
    
    // Handle wrapped response {success: true, data: {...}}
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    // If already unwrapped, return directly
    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData;
    }
    
    throw new Error('Invalid response format from server');
  },

  // Get report by ID
  getById: async (id: string): Promise<Report> => {
    const response = await apiClient.get<any>(`/reports/${id}`);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.id) {
      return responseData;
    }
    
    throw new Error('Invalid response format from server');
  },

  // Process report (resolve or dismiss)
  process: async (id: string, action: 'RESOLVED' | 'DISMISSED', notes?: string): Promise<Report> => {
    const response = await apiClient.post<any>(
      `/admin/reports/${id}/process`,
      { action, notes }
    );
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.id) {
      return responseData;
    }
    
    throw new Error('Invalid response format from server');
  },
};

