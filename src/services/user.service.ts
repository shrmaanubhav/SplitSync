import firestore from '@react-native-firebase/firestore';

export interface User {
  _id: string;
  name: string;
  phoneNumber: string;
  currency: string;
  createdAt: number;
}

const usersRef = firestore().collection('users');

export const userService = {
  async createUser(data: {
    name: string;
    phoneNumber: string;
  }): Promise<User> {
    const existing = await this.getUserByPhone(data.phoneNumber);
    if (existing) return existing;

    const doc = await usersRef.add({
      name: data.name,
      phoneNumber: data.phoneNumber,
      currency: 'INR',
      createdAt: Date.now(),
    });

    return {
      _id: doc.id,
      ...data,
      currency: 'INR',
      createdAt: Date.now(),
    };
  },

  async getUserByPhone(phoneNumber: string): Promise<User | null> {
    const snap = await usersRef
      .where('phoneNumber', '==', phoneNumber)
      .limit(1)
      .get();

    if (snap.empty) return null;

    const d = snap.docs[0];
    return { _id: d.id, ...(d.data() as any) };
  },

  async getUserById(id: string): Promise<User | null> {
    const doc = await usersRef.doc(id).get();
    if (!doc.exists) return null;
    return { _id: doc.id, ...(doc.data() as any) };
  },

  async addFriend(userId: string, friendId: string) {
    await usersRef.doc(userId).update({
      friends: firestore.FieldValue.arrayUnion(friendId),
    });
  },

  async removeFriend(userId: string, friendId: string) {
    await usersRef.doc(userId).update({
      friends: firestore.FieldValue.arrayRemove(friendId),
    });
  },
};

export default userService;