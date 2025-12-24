import { User } from './auth';
import { Review } from '@/modules/reviews/api/reviews.api';

export interface Girl extends User {
  // Some API responses return `name`; keep both for compatibility
  name?: string | null;
  slug?: string | null; // URL-friendly slug for SEO
  bio?: string;
  age?: number | null;
  birthYear?: number | null;
  height?: string | number | null;
  weight?: string | number | null;
  measurements?: string | null;
  origin?: string | null;
  address?: string | null;
  workingHours?: string | null;
  services?: string[];
  verified: boolean;
  rating?: number;
  ratingAverage?: number;
  totalReviews: number;
  totalBookings: number;
  isAvailable: boolean;
  districtId?: string;
  district?: {
    id: string;
    name: string;
    code: string;
    province?: string; // Province name
  };
  location?: string; // e.g., "Sài Gòn/Bình Tân"
  province?: string; // e.g., "Sài Gòn"
  images?: string[];
  tags?: string[];
  price?: string | null; // e.g., "200K"
  viewCount?: number; // Number of views
  // Identity verification fields
  idCardFrontUrl?: string | null;
  idCardBackUrl?: string | null;
  selfieUrl?: string | null;
  needsReverify?: boolean;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationRequestedAt?: string | null;
  verificationVerifiedAt?: string | null;
  reviews?: Review[];
}

export interface GirlListParams {
  page?: number;
  limit?: number;
  districtId?: string;
  districts?: string[]; // Array of district names for filtering
  verified?: boolean;
  minRating?: number;
  search?: string;
  sortBy?: 'rating' | 'createdAt' | 'totalBookings';
  sortOrder?: 'asc' | 'desc';
  // Filter params for API
  priceFilter?: string; // 'under-600k' | '600k-1000k' | 'over-1000k'
  ageFilter?: string; // '18-22' | '23-27' | '28-32' | 'over-32'
  heightFilter?: string; // 'under-155' | '155-165' | '165-175' | 'over-175'
  weightFilter?: string; // 'under-45' | '45-55' | '55-65' | 'over-65'
  originFilter?: string; // 'mien-bac' | 'mien-trung' | 'mien-nam' | 'nuoc-ngoai'
  locationFilter?: string; // district code or name
  province?: string; // province name (e.g., 'Sài Gòn', 'Hà Nội')
  tags?: string[]; // Array of tags to filter by
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
  price?: string;
  services?: string[];
  workingHours?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  selfieUrl?: string;
}

