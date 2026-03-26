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
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LoginScreen from './src/screens/Login';
import RegisterScreen from './src/screens/Register';
import DashboardScreen from './src/screens/Dashboard';
import GroupsScreen from './src/screens/Group';
import GroupDetailScreen from './src/screens/GroupDetails';
import ExpensesScreen from './src/screens/Expenses';
import BalancesScreen from './src/screens/Balance';
import ProfileScreen from './src/screens/Profile';
import EditProfileScreen from './src/screens/EditProfile';
import SettingsScreen from './src/screens/Settings';
import AddExpenseScreen from './src/screens/AddExpense';
import CreateGroupScreen from './src/screens/CreateGroup';
import FriendsScreen from './src/screens/Friends';
import SelectPeopleScreen from './src/screens/SelectPeople';
import CategorySelectorScreen from './src/screens/CategorySelector';

// Components / services
import { useStore } from './src/store/useStore';
import { getThemeColors } from './src/services/theme.service';
import FloatingTabBar from './src/components/FloatingTabBar';
import ThemeProvider from './src/components/ThemeProvider';
import { SelectionProvider } from './src/contexts/SelectionContext';

// TYPE IMPORT
import { ExpenseCategory } from './src/data/categories';

// ==============================
// ROOT STACK TYPES (FIXED)
// ==============================
export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Settings: undefined;
  Friends: undefined;
  EditProfile: undefined;
  CreateGroup: undefined;

  GroupDetail: any;
  AddExpense: any;
  SelectPeople: any;

  CategorySelector: {
    onSelectCategory: (category: ExpenseCategory) => void;
    selectedCategory?: ExpenseCategory;
  };
};

// ==============================
// TAB TYPES (ADDED)
// ==============================
type TabParamList = {
  Dashboard: undefined;
  Groups: undefined;
  Expenses: undefined;
  Balances: undefined;
  Profile: undefined;
};

// ==============================
// NAVIGATORS
// ==============================
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ==============================
// TABS
// ==============================
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
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Balances" component={BalancesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ==============================
// APP
// ==============================
export default function App() {
  const { isAuthenticated, setIsAuthenticated, darkMode } = useStore();
  const themeColors = getThemeColors(darkMode);

  React.useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuthStatus();
  }, [setIsAuthenticated]);

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
            {isAuthenticated ? (
              <>
                <Stack.Screen
                  name="Main"
                  component={MainTabs}
                  options={{ headerShown: false }}
                />

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
                  name="CategorySelector"
                  component={CategorySelectorScreen}
                  options={{ title: 'Select Category' }}
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
              </>
            ) : (
              <>
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Register"
                  component={RegisterScreen}
                  options={{ headerShown: false }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SelectionProvider>
  );
}

// ==============================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});