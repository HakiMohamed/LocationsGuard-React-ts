import { Automobile } from './automobile.types';

export enum MaintenanceType {
  VIDANGE = 'VIDANGE',
  FILTRE_AIR = 'FILTRE_AIR',
  FILTRE_HUILE = 'FILTRE_HUILE',
  FILTRE_CARBURANT = 'FILTRE_CARBURANT',
  FREINS = 'FREINS',
  PNEUS = 'PNEUS',
  COURROIE_DISTRIBUTION = 'COURROIE_DISTRIBUTION',
  LIQUIDE_REFROIDISSEMENT = 'LIQUIDE_REFROIDISSEMENT',
  BOUGIES_ALLUMAGE = 'BOUGIES_ALLUMAGE',
  BATTERIE = 'BATTERIE',
  CLIMATISATION = 'CLIMATISATION',
  ESSUIE_GLACES = 'ESSUIE_GLACES',
  CONTROLE_TECHNIQUE = 'CONTROLE_TECHNIQUE',
  NETTOYAGE = 'NETTOYAGE',
  FEUX_AMPLOULES = 'FEUX_AMPLOULES',
  SUSPENSION_DIRECTION = 'SUSPENSION_DIRECTION',
  NIVEAUX = 'NIVEAUX',
  ADBLUE = 'ADBLUE',
  FILTRE_HABITACLE = 'FILTRE_HABITACLE',
  GEOMETRIE = 'GEOMETRIE',
  COURROIE_ACCESSOIRES = 'COURROIE_ACCESSOIRES',
  AMORTISSEURS = 'AMORTISSEURS',
  ROTULES = 'ROTULES',
  CARDANS = 'CARDANS',
  REVISION_GENERALE = 'REVISION_GENERALE',
  VIDANGE_BOITE_VITESSES = 'VIDANGE_BOITE_VITESSES',
  POMPE_EAU = 'POMPE_EAU',
  THERMOSTAT = 'THERMOSTAT',
  RADIATEUR = 'RADIATEUR',
  ALTERNATEUR = 'ALTERNATEUR',
  DEMARREUR = 'DEMARREUR',
  CAPTEURS = 'CAPTEURS',
}


export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Maintenance {
  _id: string;
  automobile: string | { _id: string; brand: string; model: string };
  type: MaintenanceType;
  description?: string;
  date?: string;
  cost?: number;
  technician?: string;
  notes?: string;
  client?: string;
  createdAt?: string;
  updatedAt?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface MaintenanceWithNextDetails extends Maintenance {
  nextMaintenanceDate?: string;
  nextMaintenanceKilometers?: number;
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

export interface CreateMaintenancePayload {
  automobile: string;
  type: MaintenanceType;
  description?: string;
  date?: string;
  cost?: number;
  technician?: string;
  notes?: string;
  client?: string;
}