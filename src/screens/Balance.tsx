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
// import { balanceService } from '../services/balance.service';
import { formatCurrency } from '../utils/format';
import { getCurrentTheme } from '../services/theme.service';
import Screen from '../components/Screen';

const BalancesScreen = () => {
  const [balances, setBalances] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const theme = getCurrentTheme();

  const fetchBalances = async () => {
    try {
      const user = useStore.getState().user;
      const snap = await firestore().collection('expenses').get();

      let totalOwed = 0;
      let totalDue = 0;

      snap.docs.forEach(doc => {
        const exp = doc.data();
        exp.splits.forEach((s: any) => {
          if (s.userId === user?._id) {
            totalDue += s.amount;
          }
        });

        if (exp.paidBy === user?._id) {
          totalOwed += exp.amount;
        }
      });

      const overallBalance = totalOwed - totalDue;
      setBalances({
        overallBalance,
        balances: [], // group-level later
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
        onPress={() => {}}
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
  container: {
    flex: 1,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 20,
    margin: 20,
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
  positive: {
    color: '#4CD964',
  },
  negative: {
    color: '#FF3B30',
  },
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

export default BalancesScreen;