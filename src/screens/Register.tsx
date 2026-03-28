import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { getCurrentTheme } from '../services/theme.service';
import authService from '../services/auth.service';
import { useStore } from '../store/useStore';

const RegisterScreen = () => {
  const [step, setStep] = useState<'info' | 'otp' | 'setup'>('info');
  const [data, setData] = useState({ name: '', phone: '', otp: '', pin: '' });
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation();
  const theme = getCurrentTheme();
  const { setIsAuthenticated } = useStore();

  const handleNext = async () => {
    setLoading(true);
    try {
      if (step === 'info') {
        if (!data.name || !data.phone) throw new Error('Fill all fields');
        await authService.sendOTP(data.phone);
        setStep('otp');
      } else if (step === 'otp') {
        const user = await authService.verifyOTP(data.otp);
        await user?.updateProfile({ displayName: data.name });
        setStep('setup');
      } else if (step === 'setup') {
        if (data.pin.length < 4) throw new Error('PIN must be 4 digits');
        await authService.savePin(data.pin);
        setIsAuthenticated(true); // Login globally after setup
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
        {step === 'setup' ? 'Set Your PIN' : 'Create Account'}
      </Text>
      
      <View style={styles.form}>
        {step === 'info' && (
          <>
            <TextInput
              style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textPrimary }]}
              placeholder="Enter your full name (e.g. Anubhav Sharma)"
              placeholderTextColor="#999"
              onChangeText={(v) => setData({ ...data, name: v })}
            />

            <TextInput
              style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textPrimary }]}
              placeholder="Enter your phone number (e.g. 9876543210)"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              onChangeText={(v) => setData({ ...data, phone: v })}
            />
          </>
        )}

        {step === 'otp' && (
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textPrimary }]}
            placeholder="Enter 6-digit OTP sent to your phone"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={(v) => setData({ ...data, otp: v })}
          />
        )}

        {step === 'setup' && (
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.cardBackground,
              color: theme.textPrimary,
              textAlign: 'center',
              fontSize: 24
            }]}
            placeholder="Create a 4-digit PIN"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            onChangeText={(v) => setData({ ...data, pin: v })}
          />
        )}

        <Button title={step === 'setup' ? "Finish" : "Continue"} onPress={handleNext} loading={loading} />
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

export default RegisterScreen;