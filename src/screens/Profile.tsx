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

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useStore();
  const theme = getCurrentTheme();

  const handleLogout = async () => {
    try {
      // logout from Firebase
      await authService.logout();

      // Clear app state
      logout();

      // Reset navigation stack (no back navigation)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  let joinedDateString = '';
  if (user?.createdAt) {
    const createdAt = user.createdAt as any;
    const dateObj = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
    
    if (dateObj.toString() !== 'Invalid Date') {
      joinedDateString = dateObj.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long' 
      });
    }
  }

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        
        {/* PROFILE HEADER CARD */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.profileInfoContainer,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
            onPress={() => navigation.navigate('EditProfile' as any)}
          >
            <View style={styles.avatarWrapper}>
              <Avatar
                name={user?.name || ''}
                size={70}
                variant="circular"
              />
            </View>

            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.textPrimary }]} numberOfLines={1}>
                {user?.name || 'User'}
              </Text>

              {/*safe fallback for phone numbers */}
              <Text style={[styles.userPhone, { color: theme.textSecondary }]}>
                {user?.phoneNumber || user?.phoneNumber || 'No phone number'}
              </Text>

              {user?.bio && (
                <Text style={[styles.userBio, { color: theme.textSecondary }]} numberOfLines={2}>
                  {user.bio}
                </Text>
              )}

              {joinedDateString ? (
                <Text style={[styles.joinedDate, { color: theme.textTertiary }]}>
                  Joined {joinedDateString}
                </Text>
              ) : null}
            </View>

            <Text style={[styles.chevron, { color: theme.textTertiary }]}>▸</Text>
          </TouchableOpacity>
        </View>

        {/* MENU OPTIONS */}
        <View style={styles.menuContainer}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Account</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.menuItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.menuIconBox}><Text style={styles.menuIcon}>⚙️</Text></View>
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>Settings</Text>
            <Text style={[styles.chevron, { color: theme.textTertiary }]}>▸</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.menuItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() => navigation.navigate('Friends')}
          >
            <View style={styles.menuIconBox}><Text style={styles.menuIcon}>🤝</Text></View>
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>Friends</Text>
            <Text style={[styles.chevron, { color: theme.textTertiary }]}>▸</Text>
          </TouchableOpacity>
        </View>

        {/* LOGOUT BUTTON */}
        <View style={styles.bottomContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger" 
            style={styles.logoutButton}
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    padding: 20,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarWrapper: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    fontWeight: '500',
  },
  userBio: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  joinedDate: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 40, // Keeps it clear of the floating tab bar
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 16,
  },
});

export default ProfileScreen;