import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import Button from '../components/Button';
import { groupService } from '../services/group.service';
import { RootStackParamList } from '../types/navigation.types';
import { getCurrentTheme } from '../services/theme.service';

const CreateGroupScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useStore();
  const theme = getCurrentTheme();

  async function handleCreate() {
    if (!name) {
      Alert.alert('Enter group name');
      return;
    }

    if (!user?._id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    // TEMP TEST MEMBERS
    const members = [
      user._id,
      'u2',
      'u3',
    ];

    try {
      const group = await groupService.createGroup({
        name,
        members,
        description,
      });

      navigation.navigate('GroupDetail', { group });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to create group');
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Create Group
      </Text>

      {/* GROUP NAME */}
      <TextInput
        placeholder="Group Name"
        placeholderTextColor={theme.textSecondary}
        value={name}
        onChangeText={setName}
        style={[
          styles.input,
          {
            color: theme.textPrimary,
            borderColor: theme.border,
            backgroundColor: theme.cardBackground,
          },
        ]}
      />

      {/* DESCRIPTION */}
      <TextInput
        placeholder="Description"
        placeholderTextColor={theme.textSecondary}
        value={description}
        onChangeText={setDescription}
        style={[
          styles.input,
          {
            color: theme.textPrimary,
            borderColor: theme.border,
            backgroundColor: theme.cardBackground,
          },
        ]}
      />

      <Button title="Create" onPress={handleCreate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
  },
});

export default CreateGroupScreen;