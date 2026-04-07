import firestore from '@react-native-firebase/firestore';
import { CleanContact } from './contact.service';

export const friendService = {
  
  // Helper function to slice an array into chunks of 30
  chunkArray(array: string[], size: number): string[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  // The Magic Matcher
  async findRegisteredContacts(localContacts: CleanContact[]): Promise<CleanContact[]> {
    // 1. Extract just the phone numbers
    const allPhoneNumbers = localContacts.map(c => c.phoneNumber);
    
    // 2. Break them into chunks of 30 for Firestore limits
    const numberChunks = this.chunkArray(allPhoneNumbers, 30);
    
    const registeredUsersMap = new Map<string, any>(); 

    // 3. Query Firestore for each chunk
    for (const chunk of numberChunks) {
      if (chunk.length === 0) continue;
      
      const snapshot = await firestore()
        .collection('users')
        .where('phoneNumber', 'in', chunk)
        .where('status', '==', 'active') // Ignore deleted accounts
        .get();

      snapshot.docs.forEach(doc => {
        const userData = doc.data();
        // Save them in our map using the phone number as the key
        registeredUsersMap.set(userData.phoneNumber, { ...userData, _id: doc.id });
      });
    }

    // 4. Merge the results back into our local contacts list
    const finalContactList = localContacts.map(contact => {
      const registeredMatch = registeredUsersMap.get(contact.phoneNumber);
      
      if (registeredMatch) {
        return {
          ...contact,
          isOnApp: true,
          uid: registeredMatch._id,
          // Use their official SplitSync profile name if it differs from your phonebook
          name: registeredMatch.name 
        };
      }
      
      return {
        ...contact,
        isOnApp: false
      };
    });

    return finalContactList;
  }
};

export default friendService;