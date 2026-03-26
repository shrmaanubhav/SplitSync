// Authentication Service
// Simplified implementation to avoid dependency issues

// Import API client
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginData {
  phoneNumber: string;
  password: string;
}

interface RegisterData {
  name: string;
  phoneNumber: string;
  password: string;
}

interface AuthResponse {
  _id: string;
  name: string;
  phoneNumber: string;
  currency: string;
  email?: string;
  bio?: string;
  createdAt: string;
  token: string;
}

export const authService = {
  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    await AsyncStorage.setItem('token', response.data.token);
    return response.data;
  },

  // Register user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    await AsyncStorage.setItem('token', response.data.token);
    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
  },

  // Get current user
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
