import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useStore } from '../store/useStore';
import authService from '../services/auth.service';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);

  const {
    setUser,
    setIsAuthenticated,
    setUnlocked,
  } = useStore();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (fbUser) => {
      setLoading(true);

      // ---------- NOT LOGGED IN ----------
      if (!fbUser) {
        setIsAuthenticated(false);
        setUser(null);
        setUnlocked(false);
        setLoading(false);
        return;
      }

      const uid = fbUser.uid;

      try {
        const doc = await firestore()
          .collection('users')
          .doc(uid)
          .get();

        // 🔴 IMPORTANT: DO NOT RESET if user not created yet
        if (!doc.exists) {
          setLoading(false);
          return;
        }

        const userData = doc.data();

        setUser({
          _id: uid,
          ...(userData as any),
        });

        setIsAuthenticated(true);

        // 🔒 LOCK APP ON START
        const hasPin = await authService.getSavedPin();
        if (hasPin) {
          setUnlocked(false);
        } else {
          setUnlocked(true);
        }
      } catch (e) {
        console.log('Auth error:', e);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { loading };
};