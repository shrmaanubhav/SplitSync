import { useState } from 'react';
import { useStore } from '../store/useStore';
import { authService } from '../services/auth.service';

interface LoginData {
  phoneNumber: string;
  password: string;
}

interface RegisterData {
  name: string;
  phoneNumber: string;
  password: string;
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setIsAuthenticated, setUser, setToken } = useStore();

  // Login function
  const login = async (data: LoginData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(data);
      setIsAuthenticated(true);
      setUser({
        id: response._id,
        name: response.name,
        phoneNumber: response.phoneNumber,
        currency: response.currency,
        createdAt: response.createdAt,
      });
      setToken(response.token);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(data);
      setIsAuthenticated(true);
      setUser({
        id: response._id,
        name: response.name,
        phoneNumber: response.phoneNumber,
        currency: response.currency,
        createdAt: response.createdAt,
      });
      setToken(response.token);
      return response;
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'An error occurred during registration'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);

    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'An error occurred during logout'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, register, logout, loading, error };
};