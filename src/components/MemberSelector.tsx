import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { useStore } from '../store/useStore';
import Button from './Button';
import Avatar from './Avatar';
import { getCurrentTheme } from '../services/theme.service';
import { useSelection } from '../contexts/SelectionContext';

interface User {
  _id: string;
  name: string;
  phoneNumber: string;
}

interface MemberSelectorProps {
  selectedMembers: string[];
  onMemberSelect: (userId: string) => void;
  onMemberRemove: (userId: string) => void;
}

const MemberSelector: React.FC<MemberSelectorProps> = ({
  selectedMembers,
  onMemberSelect,
  onMemberRemove,
}) => {
  const navigation = useNavigation();
  const { setSelectionCallback } = useSelection();
  const { user } = useStore();
  const theme = getCurrentTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // ✅ Load selected users from Firestore
  useEffect(() => {
    const loadSelectedUsers = async () => {
      if (!selectedMembers.length) {
        setSelectedUsers([]);
        return;
      }

      try {
        const docs = await Promise.all(
          selectedMembers.map(id =>
            firestore().collection('users').doc(id).get()
          )
        );

        const users: User[] = docs.map(doc => ({
          _id: doc.id,
          ...(doc.data() as any),
        }));

        setSelectedUsers(users);
      } catch (e) {
        console.error(e);
        setSelectedUsers([]);
      }
    };

    loadSelectedUsers();
  }, [selectedMembers]);

  // ✅ Firestore search (client-side filter)
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);

      try {
        const snap = await firestore().collection('users').get();

        const users: User[] = snap.docs.map(doc => ({
          _id: doc.id,
          ...(doc.data() as any),
        }));

        const filtered = users.filter(
          u =>
            u._id !== user?._id &&
            !selectedMembers.includes(u._id) &&
            (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.phoneNumber?.includes(searchQuery))
        );

        setSearchResults(filtered);
      } catch (e) {
        console.error(e);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(searchUsers, 300);
    return () => clearTimeout(t);
  }, [searchQuery, selectedMembers, user?._id]);

  const handleUserSelect = (user: User) => {
    onMemberSelect(user._id);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUserRemove = (userId: string) => {
    onMemberRemove(userId);
  };

  const handleSelectPeople = () => {
    setSelectionCallback((selected: any[]) => {
      if (Array.isArray(selected)) {
        selected.forEach(member => {
          onMemberSelect(member._id);
        });
      }
    });

    // @ts-ignore
    navigation.navigate('SelectPeople', {
      selectedMembers,
      title: 'Select Group Members',
      mode: 'multiple',
    });
  };

  const renderSelectedUser = (user: User) => (
    <View
      key={user._id}
      style={[
        styles.selectedUserItem,
        { backgroundColor: theme.primary + '20' },
      ]}
    >
      <Avatar name={user.name} size={30} />
      <View style={styles.selectedUserInfo}>
        <Text style={[styles.selectedUserName, { color: theme.textPrimary }]}>
          {user.name}
        </Text>
        <Text style={[styles.selectedUserPhone, { color: theme.textSecondary }]}>
          {user.phoneNumber}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleUserRemove(user._id)}
        style={[styles.removeButton, { backgroundColor: theme.danger }]}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = (item: User) => (
    <TouchableOpacity
      key={item._id}
      style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
      onPress={() => handleUserSelect(item)}
    >
      <Avatar name={item.name} size={40} />
      <View style={styles.searchResultInfo}>
        <Text style={[styles.searchResultName, { color: theme.textPrimary }]}>
          {item.name}
        </Text>
        <Text style={[styles.searchResultPhone, { color: theme.textSecondary }]}>
          {item.phoneNumber}
        </Text>
      </View>
      <View style={[styles.addButton, { backgroundColor: theme.primary }]}>
        <Text style={styles.addButtonText}>+</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.textPrimary }]}>
        Group Members
      </Text>

      {selectedUsers.length > 0 && (
        <ScrollView horizontal style={styles.selectedUsersContainer}>
          {selectedUsers.map(renderSelectedUser)}
        </ScrollView>
      )}

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search members..."
          placeholderTextColor={theme.textTertiary}
        />
        {loading && <ActivityIndicator size="small" color={theme.primary} />}
      </View>

      {searchResults.length > 0 && (
        <ScrollView style={styles.searchResultsContainer}>
          {searchResults.map(renderSearchResult)}
        </ScrollView>
      )}

      <Button
        title="+ Add People"
        onPress={handleSelectPeople}
        style={styles.addPeopleButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  selectedUsersContainer: { marginBottom: 15 },
  selectedUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 8,
    marginRight: 10,
  },
  selectedUserInfo: { marginLeft: 8 },
  selectedUserName: { fontSize: 14, fontWeight: '600' },
  selectedUserPhone: { fontSize: 12 },
  removeButton: {
    marginLeft: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: { color: '#fff', fontWeight: 'bold' },
  searchContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchInput: { flex: 1, paddingVertical: 12 },
  searchResultsContainer: { maxHeight: 200, marginTop: 10 },
  searchResultItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  searchResultInfo: { flex: 1, marginLeft: 10 },
  searchResultName: { fontSize: 16, fontWeight: '600' },
  searchResultPhone: { fontSize: 14 },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 18 },
  addPeopleButton: { marginTop: 15 },
});

export default MemberSelector;