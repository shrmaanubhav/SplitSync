import React from 'react';
import { View, Text, Button } from 'react-native';
import firestore from '@react-native-firebase/firestore';

export default function App() {

  const testStep1 = () => {
    try {
      const db = firestore();
      console.log("STEP 1 OK");
    } catch (e) {
      console.log("STEP 1 ERROR:", e);
    }
  };

  const testStep2 = () => {
    try {
      const db = firestore();
      db.collection('test');
      console.log("STEP 2 OK");
    } catch (e) {
      console.log("STEP 2 ERROR:", e);
    }
  };

const testStep3 = async () => {
  try {
    // Wait for 1 second (cleaner than setTimeout)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const db = firestore();
    await db.collection('test').add({
      msg: 'hello'
    });
    
    console.log("SUCCESS");
  } catch (e) {
    // This will now actually catch the Firebase error!
    console.error("STEP 3 ERROR CAUGHT:", e);
  }
};

  return (
    <View style={{ marginTop: 50 }}>
      <Text>Debug Firebase</Text>

      <Button title="Test Step 1 (init)" onPress={testStep1} />
      <Button title="Test Step 2 (collection)" onPress={testStep2} />
      <Button title="Test Step 3 (write)" onPress={testStep3} />
    </View>
  );
}