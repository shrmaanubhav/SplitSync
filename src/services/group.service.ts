// Group Service
// Simplified implementation to avoid dependency issues

// Import API client
import api from './api';

interface Group {
  _id: string;
  name: string;
  description: string;
  members: string[];
  admins: string[];
  createdAt: string;
  updatedAt: string;
}

interface CreateGroupData {
  name: string;
  description?: string;
  members: string[];
}

interface AddMemberData {
  userId: string;
}

interface PromoteToAdminData {
  userId: string;
}

export const groupService = {
  // Create a new group
  async createGroup(data: CreateGroupData): Promise<Group> {
    const response = await api.post<Group>('/groups', data);
    return response.data;
  },

  // Get all groups for current user
  async getAllGroups(): Promise<Group[]> {
    const response = await api.get<Group[]>('/groups');
    return response.data;
  },

  // Get group by ID
  async getGroupById(id: string): Promise<Group> {
    const response = await api.get<Group>(`/groups/${id}`);
    return response.data;
  },

  // Update group
  async updateGroup(id: string, data: Partial<Group>): Promise<Group> {
    const response = await api.put<Group>(`/groups/${id}`, data);
    return response.data;
  },

  // Delete group
  async deleteGroup(id: string): Promise<any> {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  },

  // Add member to group
  async addMember(groupId: string, data: AddMemberData): Promise<Group> {
    const response = await api.post<Group>(`/groups/${groupId}/members`, data);
    return response.data;
  },

  // Remove member from group
  async removeMember(groupId: string, userId: string): Promise<Group> {
    const response = await api.delete<Group>(
      `/groups/${groupId}/members/${userId}`
    );
    return response.data;
  },

  // Promote member to admin
  async promoteToAdmin(
    groupId: string,
    data: PromoteToAdminData
  ): Promise<Group> {
    const response = await api.post<Group>(`/groups/${groupId}/admins`, data);
    return response.data;
  },

  // Remove admin privileges
  async removeAdmin(groupId: string, userId: string): Promise<Group> {
    const response = await api.delete<Group>(
      `/groups/${groupId}/admins/${userId}`
    );
    return response.data;
  },
};

export default groupService;
