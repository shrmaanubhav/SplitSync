// Share Service
// Simplified implementation to avoid dependency issues

// Mock share service
// In a real app, you would use react-native-share or similar libraries

export const shareService = {
  // Share content
  async shareContent(content: string, title?: string): Promise<void> {
    // Mock implementation
    console.log('Sharing content:', content);
  },

  // Share expense
  async shareExpense(expenseId: string): Promise<void> {
    // Mock implementation
    console.log('Sharing expense:', expenseId);
  },

  // Share group
  async shareGroup(groupId: string): Promise<void> {
    // Mock implementation
    console.log('Sharing group:', groupId);
  },
};

export default shareService;
