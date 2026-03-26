// Settlement Service
// Simplified implementation to avoid dependency issues

// Import API client
import api from './api';

interface Settlement {
  _id: string;
  from: string;
  to: string;
  amount: number;
  group: string;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateSettlementData {
  from: string;
  to: string;
  amount: number;
  group: string;
  description?: string;
  date?: string;
}

export const settlementService = {
  // Create a new settlement
  async createSettlement(data: CreateSettlementData): Promise<Settlement> {
    const response = await api.post<Settlement>('/settlements', data);
    return response.data;
  },

  // Get all settlements for current user
  async getAllSettlements(): Promise<Settlement[]> {
    const response = await api.get<Settlement[]>('/settlements');
    return response.data;
  },

  // Get settlements by group
  async getSettlementsByGroup(groupId: string): Promise<Settlement[]> {
    const response = await api.get<Settlement[]>(
      `/settlements/group/${groupId}`
    );
    return response.data;
  },

  // Get settlement by ID
  async getSettlementById(id: string): Promise<Settlement> {
    const response = await api.get<Settlement>(`/settlements/${id}`);
    return response.data;
  },

  // Update settlement
  async updateSettlement(
    id: string,
    data: Partial<Settlement>
  ): Promise<Settlement> {
    const response = await api.put<Settlement>(`/settlements/${id}`, data);
    return response.data;
  },

  // Delete settlement
  async deleteSettlement(id: string): Promise<any> {
    const response = await api.delete(`/settlements/${id}`);
    return response.data;
  },
};

export default settlementService;
