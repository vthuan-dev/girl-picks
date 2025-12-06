import { User, UserRole } from './auth';

export interface UserProfile extends User {
  bio?: string;
  dateOfBirth?: string;
  address?: string;
  districtId?: string;
  district?: District;
  verified: boolean;
  rating?: number;
  totalReviews?: number;
}

export interface UpdateProfileDto {
  fullName?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: string;
  districtId?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface District {
  id: string;
  name: string;
  code: string;
}

