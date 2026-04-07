import 'react-native-gesture-handler';
import React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

// Screens
import LoginScreen from './src/screens/Login';
import DashboardScreen from './src/screens/Dashboard';
import GroupsScreen from './src/screens/Group';
import GroupDetailScreen from './src/screens/GroupDetails';
import BalancesScreen from './src/screens/Balance';
import ProfileScreen from './src/screens/Profile';
import EditProfileScreen from './src/screens/EditProfile';
import SettingsScreen from './src/screens/Settings';
import AddExpenseScreen from './src/screens/AddExpense';
import CreateGroupScreen from './src/screens/CreateGroup';
import FriendsScreen from './src/screens/Friends';
import SelectPeopleScreen from './src/screens/SelectPeople';
import SettleScreen from './src/screens/SettleUp';

// Components / services
import { useStore } from './src/store/useStore';
import { useAuth } from './src/hooks/useAuth';
import { getThemeColors } from './src/services/theme.service';
import FloatingTabBar from './src/components/FloatingTabBar';
import ThemeProvider from './src/components/ThemeProvider';
import { SelectionProvider } from './src/contexts/SelectionContext';

// types
export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Settings: undefined;
  Friends: undefined;
  EditProfile: undefined;
  CreateGroup: undefined;

  GroupDetail: { groupId: string };
  AddExpense: { groupId: string };
  SelectPeople: any;

  SettleScreen: {
    groupId: string;
    payList: any[];
    receiveList: any[];
  };

  BalancesScreen: {
    groupId: string;
    balances: any;
  };
};

type TabParamList = {
  Dashboard: undefined;
  Groups: undefined;
  Balances: undefined;
  Profile: undefined;
};

// navigation
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// tabs
function MainTabs() {
  const { darkMode } = useStore();
  const colors = getThemeColors(darkMode);

  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.textPrimary,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Balances" component={BalancesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// app
export default function App() {
  const { isAuthenticated, user, isUnlocked, darkMode } = useStore();
  const { loading } = useAuth();

  const themeColors = getThemeColors(darkMode);

  const CustomLightTheme: Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: themeColors.background,
      card: themeColors.cardBackground,
      text: themeColors.textPrimary,
      border: themeColors.border,
      primary: themeColors.primary,
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: themeColors.background,
      card: themeColors.cardBackground,
      text: themeColors.textPrimary,
      border: themeColors.border,
      primary: themeColors.primary,
    },
  };

  const theme = darkMode ? CustomDarkTheme : CustomLightTheme;

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <SelectionProvider>
      <ThemeProvider>
        <NavigationContainer theme={theme}>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: themeColors.headerBackground },
              headerTintColor: themeColors.textPrimary,
              contentStyle: { backgroundColor: themeColors.background },
            }}
          >
            {/* 🛡️ THE FIX: Strictly require name and phoneNumber to access the app */}
            {isAuthenticated && user?.name && user?.phoneNumber && isUnlocked ? (
              <>
                <Stack.Screen
                  name="Main"
                  component={MainTabs}
                  options={{ headerShown: false }}
                />
                {/* ... rest of your main stack screens ... */}

                <Stack.Screen
                  name="GroupDetail"
                  component={GroupDetailScreen}
                  options={{ title: 'Group Details' }}
                />

                <Stack.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{ title: 'Settings' }}
                />

                <Stack.Screen
                  name="Friends"
                  component={FriendsScreen}
                  options={{ title: 'Friends' }}
                />

                <Stack.Screen
                  name="EditProfile"
                  component={EditProfileScreen}
                  options={{ title: 'Edit Profile' }}
                />

                <Stack.Screen
                  name="AddExpense"
                  component={AddExpenseScreen}
                  options={{ title: 'Add Expense' }}
                />

                <Stack.Screen
                  name="CreateGroup"
                  component={CreateGroupScreen}
                  options={{ title: 'Create Group' }}
                />

                <Stack.Screen
                  name="SelectPeople"
                  component={SelectPeopleScreen}
                  options={{ title: 'Select People', headerShown: false }}
                />

                <Stack.Screen
                  name="SettleScreen"
                  component={SettleScreen}
                  options={{ title: 'Settle Up' }}
                />

                <Stack.Screen
                  name="BalancesScreen"
                  component={BalancesScreen}
                  options={{ title: 'Balances' }}
                />
              </>
            ) : (
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SelectionProvider>
  );
}

// styles
const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});