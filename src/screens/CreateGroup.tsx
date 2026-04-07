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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import Button from '../components/Button';
import { groupService } from '../services/group.service';
import { RootStackParamList } from '../types/navigation.types';
import { getCurrentTheme } from '../services/theme.service';
import Screen from '../components/Screen';
import { useSelection } from '../contexts/SelectionContext';
import Avatar from '../components/Avatar';

interface SelectedUser {
  _id: string;
  name: string;
  phoneNumber?: string;
}

const CreateGroupScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [loading, setLoading] = useState(false);

  // 🛡️ Fixed Navigation Type to allow .replace()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useStore();
  const theme = getCurrentTheme();
  const { setSelectionCallback } = useSelection();

  const currentUserId = user?._id;

  const handleAddMembers = () => {
    // 1. Set what should happen when the user hits "Done" on the Select screen
    // 🚨 THE FIX: Add "() =>" before your function so React saves it instead of running it!
    setSelectionCallback(() => (users: SelectedUser[]) => {
      setSelectedUsers(users || []);
    });

    // 2. Navigate to the Select screen
    navigation.navigate('SelectPeople', {
      selectedMembers: (selectedUsers || []).map(u => u._id), 
      title: 'Add Members',
      mode: 'multiple',
    });
  };

  const handleRemoveMember = (idToRemove: string) => {
    // 🛡️ Defensive fallback before filtering
    setSelectedUsers(prev => (prev || []).filter(u => u._id !== idToRemove));
  };

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

    // 🛡️ Defensive fallback before mapping
    const memberIds = Array.from(new Set([currentUserId, ...(selectedUsers || []).map(u => u._id)]));

    try {
      const group = await groupService.createGroup({
        name: name.trim(),
        members: memberIds,
        description: description.trim(),
      });

      // Navigate to the new group's detail page
      navigation.replace('GroupDetail', { groupId: group._id });
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
          Give your group a name and add friends to start splitting bills.
        </Text>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          {/* GROUP NAME */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Group Name</Text>
            <TextInput
              placeholder="e.g. Goa Trip 2026"
              placeholderTextColor={theme.textTertiary}
              value={name}
              onChangeText={setName}
              style={[
                styles.input,
                { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.background },
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
                { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.background },
              ]}
            />
          </View>
        </View>

        {/* ADD MEMBERS SECTION */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 25 }]}>Group Members</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersRow}>
            {/* The "You" Avatar */}
            <View style={styles.memberAvatarContainer}>
              <Avatar name={user?.name || 'Me'} size={55} />
              <Text style={[styles.memberName, { color: theme.textPrimary }]} numberOfLines={1}>You</Text>
            </View>

            {/* Selected Friends - 🛡️ Defensive fallback before mapping */}
            {(selectedUsers || []).map((u) => (
              <View key={u._id} style={styles.memberAvatarContainer}>
                <TouchableOpacity 
                  style={styles.removeBadge} 
                  onPress={() => handleRemoveMember(u._id)}
                >
                  <Text style={styles.removeBadgeText}>×</Text>
                </TouchableOpacity>
                <Avatar name={u.name} size={55} />
                <Text style={[styles.memberName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {/* Fallback to 'User' if name is empty to prevent split() crashes */}
                  {(u.name || 'User').split(' ')[0]}
                </Text>
              </View>
            ))}

            {/* Add Button */}
            <TouchableOpacity 
              style={[styles.addMemberBtn, { borderColor: theme.border, backgroundColor: theme.background }]} 
              onPress={handleAddMembers}
            >
              <Text style={[styles.addMemberIcon, { color: theme.primary }]}>+</Text>
            </TouchableOpacity>
          </ScrollView>

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
    paddingBottom: 40,
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
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
  membersRow: {
    alignItems: 'center',
    gap: 15,
    paddingTop: 10,
  },
  memberAvatarContainer: {
    alignItems: 'center',
    width: 65,
  },
  memberName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  removeBadge: {
    position: 'absolute',
    top: -5,
    right: 0,
    backgroundColor: '#FF3B30',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  removeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: -2,
  },
  addMemberBtn: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  addMemberIcon: {
    fontSize: 24,
    fontWeight: '600',
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