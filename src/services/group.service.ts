import firestore from '@react-native-firebase/firestore';

export type Group = {
  _id: string;
  name: string;
  members: string[];
  createdAt: number;
};

const groupsRef = firestore().collection('groups');

export const groupService = {
    async createGroup(data: {
        name: string;
        members: string[];
        description?: string;
    }): Promise<Group> {
        const docRef = groupsRef.doc();

        const group: Group = {
        _id: docRef.id, // ✅ fixed
        name: data.name,
        members: data.members,
        createdAt: Date.now(),
        };

        await docRef.set(group);
        return group;
    },

    async getUserGroups(userId: string): Promise<Group[]> {
    const snap = await groupsRef
        .where('members', 'array-contains', userId)
        .get();

    return snap.docs.map(doc => ({
        _id: doc.id,          // ✅ inject id
        ...(doc.data() as Omit<Group, '_id'>),
    }));
    }
};