// Settings Screen
// Simplified implementation to avoid dependency issues

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import Button from '../components/Button';
import CurrencySelector from '../components/CurrencySelector';
import Screen from '../components/Screen';
import { useStore } from '../store/useStore';
import { currencyService } from '../services/currency.service';
import { userService } from '../services/user.service';
import { getCurrentTheme } from '../services/theme.service';

const SettingsScreen = () => {
  const { darkMode, setDarkMode, user, updateUserCurrency } = useStore();
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState(
    user?.currency || currencyService.getCurrentCurrency()
  );
  const [currencySelectorVisible, setCurrencySelectorVisible] = useState(false);
  const theme = getCurrentTheme();

  // Initialize currency from user data
  useEffect(() => {
    if (user?.currency) {
      setCurrency(user.currency);
      currencyService.setCurrentCurrency(user.currency);
    }
  }, [user]);

  const handleCurrencyChange = () => {
    console.log('Opening currency selector');
    setCurrencySelectorVisible(true);
  };

  const handleCurrencySelect = async (selectedCurrency: any) => {
    console.log('Selected currency:', selectedCurrency);

    // Update local state
    setCurrency(selectedCurrency.code);
    currencyService.setCurrentCurrency(selectedCurrency.code);

    // Update user currency in backend and store
    if (user) {
      try {
        await userService.updateUserCurrency(user.id, selectedCurrency.code);
        updateUserCurrency(user.id, selectedCurrency.code);
      } catch (error) {
        console.error('Error updating currency:', error);
      }
    }
  };

  // Debug: Log when currency selector visibility changes
  useEffect(() => {
    console.log('Currency selector visible:', currencySelectorVisible);
  }, [currencySelectorVisible]);

  // Debug: Log current currency
  useEffect(() => {
    console.log('Current currency:', currency);
  }, [currency]);

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Preferences
          </Text>

          <View style={styles.settingItem}>
            <Text style={[styles.settingText, { color: theme.textPrimary }]}>
              Dark Mode
            </Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={darkMode ? theme.primaryLight : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingText, { color: theme.textPrimary }]}>
              Notifications
            </Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={notifications ? theme.primaryLight : '#FFFFFF'}
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleCurrencyChange}
          >
            <Text style={[styles.settingText, { color: theme.textPrimary }]}>
              Currency
            </Text>
            <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
              {currency}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Account
          </Text>

          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <Text style={[styles.settingText, { color: theme.textPrimary }]}>
              Change Password
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <Text style={[styles.settingText, { color: theme.textPrimary }]}>
              Privacy Settings
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            About
          </Text>

          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <Text style={[styles.settingText, { color: theme.textPrimary }]}>
              Terms of Service
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <Text style={[styles.settingText, { color: theme.textPrimary }]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <Text style={[styles.settingText, { color: theme.textPrimary }]}>
              Version 1.0.0
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomContainer}>
          <Button title="Delete Account" variant="danger" onPress={() => {}} />
        </View>

        <CurrencySelector
          visible={currencySelectorVisible}
          onClose={() => {
            console.log('Closing currency selector');
            setCurrencySelectorVisible(false);
          }}
          onSelect={handleCurrencySelect}
          selectedCurrency={currency}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  settingText: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
});

export default SettingsScreen;