// Biometric Authentication Service
// Simplified implementation to avoid dependency issues
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock biometric authentication service
// In a real app, you would use react-native-keychain or similar libraries

export const biometricAuthService = {
  // Check if biometric authentication is available
  async isBiometricAvailable(): Promise<boolean> {
    // Mock implementation
    return true;
  },

  // Authenticate with biometrics
  async authenticate(): Promise<boolean> {
    // Mock implementation
    return true;
  },

  // Enable biometric authentication
  async enableBiometricAuth(): Promise<void> {
    await AsyncStorage.setItem('biometricAuth', 'true');
  },

  // Disable biometric authentication
  async disableBiometricAuth(): Promise<void> {
    await AsyncStorage.removeItem('biometricAuth');
  },

  // Check if biometric auth is enabled
  async isBiometricAuthEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem('biometricAuth');
    return enabled === 'true';
  },
};

export default biometricAuthService;
