import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';
import { formatCurrency } from '../utils/format'; 
import { upiService } from '../services/upi.service'; 

const SettleScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const theme = getCurrentTheme();
  
  // Get the current user so we can check if they have a upiId!
  const { user } = useStore();

  const { groupId, payList = [], receiveList = [] } = route.params;

  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfiles = async () => {
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

  const recordSettlement = async (item: any) => {
    if (!user) return;
    try {
      await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('expenses') 
        .add({
          description: 'Settlement Payment',
          paidBy: item.from, 
          amount: item.amount,
          participants: [{ userId: item.to, amountOwed: item.amount }], 
          isSettlement: true, 
          createdAt: firestore.FieldValue.serverTimestamp(), 
        });

      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not record settlement.');
    }
  };

  const handlePayNow = async (item: any) => {
    const targetUser = profiles[item.to];
    const targetName = targetUser?.name || 'User';

    if (targetUser?.upiId) {
      await upiService.initiatePayment({
        upiId: targetUser.upiId,
        name: targetName,
        amount: item.amount,
        note: 'SplitSync Settlement'
      });

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

  const handleRequest = (item: any) => {
    // Check if the current user has a UPI ID
    if (!user?.upiId) {
      Alert.alert(
        'Missing UPI ID',
        'Add your UPI ID to your profile so your friends know exactly where to send the money!',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Add Now', onPress: () => navigation.navigate('EditProfile') }
        ]
      );
      return; 
    }

    const targetUser = profiles[item.from];
    const targetName = targetUser?.name || 'User';
    
    //  We now automatically inject your UPI ID into the text message!
    const msg = `Hey ${targetName}, you owe me ₹${item.amount.toFixed(2)} in the group on SplitSync. You can pay me directly at my UPI ID: ${user.upiId}`;
    
    const phone = targetUser?.phoneNumber || '';
    Linking.openURL(`sms:${phone}?body=${encodeURIComponent(msg)}`);
  };

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
      
      {/* Only shows if you are owed money and missing a UPI ID */}
      {(!user?.upiId && receiveList.length > 0) && (
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.warningBanner, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={{ fontSize: 24, marginRight: 12 }}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>Missing UPI ID</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>
              Add your UPI ID so friends can pay you directly.
            </Text>
          </View>
          <Text style={{ color: theme.primary, fontWeight: 'bold', textTransform: 'uppercase' }}>Add Now</Text>
        </TouchableOpacity>
      )}

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
  
  // BANNER STYLES
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },

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