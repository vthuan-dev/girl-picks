export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  GIRL = 'GIRL',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  username: string;
  fullName: string;
  role?: UserRole;
  phone?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface PasswordResetDto {
  email: string;
}

export interface PasswordResetConfirmDto {
  token: string;
  newPassword: string;
}

