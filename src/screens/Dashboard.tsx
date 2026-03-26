import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { formatCurrency } from '../utils/format';

// ---- Types ----
type Balance = {
  overallBalance: number;
};

type Analytics = {
  totalExpenses: number;
  categorySpending: Record<string, number>;
};

type User = {
  name: string;
};

// ---- Screen ----
const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // TEMP DATA (replace with hooks later)
  const user: User = { name: 'User' };

  const balances: Balance = {
    overallBalance: 1200,
  };

  const analytics: Analytics = {
    totalExpenses: 5400,
    categorySpending: {
      Food: 2000,
      Travel: 1500,
    },
  };

  const theme = {
    textPrimary: '#000',
    textSecondary: '#666',
    textTertiary: '#999',
    cardBackground: '#fff',
    shadow: '#000',
    border: '#eee',
  };

  return (
    <Screen scroll>
      <ScrollView>
        {/* Welcome */}
        <Text style={[styles.welcomeText, { color: theme.textPrimary }]}>
          Welcome, {user.name}!
        </Text>

        {/* Balance Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Your Balance
          </Text>

          <Text
            style={[
              styles.balanceAmount,
              balances.overallBalance >= 0
                ? styles.positive
                : styles.negative,
            ]}
          >
            {formatCurrency(balances.overallBalance)}
          </Text>

          <Text style={{ color: theme.textSecondary }}>
            {balances.overallBalance >= 0
              ? "You're owed this amount"
              : 'You owe this amount'}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Quick Actions
          </Text>

          <View style={styles.buttonRow}>
            <Button
              title="Add Expense"
              onPress={() => navigation.navigate('AddExpense')}
              style={styles.actionButton}
            />
            <Button
              title="Settle Up"
              onPress={() => navigation.navigate('Balances')}
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* Spending Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Spending Overview
          </Text>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Total Expenses
            </Text>

            <Text style={[styles.amount, { color: theme.textPrimary }]}>
              {formatCurrency(analytics.totalExpenses)}
            </Text>

            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Top Categories
            </Text>

            {Object.entries(analytics.categorySpending).length > 0 ? (
              Object.entries(analytics.categorySpending).map(
                ([category, amount]) => (
                  <View
                    key={category}
                    style={[
                      styles.categoryRow,
                      { borderBottomColor: theme.border },
                    ]}
                  >
                    <Text style={{ color: theme.textPrimary }}>
                      {category}
                    </Text>
                    <Text style={{ color: theme.textPrimary }}>
                      {formatCurrency(amount)}
                    </Text>
                  </View>
                )
              )
            ) : (
              <Text
                style={[
                  styles.placeholderText,
                  { color: theme.textTertiary },
                ]}
              >
                No spending data
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

// ---- Styles ----
const styles = StyleSheet.create({
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  positive: {
    color: '#4CD964',
  },
  negative: {
    color: '#FF3B30',
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  placeholderText: {
    textAlign: 'center',
    padding: 20,
  },
});

export default DashboardScreen;