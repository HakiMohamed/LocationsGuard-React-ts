export enum FuelType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID'
}

export enum InsuranceType {
  TIERS_SIMPLE = 'TIERS_SIMPLE',           // Responsabilité Civile de base
  TIERS_ETENDU = 'TIERS_ETENDU',          // RC + Incendie + Vol
  TOUS_RISQUES = 'TOUS_RISQUES',          // Couverture complète
  TOUS_RISQUES_PLUS = 'TOUS_RISQUES_PLUS' // Couverture complète + options supplémentaires
}


export interface ReservationStats {
  reservationCount: number;
  _id: string;
  brand: string;
  model: string;
  year: number;
  categoryName: string;
  automobileId: string;
  categoryId: string;
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
  insuranceType?: InsuranceType;
  lastVidangeDate?: Date;
}



