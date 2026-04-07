import Contacts from 'react-native-contacts';
import { PermissionsAndroid } from 'react-native';

export interface CleanContact {
  id: string;
  name: string;
  phoneNumber: string; 
  isOnApp?: boolean;   
  uid?: string;        
}

export const contactService = {
  
  // 1. Request Android Runtime Permission
  async requestPermission(): Promise<boolean> {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts Permission',
          message: 'SplitSync needs access to your contacts to help you easily add friends to groups.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  },

  // 2. Fetch and Clean Data
  async getLocalContacts(defaultCountryCode = '+91'): Promise<CleanContact[]> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Contact permission denied. Please enable it in your phone settings.');
    }

    const rawContacts = await Contacts.getAll();
    const cleanList: CleanContact[] = [];

    rawContacts.forEach(contact => {
      if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) return;
      
      const name = `${contact.givenName || ''} ${contact.familyName || ''}`.trim();
      if (!name) return;


      const rawNumber = contact.phoneNumbers[0].number;
      let cleanNumber = rawNumber.replace(/[^\d+]/g, '');

      if (cleanNumber.length === 10 && !cleanNumber.startsWith('+')) {
        cleanNumber = `${defaultCountryCode}${cleanNumber}`;
      }

      cleanList.push({
        id: contact.recordID,
        name: name,
        phoneNumber: cleanNumber,
      });
    });

    // Remove duplicates 
    const uniqueMap = new Map();
    cleanList.forEach(item => uniqueMap.set(item.phoneNumber, item));
    
    // Return sorted alphabetically
    return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
};

export default contactService;