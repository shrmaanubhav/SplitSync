import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';
import authService from '../services/auth.service';

const SettingsScreen = () => {
  const { darkMode, setDarkMode, user, logout, balances } = useStore();
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // PIN Modal States
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'change' | 'delete'>('change');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  const theme = getCurrentTheme();

  // ---------- PIN MODAL LOGIC ----------

  const handleModalSubmit = () => {
    if (modalMode === 'change') {
      handleUpdatePin();
    } else {
      handleSecureDelete();
    }
  };

  const handleUpdatePin = async () => {
    const savedPinRaw = await authService.getSavedPin();
    // Ensure both are strict, trimmed strings
    const actualSavedPin = String(savedPinRaw || '').trim();
    const enteredPin = String(currentPinInput).trim();

    if (enteredPin !== actualSavedPin) {
      Alert.alert('Security Check', 'Current PIN is incorrect. ❌');
      return;
    }

    if (newPinInput.length < 4 || newPinInput !== confirmPinInput) {
      Alert.alert('Error', 'Please ensure the new PIN is 4 digits and matches the confirmation.');
      return;
    }

    try {
      await authService.savePin(newPinInput);
      Alert.alert('Success', 'Your security PIN has been updated! 🛡️');
      closePinModal();
    } catch (e) {
      Alert.alert('Error', 'Failed to update PIN. Please try again.');
    }
  };

  const closePinModal = () => {
    setPinModalVisible(false);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  // ---------- SECURE DEACTIVATION LOGIC ----------

  const initiateDeleteFlow = () => {
    // prevent from deleting if account not settled
    const hasUnsettledBalances = balances.some(
      balance => (balance.totalOwed || 0) > 0.01 || (balance.totalDue || 0) > 0.01
    );
    
    if (hasUnsettledBalances) {
      Alert.alert(
        'Settle Up First', 
        'You have outstanding debts or are owed money in your groups. You must fully settle all individual balances before deactivating your account.'
      );
      return;
    }

    setModalMode('delete');
    setPinModalVisible(true);
  };

  const handleSecureDelete = async () => {
    try {
      const savedPinRaw = await authService.getSavedPin();
      // Ensure both are strict, trimmed strings
      const actualSavedPin = String(savedPinRaw || '').trim();
      const enteredPin = String(currentPinInput).trim();

      // 1. Verify PIN
      if (enteredPin !== actualSavedPin) {
        Alert.alert('Security Check', 'Incorrect PIN. Deactivation denied. 🔐');
        return;
      }

      // 2. Final Warning
      Alert.alert(
        'Final Warning',
        'This will anonymize your profile. Your group history will remain intact for your friends, but your personal data will be wiped. This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Deactivate Account', 
            style: 'destructive', 
            onPress: async () => {
              try {
                setLoading(true);
                const userId = user?._id;
                if (!userId) return;

                // A. THE SOFT DELETE (Cloud Scrub)
                await firestore().collection('users').doc(userId).update({
                  name: 'Deleted User',
                  phoneNumber: '', 
                  status: 'deleted',
                  friends: [], 
                  updatedAt: Date.now(),
                });

                // B. LOGOUT OF FIREBASE & WIPE KEYCHAIN
                await authService.logout();

                // C. WIPE THE STORE FIRST
                logout(); 
                
              } catch (e) {
                Alert.alert('Error', 'We encountered a problem closing your account. Please try again.');
                setLoading(false);
              } 
            } 
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Could not verify PIN. Please try restarting the app.");
    }
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
            <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: '#767577', true: theme.primary }} />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.icon}>🔔</Text>
              <Text style={[styles.rowText, { color: theme.textPrimary }]}>Notifications</Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#767577', true: theme.primary }} />
          </View>
        </View>

        {/* SECURITY SECTION */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 25 }]}>Security</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.row} onPress={() => { setModalMode('change'); setPinModalVisible(true); }}>
            <View style={styles.rowLeft}>
              <Text style={styles.icon}>🔐</Text>
              <Text style={[styles.rowText, { color: theme.textPrimary }]}>Change App PIN</Text>
            </View>
            <Text style={[styles.chevron, { color: theme.textTertiary }]}>▸</Text>
          </TouchableOpacity>
        </View>

        {/* DANGER ZONE */}
        <Text style={[styles.sectionTitle, { color: '#FF3B30', marginTop: 30 }]}>Danger Zone</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.dangerDesc, { color: theme.textSecondary }]}>
            Deactivating your account will anonymize your data. This action requires your security PIN.
          </Text>
          <Button title="Deactivate Account" variant="danger" onPress={initiateDeleteFlow} style={styles.deleteBtn} loading={loading} />
        </View>

        {/* UNIFIED PIN MODAL */}
        <Modal visible={pinModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                {modalMode === 'change' ? 'Update PIN' : 'Verify Identity'}
              </Text>
              
              <TextInput
                style={[styles.modalInput, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background, letterSpacing: currentPinInput ? 10 : 0 }]}
                placeholder="Enter Current PIN"
                placeholderTextColor={theme.textTertiary}
                secureTextEntry
                keyboardType="number-pad"
                maxLength={4}
                value={currentPinInput}
                onChangeText={setCurrentPinInput}
              />
              
              {modalMode === 'change' && (
                <>
                  <TextInput
                    style={[styles.modalInput, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background, letterSpacing: newPinInput ? 10 : 0 }]}
                    placeholder="New 4-Digit PIN"
                    placeholderTextColor={theme.textTertiary}
                    secureTextEntry
                    keyboardType="number-pad"
                    maxLength={4}
                    value={newPinInput}
                    onChangeText={setNewPinInput}
                  />
                  <TextInput
                    style={[styles.modalInput, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background, letterSpacing: confirmPinInput ? 10 : 0 }]}
                    placeholder="Confirm New PIN"
                    placeholderTextColor={theme.textTertiary}
                    secureTextEntry
                    keyboardType="number-pad"
                    maxLength={4}
                    value={confirmPinInput}
                    onChangeText={setConfirmPinInput}
                  />
                </>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelLink} onPress={closePinModal}>
                  <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
                <Button 
                    title={modalMode === 'change' ? "Update" : "Verify & Deactivate"} 
                    onPress={handleModalSubmit} 
                    style={{ flex: 1, marginLeft: 20 }} 
                />
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, marginLeft: 4 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', paddingHorizontal: 16, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 20, marginRight: 16 },
  rowText: { fontSize: 16, fontWeight: '600' },
  chevron: { fontSize: 20, fontWeight: '300' },
  divider: { height: 1, width: '100%', opacity: 0.5 },
  dangerDesc: { fontSize: 13, lineHeight: 18, marginVertical: 12, textAlign: 'center' },
  deleteBtn: { marginBottom: 12, borderRadius: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 24, padding: 24, borderWidth: 1, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 15, marginBottom: 15, fontSize: 16, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  cancelLink: { paddingHorizontal: 10 }
});

export default SettingsScreen;