import { User } from './auth';

export interface Girl extends User {
  bio?: string;
  verified: boolean;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  isAvailable: boolean;
  districtId?: string;
  district?: {
    id: string;
    name: string;
    code: string;
  };
  images?: string[];
  tags?: string[];
}

export interface GirlListParams {
  page?: number;
  limit?: number;
  districtId?: string;
  verified?: boolean;
  minRating?: number;
  search?: string;
  sortBy?: 'rating' | 'createdAt' | 'totalBookings';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateGirlProfileDto {
  bio?: string;
  districtId?: string;
  images?: string[];
  tags?: string[];
}

export interface UpdateGirlProfileDto {
  bio?: string;
  districtId?: string;
  images?: string[];
  tags?: string[];
  isAvailable?: boolean;
}

