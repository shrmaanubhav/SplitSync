import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // adjust path if needed

import { expenseCategories, ExpenseCategory } from '../data/categories';
import CategoryIcon from '../components/CategoryIcon';
import Screen from '../components/Screen';
import { getCurrentTheme } from '../services/theme.service';

// FIXED typing
type Props = NativeStackScreenProps<
  RootStackParamList,
  'CategorySelector'
>;

const CategorySelectorScreen = ({ route, navigation }: Props) => {
  const { onSelectCategory, selectedCategory } = route.params;
  const theme = getCurrentTheme();

  const handleSelectCategory = (category: ExpenseCategory) => {
    onSelectCategory(category);
    navigation.goBack();
  };

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Select Category
        </Text>

        <ScrollView contentContainerStyle={styles.grid}>
          {expenseCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory?.id === category.id && styles.selectedCategory,
                { backgroundColor: theme.cardBackground },
              ]}
              onPress={() => handleSelectCategory(category)}
            >
              <CategoryIcon category={category} size={50} />
              <Text
                style={[
                  styles.categoryName,
                  { color: theme.textPrimary, textAlign: 'center' },
                ]}
                numberOfLines={2}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
});

export default CategorySelectorScreen;