import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getCurrentTheme } from '../services/theme.service';

interface CardProps {
  children: React.ReactNode;
  style?: any;
}

const Card: React.FC<CardProps> = ({ children, style }) => {
  const theme = getCurrentTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          shadowColor: theme.shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default Card;
