import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '../components/Button';
import { useStore } from '../store/useStore';
import Screen from '../components/Screen';
import Avatar from '../components/Avatar';
import { getCurrentTheme } from '../services/theme.service';
import authService from '../services/auth.service';

type RootStackParamList = {
  Login: undefined;
  Settings: undefined;
  Friends: undefined;
  EditProfile: undefined;
};

type ProfileScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useStore();

  const handleLogout = async () => {
    try {
      // 🔴 IMPORTANT: logout from Firebase
      await authService.logout();

      // 🔴 Clear app state
      logout();

      // 🔴 Reset navigation stack (no back navigation)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const theme = getCurrentTheme();

  return (
    <Screen>
      <View style={styles.profileHeader}>
        <TouchableOpacity
          style={[
            styles.profileInfoContainer,
            {
              backgroundColor: theme.cardBackground,
              shadowColor: theme.shadow,
              elevation: theme.elevation,
            },
          ]}
          onPress={() => navigation.navigate('EditProfile' as any)}
        >
          <Avatar
            name={user?.name}
            size="large"
            variant="circular"
            editable={true}
          />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>
              {user?.name || 'User'}
            </Text>

            <Text style={[styles.userPhone, { color: theme.textSecondary }]}>
              {user?.phoneNumber || 'No phone number'}
            </Text>

            {user?.bio && (
              <Text style={[styles.userBio, { color: theme.textSecondary }]}>
                {user.bio}
              </Text>
            )}

            {user?.createdAt && (
              <Text style={[styles.joinedDate, { color: theme.textSecondary }]}>
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.cardBackground }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={[styles.menuText, { color: theme.textPrimary }]}>
            Settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.cardBackground }]}
          onPress={() => navigation.navigate('Friends')}
        >
          <Text style={[styles.menuText, { color: theme.textPrimary }]}>
            Friends
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
  },
  userPhone: {
    fontSize: 15,
  },
  userBio: {
    fontSize: 14,
    marginTop: 8,
  },
  joinedDate: {
    fontSize: 13,
    marginTop: 8,
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
  },
  menuText: {
    fontSize: 17,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  logoutButton: {
    paddingVertical: 15,
    borderRadius: 12,
  },
});

export default ProfileScreen;