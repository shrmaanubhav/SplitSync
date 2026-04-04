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
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';
import authService from '../services/auth.service';

const SettingsScreen = () => {
  const { darkMode, setDarkMode } = useStore();
  const [notifications, setNotifications] = useState(true);
  
  // PIN Change States
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  const theme = getCurrentTheme();

  const handleUpdatePin = async () => {
    const actualSavedPin = await authService.getSavedPin();

    if (currentPinInput !== actualSavedPin) {
      Alert.alert('Security Check', 'Current PIN is incorrect. ❌');
      return;
    }

    if (newPinInput.length < 4) {
      Alert.alert('Invalid PIN', 'Your new PIN must be 4 digits.');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      Alert.alert('Mismatch', 'The new PINs do not match. 🧐');
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
        </View>

        {/* SECURITY SECTION */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 25 }]}>Security</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <TouchableOpacity 
            style={styles.row} 
            activeOpacity={0.7}
            onPress={() => setPinModalVisible(true)}
          >
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
            Deleting your account will remove all personal data and group associations.
          </Text>
          <Button 
            title="Delete My Account" 
            variant="danger" 
            onPress={handleDeleteAccount}
            style={styles.deleteBtn}
          />
        </View>

        {/* PIN CHANGE MODAL */}
        <Modal visible={pinModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Update PIN</Text>
              
              <TextInput
                style={[styles.modalInput, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
                placeholder="Current 4-Digit PIN"
                placeholderTextColor={theme.textTertiary}
                secureTextEntry
                keyboardType="number-pad"
                maxLength={4}
                value={currentPinInput}
                onChangeText={setCurrentPinInput}
              />
              
              <TextInput
                style={[styles.modalInput, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
                placeholder="New 4-Digit PIN"
                placeholderTextColor={theme.textTertiary}
                secureTextEntry
                keyboardType="number-pad"
                maxLength={4}
                value={newPinInput}
                onChangeText={setNewPinInput}
              />

              <TextInput
                style={[styles.modalInput, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
                placeholder="Confirm New PIN"
                placeholderTextColor={theme.textTertiary}
                secureTextEntry
                keyboardType="number-pad"
                maxLength={4}
                value={confirmPinInput}
                onChangeText={setConfirmPinInput}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelLink} onPress={closePinModal}>
                  <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
                <Button title="Update PIN" onPress={handleUpdatePin} style={{ flex: 1, marginLeft: 20 }} />
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
  divider: { height: 1, width: '100%' },
  dangerDesc: { fontSize: 13, lineHeight: 18, marginVertical: 12, textAlign: 'center' },
  deleteBtn: { marginBottom: 12, borderRadius: 12 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 24, padding: 24, borderWidth: 1, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 15, marginBottom: 15, fontSize: 14, textAlign: 'center', letterSpacing: 5 },
  modalButtons: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  cancelLink: { paddingHorizontal: 10 }
});

export default SettingsScreen;