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
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);

  const theme = getCurrentTheme();
  const { setUser, setUnlocked, user } = useStore();

  // ---------- SESSION CHECK ----------
  useEffect(() => {
    const checkSession = async () => {
      try {
        const fbUser = authService.getCurrentUser();
        const savedPin = await authService.getSavedPin();
        
        if (fbUser) {
          const doc = await firestore().collection('users').doc(fbUser.uid).get();
          if (doc.exists()) {
            setUser(doc.data() as any);
            if (savedPin) {
              setStep('pin');
            } else {
              setStep('setup');
            }
          } else {
            setStep('setup');
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setInitialChecking(false);
      }
    };
    checkSession();
  }, []);

  // ---------- AUTH LOGIC ----------
  const handleSendOTP = async () => {
    if (phone.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number.');
      return;
    }
    try {
      setLoading(true);
      await authService.sendOTP(phone);
      setOtpSent(true);
    } catch (e: any) {
      Alert.alert('Error', 'Unable to send OTP. Please check your network connection.');
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
      if (doc.exists()) {
        setUser(doc.data() as any);
        setStep('pin');
      } else {
        setStep('setup');
      }
    } catch (e: any) {
      Alert.alert('Verification Failed', 'The code entered is incorrect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- SECURITY LOGIC ----------
  const handlePinUnlock = async () => {
    const savedPin = await authService.getSavedPin();
    if (pin === savedPin) {
      setUnlocked(true);
    } else {
      setPin('');
      Alert.alert('Incorrect PIN', 'The PIN entered does not match your security records.');
    }
  };

  const handleSetup = async () => {
    try {
      if (!name.trim() || pin.length < 4) {
        throw new Error('Please provide your full name and a 4-digit security PIN.');
      }
      
      setLoading(true);
      const fbUser = authService.getCurrentUser();
      const uid = fbUser?.uid;
      const phoneNumber = fbUser?.phoneNumber;

      if (!uid) throw new Error('Session expired. Please restart the process.');

      await authService.savePin(pin);

      const newUser = {
        _id: uid,
        name: name.trim(),
        phoneNumber: phoneNumber || '', 
        currency: 'INR',
        friends: [],
        createdAt: Date.now(),
      };

      await firestore().collection('users').doc(uid).set(newUser);
      setUser(newUser as any);
      setUnlocked(true);
    } catch (e: any) {
      Alert.alert('Setup Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialChecking) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          {/* VISUAL ELEMENT */}
          <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
            <Text style={styles.emoji}>
              {step === 'auth' ? '🪙' : step === 'pin' ? '🛡️' : '👤'}
            </Text>
          </View>
          
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {step === 'pin' ? `Welcome back, ${user?.name?.split(' ')[0] || 'User'}` : 
             step === 'setup' ? 'Create Account' : 'Welcome to SplitSync'}
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {step === 'pin' ? 'Enter your security PIN to access your vault.' : 
             step === 'setup' ? 'Complete your profile details to get started.' : 
             'Expense splitting, synchronized.'}
          </Text>
        </View>

        <View style={styles.form}>
          {step === 'auth' && (
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="Phone Number"
                placeholderTextColor={theme.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
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
                title={otpSent ? "Verify Code" : "Continue"}
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
              <TouchableOpacity 
                style={styles.forgotBtn} 
                onPress={() => {
                  setOtpSent(false);
                  setStep('auth');
                }}
              >
                <Text style={{ color: theme.primary, fontWeight: '700' }}>Forgot PIN or Change User?</Text>
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
              <TextInput
                style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="Create Security PIN"
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { 
    flexGrow: 1, 
    padding: 30, 
    justifyContent: 'center' 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: { 
    fontSize: 48, 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '900', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    textAlign: 'center', 
    lineHeight: 22, 
    paddingHorizontal: 20,
    fontWeight: '500'
  },
  form: { 
    width: '100%' 
  },
  inputWrapper: { 
    gap: 16 
  },
  input: {
    height: 60,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
  },
  pinInput: {
    height: 75,
    borderRadius: 20,
    textAlign: 'center',
    fontSize: 36,
    fontWeight: 'bold',
    borderWidth: 1,
    letterSpacing: 15,
  },
  forgotBtn: { 
    alignSelf: 'center', 
    marginTop: 20 
  },
});

export default LoginScreen;