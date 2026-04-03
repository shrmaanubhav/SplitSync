import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';

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
        createdAt: Date.now(),
      });

    navigation.goBack();
  };

  const renderPay = ({ item }: any) => (
    <View style={styles.row}>
      <Text style={{ color: theme.textPrimary }}>
        Pay {item.to} ₹{item.amount}
      </Text>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: theme.primary }]}
        onPress={() => settle(item)}
      >
        <Text style={{ color: '#fff' }}>Pay</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReceive = ({ item }: any) => (
    <View style={styles.row}>
      <Text style={{ color: theme.textPrimary }}>
        Receive ₹{item.amount} from {item.from}
      </Text>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: 'green' }]}
        onPress={() => settle(item)}
      >
        <Text style={{ color: '#fff' }}>Request</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      <Text style={[styles.section, { color: theme.textSecondary }]}>
        You Pay
      </Text>

      <FlatList
        data={payList}
        keyExtractor={(_, i) => 'pay-' + i}
        renderItem={renderPay}
        ListEmptyComponent={
          <Text style={{ color: theme.textSecondary }}>Nothing to pay</Text>
        }
      />

      <Text style={[styles.section, { color: theme.textSecondary }]}>
        You Receive
      </Text>

      <FlatList
        data={receiveList}
        keyExtractor={(_, i) => 'rec-' + i}
        renderItem={renderReceive}
        ListEmptyComponent={
          <Text style={{ color: theme.textSecondary }}>Nothing to receive</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  section: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: 'bold',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
});

export default SettleScreen;