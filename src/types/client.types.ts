export interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  address?: string;
  city?: string;
  drivingLicenseDate?: Date;
  drivingLicenseNumber?: string;
  drivingLicenseFrontImage?: string;
  drivingLicenseBackImage?: string;
  drivingLicenseExpirationDate?: Date;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  drivingLicenseDate?: Date;
  drivingLicenseNumber?: string;
  drivingLicenseFrontImage?: string;
  drivingLicenseBackImage?: string;
  drivingLicenseExpirationDate?: Date;
  
}

export interface UpdateClientDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  drivingLicenseDate?: Date;
  drivingLicenseNumber?: string;
  drivingLicenseFrontImage?: string;
  drivingLicenseBackImage?: string;
  drivingLicenseExpirationDate?: Date;
} 