import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useStore } from '../store/useStore';
import Screen from '../components/Screen';
import Avatar from '../components/Avatar';
import { getCurrentTheme } from '../services/theme.service';
import firestore from '@react-native-firebase/firestore';

interface Friend {
  _id: string;
  name: string;
  phoneNumber: string;
}

const FriendsScreen = () => {
  const { user } = useStore();
  const theme = getCurrentTheme();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ---------- FETCH ----------
  const loadFriends = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);

      const userDoc = await firestore()
        .collection('users')
        .doc(user._id)
        .get();

      const data = userDoc.data();
      const friendIds: string[] = data?.friends || [];

      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }

      const docs = await Promise.all(
        friendIds.map(id =>
          firestore().collection('users').doc(id).get()
        )
      );

      const result = docs.map(doc => ({
        _id: doc.id,
        ...(doc.data() as any),
      }));

      setFriends(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
          {item.phoneNumber}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={theme.primary} />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.friendsList}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40 }}>
            No friends yet
          </Text>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  friendsList: {
    padding: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  friendInfo: {
    marginLeft: 15,
  },
  friendName: {
    fontSize: 18,
    fontWeight: '600',
  },
  friendPhone: {
    fontSize: 14,
  },
});

export default FriendsScreen;