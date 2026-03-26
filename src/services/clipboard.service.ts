// Clipboard Service
// Simplified implementation to avoid dependency issues

// Mock clipboard service
// In a real app, you would use @react-native-clipboard/clipboard or similar libraries

export const clipboardService = {
  // Copy text to clipboard
  async copyToClipboard(text: string): Promise<void> {
    // Mock implementation
    console.log('Copied to clipboard:', text);
  },

  // Read text from clipboard
  async readFromClipboard(): Promise<string> {
    // Mock implementation
    return 'Clipboard content';
  },
};

export default clipboardService;
