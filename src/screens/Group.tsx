import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  useNavigation,
  useFocusEffect,
  NavigationProp,
} from '@react-navigation/native';
import Button from '../components/Button';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';
import Screen from '../components/Screen';
import { getFloatingButtonPosition } from '../utils/layout';
import { groupService } from '../services/group.service';
import { RootStackParamList } from '../types/navigation.types';

const GroupsScreen = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useStore();
  const theme = getCurrentTheme();

  async function load() {
    if (!user?._id) return;

    const data = await groupService.getUserGroups(user._id);
    setGroups(data);
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [])
  );

  const renderGroupItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.groupCard, { backgroundColor: theme.cardBackground }]}
      onPress={() => {
        console.log('CLICK GROUP:', item);
        navigation.navigate('GroupDetail', { group: item });
      }}
    >
      <View style={styles.groupHeader}>
        <Text style={[styles.groupName, { color: theme.textPrimary }]}>
          {item.name}
        </Text>
        <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
          {item.members?.length || 0} members
        </Text>
      </View>

      <Text style={{ color: theme.textSecondary }}>
        Tap to view details
      </Text>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={item => item._id} // ✅ fixed
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textPrimary }]}>
              No groups yet
            </Text>
          </View>
        }
      />

      <Button
        title="Create Group"
        onPress={() => navigation.navigate('CreateGroup')}
        style={styles.fab}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  listContainer: { padding: 20 },
  groupCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  memberCount: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: getFloatingButtonPosition(20),
    right: 20,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default GroupsScreen;