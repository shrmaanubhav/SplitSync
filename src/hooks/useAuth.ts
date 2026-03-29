import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { useStore } from '../store/useStore';
import userService from '../services/user.service';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const { setUser, setIsAuthenticated } = useStore();

  useEffect(() => {
    const unsub = auth().onAuthStateChanged(async (fbUser) => {
      setLoading(true);

      if (!fbUser) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      const phone = fbUser.phoneNumber;
      if (!phone) {
        setUser(null);
        setLoading(false);
        return;
      }

      const user = await userService.getUserByPhone(phone);

      // prevent loop
      const current = useStore.getState().user;
      if (!current || current._id !== user?._id) {
        setUser(user);
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  return { loading };
};