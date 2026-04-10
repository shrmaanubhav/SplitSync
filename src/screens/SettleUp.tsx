import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';
import { formatCurrency } from '../utils/format'; 
import { upiService } from '../services/upi.service'; // Make sure you saved this file!

const SettleScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const theme = getCurrentTheme();
  const { user } = useStore();

  const { groupId, payList = [], receiveList = [] } = route.params;

  // 🚨 NEW: Store fetched user profiles so we have their Names, Phone Numbers, and UPI IDs
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      // Get all unique UIDs involved in settlements
      const uniqueUids = new Set([
        ...payList.map((i: any) => i.to), 
        ...receiveList.map((i: any) => i.from)
      ]);

      if (uniqueUids.size === 0) {
        setLoading(false);
        return;
      }

      try {
        const promises = Array.from(uniqueUids).map(id => 
          firestore().collection('users').doc(id as string).get()
        );
        const docs = await Promise.all(promises);
        
        const map: Record<string, any> = {};
        docs.forEach(d => {
          if (d.exists()) map[d.id] = d.data();
        });
        setProfiles(map);
      } catch (e) {
        console.error("Failed to fetch profiles", e);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfiles();
  }, []);

  // 🚨 THE MATH FIX: Record settlements as expenses to clear the ledger
  const recordSettlement = async (item: any) => {
    if (!user) return;
    try {
      await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('expenses') // Must be expenses, not settlements!
        .add({
          description: 'Settlement Payment',
          paidBy: item.from, // The person paying
          amount: item.amount,
          participants: [{ userId: item.to, amountOwed: item.amount }], // The person receiving
          isSettlement: true, 
          createdAt: firestore.FieldValue.serverTimestamp(), 
        });

      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not record settlement.');
    }
  };

  // ---------- PAYMENT FLOW ----------
  const handlePayNow = async (item: any) => {
    const targetUser = profiles[item.to];
    const targetName = targetUser?.name || 'User';

    if (targetUser?.upiId) {
      // 1. Trigger the UPI Intent
      await upiService.initiatePayment({
        upiId: targetUser.upiId,
        name: targetName,
        amount: item.amount,
        note: 'SplitSync Settlement'
      });

      // 2. The OS switches to GPay. When they return, ask if it worked!
      setTimeout(() => {
        Alert.alert(
          'Payment Status', 
          `Did you successfully pay ${targetName}?`, [
          { text: 'No', style: 'cancel' },
          { text: 'Yes, I paid', onPress: () => recordSettlement(item) }
        ]);
      }, 1000);
    } else {
      Alert.alert(
        'No UPI ID',
        `${targetName} hasn't added their UPI ID yet. Do you want to record this as a cash payment?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Record Cash', onPress: () => recordSettlement(item) }
      ]);
    }
  };

  // ---------- REQUEST FLOW ----------
  const handleRequest = (item: any) => {
    const targetUser = profiles[item.from];
    const targetName = targetUser?.name || 'User';
    const msg = `Hey ${targetName}, you owe me ₹${item.amount.toFixed(2)} in the group on SplitSync. Please settle up!`;
    
    // Open native SMS
    const phone = targetUser?.phoneNumber || '';
    Linking.openURL(`sms:${phone}?body=${encodeURIComponent(msg)}`);
  };

  // ---------- RENDERERS ----------
  const renderPay = ({ item }: any) => {
    const targetName = profiles[item.to]?.name || 'Loading...';
    return (
      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>
            Pay <Text style={[styles.highlightName, { color: theme.textPrimary }]}>{targetName}</Text>
          </Text>
          <Text style={[styles.cardAmount, { color: '#FF3B30' }]}>
            {formatCurrency(item.amount)}
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={[styles.btn, { backgroundColor: theme.primary }]} onPress={() => handlePayNow(item)}>
          <Text style={styles.btnText}>Pay UPI</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderReceive = ({ item }: any) => {
    const targetName = profiles[item.from]?.name || 'Loading...';
    return (
      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>
            Request from <Text style={[styles.highlightName, { color: theme.textPrimary }]}>{targetName}</Text>
          </Text>
          <Text style={[styles.cardAmount, { color: '#4CD964' }]}>
            {formatCurrency(item.amount)}
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={[styles.btnOutline, { borderColor: theme.primary }]} onPress={() => handleRequest(item)}>
          <Text style={[styles.btnOutlineText, { color: theme.primary }]}>Request</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <View style={[styles.emptyState, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <Text style={[styles.emptyStateText, { color: theme.textTertiary }]}>✓ {message}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>You Owe</Text>
      <FlatList
        data={payList}
        keyExtractor={(_, i) => 'pay-' + i}
        renderItem={renderPay}
        ListEmptyComponent={<EmptyState message="You don't owe anyone right now" />}
        contentContainerStyle={styles.listPadding}
      />

      <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 24 }]}>You Are Owed</Text>
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
  container: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '800', marginBottom: 16, letterSpacing: 0.5 },
  listPadding: { paddingBottom: 8 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1 },
  cardInfo: { flex: 1 },
  cardLabel: { fontSize: 14, marginBottom: 4 },
  highlightName: { fontWeight: '700', fontSize: 16 },
  cardAmount: { fontSize: 20, fontWeight: '800' },
  btn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, textTransform: 'uppercase' },
  btnOutline: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 2 },
  btnOutlineText: { fontWeight: '700', fontSize: 14, textTransform: 'uppercase' },
  emptyState: { padding: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed' },
  emptyStateText: { fontSize: 15, fontStyle: 'italic', fontWeight: '500' },
});

export default SettleScreen;