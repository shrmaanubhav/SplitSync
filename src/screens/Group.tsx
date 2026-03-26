import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { groupService } from '../services/group.service';
import { formatCurrency } from '../utils/format';
import { useStore } from '../store/useStore';
import { currencyService } from '../services/currency.service';
import { getCurrentTheme } from '../services/theme.service';
import Screen from '../components/Screen';
import { getFloatingButtonPosition } from '../utils/layout';
import { analyticsService } from '../services/analytics.service';

const GroupsScreen = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [groupAnalytics, setGroupAnalytics] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { setCurrentGroup, user } = useStore();

  const fetchGroups = async () => {
    try {
      const data = await groupService.getAllGroups();
      setGroups(data);

      // Fetch analytics for each group
      const analyticsData: any = {};
      for (const group of data) {
        try {
          const analytics = await analyticsService.getGroupAnalytics(group._id);
          analyticsData[group._id] = analytics;
        } catch (error) {
          console.error(
            `Error fetching analytics for group ${group._id}:`,
            error
          );
          analyticsData[group._id] = { totalExpenses: 0 };
        }
      }
      setGroupAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = () => {
    // Navigate to create group screen
    // @ts-ignore
    navigation.navigate('CreateGroup');
  };

  const theme = getCurrentTheme();

  const renderGroupItem = ({ item }: { item: any }) => {
    const analytics = groupAnalytics[item._id] || { totalExpenses: 0 };

    // Calculate user's balance (simplified - in a real app, this would come from the balance service)
    let userBalance = 0;
    if (
      analytics.personSpending &&
      user?.id &&
      analytics.personSpending[user.id]
    ) {
      userBalance = analytics.personSpending[user.id].netBalance || 0;
    }

    return (
      <TouchableOpacity
        style={[styles.groupCard, { backgroundColor: theme.cardBackground }]}
        onPress={() => {
          setCurrentGroup(item);
          // @ts-ignore
          navigation.navigate('GroupDetail', { group: item });
        }}
      >
        <View style={styles.groupHeader}>
          <Text style={[styles.groupName, { color: theme.textPrimary }]}>
            {item.name}
          </Text>
          <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
            {item.members.length} members
          </Text>
        </View>
        <Text style={[styles.groupDescription, { color: theme.textSecondary }]}>
          {item.description || 'No description'}
        </Text>
        <View style={styles.groupFooter}>
          <Text style={[styles.totalExpenses, { color: theme.textPrimary }]}>
            Total: {formatCurrency(analytics.totalExpenses || 0)}
          </Text>
          <Text
            style={[
              styles.yourBalance,
              { color: userBalance >= 0 ? '#4CD964' : '#FF3B30' },
            ]}
          >
            Your balance: {formatCurrency(userBalance)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textPrimary }]}>
              No groups yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Create your first group to start sharing expenses
            </Text>
          </View>
        }
      />

      <Button
        title="Create New Group"
        onPress={handleCreateGroup}
        style={styles.fab}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  groupCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  memberCount: {
    fontSize: 14,
  },
  groupDescription: {
    fontSize: 16,
    marginBottom: 15,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalExpenses: {
    fontSize: 16,
    fontWeight: '600',
  },
  yourBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: getFloatingButtonPosition(20), // Use utility function for proper positioning
    right: 20,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default GroupsScreen;