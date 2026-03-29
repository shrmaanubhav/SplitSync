import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

let confirmationResult: FirebaseAuthTypes.ConfirmationResult | null = null;

export const authService = {
  // ---------- PHONE AUTH ----------

  async sendOTP(phoneNumber: string) {
    try {
      const formatted = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+91${phoneNumber.replace(/^0+/, '')}`;

      confirmationResult = await auth().signInWithPhoneNumber(formatted);
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send OTP');
    }
  },

  async verifyOTP(otp: string) {
    try {
      if (!confirmationResult) {
        throw new Error('No OTP request found');
      }

      const credential = await confirmationResult.confirm(otp);

      if (!credential || !credential.user) {
        throw new Error('OTP verification failed');
      }

      return credential.user;
    } catch {
      throw new Error('Invalid OTP');
    }
  },

  // ---------- AUTH STATE ----------

  getCurrentUser() {
    return auth().currentUser;
  },

  onAuthStateChanged(
    callback: (user: FirebaseAuthTypes.User | null) => void
  ) {
    return auth().onAuthStateChanged(callback);
  },

  async logout() {
    await auth().signOut();
  },

  // ---------- PIN ----------

  async savePin(pin: string) {
    await Keychain.setGenericPassword('app_pin', pin);
    await AsyncStorage.setItem('onboardingComplete', 'true');
  },

  async getSavedPin() {
    const creds = await Keychain.getGenericPassword();
    return creds ? creds.password : null;
  },

  async hasOnboarded() {
    const val = await AsyncStorage.getItem('onboardingComplete');
    return val === 'true';
  },
};

export default authService;