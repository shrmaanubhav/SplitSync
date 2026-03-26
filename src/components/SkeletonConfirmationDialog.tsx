import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonConfirmationDialogProps {
  style?: any;
}

const SkeletonConfirmationDialog: React.FC<SkeletonConfirmationDialogProps> = ({
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader height={18} width="40%" style={styles.title} />
      <SkeletonLoader height={16} width="80%" style={styles.message} />
      <View style={styles.buttonContainer}>
        <SkeletonLoader height={40} width="40%" style={styles.button} />
        <SkeletonLoader height={40} width="40%" style={styles.button} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    borderRadius: 8,
  },
});

export default SkeletonConfirmationDialog;
