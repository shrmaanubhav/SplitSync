import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { getCurrentTheme } from '../services/theme.service';
import authService from '../services/auth.service';
import { useStore } from '../store/useStore';

const LoginScreen = () => {
  const [step, setStep] = useState<'phone' | 'otp' | 'pin'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation();
  const theme = getCurrentTheme();
  const { setIsAuthenticated } = useStore();

  useEffect(() => {
    const checkState = async () => {
      const user = authService.getCurrentUser();
      const hasPin = await authService.getSavedPin();
      if (user && hasPin) setStep('pin');
    };
    checkState();
  }, []);

  const handleAction = async () => {
    setLoading(true);
    try {
      if (step === 'phone') {
        await authService.sendOTP(phone);
        setStep('otp');
      } else if (step === 'otp') {
        await authService.verifyOTP(otp);
        const hasPin = await authService.getSavedPin();
        if (hasPin) setStep('pin');
        else navigation.navigate('Register' as never); // Go to setup name/pin
      } else if (step === 'pin') {
        const savedPin = await authService.getSavedPin();
        if (pin === savedPin) {
          setIsAuthenticated(true); // Unlock the app globally
        } else {
          Alert.alert('Error', 'Incorrect PIN');
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        {step === 'pin' ? 'Unlock App' : 'Welcome Back'}
      </Text>
      
      <View style={styles.form}>
        {step === 'phone' && (
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textPrimary }]}
            placeholder="Enter your phone number (e.g. 9876543210)"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        )}

        {step === 'otp' && (
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textPrimary }]}
            placeholder="Enter 6-digit OTP sent to your phone"
            placeholderTextColor="#999"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
        )}

        {step === 'pin' && (
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.cardBackground,
              color: theme.textPrimary,
              textAlign: 'center',
              fontSize: 28
            }]}
            placeholder="Enter your 4-digit PIN"
            placeholderTextColor="#999"
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
        )}

        <Button title="Continue" onPress={handleAction} loading={loading} />
        
        {step === 'phone' && (
          <Button title="New here? Create Account" variant="secondary" onPress={() => navigation.navigate('Register' as never)} />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  form: { width: '100%' },
  input: { height: 55, borderRadius: 12, paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: '#ccc' },
});

export default LoginScreen;