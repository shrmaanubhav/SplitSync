import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator as RNActivityIndicator,
} from 'react-native';

interface ActivityIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  style?: any;
}

const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
  size = 'large',
  color = '#007AFF',
  message,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <RNActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default ActivityIndicator;
