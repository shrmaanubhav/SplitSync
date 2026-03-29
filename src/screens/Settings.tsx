import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
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
    }

    setVisible(false);
  };

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={{ color: theme.textPrimary }}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>

        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={{ color: theme.textPrimary }}>Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>

        <TouchableOpacity
          style={styles.section}
          onPress={() => setVisible(true)}
        >
          <Text style={{ color: theme.textPrimary }}>Currency</Text>
          <Text style={{ color: theme.textSecondary }}>{currency}</Text>
        </TouchableOpacity>

        <Button title="Delete Account" variant="danger" onPress={() => {}} />

        <CurrencySelector
          visible={visible}
          onClose={() => setVisible(false)}
          onSelect={handleCurrencySelect}
          selectedCurrency={currency}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: {
    padding: 20,
    borderBottomWidth: 1,
  },
});

export default SettingsScreen;