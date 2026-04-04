import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Button from '../components/Button';
import CurrencySelector from '../components/CurrencySelector';
import Screen from '../components/Screen';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';
import firestore from '@react-native-firebase/firestore';

const SettingsScreen = () => {
  const { darkMode, setDarkMode, user, updateUserCurrency } = useStore();
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [notifications, setNotifications] = useState(true);
  const [visible, setVisible] = useState(false);

  const theme = getCurrentTheme();

  const handleCurrencySelect = async (c: any) => {
    const code = c.code;
    setCurrency(code);

    if (!user?._id) return;

    try {
      await firestore()
        .collection('users')
        .doc(user._id)
        .update({ currency: code });

      updateUserCurrency(code);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not update currency');
    }
    setVisible(false);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This action is permanent and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete requested') },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        
        {/* PREFERENCES SECTION */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Preferences</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.icon}>🌙</Text>
              <Text style={[styles.rowText, { color: theme.textPrimary }]}>Dark Mode</Text>
            </View>
            <Switch 
              value={darkMode} 
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.icon}>🔔</Text>
              <Text style={[styles.rowText, { color: theme.textPrimary }]}>Notifications</Text>
            </View>
            <Switch 
              value={notifications} 
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity 
            style={styles.row} 
            activeOpacity={0.7}
            onPress={() => setVisible(true)}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.icon}>💰</Text>
              <Text style={[styles.rowText, { color: theme.textPrimary }]}>Currency</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.currencyText, { color: theme.textSecondary }]}>{currency}</Text>
              <Text style={[styles.chevron, { color: theme.textTertiary }]}>▸</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* DANGER ZONE */}
        <Text style={[styles.sectionTitle, { color: '#FF3B30', marginTop: 30 }]}>Danger Zone</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.dangerDesc, { color: theme.textSecondary }]}>
            Deleting your account will remove all personal data and group associations.
          </Text>
          <Button 
            title="Delete My Account" 
            variant="danger" 
            onPress={handleDeleteAccount}
            style={styles.deleteBtn}
          />
        </View>

        <CurrencySelector
          visible={visible}
          onClose={() => setVisible(false)}
          onSelect={handleCurrencySelect}
          selectedCurrency={currency}
        />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 16,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  dangerDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 12,
    textAlign: 'center',
  },
  deleteBtn: {
    marginBottom: 12,
    borderRadius: 12,
  },
});

export default SettingsScreen;