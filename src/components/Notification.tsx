import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface NotificationProps {
  title: string;
  message: string;
  time: string;
  unread?: boolean;
  onPress: () => void;
  style?: any;
}

const Notification: React.FC<NotificationProps> = ({
  title,
  message,
  time,
  unread = false,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, unread && styles.unread, style]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={[styles.title, unread && styles.unreadTitle]}>
          {title}
        </Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <Text style={styles.time}>{time}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    backgroundColor: '#FFFFFF',
  },
  unread: {
    backgroundColor: '#E8F4FF',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
});

export default Notification;
