import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) => {
  const { darkMode } = useStore();
  const theme = getCurrentTheme();

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return [
          styles.secondaryButton,
          {
            borderColor: theme.primary,
            backgroundColor: 'transparent',
          },
        ];
      case 'danger':
        return [styles.dangerButton, { backgroundColor: theme.danger }];
      default:
        return [styles.primaryButton, { backgroundColor: theme.primary }];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.secondaryText, { color: theme.primary }];
      case 'danger':
        return [styles.dangerText, { color: '#FFFFFF' }];
      default:
        return [styles.primaryText, { color: '#FFFFFF' }];
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? theme.primary : '#FFFFFF'}
        />
      ) : (
        <Text style={[styles.text, getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    // backgroundColor will be set dynamically
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    // borderColor will be set dynamically
  },
  dangerButton: {
    // backgroundColor will be set dynamically
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    // color will be set dynamically
  },
  secondaryText: {
    // color will be set dynamically
  },
  dangerText: {
    // color will be set dynamically
  },
});

export default Button;
