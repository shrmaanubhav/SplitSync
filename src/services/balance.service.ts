// Balance Service
// Simplified implementation to avoid dependency issues

// Import API client
import api from './api';

interface Balance {
  groupId: string;
  groupName: string;
  totalOwed: number;
  totalDue: number;
  netBalance: number;
}

interface BalancesResponse {
  overallBalance: number;
  balances: Balance[];
}

interface GroupBalances {
  [userId: string]: number;
}

export const balanceService = {
  // Get user's balances across all groups
  async getBalances(): Promise<BalancesResponse> {
    const response = await api.get<BalancesResponse>('/balances');
    return response.data;
  },

  // Get user's balances for a specific group
  async getGroupBalances(groupId: string): Promise<GroupBalances> {
    const response = await api.get<GroupBalances>(`/balances/group/${groupId}`);
    return response.data;
  },
};

export default balanceService;
