import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

let confirmationResult: FirebaseAuthTypes.ConfirmationResult | null = null;

export const authService = {
  // --- Firebase Phone Auth ---
  async sendOTP(phoneNumber: string) {
    try {
      const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      confirmationResult = await auth().signInWithPhoneNumber(formatted);
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send SMS');
    }
  },

  async verifyOTP(otp: string) {
    try {
      if (!confirmationResult) throw new Error('No pending OTP request');
      const credential = await confirmationResult.confirm(otp);
      return credential?.user;
    } catch (error: any) {
      throw new Error('Invalid OTP code');
    }
  },

  // --- Secure PIN Management ---
  async savePin(pin: string) {
    // We store 'app_pin' as the username and the actual digits as the password
    await Keychain.setGenericPassword('app_pin', pin);
    await AsyncStorage.setItem('softOnboardingCompleted', 'true');
  },

  async getSavedPin() {
    const credentials = await Keychain.getGenericPassword();
    return credentials ? credentials.password : null;
  },

  async hasOnboarded() {
    const status = await AsyncStorage.getItem('softOnboardingCompleted');
    return status === 'true';
  },

  async logout() {
    await auth().signOut();
    // We DON'T clear the keychain here so the device remembers the PIN 
    // for the next login, but we clear the onboarding flag if you want a full reset.
  },

  getCurrentUser() {
    return auth().currentUser;
  }
};

export default authService;