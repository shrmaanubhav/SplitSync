import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonAnalyticsChartProps {
  style?: any;
}

const SkeletonAnalyticsChart: React.FC<SkeletonAnalyticsChartProps> = ({
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader height={18} width="40%" style={styles.title} />
      <View style={styles.chart}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} style={styles.barContainer}>
            <SkeletonLoader
              height={20}
              width={`${20 + index * 20}%`}
              style={styles.bar}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
  },
  title: {
    marginBottom: 15,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    borderRadius: 4,
  },
});

export default SkeletonAnalyticsChart;
