import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Button from '../components/Button';
import { getCurrentTheme } from '../services/theme.service';
import authService from '../services/auth.service';
import firestore from '@react-native-firebase/firestore';
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

  const theme = getCurrentTheme();
  const { setUser, setUnlocked } = useStore();

  // ---------- CHECK EXISTING SESSION ----------
  useEffect(() => {
    const check = async () => {
      const fbUser = authService.getCurrentUser();
      const savedPin = await authService.getSavedPin();

      if (fbUser && savedPin) {
        setStep('pin');
      }
    };

    check();
  }, []);

  // ---------- SEND OTP ----------
  const handleSendOTP = async () => {
    if (!phone) {
      Alert.alert('Error', 'Enter phone number');
      return;
    }

    try {
      setLoading(true);
      await authService.sendOTP(phone);
      setOtpSent(true);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- VERIFY OTP ----------
  const handleVerifyOTP = async () => {
    try {
      setLoading(true);

      const fbUser = await authService.verifyOTP(otp);
      const uid = fbUser?.uid;
      const phoneNumber = fbUser?.phoneNumber;

      if (!uid || !phoneNumber) throw new Error('Auth failed');

      const doc = await firestore()
        .collection('users')
        .doc(uid)
        .get();

      if (doc.exists()) {
        setStep('pin');
      } else {
        setStep('setup');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- PIN ----------
  const handlePin = async () => {
    const savedPin = await authService.getSavedPin();

    if (pin === savedPin) {
      setUnlocked(true);
    } else {
      Alert.alert('Error', 'Incorrect PIN');
    }
  };

  // ---------- SETUP ----------
  const handleSetup = async () => {
    try {
      if (!name || pin.length < 4) {
        throw new Error('Enter valid name and PIN');
      }

      const fbUser = authService.getCurrentUser();
      const uid = fbUser?.uid;
      const phoneNumber = fbUser?.phoneNumber;

      if (!uid || !phoneNumber) throw new Error('Auth failed');

      await authService.savePin(pin);

      const newUser = {
        _id: uid,
        name,
        phoneNumber,
        currency: 'INR',
        friends: [],
        createdAt: Date.now(),
      };

      await firestore().collection('users').doc(uid).set(newUser);

      setUser(newUser);
      setUnlocked(true);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // ---------- UI ----------
  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        {step === 'pin'
          ? 'Unlock App'
          : step === 'setup'
          ? 'Complete Setup'
          : 'Welcome'}
      </Text>

      <View style={styles.form}>
        {/* ---------- AUTH (PHONE + OTP SAME SCREEN) ---------- */}
        {step === 'auth' && (
          <>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.cardBackground, color: theme.textPrimary },
              ]}
              placeholder="Enter phone number"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            {!otpSent ? (
              <Button
                title="Send OTP"
                onPress={handleSendOTP}
                loading={loading}
              />
            ) : (
              <>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.cardBackground, color: theme.textPrimary },
                  ]}
                  placeholder="Enter OTP"
                  placeholderTextColor="#999"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />

                <Button
                  title="Verify OTP"
                  onPress={handleVerifyOTP}
                  loading={loading}
                />
              </>
            )}
          </>
        )}

        {/* ---------- PIN ---------- */}
        {step === 'pin' && (
          <>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  textAlign: 'center',
                  fontSize: 28,
                },
              ]}
              placeholder="Enter PIN"
              placeholderTextColor="#999"
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />

            <Button title="Unlock" onPress={handlePin} />
          </>
        )}

        {/* ---------- SETUP ---------- */}
        {step === 'setup' && (
          <>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.cardBackground, color: theme.textPrimary },
              ]}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  textAlign: 'center',
                },
              ]}
              placeholder="Create PIN"
              placeholderTextColor="#999"
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />

            <Button title="Finish" onPress={handleSetup} />
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: { width: '100%' },
  input: {
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default LoginScreen;