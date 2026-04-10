import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SectionList,
  Linking,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

import { useStore } from '../store/useStore';
import Screen from '../components/Screen';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { getCurrentTheme } from '../services/theme.service';
import contactService, { CleanContact } from '../services/contact.service';
import friendService from '../services/friend.service';

interface Friend {
  _id: string;
  name: string;
  phoneNumber: string;
}

const FriendsScreen = () => {
  const { user, setUser } = useStore();
  const theme = getCurrentTheme();

  // Tabs
  const [activeTab, setActiveTab] = useState<'friends' | 'discover'>('friends');

  // Existing Friends State
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Contacts Discovery State
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactSections, setContactSections] = useState<{ title: string; data: CleanContact[] }[]>([]);
  const [hasSynced, setHasSynced] = useState(false);

  // ---------- FETCH EXISTING FRIENDS ----------
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

      const result = docs.map(doc => ({
        _id: doc.id,
        ...(doc.data() as any),
      }));

      setFriends(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFriends(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  useEffect(() => {
    loadFriends();
  }, []);

  // ---------- SYNC & DISCOVER CONTACTS ----------
  const handleSyncContacts = async () => {
    try {
      setLoadingContacts(true);
      
      // 1. Get raw phonebook
      const localContacts = await contactService.getLocalContacts();
      
      // 2. Query Firebase to find who is on the app
      const matchedContacts = await friendService.findRegisteredContacts(localContacts);

      // 3. Filter out people who are ALREADY friends
      const currentFriendPhones = friends.map(f => f.phoneNumber);
      const availableContacts = matchedContacts.filter(
        c => !currentFriendPhones.includes(c.phoneNumber) && c.phoneNumber !== user?.phoneNumber
      );

      // 4. Split into two sections
      const onApp = availableContacts.filter(c => c.isOnApp);
      const notOnApp = availableContacts.filter(c => !c.isOnApp);

      setContactSections([
        { title: 'On SplitSync', data: onApp },
        { title: 'Invite to App', data: notOnApp },
      ]);
      
      setHasSynced(true);
    } catch (error: any) {
      Alert.alert('Sync Error', error.message);
    } finally {
      setLoadingContacts(false);
    }
  };

  // ---------- ADD & INVITE LOGIC ----------
  const handleAddFriend = async (targetUid: string, contactName: string) => {
    if (!user?._id) return;
    try {
      // Add each other as friends in a batch to ensure atomicity
      const batch = firestore().batch();
      
      const currentUserRef = firestore().collection('users').doc(user._id);
      const targetUserRef = firestore().collection('users').doc(targetUid);

      batch.update(currentUserRef, {
        friends: firestore.FieldValue.arrayUnion(targetUid)
      });
      batch.update(targetUserRef, {
        friends: firestore.FieldValue.arrayUnion(user._id)
      });

      await batch.commit();

      // Update Zustand local state just to keep it snappy
      const updatedFriends = [...(user.friends || []), targetUid];
      setUser({ ...user, friends: updatedFriends });

      Alert.alert('Success', `${contactName} has been added to your friends!`);
      
      // Reload lists
      loadFriends();
      handleSyncContacts();
      setActiveTab('friends');
    } catch (e) {
      Alert.alert('Error', 'Could not add friend.');
    }
  };

  const handleInvite = (phoneNumber: string) => {
    const message = `Hey! I'm using SplitSync to track expenses. Download it here so we can split bills easily!`;
    Linking.openURL(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
  };

  // ---------- RENDERERS ----------
  const renderExistingFriend = ({ item }: { item: Friend }) => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <Avatar name={item.name} size={50} />
      <View style={styles.friendInfo}>
        <Text style={[styles.friendName, { color: theme.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.friendPhone, { color: theme.textSecondary }]}>{item.phoneNumber}</Text>
      </View>
    </View>
  );

  const renderDiscoveredContact = ({ item }: { item: CleanContact }) => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <Avatar name={item.name} size={50} />
      <View style={styles.friendInfo}>
        <Text style={[styles.friendName, { color: theme.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.friendPhone, { color: theme.textSecondary }]}>{item.phoneNumber}</Text>
      </View>
      
      {item.isOnApp ? (
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
          onPress={() => handleAddFriend(item.uid!, item.name)}
        >
          <Text style={styles.actionBtnText}>Add</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: theme.border }]}
          onPress={() => handleInvite(item.phoneNumber)}
        >
          <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>Invite</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Screen>
      {/* HEADER TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'friends' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'friends' ? theme.primary : theme.textSecondary }]}>My Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'discover' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'discover' ? theme.primary : theme.textSecondary }]}>Find Friends</Text>
        </TouchableOpacity>
      </View>

      {/* MY FRIENDS TAB */}
      {activeTab === 'friends' && (
        loadingFriends ? (
          <ActivityIndicator style={styles.loader} size="large" color={theme.primary} />
        ) : (
          <FlatList
            data={friends}
            renderItem={renderExistingFriend}
            keyExtractor={item => item._id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textSecondary }]}>No friends added yet.</Text>}
          />
        )
      )}

      {/* FIND FRIENDS TAB */}
      {activeTab === 'discover' && (
        <View style={styles.discoverContainer}>
          {!hasSynced ? (
            <View style={styles.syncPrompt}>
              <Text style={[styles.syncTitle, { color: theme.textPrimary }]}>Find your split squad</Text>
              <Text style={[styles.syncDesc, { color: theme.textSecondary }]}>
                Sync your contacts to see who is already using SplitSync. We never message anyone without your permission.
              </Text>
              <Button title="Sync Contacts" onPress={handleSyncContacts} loading={loadingContacts} />
            </View>
          ) : (
            <SectionList
              sections={contactSections}
              keyExtractor={(item, index) => item.phoneNumber + index}
              renderItem={renderDiscoveredContact}
              renderSectionHeader={({ section: { title, data } }) => (
                data.length > 0 ? (
                  <Text style={[styles.sectionHeader, { color: theme.textPrimary, backgroundColor: theme.background }]}>
                    {title}
                  </Text>
                ) : null
              )}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  tabContainer: { flexDirection: 'row', width: '100%', borderBottomWidth: 1, borderBottomColor: '#333' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  tabText: { fontSize: 16, fontWeight: '700' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 12, borderRadius: 16, borderWidth: 1 },
  friendInfo: { marginLeft: 15, flex: 1 },
  friendName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  friendPhone: { fontSize: 13 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  discoverContainer: { flex: 1 },
  syncPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  syncTitle: { fontSize: 24, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  syncDesc: { fontSize: 15, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  sectionHeader: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, paddingVertical: 10, marginTop: 10 },
});

export default FriendsScreen;