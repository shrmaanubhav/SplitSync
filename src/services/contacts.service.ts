import { Platform } from 'react-native';

/**
 * 🚀 TEMPORARY MOCK TO BYPASS EXPO DEPENDENCY
 * This prevents the 'Unable to resolve module expo-contacts' error
 * during the bundling process.
 */
const Contacts: any = {
  Fields: {
    PhoneNumbers: 'phoneNumbers',
    Emails: 'emails',
  },
  requestPermissionsAsync: async () => ({ status: 'granted' }),
  getPermissionsAsync: async () => ({ status: 'granted' }),
  getContactsAsync: async () => ({ data: [] }),
};

export interface Contact {
  id: string;
  name: string;
  phoneNumbers: string[];
  emails: string[];
}

// Function to normalize Indian phone numbers (always remove 91)
export const normalizeIndianPhoneNumber = (phoneNumber: string): string => {
  let normalized = phoneNumber.replace(/\D/g, '');

  if (normalized.startsWith('91') && normalized.length === 12) {
    return normalized.substring(2);
  }

  if (normalized.startsWith('0') && normalized.length === 11) {
    return normalized.substring(1);
  }

  if (normalized.length === 10) {
    return normalized;
  }

  return normalized;
};

// Function to check if two Indian phone numbers match
export const phoneNumbersMatch = (phone1: string, phone2: string): boolean => {
  const normalized1 = normalizeIndianPhoneNumber(phone1);
  const normalized2 = normalizeIndianPhoneNumber(phone2);
  return normalized1 === normalized2;
};

export const contactsService = {
  // Request contacts permission
  async requestPermission(): Promise<boolean> {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === 'granted';
  },

  // Check if contacts permission is granted
  async hasPermission(): Promise<boolean> {
    const { status } = await Contacts.getPermissionsAsync();
    return status === 'granted';
  },

  // Get all contacts with phone numbers
  async getContactsWithPhoneNumbers(): Promise<Contact[]> {
    const hasPermission = await this.hasPermission();
    if (!hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) {
        throw new Error('Contacts permission not granted');
      }
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
    });

    const contacts: Contact[] = data
      .filter(
        (contact: any) =>
          contact.phoneNumbers &&
          contact.phoneNumbers.length > 0 &&
          contact.name
      )
      .map((contact: any) => ({
        id: contact.id,
        name: contact.name || 'Unknown',
        phoneNumbers: contact.phoneNumbers
          ? contact.phoneNumbers.map((p: any) => p.number || '').filter((n: string) => n)
          : [],
        emails: contact.emails
          ? contact.emails.map((e: any) => e.email || '').filter((e: string) => e)
          : [],
      }));

    return contacts;
  },

  // Search contacts by name or phone number
  async searchContacts(query: string): Promise<Contact[]> {
    const contacts = await this.getContactsWithPhoneNumbers();
    const normalizedQuery = query.toLowerCase().trim();

    return contacts.filter(contact => {
      if (contact.name.toLowerCase().includes(normalizedQuery)) return true;
      if (contact.phoneNumbers.some(phone => phone.includes(normalizedQuery))) return true;
      if (contact.emails.some(email => email.toLowerCase().includes(normalizedQuery))) return true;
      return false;
    });
  },

  // Format phone number for display (Indian format)
  formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');

    if (cleaned.length === 10) {
      return `${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
    }

    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      const number = cleaned.substring(2);
      return `${number.substring(0, 5)} ${number.substring(5)}`;
    }

    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      const number = cleaned.substring(1);
      return `${number.substring(0, 5)} ${number.substring(5)}`;
    }

    return cleaned;
  },

  phoneNumbersMatch,
  normalizeIndianPhoneNumber,
};

export default contactsService;