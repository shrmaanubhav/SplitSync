import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import MemberSelector from '../components/MemberSelector';
import { groupService } from '../services/group.service';
import { contactsService } from '../services/contacts.service';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';
import Screen from '../components/Screen';

const CreateGroupScreen = () => {
  const navigation = useNavigation();
  const { user } = useStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Check contacts when screen is loaded
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        // Check if we have contacts permission
        const hasPermission = await contactsService.hasPermission();
        if (!hasPermission) {
          // Request permission silently
          await contactsService.requestPermission();
        }

        // We can add any other initialization logic here if needed
      } catch (error) {
        console.log('Error initializing contacts:', error);
      } finally {
        setInitializing(false);
      }
    };

    initializeScreen();
  }, []);

  const handleMemberSelect = (userId: string) => {
    if (!selectedMembers.includes(userId)) {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleMemberRemove = (userId: string) => {
    setSelectedMembers(selectedMembers.filter(id => id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setLoading(true);
    try {
      // Create group data - include current user as admin but not as regular member
      // The backend will automatically add the creator as both admin and member
      const groupData = {
        name,
        description,
        members: selectedMembers, // Only include selected members, not the creator
      };

      await groupService.createGroup(groupData);

      Alert.alert('Success', 'Group created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const theme = getCurrentTheme();

  if (initializing) {
    return (
      <Screen>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.background, justifyContent: 'center' },
          ]}
        >
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textPrimary }]}>
            Initializing contacts...
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView
          style={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Create New Group
            </Text>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>
                Group Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter group name"
                placeholderTextColor={theme.textTertiary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter group description (optional)"
                placeholderTextColor={theme.textTertiary}
                multiline
                numberOfLines={4}
              />
            </View>

            <MemberSelector
              selectedMembers={selectedMembers}
              onMemberSelect={handleMemberSelect}
              onMemberRemove={handleMemberRemove}
            />

            <Button
              title="Create Group"
              onPress={handleCreateGroup}
              loading={loading}
              disabled={loading}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 20,
    marginBottom: 20, // Add some bottom margin
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
  },
});

export default CreateGroupScreen;