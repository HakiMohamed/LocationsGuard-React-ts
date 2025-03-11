import api from './api.service';
import DeviceDetector from "device-detector-js";

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  data: {
    user: {
      _id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    access_token: string;
    device: {
      deviceId: string;
      name: string;
      type: string;
      ip: string;
      isActive: boolean;
      lastLogin: string;
    };
    message: string;
  };
  statusCode: number;
  timestamp: string;
}

interface DeviceInfo {
  deviceName: string;
  deviceType: string;
  browser: string;
  os: string;
  model: string;
  brand: string;
  screenResolution: string;
  cpuCores: number;
  systemLanguage: string;
  timeZone: string;
  userAgent: string;
}

const getDeviceInfo = (): DeviceInfo => {
  const deviceDetector = new DeviceDetector();
  const device = deviceDetector.parse(navigator.userAgent);
  
  return {
    deviceName: `${device.device?.brand || ''} ${device.device?.model || ''} ${device.os?.name || ''}`.trim(),
    deviceType: device.device?.type || 'desktop',
    browser: `${device.client?.name || ''} ${device.client?.version || ''}`.trim(),
    os: `${device.os?.name || ''} ${device.os?.version || ''}`.trim(),
    model: device.device?.model || 'Unknown Model',
    brand: device.device?.brand || 'Unknown Brand',
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    cpuCores: navigator.hardwareConcurrency || 0,
    systemLanguage: navigator.language,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    userAgent: navigator.userAgent
  };
};

class AuthService {
  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  }

  async login(data: LoginData) {
    const deviceInfo = getDeviceInfo();
    
    const response = await api.post<LoginResponse>('/auth/login', {
      ...data,
      device: deviceInfo
    });

    if (response.data.data.access_token) {
      localStorage.setItem('access_token', response.data.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      localStorage.setItem('device', JSON.stringify(response.data.data.device));
    }
    return response.data;
  }

  async logout() {
    try {
      const response = await api.post('/auth/logout');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      throw error;
    }
  }

  async requestPasswordReset(email: string) {
    const response = await api.post('/auth/request-password-reset', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  }

  async resendVerificationEmail(email: string) {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  }

  async verifyEmail(token: string) {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get('/auth/user');
    return response.data;
  }

  getStoredAuthData() {
    return {
      token: localStorage.getItem('access_token'),
      user: JSON.parse(localStorage.getItem('user') || 'null'),
      device: JSON.parse(localStorage.getItem('device') || 'null'),
      fullData: JSON.parse(localStorage.getItem('auth_data') || 'null')
    };
  }

  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh', {}, {
        withCredentials: true  
      });
      if (response.data.data.access_token) {
        localStorage.setItem('access_token', response.data.data.access_token);
      }
      return response.data;
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      throw error;
    }
  }

  async getCurrentDevice() {
    const response = await api.get('/auth/devices/current');
    return response.data;
  }

  async getAllDevices() {
    const response = await api.get('/auth/devices');
    return response.data;
  }

  async revokeDevice(deviceId: string) {
    const response = await api.delete(`/auth/devices/${deviceId}`);
    return response.data;
  }

  async revokeAllDevices(exceptCurrent: boolean = false) {
    const response = await api.delete(`/auth/devices?exceptCurrent=${exceptCurrent}`);
    return response.data;
  }
}

export default new AuthService(); 