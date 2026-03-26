// Mock navigation service
// In a real app, you would use React Navigation's navigation prop or useNavigation hook

export const navigationService = {
  // Navigate to screen
  navigate(screen: string, params?: any): void {
    // Mock implementation
    console.log('Navigating to:', screen, params);
  },

  // Go back
  goBack(): void {
    // Mock implementation
    console.log('Going back');
  },

  // Reset navigation stack
  reset(routes: any[]): void {
    // Mock implementation
    console.log('Resetting navigation stack:', routes);
  },

  // Navigate to expense detail
  navigateToExpenseDetail(expenseId: string): void {
    this.navigate('ExpenseDetail', { expenseId });
  },

  // Navigate to group detail
  navigateToGroupDetail(groupId: string): void {
    this.navigate('GroupDetail', { groupId });
  },
};
