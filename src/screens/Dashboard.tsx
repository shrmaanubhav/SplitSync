import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';
import { getBalances } from '../services/balance.service';
import { formatCurrency } from '../utils/format';
import Screen from '../components/Screen';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useStore();
  const theme = getCurrentTheme();

  const [loading, setLoading] = useState(true);
  const [overallBalance, setOverallBalance] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);

  // Safely grab the correct ID format
  const currentUserId = user?.uid || user?._id;

  const fetchDashboardData = async () => {
    if (!currentUserId) return;

    try {
      // 1. Fetch only the groups this user is a part of
      const groupsSnap = await firestore()
        .collection('groups')
        .where('members', 'array-contains', currentUserId)
        .get();

      let calcOverallBalance = 0;
      let calcTotalSpent = 0;
      let allExpenses: any[] = [];

      // 2. Loop through groups to fetch expenses and calculate totals
      for (const doc of groupsSnap.docs) {
        const groupData = doc.data();
        
        const expSnap = await firestore()
          .collection('groups')
          .doc(doc.id)
          .collection('expenses')
          .get();

        const expenses: any[] = expSnap.docs.map(e => ({
          id: e.id,
          groupId: doc.id,
          groupName: groupData.name,
          ...e.data(),
        }));

        allExpenses = [...allExpenses, ...expenses];

        // Calculate net balance for this group
        const bal = getBalances(groupData.members || [], expenses as any);
        calcOverallBalance += (bal[currentUserId] || 0);

        // Calculate exactly how much the user has spent (their share)
        expenses.forEach(exp => {
          const myParticipantData = (exp.participants || []).find((p: any) => 
            (p.userId && p.userId === currentUserId) || p === currentUserId
          );

          if (myParticipantData) {
            if (typeof myParticipantData === 'object') {
              calcTotalSpent += (myParticipantData.amountOwed || 0);
            } else {
              // Fallback for older string-based expenses
              calcTotalSpent += (exp.amount / exp.participants.length);
            }
          }
        });
      }

      // 3. Sort expenses by date to get the 3 most recent
      allExpenses.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt;
        return dateB - dateA;
      });

      setOverallBalance(calcOverallBalance);
      setTotalSpent(calcTotalSpent);
      setRecentExpenses(allExpenses.slice(0, 3)); // Keep top 3
      
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Run every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [currentUserId])
  );

  return (
    <Screen scroll>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* WELCOME */}
        <Text style={[styles.welcomeText, { color: theme.textPrimary }]}>
          Welcome, {user?.name?.split(' ')[0] || 'User'}!
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* HERO BALANCE CARD (Branded Orange) */}
            <View style={[styles.heroCard, { backgroundColor: theme.primary }]}>
              <Text style={styles.heroTitle}>Overall Balance</Text>
              
              <Text style={styles.heroAmount}>
                {formatCurrency(Math.abs(overallBalance))}
              </Text>

              <Text style={styles.heroSubtitle}>
                {Math.abs(overallBalance) < 0.01
                  ? "You're all settled up 🎉"
                  : overallBalance > 0
                  ? "You are owed this amount"
                  : "You owe this amount"}
              </Text>
            </View>

            {/* QUICK ACTIONS */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Quick Actions
              </Text>

              <View style={styles.buttonRow}>
                {/* Outlined Button for Add Expense */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.actionBtnOutline, { borderColor: theme.primary }]}
                  // 👇 Navigates directly to your fixed CreateGroupScreen
                  onPress={() => navigation.navigate('CreateGroup')} 
                >
                  <Text style={[styles.actionBtnTextOutline, { color: theme.primary }]}>
                    + New Group
                  </Text>
                </TouchableOpacity>

                {/* Solid Button for Settle Up */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.actionBtnSolid, { backgroundColor: theme.primary }]}
                  onPress={() => navigation.navigate('Balances')}
                >
                  <Text style={styles.actionBtnTextSolid}>Settle Up</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SPENDING OVERVIEW */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Spending Overview
              </Text>

              <View style={[styles.overviewCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <View style={styles.totalSpentRow}>
                  <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>
                    Your Total Share
                  </Text>
                  <Text style={[styles.totalAmount, { color: theme.textPrimary }]}>
                    {formatCurrency(totalSpent)}
                  </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <Text style={[styles.cardTitle, { color: theme.textPrimary, marginBottom: 12 }]}>
                  Recent Activity
                </Text>

                {recentExpenses.length > 0 ? (
                  recentExpenses.map((exp) => (
                    <View key={exp.id} style={styles.recentRow}>
                      <View style={styles.recentIcon}>
                        <Text>💸</Text>
                      </View>
                      <View style={styles.recentInfo}>
                        <Text style={[styles.recentDesc, { color: theme.textPrimary }]} numberOfLines={1}>
                          {exp.description || 'Expense'}
                        </Text>
                        <Text style={[styles.recentGroup, { color: theme.textTertiary }]}>
                          {exp.groupName}
                        </Text>
                      </View>
                      <Text style={[styles.recentAmount, { color: theme.textPrimary }]}>
                        {formatCurrency(exp.amount)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.placeholderText, { color: theme.textTertiary }]}>
                    No recent expenses found.
                  </Text>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100, // Room for the floating tab bar
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  
  // Hero Card
  heroCard: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  heroTitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    marginVertical: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },

  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginHorizontal: 20,
    marginBottom: 12,
  },

  // Action Buttons
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    gap: 12,
  },
  actionBtnOutline: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  actionBtnTextOutline: {
    fontWeight: '700',
    fontSize: 15,
  },
  actionBtnSolid: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionBtnTextSolid: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  // Overview Card
  overviewCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
  },
  totalSpentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },

  // Recent Expenses
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentDesc: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  recentGroup: {
    fontSize: 13,
  },
  recentAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  placeholderText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
});

export default DashboardScreen;