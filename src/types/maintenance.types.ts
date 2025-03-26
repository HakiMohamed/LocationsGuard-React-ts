import { Automobile } from './automobile.types';

export enum MaintenanceType {
  OIL_CHANGE = 'OIL_CHANGE',
  TIRE_CHANGE = 'TIRE_CHANGE',
  BRAKE_SERVICE = 'BRAKE_SERVICE',
  FILTER_CHANGE = 'FILTER_CHANGE',
  BATTERY_REPLACEMENT = 'BATTERY_REPLACEMENT',
  GENERAL_INSPECTION = 'GENERAL_INSPECTION',
  COOLING_SYSTEM = 'COOLING_SYSTEM',
  TRANSMISSION_SERVICE = 'TRANSMISSION_SERVICE',
  SUSPENSION_CHECK = 'SUSPENSION_CHECK',
  ELECTRICAL_SYSTEM = 'ELECTRICAL_SYSTEM',
  AIR_CONDITIONING = 'AIR_CONDITIONING',
  OTHER = 'OTHER'
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Maintenance {
  _id: string;
  automobile: Automobile | string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  completedDate?: Date;
  description?: string;
  cost?: number;
  mileageAtMaintenance?: number;
  nextDueMileage?: number;
  nextDueDate?: Date;
  notes?: string;
  performedBy?: string;
  attachments?: string[];
  notificationSent?: boolean;
  partsReplaced?: string[];
  laborHours?: number;
  warranty?: string;
  oilType?: string;
  oilBrand?: string;
  oilQuantity?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MaintenanceWithNextDetails extends Maintenance {
  nextMaintenance?: {
    dueMileage: number;
    dueDate: Date;
    mileageUntilDue: number;
    daysUntilDue: number;
    estimatedDate?: Date;
    status: 'OVERDUE' | 'URGENT' | 'UPCOMING' | 'OK';
  };
}

export interface MaintenanceRule {
  mileageInterval: number;
  timeInterval: number;
  description: string;
  applicable: boolean;
}

export interface OilType {
  name: string;
  mileageInterval: number;
  timeInterval: number;
}

export interface MaintenanceTypeInfo {
  type: MaintenanceType;
  description: string;
  mileageInterval: number;
  timeInterval: number;
  lastMaintenance?: Maintenance;
  nextDueDate?: Date;
  nextDueMileage?: number;
  daysUntilDue?: number;
  mileageUntilDue?: number;
  status: 'OVERDUE' | 'URGENT' | 'UPCOMING' | 'OK';
  oilTypes?: OilType[];
}

export interface MaintenanceSchedule {
  automobile: Automobile;
  averageDailyMileage: number;
  suggestedSchedule: {
    type: MaintenanceType;
    description: string;
    suggestedDate: Date;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedMileage: number;
    reason: string;
  }[];
}