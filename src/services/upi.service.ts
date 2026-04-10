import { Linking, Alert, Platform } from 'react-native';

interface UPIParams {
  upiId: string;      // The receiver's UPI ID (pa)
  name: string;       // The receiver's Name (pn)
  amount: number;     // The amount to pay (am)
  note?: string;      // Transaction note (tn)
}

export const upiService = {
  
  async initiatePayment({ upiId, name, amount, note = 'SplitSync Settlement' }: UPIParams) {
    // 1. Format the data to be URL-safe
    const encodedName = encodeURIComponent(name);
    const encodedNote = encodeURIComponent(note);
    // Force amount to 2 decimal places as required by the UPI standard
    const formattedAmount = amount.toFixed(2); 

    // 2. Construct the official UPI URI Scheme
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${formattedAmount}&cu=INR&tn=${encodedNote}`;

    try {
      if (Platform.OS === 'android') {
        // 3. Ask Android if there is ANY app installed that can handle 'upi://'
        const canOpen = await Linking.canOpenURL(upiUrl);

        if (canOpen) {
          // This tells Android to fire the Intent. 
          // A bottom sheet will appear with GPay, PhonePe, Paytm, etc.
          await Linking.openURL(upiUrl);
        } else {
          Alert.alert(
            'No UPI App Found', 
            'We could not find a UPI app like Google Pay or PhonePe on your device.'
          );
        }
      } else {
        // iOS fallback (if you ever port to iOS, some apps still intercept this scheme)
        await Linking.openURL(upiUrl);
      }
    } catch (error) {
      console.error('UPI Launch Error:', error);
      Alert.alert('Error', 'Something went wrong while trying to open the payment app.');
    }
  }
};