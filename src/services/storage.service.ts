// Storage Service
// Simplified implementation to avoid dependency issues
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock storage service
export const storageService = {
  // Set item
  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },

  // Get item
  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  },

  // Remove item
  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  // Clear all items
  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },

  // Store object
  async setObject(key: string, value: any): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  },

  // Get object
  async getObject(key: string): Promise<any> {
    const value = await this.getItem(key);
    return value ? JSON.parse(value) : null;
  },
};

export default storageService;
