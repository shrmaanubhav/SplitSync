import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCurrentTheme } from '../services/theme.service';
import Avatar from '../components/Avatar';
import { contactsService } from '../services/contacts.service';
import Screen from '../components/Screen';
import { useSelection } from '../contexts/SelectionContext';
import { useStore } from '../store/useStore';
import firestore from '@react-native-firebase/firestore';

interface AppUser {
  _id: string;
  name: string;
  phoneNumber: string;
}

interface Contact {
  id: string;
  name: string;
  phoneNumbers: string[];
}

const SelectPeopleScreen = () => {
  const theme = getCurrentTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { selectionCallback } = useSelection();
  const { user } = useStore();

  const {
    selectedMembers = [],
    title = 'Select People',
    mode = 'multiple',
  } = route.params as any;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AppUser[]>([]);
  const [contactResults, setContactResults] = useState<Contact[]>([]);
  const [friends, setFriends] = useState<AppUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // ---------- LOAD FRIENDS ----------
  const loadFriends = async () => {
    if (!user?._id) return;

    try {
      setLoadingFriends(true);

      const userDoc = await firestore()
        .collection('users')
        .doc(user._id)
        .get();

      const friendIds: string[] = userDoc.data()?.friends || [];

      const docs = await Promise.all(
        friendIds.map(id =>
          firestore().collection('users').doc(id).get()
        )
      );

      setFriends(
        docs.map(doc => ({
          _id: doc.id,
          ...(doc.data() as any),
        }))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    loadFriends();

    if (selectedMembers.length > 0) {
      setSelectedUsers(
        selectedMembers.map((id: string) => ({
          _id: id,
          name: '',
          phoneNumber: '',
        }))
      );
    }
  }, []);

  // ---------- SEARCH ----------
  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setContactResults([]);
        return;
      }

      setLoading(true);

      try {
        const snap = await firestore().collection('users').get();

        const users: AppUser[] = snap.docs
          .map(doc => ({
            _id: doc.id,
            ...(doc.data() as any),
          }))
          .filter(u =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.phoneNumber?.includes(searchQuery)
          );

        setSearchResults(users);

        const contacts = await contactsService.searchContacts(searchQuery);
        setContactResults(contacts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(search, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // ---------- SELECT ----------
  const handleUserSelect = (u: AppUser) => {
    const exists = selectedUsers.some(s => s._id === u._id);

    if (mode === 'single') {
      selectionCallback?.([u]);
      navigation.goBack();
      return;
    }

    setSelectedUsers(
      exists
        ? selectedUsers.filter(s => s._id !== u._id)
        : [...selectedUsers, u]
    );
  };

  const handleComplete = () => {
    selectionCallback?.(selectedUsers);
    navigation.goBack();
  };

  // ---------- RENDER ----------
  const renderUser = ({ item }: { item: AppUser }) => (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: theme.border }]}
      onPress={() => handleUserSelect(item)}
    >
      <Avatar name={item.name} size={40} />
      <View style={{ marginLeft: 10 }}>
        <Text style={{ color: theme.textPrimary }}>{item.name}</Text>
        <Text style={{ color: theme.textSecondary }}>
          {item.phoneNumber}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        <TextInput
          style={[styles.input, { color: theme.textPrimary }]}
          placeholder="Search..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {loading && <ActivityIndicator />}

        {searchQuery === '' ? (
          <FlatList
            data={friends}
            renderItem={renderUser}
            keyExtractor={i => i._id}
          />
        ) : (
          <FlatList
            data={searchResults}
            renderItem={renderUser}
            keyExtractor={i => i._id}
          />
        )}

        <TouchableOpacity style={styles.doneBtn} onPress={handleComplete}>
          <Text style={{ color: '#fff' }}>Done</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  input: {
    padding: 15,
    borderBottomWidth: 1,
  },
  item: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
  },
  doneBtn: {
    backgroundColor: 'black',
    padding: 15,
    alignItems: 'center',
  },
});

export default SelectPeopleScreen;