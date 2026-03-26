import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { friendService } from '../services/friend.service';
import { contactsService } from '../services/contacts.service';
import { useStore } from '../store/useStore';
import Screen from '../components/Screen';
import Avatar from '../components/Avatar';
import { getCurrentTheme } from '../services/theme.service';

interface Friend {
  _id: string;
  name: string;
  phoneNumber: string;
}

// FIX: type for backend response
type FriendAPI = {
  _id?: string;
  id?: string;
  name: string;
  phoneNumber: string;
};

const FriendsScreen = () => {
  const navigation = useNavigation();
  const { user } = useStore();
  const theme = getCurrentTheme();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFriends();
    uploadContacts();
  }, []);

  const uploadContacts = async () => {
    if (!user) return;

    try {
      await friendService.uploadContacts(user.id);
    } catch (error) {
      console.error('Error uploading contacts:', error);
    }
  };

  const loadFriends = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // FIX: typed response
      const friendsData: FriendAPI[] = await friendService.getAllFriends(user.id);

      const formattedFriends: Friend[] = friendsData.map((friend) => ({
        _id: friend._id || friend.id || '',
        name: friend.name,
        phoneNumber: friend.phoneNumber,
      }));

      setFriends(formattedFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (user) {
        await uploadContacts();
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadFriends();
      }
    } catch (error) {
      console.error('Error refreshing friends:', error);
      Alert.alert('Error', 'Failed to refresh friends');
    } finally {
      setRefreshing(false);
    }
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      style={[
        styles.friendItem,
        {
          backgroundColor: theme.cardBackground,
          borderBottomColor: theme.border,
        },
      ]}
    >
      <Avatar name={item.name} size={50} />
      <View style={styles.friendInfo}>
        <Text style={[styles.friendName, { color: theme.textPrimary }]}>
          {item.name}
        </Text>
        <Text style={[styles.friendPhone, { color: theme.textSecondary }]}>
          {contactsService.formatPhoneNumber(item.phoneNumber)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <Screen>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <ActivityIndicator
            size="large"
            color={theme.primary}
            style={styles.loader}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          My Friends
        </Text>

        {friends.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              You don't have any friends yet.
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
              Add friends to start sharing expenses!
            </Text>
          </View>
        ) : (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
            contentContainerStyle={styles.friendsList}
          />
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  friendsList: {
    paddingHorizontal: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  friendInfo: {
    marginLeft: 15,
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  friendPhone: {
    fontSize: 14,
  },
});

export default FriendsScreen;