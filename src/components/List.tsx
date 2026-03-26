import React from 'react';
import { FlatList, StyleSheet, ListRenderItem } from 'react-native';

interface ListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T) => string;
  style?: any;
  contentContainerStyle?: any;
}

const List = <T extends any>({
  data,
  renderItem,
  keyExtractor,
  style,
  contentContainerStyle,
}: ListProps<T>) => {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={[styles.list, style]}
      contentContainerStyle={contentContainerStyle}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});

export default List;
