import React from 'react';
import { FlatList, StyleSheet, ListRenderItem } from 'react-native';

interface GridProps {
  data: any[];
  renderItem: ListRenderItem<any>;
  keyExtractor: (item: any) => string;
  numColumns?: number;
  style?: any;
  contentContainerStyle?: any;
}

const Grid: React.FC<GridProps> = ({
  data,
  renderItem,
  keyExtractor,
  numColumns = 2,
  style,
  contentContainerStyle,
}) => {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      style={[styles.grid, style]}
      contentContainerStyle={contentContainerStyle}
    />
  );
};

const styles = StyleSheet.create({
  grid: {
    flex: 1,
  },
});

export default Grid;
