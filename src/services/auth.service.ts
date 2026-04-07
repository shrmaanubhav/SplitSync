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
    try {
      await auth().signOut();
      // Ensure local security is wiped completely on standard logout
      await Keychain.resetGenericPassword();
      await AsyncStorage.removeItem('onboardingComplete');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // ---------- PIN ----------

  async savePin(pin: string) {
    // If an empty string is explicitly passed, wipe the PIN 
    if (!pin) {
      await Keychain.resetGenericPassword();
      await AsyncStorage.removeItem('onboardingComplete');
      return;
    }

    // Strict Guard: Prevent saving short or empty PINs during setup
    if (pin.length < 4) {
      throw new Error('A 4-digit PIN is strictly required for security.');
    }

    await Keychain.setGenericPassword('app_pin', pin);
    await AsyncStorage.setItem('onboardingComplete', 'true');
  },

  async getSavedPin() {
    try {
      const creds = await Keychain.getGenericPassword();
      return creds ? creds.password : null;
    } catch (error) {
      console.error('Keychain fetch error:', error);
      return null;
    }
  },

  async hasOnboarded() {
    try {
      const val = await AsyncStorage.getItem('onboardingComplete');
      return val === 'true';
    } catch {
      return false;
    }
  },
};

export default authService;