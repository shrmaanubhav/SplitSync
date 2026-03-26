import api from './api';

export const analyticsService = {
  // Log event
  async logEvent(eventName: string, properties?: any): Promise<void> {
    // Mock implementation
    console.log('Logging event:', eventName, properties);
  },

  // Log screen view
  async logScreenView(screenName: string): Promise<void> {
    this.logEvent('screen_view', { screen_name: screenName });
  },

  // Log user action
  async logUserAction(action: string, details?: any): Promise<void> {
    this.logEvent('user_action', { action, ...details });
  },

  // Log expense creation
  async logExpenseCreated(expenseId: string, amount: number): Promise<void> {
    this.logEvent('expense_created', { expense_id: expenseId, amount });
  },

  // Log group creation
  async logGroupCreated(groupId: string): Promise<void> {
    this.logEvent('group_created', { group_id: groupId });
  },

  // Log settlement
  async logSettlement(settlementId: string, amount: number): Promise<void> {
    this.logEvent('settlement_made', { settlement_id: settlementId, amount });
  },

  // Get global analytics
  async getGlobalAnalytics(): Promise<any> {
    try {
      const response = await api.get('/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching global analytics:', error);
      throw error;
    }
  },

  // Get group analytics
  async getGroupAnalytics(groupId: string): Promise<any> {
    try {
      const response = await api.get(`/analytics/group/${groupId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching analytics for group ${groupId}:`, error);
      throw error;
    }
  },
};
