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

type Step = 'phone' | 'otp' | 'pin' | 'setup';

const LoginScreen = () => {
  const [step, setStep] = useState<Step>('phone');

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);

  const theme = getCurrentTheme();
  const { setUser } = useStore();

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

  // ---------- MAIN FLOW ----------
  const handleAction = async () => {
    setLoading(true);

    try {
      // PHONE
      if (step === 'phone') {
        if (!phone) throw new Error('Enter phone number');

        await authService.sendOTP(phone);
        setStep('otp');
      }

      // OTP
      else if (step === 'otp') {
        const fbUser = await authService.verifyOTP(otp);

        const uid = fbUser?.uid;
        const phoneNumber = fbUser?.phoneNumber;

        if (!uid || !phoneNumber) throw new Error('Auth failed');

        const userDoc = await firestore()
          .collection('users')
          .doc(uid)
          .get();

        if (userDoc.exists()) {
          setStep('pin');
        } else {
          setStep('setup');
        }
      }

      // PIN
      else if (step === 'pin') {
        const savedPin = await authService.getSavedPin();

        if (pin === savedPin) {
          // useAuth handles navigation
        } else {
          Alert.alert('Error', 'Incorrect PIN');
        }
      }

      // SETUP (NEW USER)
      else if (step === 'setup') {
        if (!name || pin.length < 4) {
          throw new Error('Enter valid name and 4-digit PIN');
        }

        const fbUser = authService.getCurrentUser();
        const uid = fbUser?.uid;
        const phoneNumber = fbUser?.phoneNumber;

        if (!uid || !phoneNumber) throw new Error('Auth failed');

        await authService.savePin(pin);

        // ✅ CREATE FIRESTORE USER
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
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
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
        {step === 'phone' && (
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.cardBackground, color: theme.textPrimary },
            ]}
            placeholder="Enter phone number"  
            placeholderTextColor="#363232"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        )}

        {step === 'otp' && (
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.cardBackground, color: theme.textPrimary },
            ]}
            placeholder="Enter OTP"
            placeholderTextColor="#363232"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
        )}

        {step === 'pin' && (
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
            placeholderTextColor="#363232"
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
        )}

        {step === 'setup' && (
          <>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.cardBackground, color: theme.textPrimary },
              ]}
              placeholder="Enter your name"
              placeholderTextColor="#363232"
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
              placeholderTextColor="#363232"
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
          </>
        )}

        <Button title="Continue" onPress={handleAction} loading={loading} />
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