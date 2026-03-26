// User Service
// Simplified implementation to avoid dependency issues

// Import API client
import api from './api';

interface User {
  _id: string;
  name: string;
  phoneNumber: string;
  currency: string; // Add currency field
  friends: string[];
  createdAt: string;
  updatedAt: string;
}

interface AddFriendData {
  friendId: string;
}

export const userService = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  // Search users by phone number
  async searchUsersByPhoneNumber(phoneNumber: string): Promise<User[]> {
    const response = await api.get<User[]>(
      `/users/search?phoneNumber=${encodeURIComponent(phoneNumber)}`
    );
    return response.data;
  },

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  // Update user profile
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  // Update user currency preference
  async updateUserCurrency(id: string, currency: string): Promise<User> {
    const response = await api.put<User>(`/users/${id}/currency`, { currency });
    return response.data;
  },

  // Add friend
  async addFriend(id: string, data: AddFriendData): Promise<any> {
    const response = await api.post(`/users/${id}/friends`, data);
    return response.data;
  },

  // Remove friend
  async removeFriend(id: string, friendId: string): Promise<any> {
    const response = await api.delete(`/users/${id}/friends/${friendId}`);
    return response.data;
  },
};

export default userService;
