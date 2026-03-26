import { userApi } from './api';
import { contactsService } from './contacts.service';

export const friendService = {
  // Get all friends of a user
  async getAllFriends(userId: string) {
    try {
      const response = await userApi.getUserFriends(userId);
      return response.data;
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  },

  // Upload contacts and find matching users
  async uploadContacts(userId: string) {
    try {
      // Get contacts with phone numbers
      const contacts = await contactsService.getContactsWithPhoneNumbers();

      // Format contacts for upload
      const formattedContacts = contacts
        .map(contact => ({
          name: contact.name,
          phoneNumber: contact.phoneNumbers[0] || '', // Use first phone number
        }))
        .filter(contact => contact.phoneNumber); // Filter out contacts without phone numbers

      // Upload contacts to backend
      const response = await userApi.uploadContacts(userId, formattedContacts);
      return response.data;
    } catch (error) {
      console.error('Error uploading contacts:', error);
      throw error;
    }
  },

  // Add a friend
  async addFriend(userId: string, friendId: string) {
    try {
      const response = await userApi.addFriend(userId, friendId);
      return response.data;
    } catch (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
  },

  // Remove a friend
  async removeFriend(userId: string, friendId: string) {
    try {
      const response = await userApi.removeFriend(userId, friendId);
      return response.data;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  },
};

export default friendService;
