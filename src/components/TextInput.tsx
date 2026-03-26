import React from 'react';
import { TextInput as RNTextInput, StyleSheet, View, Text } from 'react-native';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';

interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: any;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
}) => {
  const { darkMode } = useStore();
  const theme = getCurrentTheme();

  const containerStyle = [styles.container];

  const inputStyle = [
    styles.input,
    {
      borderColor: theme.border,
      backgroundColor: theme.cardBackground,
      color: theme.textPrimary,
    },
    error ? { borderColor: theme.danger } : null,
  ];

  const labelStyle = [styles.label, { color: theme.textSecondary }];

  const helperStyle = [styles.errorText, { color: theme.danger }];

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={labelStyle as any}>{label}</Text>}
      <RNTextInput
        style={inputStyle as any}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {error && <Text style={helperStyle as any}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  errorText: {
    fontSize: 14,
    marginTop: 6,
  },
});

export default TextInput;
