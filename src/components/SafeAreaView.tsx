import React from 'react';
import { SafeAreaView as RNSafeAreaView, StyleSheet } from 'react-native';

interface SafeAreaViewProps {
  children: React.ReactNode;
  style?: any;
}

const SafeAreaView: React.FC<SafeAreaViewProps> = ({ children, style }) => {
  return (
    <RNSafeAreaView style={[styles.container, style]}>
      {children}
    </RNSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaView;
