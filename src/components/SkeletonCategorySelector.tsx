import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonCategorySelectorProps {
  categories?: number;
  style?: any;
}

const SkeletonCategorySelector: React.FC<SkeletonCategorySelectorProps> = ({
  categories = 5,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader height={16} width="30%" style={styles.label} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
      >
        {Array.from({ length: categories }).map((_, index) => (
          <SkeletonLoader
            key={index}
            width={80}
            height={40}
            borderRadius={8}
            style={styles.category}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    marginBottom: 10,
  },
  scrollContainer: {
    paddingVertical: 5,
  },
  category: {
    marginRight: 10,
  },
});

export default SkeletonCategorySelector;
