import { Automobile } from './automobile.types';

export enum MaintenanceType {
  VIDANGE = 'Vidange',
  FILTRE_AIR = 'Filtre à air',
  FILTRE_HUILE = 'Filtre à huile',
  FILTRE_CARBURANT = 'Filtre à carburant',
  FREINS = 'Freins',
  PNEUS = 'Pneus',
  COURROIE_DISTRIBUTION = 'Courroie de distribution',
  LIQUIDE_REFROIDISSEMENT = 'Liquide de refroidissement',
  BOUGIES_ALLUMAGE = 'Bougies d\'allumage',
  BATTERIE = 'Batterie',
  CLIMATISATION = 'Climatisation',
  ESSUIE_GLACES = 'Essuie-glaces',
  CONTROLE_TECHNIQUE = 'Contrôle technique',
  NETTOYAGE = 'Nettoyage',
  FEUX_AMPLOULES = 'Feux et ampoules',
  SUSPENSION_DIRECTION = 'Suspension et direction',
  NIVEAUX = 'Niveaux',
  ADBLUE = 'AdBlue',
  FILTRE_HABITACLE = 'Filtre d\'habitacle',
  GEOMETRIE = 'Géométrie',
  COURROIE_ACCESSOIRES = 'Courroie d\'accessoires',
  AMORTISSEURS = 'Amortisseurs',
  ROTULES = 'Rotules',
  CARDANS = 'Cardans',
  REVISION_GENERALE = 'Révision générale',
  VIDANGE_BOITE_VITESSES = 'Vidange boîte de vitesses',
  POMPE_EAU = 'Pompe à eau',
  THERMOSTAT = 'Thermostat',
  RADIATEUR = 'Radiateur',
  ALTERNATEUR = 'Alternateur',
  DEMARREUR = 'Démarreur',
  CAPTEURS = 'Capteurs'
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