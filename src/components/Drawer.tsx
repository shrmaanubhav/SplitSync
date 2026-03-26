import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface DrawerItem {
  key: string;
  title: string;
  icon?: string;
}

interface DrawerProps {
  items: DrawerItem[];
  activeItem: string;
  onItemPress: (key: string) => void;
  onClose: () => void;
  style?: any;
}

const Drawer: React.FC<DrawerProps> = ({
  items,
  activeItem,
  onItemPress,
  onClose,
  style,
}) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Splitter</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>

      {items.map(item => (
        <TouchableOpacity
          key={item.key}
          style={[styles.item, activeItem === item.key && styles.activeItem]}
          onPress={() => {
            onItemPress(item.key);
            onClose();
          }}
        >
          {item.icon && <Text style={styles.icon}>{item.icon}</Text>}
          <Text
            style={[
              styles.itemText,
              activeItem === item.key && styles.activeItemText,
            ]}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 10,
  },
  closeText: {
    fontSize: 24,
    color: '#666',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  activeItem: {
    backgroundColor: '#E8F4FF',
  },
  icon: {
    fontSize: 20,
    marginRight: 15,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  activeItemText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default Drawer;
