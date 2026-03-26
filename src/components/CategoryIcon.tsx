// Category Icon Component

import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ExpenseCategory } from '../data/categories';
import { getCurrentTheme } from '../services/theme.service';

interface CategoryIconProps {
  category: ExpenseCategory;
  size?: number;
  onPress?: () => void;
  style?: any;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 40,
  onPress,
  style,
}) => {
  const theme = getCurrentTheme();

  // Map category icons to more relevant MaterialCommunityIcons names
  const iconMap: Record<string, string> = {
    food: 'food-fork-drink', // More specific food icon
    transport: 'car', // Good for transportation
    shopping: 'cart', // Shopping cart
    entertainment: 'movie', // Movie for entertainment
    utilities: 'lightning-bolt', // Electricity/bills
    travel: 'airplane', // Travel icon
    health: 'heart-plus', // Health/medical
    education: 'school', // Education
    gifts: 'gift', // Gifts
    home: 'home', // Home expenses
    personal: 'account', // Personal care
    other: 'dots-horizontal', // Other/miscellaneous
  };

  const iconName = iconMap[category.id] || 'help-circle';

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: category.color + '20',
          borderColor: category.color,
        },
        style,
      ]}
      onTouchEnd={onPress}
    >
      <MaterialCommunityIcons
        name={iconName as any}
        size={size * 0.6}
        color={category.color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoryIcon;
