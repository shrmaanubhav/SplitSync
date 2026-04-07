import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

import { getCurrentTheme } from '../services/theme.service';
import Avatar from '../components/Avatar';
import Screen from '../components/Screen';
import { useSelection } from '../contexts/SelectionContext';
import { useStore } from '../store/useStore';

interface AppUser {
  _id: string;
  name: string;
  phoneNumber: string;
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
  const [friends, setFriends] = useState<AppUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<AppUser[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // ---------- LOAD EXISTING FRIENDS ONLY ----------
  const loadFriends = async () => {
    if (!user?._id) return;

    try {
      setLoadingFriends(true);

      const userDoc = await firestore().collection('users').doc(user._id).get();
      const friendIds: string[] = userDoc.data()?.friends || [];

      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }

      const docs = await Promise.all(
        friendIds.map(id => firestore().collection('users').doc(id).get())
      );

      const loadedFriends = docs.map(doc => ({
        _id: doc.id,
        ...(doc.data() as any),
      }));

      setFriends(loadedFriends);

      // Pre-select users if editing an existing group/expense
      if (selectedMembers.length > 0) {
        const preSelected = loadedFriends.filter(f => selectedMembers.includes(f._id));
        setSelectedUsers(preSelected);
      }
    } catch (e) {
      console.error('Error loading friends:', e);
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  // ---------- INSTANT LOCAL SEARCH ----------
  // No Firebase calls! We just filter the loaded friends list in memory.
  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.phoneNumber.includes(searchQuery)
  );

  // ---------- SELECT ----------
  const handleUserSelect = (u: AppUser) => {
    const isSelected = selectedUsers.some(s => s._id === u._id);

    if (mode === 'single') {
      selectionCallback?.([u]);
      navigation.goBack();
      return;
    }

    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(s => s._id !== u._id));
    } else {
      setSelectedUsers([...selectedUsers, u]);
    }
  };

  const handleComplete = () => {
    selectionCallback?.(selectedUsers);
    navigation.goBack();
  };

  // ---------- RENDER ----------
  const renderUser = ({ item }: { item: AppUser }) => {
    const isSelected = selectedUsers.some(s => s._id === item._id);

    return (
      <TouchableOpacity
        style={[
          styles.item, 
          { 
            borderBottomColor: theme.border,
            backgroundColor: isSelected ? theme.primary + '15' : 'transparent' // Slight highlight if selected
          }
        ]}
        onPress={() => handleUserSelect(item)}
      >
        <Avatar name={item.name} size={45} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.textPrimary }]}>{item.name}</Text>
          <Text style={[styles.userPhone, { color: theme.textSecondary }]}>{item.phoneNumber}</Text>
        </View>
        
        {/* Visual Checkmark Indicator */}
        <View style={[styles.checkbox, { borderColor: isSelected ? theme.primary : theme.border }]}>
          {isSelected && <Text style={{ color: theme.primary, fontWeight: 'bold' }}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {selectedUsers.length} selected
          </Text>
        </View>

        <TextInput
          style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.cardBackground }]}
          placeholder="Search friends..."
          placeholderTextColor={theme.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {loadingFriends ? (
          <ActivityIndicator style={{ marginTop: 20 }} size="large" color={theme.primary} />
        ) : (
          <FlatList
            data={filteredFriends}
            renderItem={renderUser}
            keyExtractor={i => i._id}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {searchQuery ? "No friends found matching that search." : "You haven't added any friends yet."}
              </Text>
            }
          />
        )}

        <TouchableOpacity 
          style={[styles.doneBtn, { backgroundColor: theme.primary }]} 
          onPress={handleComplete}
        >
          <Text style={styles.doneBtnText}>Confirm Selection</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  input: { padding: 15, marginHorizontal: 20, marginBottom: 10, borderRadius: 12, borderWidth: 1, fontSize: 16 },
  item: { flexDirection: 'row', padding: 15, alignItems: 'center', borderBottomWidth: 1 },
  userInfo: { marginLeft: 15, flex: 1 },
  userName: { fontSize: 16, fontWeight: '600' },
  userPhone: { fontSize: 13, marginTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  doneBtn: { padding: 18, alignItems: 'center', margin: 20, borderRadius: 16 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 40, paddingHorizontal: 20 },
});

export default SelectPeopleScreen;