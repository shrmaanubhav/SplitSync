import React, { useState, useEffect ,useCallback} from 'react';
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
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { formatCurrency } from '../utils/format';
import { getCurrentTheme } from '../services/theme.service';
import Screen from '../components/Screen';
import { getBalances } from '../services/balance.service';

const BalancesScreen = () => {
  const [balances, setBalances] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();
  const { user } = useStore();
  const theme = getCurrentTheme();

  const fetchBalances = async () => {
    try {
      if (!user) return;

      const groupsSnap = await firestore().collection('groups').get();

      let overall = 0;
      const result: any[] = [];

      for (const g of groupsSnap.docs) {
        const groupId = g.id;
        const groupData = g.data();

        const currentUserId = user._id;

        if (!groupData.members?.includes(currentUserId)) continue;

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
        const myBalance = bal[currentUserId] || 0;

        overall += myBalance;

        result.push({
          groupId,
          groupName: groupData.name || 'Group',
          netBalance: myBalance,
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

  useFocusEffect(
    useCallback(() => {
      fetchBalances();
    }, [user]) 
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBalances();
    setRefreshing(false);
  };

  const renderItem = ({ item }: any) => {
    const isZero = Math.abs(item.netBalance) < 0.01;
    const isPositive = item.netBalance > 0.01;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('GroupDetail', { groupId: item.groupId })}
        style={[
          styles.card,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.cardContent}>
          {/* LEFT SIDE: Name & Status */}
          <View style={styles.cardLeft}>
            <Text style={[styles.groupName, { color: theme.textPrimary }]}>
              {item.groupName}
            </Text>
            <Text style={[styles.status, { color: theme.textSecondary }]}>
              {isZero
                ? 'All settled up'
                : isPositive
                ? `You are owed ${formatCurrency(item.netBalance)}`
                : `You owe ${formatCurrency(Math.abs(item.netBalance))}`}
            </Text>
          </View>

          {/* RIGHT SIDE: Amount & Action */}
          <View style={styles.cardRight}>
            <Text
              style={[
                styles.amount,
                { color: isZero ? theme.textTertiary : isPositive ? '#4CD964' : '#FF3B30' },
              ]}
            >
              {formatCurrency(Math.abs(item.netBalance))}
            </Text>

            {!isZero && (
              <Text style={[styles.actionText, { color: theme.primary }]}>
                {isPositive ? 'View ▸' : 'Settle ▸'}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {balances && (
          <>
            <View
              style={[
                styles.summary,
                { 
                  backgroundColor: theme.primary,
                  shadowColor: theme.primary,
                },
              ]}
            >
              <Text style={[styles.summaryTitle, { color: 'rgba(255, 255, 255, 0.85)' }]}>
                Overall Balance
              </Text>

              <Text style={[styles.summaryAmount, { color: '#FFFFFF' }]}>
                {formatCurrency(Math.abs(balances.overallBalance))}
              </Text>

              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 13, fontWeight: '500' }}>
                {Math.abs(balances.overallBalance) < 0.01
                  ? "You're all settled up 🎉"
                  : balances.overallBalance > 0
                  ? 'You are owed this amount in total'
                  : 'You owe this amount in total'}
              </Text>
            </View>

            <FlatList
              data={balances.balances}
              renderItem={renderItem}
              keyExtractor={i => i.groupId}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  summary: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '800',
    marginVertical: 8,
  },

  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    paddingRight: 10,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  groupName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
  },
});

export default BalancesScreen;