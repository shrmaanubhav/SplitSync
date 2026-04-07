import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';
import { formatCurrency } from '../utils/format'; 

const SettleScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const theme = getCurrentTheme();

  const { user } = useStore();

  const { groupId, payList = [], receiveList = [] } = route.params;

  const settle = async (item: any) => {
    if (!user) return;

    await firestore()
      .collection('groups')
      .doc(groupId)
      .collection('settlements')
      .add({
        from: item.from,
        to: item.to,
        amount: item.amount,
        createdAt: firestore.Timestamp.now(), 
      });

    navigation.goBack();
  };

  const renderPay = ({ item }: any) => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>
          Pay <Text style={[styles.highlightName, { color: theme.textPrimary }]}>{item.to}</Text>
        </Text>
        <Text style={[styles.cardAmount, { color: '#FF3B30' }]}>
          {formatCurrency(item.amount)}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.btn, { backgroundColor: theme.primary }]}
        onPress={() => settle(item)}
      >
        <Text style={styles.btnText}>Pay Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReceive = ({ item }: any) => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>
          Request from <Text style={[styles.highlightName, { color: theme.textPrimary }]}>{item.from}</Text>
        </Text>
        <Text style={[styles.cardAmount, { color: '#4CD964' }]}>
          {formatCurrency(item.amount)}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.btnOutline, { borderColor: theme.primary }]}
        onPress={() => settle(item)}
      >
        <Text style={[styles.btnOutlineText, { color: theme.primary }]}>Request</Text>
      </TouchableOpacity>
    </View>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <View style={[styles.emptyState, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <Text style={[styles.emptyStateText, { color: theme.textTertiary }]}>✓ {message}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* YOU PAY SECTION */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        You Owe
      </Text>
      <FlatList
        data={payList}
        keyExtractor={(_, i) => 'pay-' + i}
        renderItem={renderPay}
        ListEmptyComponent={<EmptyState message="You don't owe anyone right now" />}
        contentContainerStyle={styles.listPadding}
      />

      {/* YOU RECEIVE SECTION */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 24 }]}>
        You Are Owed
      </Text>
      <FlatList
        data={receiveList}
        keyExtractor={(_, i) => 'rec-' + i}
        renderItem={renderReceive}
        ListEmptyComponent={<EmptyState message="No one owes you right now" />}
        contentContainerStyle={styles.listPadding}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  listPadding: {
    paddingBottom: 8,
  },
  
  // Card Styles
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  highlightName: {
    fontWeight: '700',
    fontSize: 16,
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: '800',
  },

  // Primary Button (Pay)
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
  },

  // Secondary Button 
  btnOutline: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
  },
  btnOutlineText: {
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
  },

  // Empty State
  emptyState: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed', 
  },
  emptyStateText: {
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});

export default SettleScreen;