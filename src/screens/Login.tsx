import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

import Button from '../components/Button';
import { getCurrentTheme } from '../services/theme.service';
import authService from '../services/auth.service';
import { useStore } from '../store/useStore';

type Step = 'auth' | 'pin' | 'setup';

const LoginScreen = () => {
  const [step, setStep] = useState<Step>('auth');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);

  const theme = getCurrentTheme();
  const { setUser, setUnlocked, user, logout } = useStore();

  useEffect(() => {
    const initSession = async () => {
      try {
        const fbUser = authService.getCurrentUser();
        const savedPin = await authService.getSavedPin();

        if (fbUser) {
          if (user?.name && user?.phoneNumber) {
            setStep(savedPin ? 'pin' : 'setup');
            setName(user.name);
          } else {
            setStep('setup');
          }
        } else {
          setStep('auth');
        }
      } catch (error) {
        console.error("Init check error:", error);
      } finally {
        setInitialChecking(false);
      }
    };
    initSession();
  }, [user]);

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a 10-digit number.');
      return;
    }
    try {
      setLoading(true);
      await authService.sendOTP(`+91${phone}`);
      setOtpSent(true);
    } catch (e: any) {
      Alert.alert('Error', 'Unable to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      const fbUser = await authService.verifyOTP(otp);
      if (!fbUser) throw new Error('Verification failed');
      
      const doc = await firestore().collection('users').doc(fbUser.uid).get();
      const userData = doc.data();
      const savedPin = await authService.getSavedPin();

      if (doc.exists() && userData?.phoneNumber && userData?.name && userData?.status !== 'deleted') {
        setUser(userData as any);
        setName(userData.name);
        setStep(savedPin ? 'pin' : 'setup'); 
      } else {
        setUser(null);
        setName('');
        setUpiId(''); 
        setStep('setup');
      }
    } catch (e: any) {
      Alert.alert('Verification Failed', 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- PIN UNLOCK ----------
  const handlePinUnlock = async () => {
    const savedPinRaw = await authService.getSavedPin();
    const actualSavedPin = String(savedPinRaw || '').trim();
    const enteredPin = String(pin).trim();

    if (enteredPin === actualSavedPin) {
      setUnlocked(true);
    } else {
      setPin('');
      Alert.alert('Incorrect PIN', 'Please try again.');
    }
  };

  // ---------- SETUP ----------
  const handleSetup = async () => {
    try {
      if (!name.trim() || pin.length < 4) {
        throw new Error('Please provide your full name and a 4-digit security PIN.');
      }
      setLoading(true);
      const fbUser = authService.getCurrentUser();
      const uid = fbUser?.uid;
      
      if (!uid) throw new Error('Session expired.');

      await authService.savePin(pin);

      // Protect Returning Users logging into a new device
      if (user?._id) {
        await firestore().collection('users').doc(uid).update({ name: name.trim() });
        setUser({ ...user, name: name.trim() } as any);
        setUnlocked(true);
        return; 
      }

      // If they are brand new, build the fresh user profile
      const phoneNumber = fbUser?.phoneNumber;
      const cleanUpiId = upiId.trim().toLowerCase();

      const freshUser = {
        _id: uid,
        name: name.trim(),
        phoneNumber: phoneNumber || `+91${phone}`, 
        upiId: cleanUpiId || null, // Save the UPI ID!
        currency: 'INR',
        friends: [],
        createdAt: Date.now(),
        status: 'active'
      };

      await firestore().collection('users').doc(uid).set(freshUser);

      setUser(freshUser as any);
      setUnlocked(true);
      
    } catch (e: any) {
      Alert.alert('Setup Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- RESET FLOW (Forgot PIN or Change User) ----------
  const handleResetFlow = () => {
    logout();
    setOtpSent(false);
    setOtp('');
    setPhone('');
    setStep('auth');
  };

  if (initialChecking) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
            <Text style={styles.emoji}>{step === 'auth' ? '🪙' : step === 'pin' ? '🛡️' : '👤'}</Text>
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {step === 'pin' ? `Welcome back, ${user?.name?.split(' ')[0] || 'User'}` : 
             step === 'setup' ? (user?.name ? 'Secure Your Session' : 'Create Account') : 'Welcome to SplitSync'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {step === 'pin' ? 'Enter your security PIN to unlock.' : 
             step === 'setup' ? (user?.name ? 'Please set a new 4-digit PIN for this device.' : 'Set up your profile and PIN.') : 
             'Expense splitting, synchronized.'}
          </Text>
        </View>

        <View style={styles.form}>
          {step === 'auth' && (
            <View style={styles.inputWrapper}>
              <View style={[styles.phoneInputRow, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={[styles.prefix, { color: theme.textPrimary }]}>+91</Text>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <TextInput
                  style={[styles.flexInput, { color: theme.textPrimary }]}
                  placeholder="Phone Number"
                  placeholderTextColor={theme.textTertiary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              {otpSent && (
                <TextInput
                  style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textPrimary, borderColor: theme.border }]}
                  placeholder="Verification Code"
                  placeholderTextColor={theme.textTertiary}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              )}
              <Button 
                title={otpSent ? "Verify & Continue" : "Continue"} 
                onPress={otpSent ? handleVerifyOTP : handleSendOTP} 
                loading={loading} 
              />
            </View>
          )}

          {step === 'pin' && (
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.pinInput, { backgroundColor: theme.cardBackground, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="••••"
                placeholderTextColor={theme.textTertiary}
                value={pin}
                onChangeText={setPin}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
              <Button title="Unlock App" onPress={handlePinUnlock} />
              <TouchableOpacity style={styles.forgotBtn} onPress={handleResetFlow}>
                <Text style={{ color: theme.primary, fontWeight: '700', textAlign: 'center' }}>Forgot PIN or Change User?</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'setup' && (
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="Full Name"
                placeholderTextColor={theme.textTertiary}
                value={name}
                onChangeText={setName}
              />
              
              {/* UPI ID Input shown only for brand new users */}
              {!user?.name && (
                <View>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textPrimary, borderColor: theme.border, marginBottom: 8 }]}
                    placeholder="UPI ID (Optional, e.g. name@bank)"
                    placeholderTextColor={theme.textTertiary}
                    value={upiId}
                    onChangeText={setUpiId}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={{ color: theme.textSecondary, fontSize: 12, paddingHorizontal: 5, marginBottom: 8 }}>
                    Allows friends to pay you back directly via UPI apps.
                  </Text>
                </View>
              )}

              <TextInput
                style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="Create 4-Digit PIN"
                placeholderTextColor={theme.textTertiary}
                value={pin}
                onChangeText={setPin}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
              <Button title="Complete Setup" onPress={handleSetup} loading={loading} />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flexGrow: 1, padding: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emoji: { fontSize: 48 },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20, fontWeight: '500' },
  form: { width: '100%' },
  inputWrapper: { gap: 16 },
  input: { height: 60, borderRadius: 16, paddingHorizontal: 20, fontSize: 16, borderWidth: 1 },
  phoneInputRow: { height: 60, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  prefix: { fontSize: 16, fontWeight: '700', paddingRight: 10 },
  divider: { width: 1, height: '60%', marginHorizontal: 10 },
  flexInput: { flex: 1, height: '100%', fontSize: 16 },
  pinInput: { height: 75, borderRadius: 20, textAlign: 'center', fontSize: 36, fontWeight: 'bold', borderWidth: 1, letterSpacing: 15 },
  forgotBtn: { alignSelf: 'center', marginTop: 25 },
});

export default LoginScreen;