export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  CLIENT = 'client'
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: UserRole;
  avatarUrl?: string;
  bannerUrl?: string;
  city?: string;
  address?: string;
  drivingLicenseNumber?: string;
  drivingLicenseDate?: Date;
  drivingLicenseExpirationDate?: Date;
  drivingLicenseImage?: string;
  lastLogin?: Date;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  deviceId: string;
  name: string;
  type: string;
  ip: string;
  isActive: boolean;
  lastLogin: string;
} 