import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { register, loading, error } = useAuth();
  const { darkMode } = useStore();
  const theme = getCurrentTheme();

  const handleRegister = async () => {
    if (!name || !phoneNumber || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await register({ name, phoneNumber, password });
    } catch (err) {
      Alert.alert(
        'Registration Failed',
        error || 'An error occurred during registration'
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Create Account
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Sign up to get started
      </Text>

      <View style={styles.form}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Full Name
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          placeholderTextColor={theme.textTertiary}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Phone Number
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"
          placeholderTextColor={theme.textTertiary}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Password
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          placeholderTextColor={theme.textTertiary}
          secureTextEntry
        />

        <Button
          title="Sign Up"
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
        />

        <Button
          title="Already have an account? Sign In"
          onPress={() => navigation.navigate('Login' as never)}
          variant="secondary"
          style={styles.linkButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
  linkButton: {
    marginTop: 20,
  },
});

export default RegisterScreen;