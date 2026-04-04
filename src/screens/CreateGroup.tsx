import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import Button from '../components/Button';
import { groupService } from '../services/group.service';
import { RootStackParamList } from '../types/navigation.types';
import { getCurrentTheme } from '../services/theme.service';
import Screen from '../components/Screen';

const CreateGroupScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useStore();
  const theme = getCurrentTheme();

  // Using your consistent _id architecture
  const currentUserId = user?._id;

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter a group name.');
      return;
    }

    if (!currentUserId) {
      Alert.alert('Error', 'User session not found. Please log in again.');
      return;
    }

    setLoading(true);

    // Initial members: just the creator for now
    const members = [currentUserId];

    try {
      const group = await groupService.createGroup({
        name: name.trim(),
        members,
        description: description.trim(),
      });

      // Navigate to the new group's detail page
      // Using group.id or group._id depending on your service return
      navigation.navigate('GroupDetail', { groupId: group._id });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          New Group
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Give your group a name and description to start splitting bills.
        </Text>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          {/* GROUP NAME */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Group Name</Text>
            <TextInput
              placeholder="e.g. Goa Trip 2024"
              placeholderTextColor={theme.textTertiary}
              value={name}
              onChangeText={setName}
              style={[
                styles.input,
                {
                  color: theme.textPrimary,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
            />
          </View>

          {/* DESCRIPTION */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Description (Optional)</Text>
            <TextInput
              placeholder="What is this group for?"
              placeholderTextColor={theme.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={[
                styles.input,
                styles.textArea,
                {
                  color: theme.textPrimary,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <Button 
            title="Create Group" 
            onPress={handleCreate} 
            loading={loading}
          />
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.cancelBtn}
          >
            <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonWrapper: {
    marginTop: 30,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 16,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateGroupScreen;