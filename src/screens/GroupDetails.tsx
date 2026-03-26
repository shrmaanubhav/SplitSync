import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../components/Button';
import { groupService } from '../services/group.service';
import { expenseService } from '../services/expense.service';
import { balanceService } from '../services/balance.service';
import { analyticsService } from '../services/analytics.service';
import { formatCurrency, formatDate } from '../utils/format';
import { currencyService } from '../services/currency.service';
import { useStore } from '../store/useStore';
import Avatar from '../components/Avatar';
import { getCurrentTheme } from '../services/theme.service';

const GroupDetailScreen = () => {
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { user, darkMode } = useStore();
  const theme = getCurrentTheme();
  // Updated to handle both groupId and group object
  const routeParams = route.params as { groupId?: string; group?: any };

  const fetchGroupData = async () => {
    try {
      // Get groupId from either route params or group object
      const groupId = routeParams.groupId || routeParams.group?._id;

      if (!groupId) {
        console.error('No group ID provided');
        return;
      }

      const [groupData, expensesData, balancesData, analyticsData] =
        await Promise.all([
          groupService.getGroupById(groupId),
          expenseService.getExpensesByGroup(groupId),
          balanceService.getGroupBalances(groupId),
          analyticsService.getGroupAnalytics(groupId),
        ]);

      setGroup(groupData);
      setExpenses(expensesData);
      setBalances(balancesData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching group data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroupData();
    setRefreshing(false);
  };

  useEffect(() => {
    // If we have a group object passed in, use it directly
    if (routeParams.group) {
      setGroup(routeParams.group);
    }

    fetchGroupData();
  }, [routeParams.groupId, routeParams.group]);

  const handleAddExpense = () => {
    // Navigate to add expense screen with group context
    // @ts-ignore
    navigation.navigate('AddExpense', { group });
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone and all expenses in this group will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await groupService.deleteGroup(group._id);
              // Navigate back to the previous screen
              // @ts-ignore
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting group:', error);
              Alert.alert('Error', 'Failed to delete group');
            }
          },
        },
      ]
    );
  };

  const handlePromoteToAdmin = async (memberId: string) => {
    try {
      const updatedGroup = await groupService.promoteToAdmin(group._id, {
        userId: memberId,
      });
      setGroup(updatedGroup);
      Alert.alert('Success', 'Member promoted to admin successfully');
    } catch (error: any) {
      console.error('Error promoting to admin:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to promote member to admin';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleRemoveAdmin = async (memberId: string) => {
    try {
      const updatedGroup = await groupService.removeAdmin(group._id, memberId);
      setGroup(updatedGroup);
      Alert.alert('Success', 'Admin privileges removed successfully');
    } catch (error: any) {
      console.error('Error removing admin:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to remove admin privileges';
      Alert.alert('Error', errorMessage);
    }
  };

  const isAdmin = (memberId: string) => {
    return group?.admins?.some(
      (admin: any) => admin._id === memberId || admin === memberId
    );
  };

  const isCurrentUserAdmin = () => {
    return group?.admins?.some(
      (admin: any) => admin._id === user?.id || admin === user?.id
    );
  };

  const renderMemberItem = (item: any) => {
    const memberIsAdmin = isAdmin(item._id);
    const currentUserIsAdmin = isCurrentUserAdmin();

    return (
      <View
        style={[styles.memberItem, { backgroundColor: theme.cardBackground }]}
      >
        <Avatar name={item.name} size={40} />
        <View style={styles.memberInfo}>
          <View style={styles.memberNameContainer}>
            <Text style={[styles.memberName, { color: theme.textPrimary }]}>
              {item.name}
            </Text>
            {memberIsAdmin && (
              <View
                style={[styles.adminBadge, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            )}
          </View>
          <Text style={[styles.memberEmail, { color: theme.textSecondary }]}>
            {item.email}
          </Text>
        </View>
        {currentUserIsAdmin && user?.id !== item._id && (
          <View style={styles.adminActions}>
            {memberIsAdmin ? (
              <Button
                title="Remove Admin"
                variant="secondary"
                onPress={() => handleRemoveAdmin(item._id)}
                style={styles.adminButton}
              />
            ) : (
              <Button
                title="Make Admin"
                variant="primary"
                onPress={() => handlePromoteToAdmin(item._id)}
                style={styles.adminButton}
              />
            )}
          </View>
        )}
      </View>
    );
  };

  const renderExpenseItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.expenseItem, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.expenseHeader}>
        <Text style={[styles.expenseDescription, { color: theme.textPrimary }]}>
          {item.description}
        </Text>
        <Text style={[styles.expenseAmount, { color: theme.textPrimary }]}>
          {formatCurrency(item.amount)}
        </Text>
      </View>
      <View style={styles.expenseFooter}>
        <Text style={[styles.expensePaidBy, { color: theme.textSecondary }]}>
          Paid by {item.paidBy?.name || 'Unknown'}
        </Text>
        <Text style={[styles.expenseDate, { color: theme.textSecondary }]}>
          {formatDate(item.date)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {group ? (
        <>
          <View
            style={[
              styles.header,
              {
                backgroundColor: theme.cardBackground,
                borderBottomColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.groupName, { color: theme.textPrimary }]}>
              {group.name}
            </Text>
            <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
              {group.members?.length || 0} members
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                {formatCurrency(analytics?.totalExpenses || 0)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Total Expenses
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                {formatCurrency(0)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Your Balance
              </Text>
            </View>
          </View>

          {/* Members Section */}
          <View
            style={[styles.section, { backgroundColor: theme.cardBackground }]}
          >
            <TouchableOpacity
              style={[
                styles.sectionHeader,
                styles.clickableSectionHeader,
                { backgroundColor: theme.cardBackground },
              ]}
              onPress={() => setShowMembers(!showMembers)}
              activeOpacity={0.7}
            >
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Members ({group.members?.length || 0})
              </Text>
              <Text style={[styles.toggleText, { color: theme.primary }]}>
                {showMembers ? '▲ Hide' : '▼ Show'}
              </Text>
            </TouchableOpacity>

            {showMembers && group.members && group.members.length > 0 && (
              <View style={styles.membersListContainer}>
                <ScrollView
                  style={styles.membersList}
                  contentContainerStyle={styles.membersListContent}
                >
                  {group.members.map(renderMemberItem)}
                </ScrollView>
              </View>
            )}

            {showMembers && group.members && group.members.length === 0 && (
              <View style={styles.membersListContainer}>
                <Text
                  style={[styles.noMembersText, { color: theme.textSecondary }]}
                >
                  No members in this group
                </Text>
              </View>
            )}
          </View>

          <View
            style={[styles.section, { backgroundColor: theme.cardBackground }]}
          >
            <View
              style={[
                styles.sectionHeader,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Recent Expenses
              </Text>
              <View style={styles.buttonGroup}>
                <Button
                  title="Add Expense"
                  onPress={handleAddExpense}
                  variant="secondary"
                  style={styles.addButton}
                />
                {isCurrentUserAdmin() && (
                  <Button
                    title="Delete Group"
                    onPress={handleDeleteGroup}
                    variant="danger"
                    style={styles.deleteButton}
                  />
                )}
              </View>
            </View>

            <FlatList
              data={expenses}
              renderItem={renderExpenseItem}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.expensesList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[theme.primary]}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text
                    style={[styles.emptyText, { color: theme.textPrimary }]}
                  >
                    No expenses yet
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtext,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Add your first expense to this group
                  </Text>
                </View>
              }
            />
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.textPrimary }}>
            Loading group details...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  memberCount: {
    fontSize: 16,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 16,
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  clickableSectionHeader: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  deleteButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  adminButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  membersListContainer: {
    paddingBottom: 20,
  },
  membersList: {
    maxHeight: 300,
  },
  membersListContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 10,
  },
  memberNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  adminBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  memberEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  adminActions: {
    flexDirection: 'row',
  },
  noMembersText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
  expensesList: {
    padding: 20,
    paddingTop: 0,
  },
  expenseItem: {
    borderRadius: 12,
    padding: 15,
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
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  expenseDescription: {
    fontSize: 18,
    fontWeight: '600',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expensePaidBy: {
    fontSize: 14,
  },
  expenseDate: {
    fontSize: 14,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GroupDetailScreen;