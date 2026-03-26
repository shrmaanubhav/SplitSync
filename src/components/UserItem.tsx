import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Avatar from './Avatar'; // Import the new Avatar component

interface UserItemProps {
  name: string;
  email: string;
  isFriend?: boolean;
  onPress: () => void;
  style?: any;
}

const UserItem: React.FC<UserItemProps> = ({
  name,
  email,
  isFriend = false,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <Avatar name={name} size="medium" variant="circular" />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
      {isFriend && (
        <View style={styles.friendBadge}>
          <Text style={styles.friendText}>Friend</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  friendBadge: {
    backgroundColor: '#4CD964',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  friendText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default UserItem;
