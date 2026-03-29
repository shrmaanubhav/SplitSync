import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../components/Button';
import { formatCurrency, formatDate } from '../utils/format';
import { getCurrentTheme } from '../services/theme.service';
import firestore from '@react-native-firebase/firestore';

// ---------- TYPES ----------
interface Expense {
  _id: string;
  amount: number;
  description?: string;
  createdAt?: number;
  paidBy?: string;
  groupId?: string;
}

interface Group {
  _id: string;
  name: string;
  members: string[];
}

// ---------- COMPONENT ----------
const GroupDetailScreen = () => {
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [analytics, setAnalytics] = useState<{ totalExpenses: number } | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const theme = getCurrentTheme();

  const routeParams = route.params as { groupId?: string; group?: any };

  // ---------- FETCH ----------
  const fetchGroupData = async () => {
    try {
      const groupId = routeParams.groupId || routeParams.group?._id;
      if (!groupId) return;

      // GROUP
      const groupDoc = await firestore()
        .collection('groups')
        .doc(groupId)
        .get();

      const groupData: Group = {
        _id: groupDoc.id,
        ...(groupDoc.data() as Omit<Group, '_id'>),
      };

      // EXPENSES
      const expSnap = await firestore()
        .collection('expenses')
        .where('groupId', '==', groupId)
        .get();

      const expData: Expense[] = expSnap.docs.map(doc => ({
        _id: doc.id,
        ...(doc.data() as Omit<Expense, '_id'>),
      }));

      // ANALYTICS
      let total = 0;
      expData.forEach(e => {
        total += e.amount || 0;
      });

      setGroup(groupData);
      setExpenses(expData);
      setAnalytics({ totalExpenses: total });

    } catch (e) {
      console.error(e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroupData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchGroupData();
  }, [routeParams.groupId]);

  // ---------- UI ----------
  const renderExpense = ({ item }: { item: Expense }) => (
    <View
      style={[
        styles.expenseItem,
        { backgroundColor: theme.cardBackground },
      ]}
    >
      <Text style={{ color: theme.textPrimary }}>
        {item.description || 'No description'}
      </Text>

      <Text style={{ color: theme.textPrimary }}>
        {formatCurrency(item.amount)}
      </Text>

      <Text style={{ color: theme.textSecondary }}>
        {item.createdAt ? formatDate(item.createdAt.toString()) : 'Just now'}
      </Text>
    </View>
  );

  if (!group) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER */}
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        {group.name}
      </Text>

      <Text style={{ color: theme.textSecondary }}>
        Members: {group.members?.length || 0}
      </Text>

      <Text style={{ color: theme.textPrimary }}>
        Total: {formatCurrency(analytics?.totalExpenses || 0)}
      </Text>

      {/* LIST */}
      <FlatList
        data={expenses}
        renderItem={renderExpense}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ marginTop: 20 }}
      />

      {/* BUTTON */}
      <Button
        title="Add Expense"
        onPress={() =>
          // @ts-ignore
          navigation.navigate('AddExpense', { group })
        }
      />
    </View>
  );
};

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  expenseItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GroupDetailScreen;