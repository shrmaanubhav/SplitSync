import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  backgroundColor?: string;
  height?: number;
  label?: string;
  style?: any;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = '#007AFF',
  backgroundColor = '#E5E5EA',
  height = 10,
  label,
  style,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.background, { backgroundColor, height }]}>
        <View
          style={[
            styles.progress,
            {
              backgroundColor: color,
              width: `${clampedProgress * 100}%`,
              height,
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {Math.round(clampedProgress * 100)}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  background: {
    borderRadius: 5,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'right',
  },
});

export default ProgressBar;
