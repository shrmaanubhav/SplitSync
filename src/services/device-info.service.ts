// Device Info Service
// Simplified implementation to avoid dependency issues

// Mock device info service
// In a real app, you would use react-native-device-info or similar libraries

export const deviceInfoService = {
  // Get device info
  async getDeviceInfo(): Promise<any> {
    return {
      deviceId: 'mock-device-id',
      model: 'Mock Device',
      brand: 'Mock Brand',
      systemName: 'Mock OS',
      systemVersion: '1.0.0',
    };
  },

  // Get app version
  async getAppVersion(): Promise<string> {
    return '1.0.0';
  },

  // Get build number
  async getBuildNumber(): Promise<string> {
    return '1';
  },
};

export default deviceInfoService;
