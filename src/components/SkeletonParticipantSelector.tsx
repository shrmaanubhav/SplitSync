import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonParticipantSelectorProps {
  participants?: number;
  style?: any;
}

const SkeletonParticipantSelector: React.FC<
  SkeletonParticipantSelectorProps
> = ({ participants = 3, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <SkeletonLoader height={16} width="30%" />
        <SkeletonLoader height={14} width="40%" />
      </View>

      {Array.from({ length: participants }).map((_, index) => (
        <View key={index} style={styles.participantRow}>
          <SkeletonLoader height={50} style={styles.nameInput} />
          <SkeletonLoader height={50} width="30%" style={styles.amountInput} />
          <SkeletonLoader
            width={40}
            height={40}
            borderRadius={20}
            style={styles.removeButton}
          />
        </View>
      ))}

      <SkeletonLoader height={50} borderRadius={8} style={styles.addButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  nameInput: {
    flex: 2,
    marginRight: 10,
    borderRadius: 8,
  },
  amountInput: {
    marginRight: 10,
    borderRadius: 8,
  },
  removeButton: {
    // Remove button styling
  },
  addButton: {
    // Add button styling
  },
});

export default SkeletonParticipantSelector;
