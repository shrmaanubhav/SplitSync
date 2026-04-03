import React, { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useStore } from '../store/useStore';
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
import { formatCurrency } from '../utils/format';
import { getCurrentTheme } from '../services/theme.service';
import Screen from '../components/Screen';
import { getBalances } from '../services/balance.service';

const BalancesScreen = () => {
  const [balances, setBalances] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();
  const theme = getCurrentTheme();

  const fetchBalances = async () => {
    try {
      const user = useStore.getState().user;
      if (!user) return;

      const groupsSnap = await firestore().collection('groups').get();

      let overall = 0;
      const result: any[] = [];

      for (const g of groupsSnap.docs) {
        const groupId = g.id;
        const groupData = g.data();

        // skip groups user is not part of
        if (!groupData.members?.includes(user._id)) continue;

        const expSnap = await firestore()
          .collection('groups')
          .doc(groupId)
          .collection('expenses')
          .get();

        const expenses = expSnap.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          paidBy: data.paidBy,  
          amount: data.amount,
          participants: data.participants || [],
          createdAt: data.createdAt || Date.now(),
        };
      });

        const bal = getBalances(groupData.members || [], expenses);
        const myBalance = bal[user._id] || 0;

        overall += myBalance;

        result.push({
          groupId,
          groupName: groupData.name || 'Group',
          netBalance: myBalance,
          totalDue: myBalance < 0 ? Math.abs(myBalance) : 0,
          totalOwed: myBalance > 0 ? myBalance : 0,
        });
      }

      setBalances({
        overallBalance: overall,
        balances: result,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBalances();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const renderBalanceItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.balanceItem, { backgroundColor: theme.cardBackground }]}
      onPress={() =>
        navigation.navigate('GroupDetail', { groupId: item.groupId })
      }
    >
      <View style={styles.balanceHeader}>
        <Text style={[styles.groupName, { color: theme.textPrimary }]}>
          {item.groupName}
        </Text>
        <Text
          style={[
            styles.netBalance,
            item.netBalance >= 0 ? styles.positive : styles.negative,
          ]}
        >
          {formatCurrency(item.netBalance)}
        </Text>
      </View>

      <View style={styles.balanceDetails}>
        <Text style={[styles.balanceText, { color: theme.textSecondary }]}>
          You owe: {formatCurrency(item.totalDue)}
        </Text>
        <Text style={[styles.balanceText, { color: theme.textSecondary }]}>
          You're owed: {formatCurrency(item.totalOwed)}
        </Text>
      </View>

      <Button
        title="Settle Up"
        onPress={() =>
          navigation.navigate('GroupDetail', { groupId: item.groupId })
        }
        variant="secondary"
        style={styles.settleButton}
      />
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {balances ? (
          <>
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>
                Overall Balance
              </Text>

              <Text
                style={[
                  styles.summaryAmount,
                  balances.overallBalance >= 0
                    ? styles.positive
                    : styles.negative,
                ]}
              >
                {formatCurrency(balances.overallBalance)}
              </Text>

              <Text
                style={[
                  styles.summaryDescription,
                  { color: theme.textSecondary },
                ]}
              >
                {balances.overallBalance >= 0
                  ? "You're owed this amount in total"
                  : 'You owe this amount in total'}
              </Text>
            </View>

            <FlatList
              data={balances.balances}
              renderItem={renderBalanceItem}
              keyExtractor={item => item.groupId}
              contentContainerStyle={styles.listContainer}
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
                    No balances yet
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtext,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Start sharing expenses to see your balances
                  </Text>
                </View>
              }
            />
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={{ color: theme.textPrimary }}>
              Loading balances...
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  summaryCard: {
    borderRadius: 12,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    elevation: 5,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },

  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 10,
  },

  positive: { color: '#4CD964' },
  negative: { color: '#FF3B30' },

  summaryDescription: {
    fontSize: 16,
    textAlign: 'center',
  },

  listContainer: {
    paddingHorizontal: 20,
  },

  balanceItem: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
  },

  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  netBalance: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  balanceDetails: {
    marginBottom: 15,
  },

  balanceText: {
    fontSize: 16,
    marginBottom: 5,
  },

  settleButton: {
    alignSelf: 'flex-start',
  },

  emptyContainer: {
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

export default BalancesScreen;