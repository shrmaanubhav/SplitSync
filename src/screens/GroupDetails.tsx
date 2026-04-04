import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  NavigationProp,
} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

import { getCurrentTheme } from '../services/theme.service';
import { getBalances } from '../services/balance.service';
import { getSettlements } from '../services/settlement.service';
import { RootStackParamList } from '../types/navigation.types';
import { useStore } from '../store/useStore';

const GroupDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();

  const { groupId } = route.params as { groupId: string };

  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>({});
  const [settlements, setSettlements] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});

  const { user } = useStore();
  const theme = getCurrentTheme();
  
  const currentUserId = (user as any)?.uid || user?._id;

  // fetch group
  useEffect(() => {
    const unsub = firestore()
      .collection('groups')
      .doc(groupId)
      .onSnapshot(doc => {
        if (doc.exists()) {
          setGroup({ _id: doc.id, ...doc.data() });
        }
      });

    return unsub;
  }, [groupId]);

  // fetch name from id
  useEffect(() => {
    if (!group?.members?.length) return;

    const unsub = firestore()
      .collection('users')
      .where('_id', 'in', group.members)
      .onSnapshot(snapshot => {
        const map: Record<string, string> = {};

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          map[data._id] = data.name;
        });

        setUsersMap(map);
      });

    return unsub;
  }, [group]);

  // fetch expenses
  useEffect(() => {
    if (!group) return;

    const unsub = firestore()
      .collection('groups')
      .doc(groupId)
      .collection('expenses')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const exp = snapshot.docs.map(doc => ({
          _id: doc.id,
          ...(doc.data() as any),
        }));

        const bal = getBalances(group.members || [], exp);
        const set = getSettlements(bal);

        setExpenses(exp);
        setBalances(bal);
        setSettlements(set);
      });

    return unsub;
  }, [groupId, group]);

  if (!group) {
    return <Text style={{ padding: 20 }}>Loading...</Text>;
  }

  // map names
  const getName = (id: string) => {
    if (id === currentUserId) return 'You';
    return usersMap[id] || id;
  };

  // summary
  const getSummary = () => {
    if (!currentUserId) return { owe: 0, receive: 0 };

    const myBalance = balances[currentUserId] || 0;

    if (myBalance < 0) {
      return { owe: Math.abs(myBalance), receive: 0 };
    } else if (myBalance > 0) {
      return { owe: 0, receive: myBalance };
    } else {
      return { owe: 0, receive: 0 };
    }
  };

  const summary = getSummary();

  const handleSettleUp = () => {
    if (!currentUserId) return;

    const myPay = settlements.filter(s => s.from === currentUserId);
    const myReceive = settlements.filter(s => s.to === currentUserId);

    navigation.navigate('SettleScreen', {
      groupId: groupId,
      payList: myPay,
      receiveList: myReceive,
    });
  };

  // show expenses
  const renderExpense = ({ item }: any) => {
    const dateObj = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
    const dateString = dateObj.toDateString() !== 'Invalid Date' ? dateObj.toDateString().slice(4, 10) : 'N/A';

    return (
      <View style={styles.row}>
        {/* DATE */}
        <View style={styles.dateBox}>
          <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>
            {dateString}
          </Text>
        </View>

        {/* ICON */}
        <View style={[styles.icon, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderWidth: 1 }]}>
          <Text style={{ fontSize: 16 }}>💸</Text>
        </View>

        {/* TEXT */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '600' }}>
            {getName(item.paidBy)} paid <Text style={{ fontWeight: '800' }}>₹{item.amount}</Text>
          </Text>

          <Text style={{ color: theme.textSecondary, marginTop: 2, fontSize: 13 }}>
            {item.description || 'Expense'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {group.name}
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: 16, marginTop: 4 }}>
          {group.members?.length || 0} members
        </Text>
      </View>

      {/* SUMMARY */}
      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderWidth: 1 }]}>
        {summary.owe > 0 && (
          <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '500' }}>
            You owe{' '}
            <Text style={{ color: '#FF3B30', fontWeight: 'bold', fontSize: 18 }}>
              ₹{summary.owe.toFixed(2)}
            </Text>
          </Text>
        )}

        {summary.receive > 0 && (
          <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '500' }}>
            You will receive{' '}
            <Text style={{ color: '#4CD964', fontWeight: 'bold', fontSize: 18 }}>
              ₹{summary.receive.toFixed(2)}
            </Text>
          </Text>
        )}

        {summary.owe === 0 && summary.receive === 0 && (
          <Text style={{ color: theme.textSecondary, fontSize: 16, fontStyle: 'italic' }}>
            All settled up in this group 🎉
          </Text>
        )}
      </View>

      {/* ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
          onPress={handleSettleUp}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, textTransform: 'uppercase' }}>
            Settle up
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={expenses}
        renderItem={renderExpense}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ marginTop: 10, paddingBottom: 100 }}
      />

      {/* FLOAT BUTTON */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          activeOpacity={0.9}
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('AddExpense', { groupId })}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
            + Add Expense
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800' },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  primaryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  dateBox: {
    width: 60,
    alignItems: 'center',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default GroupDetailScreen;