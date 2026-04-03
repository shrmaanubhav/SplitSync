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
import navigation from '../navigation';

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

  // ---------- FETCH GROUP ----------
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

  // ---------- FETCH USERS (ID → NAME) ----------
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

  // ---------- FETCH EXPENSES ----------
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

  // ---------- NAME MAPPER ----------
  const getName = (id: string) => {
    return usersMap[id] || id;
  };

  // ---------- SUMMARY ----------
  const getSummary = () => {
    if (!user) return { owe: 0, receive: 0 };

    const myBalance = balances[user._id] || 0;

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
    if (!user) return;

    const myPay = settlements.filter(s => s.from === user._id);
    const myReceive = settlements.filter(s => s.to === user._id);

    navigation.navigate('SettleScreen', {
      groupId: groupId,
      payList: myPay,
      receiveList: myReceive,
    });
  };

  // const handleBalances = () => {
  //   navigation.navigate('BalancesScreen', {
  //     groupId: groupId,
  //     balances: balances,
  //   }); 
  // };

  // ---------- RENDER EXPENSE ----------
  const renderExpense = ({ item }: any) => (
    <View style={styles.row}>
      
      {/* DATE */}
      <View style={styles.dateBox}>
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          {new Date(item.createdAt).toDateString().slice(4, 10)}
        </Text>
      </View>

      {/* ICON */}
      <View style={[styles.icon, { backgroundColor: theme.cardBackground }]}>
        <Text>💰</Text>
      </View>

      {/* TEXT */}
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.textPrimary }}>
          {getName(item.paidBy)} paid ₹{item.amount}
        </Text>

        <Text style={{ color: theme.textSecondary, marginTop: 3 }}>
          {item.description || 'Expense'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {group.name}
        </Text>
        <Text style={{ color: theme.textSecondary }}>
          {group.members?.length || 0} people
        </Text>
      </View>

      {/* SUMMARY */}
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        {summary.owe > 0 && (
          <Text style={{ color: theme.textPrimary }}>
            You owe{' '}
            <Text style={{ color: 'orange', fontWeight: 'bold' }}>
              ₹{summary.owe}
            </Text>
          </Text>
        )}

        {summary.receive > 0 && (
          <Text style={{ color: theme.textPrimary, marginTop: 5 }}>
            You will receive{' '}
            <Text style={{ color: 'green', fontWeight: 'bold' }}>
              ₹{summary.receive}
            </Text>
          </Text>
        )}

        {summary.owe === 0 && summary.receive === 0 && (
          <Text style={{ color: theme.textSecondary }}>
            All settled
          </Text>
        )}
      </View>

      {/* ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
          onPress={handleSettleUp}
        >
          <Text style={{ color: '#fff' }}>Settle up</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: theme.border }]}
          onPress={handleBalances}
        >
          <Text style={{ color: theme.textPrimary }}>Balances</Text>
        </TouchableOpacity> */}
      </View>

      {/* LIST */}
      <FlatList
        data={expenses}
        renderItem={renderExpense}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ marginTop: 20, paddingBottom: 100 }}
      />

      {/* FLOAT BUTTON */}
      <View style={styles.fabContainer}>
        <View style={[styles.fab, { backgroundColor: theme.primary }]}>
          <Text
            style={{ color: '#fff', fontWeight: 'bold' }}
            onPress={() => navigation.navigate('AddExpense', { groupId })}
          >
            + Add expense
          </Text>
        </View>
      </View>

    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  header: { marginBottom: 20 },

  title: { fontSize: 28, fontWeight: 'bold' },

  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  primaryBtn: {
    padding: 10,
    borderRadius: 8,
  },

  secondaryBtn: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },

  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },

  dateBox: {
    width: 60,
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },

  fab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
});

export default GroupDetailScreen;