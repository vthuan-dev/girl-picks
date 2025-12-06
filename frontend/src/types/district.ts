export interface District {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface DistrictListParams {
  page?: number;
  limit?: number;
  search?: string;
}

