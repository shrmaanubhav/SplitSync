import { useEffect, useState, useRef } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useStore } from '../store/useStore';
import authService from '../services/auth.service';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  
  // 🛡️ Track if this is a fresh app launch vs a background token refresh
  const isInitialMount = useRef(true); 

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = authService.onAuthStateChanged(async (fbUser) => {
      if (!isMounted) return;

      // ---------- NOT LOGGED IN ----------
      if (!fbUser) {
        useStore.getState().setIsAuthenticated(false);
        useStore.getState().setUser(null);
        useStore.getState().setUnlocked(false);
        setLoading(false);
        return;
      }

      const uid = fbUser.uid;

      try {
        const doc = await firestore().collection('users').doc(uid).get();

        if (!doc.exists) {
          setLoading(false);
          return;
        }

        const userData = doc.data();

        // 🛡️ GUARD 1: Ignore Soft-Deleted or Incomplete Users
        if (!userData?.phoneNumber || !userData?.name || userData?.status === 'deleted') {
          setLoading(false);
          return;
        }

        // Valid user found, sync the latest data from cloud
        useStore.getState().setUser({
          _id: uid,
          ...(userData as any),
        });
        useStore.getState().setIsAuthenticated(true);

        // 🛡️ GUARD 2: THE PERSISTENCE TRAP FIX
        // Zustand remembers that 'isUnlocked' was true from your last session.
        // We MUST force it to false on the first boot so the PIN screen appears.
        if (isInitialMount.current) {
           // Fresh app launch: ALWAYS lock the app.
           useStore.getState().setUnlocked(false);
           isInitialMount.current = false;
        }

      } catch (e) {
        console.log('Auth error:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { loading };
};