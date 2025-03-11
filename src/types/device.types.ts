export interface Device {
  deviceId: string;
  name: string;
  type: string;
  ip: string;
  isActive: boolean;
  lastLogin: string;
  browser?: string;
  os?: string;
}

export interface DeviceListResponse {
  devices: Device[];
  total: number;
  active: number;
} 