export enum ExpenseType {
  WATER = 'Eau',
  ELECTRICITY = 'Électricité',
  RENT = 'Loyer',
  WIFI = 'Wifi',
  SALARY = 'Salaire',
  TAX = 'Taxe',
  MAINTENANCE_LOCAL = 'Maintenance de local',
  OTHER = 'Autre'
}

export interface Expense {
  _id?: string;
  label: string;
  type: ExpenseType;
  amount: number;
  date: string; // ISO string
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
} 