import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Segment {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  selectedSegment: string;
  onSegmentChange: (key: string) => void;
  style?: any;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  segments,
  selectedSegment,
  onSegmentChange,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {segments.map(segment => (
        <TouchableOpacity
          key={segment.key}
          style={[
            styles.segment,
            selectedSegment === segment.key && styles.selectedSegment,
          ]}
          onPress={() => onSegmentChange(segment.key)}
        >
          <Text
            style={[
              styles.segmentText,
              selectedSegment === segment.key && styles.selectedSegmentText,
            ]}
          >
            {segment.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedSegment: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  selectedSegmentText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default SegmentedControl;
