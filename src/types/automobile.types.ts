export enum FuelType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID'
}

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  SEMI_AUTOMATIC = 'SEMI_AUTOMATIC'
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  automobiles?: Automobile[];
}

export interface Automobile {
  _id: string;
  brand: string;
  model: string;
  year: number;
  category: Category;
  dailyRate: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  seats: number;
  isAvailable: boolean;
  images: string[];
  licensePlate: string;
  mileage: number;
  color?: string;
  engineCapacity?: number;
  fuelConsumption?: number;
  features: string[];
  description?: string;
}



