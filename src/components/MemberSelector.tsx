import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../services/user.service';
import { useStore } from '../store/useStore';
import Button from './Button';
import Avatar from './Avatar';
import { getCurrentTheme } from '../services/theme.service';
import { useSelection } from '../contexts/SelectionContext';

interface User {
  _id: string;
  name: string;
  phoneNumber: string;
}

interface MemberSelectorProps {
  selectedMembers: string[];
  onMemberSelect: (userId: string) => void;
  onMemberRemove: (userId: string) => void;
}

const MemberSelector: React.FC<MemberSelectorProps> = ({
  selectedMembers,
  onMemberSelect,
  onMemberRemove,
}) => {
  const navigation = useNavigation();
  const { setSelectionCallback } = useSelection();
  const { user, darkMode } = useStore();
  const theme = getCurrentTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // Load selected users with actual data
  useEffect(() => {
    const loadSelectedUsers = async () => {
      if (selectedMembers.length > 0) {
        try {
          // Fetch actual user details for selected members
          const usersData: User[] = [];

          // Process each selected member
          for (const userId of selectedMembers) {
            // Skip if it's the current user (they're automatically added)
            if (userId === user?.id) continue;

            try {
              const userData = await userService.getUserById(userId);
              usersData.push({
                _id: userData._id,
                name: userData.name,
                phoneNumber: userData.phoneNumber,
              });
            } catch (error) {
              console.error(`Error loading user ${userId}:`, error);
              // Still add a placeholder even if there's an error
              usersData.push({
                _id: userId,
                name: `User ${userId.substring(0, 5)}`,
                phoneNumber: '',
              });
            }
          }

          setSelectedUsers(usersData);
        } catch (error) {
          console.error('Error loading selected users:', error);
          // Fallback to placeholder data
          const users = selectedMembers.map(id => ({
            _id: id,
            name: `User ${id.substring(0, 5)}`,
            phoneNumber: '',
          }));
          setSelectedUsers(users);
        }
      } else {
        setSelectedUsers([]);
      }
    };

    loadSelectedUsers();
  }, [selectedMembers, user?.id]);

  // Search users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const users = await userService.searchUsersByPhoneNumber(searchQuery);
        // Filter out the current user and already selected members
        const filteredUsers = users.filter(
          u =>
            u._id !== user?.id &&
            !selectedMembers.includes(u._id) &&
            (u.phoneNumber.includes(searchQuery) ||
              u.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setSearchResults(filteredUsers);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedMembers, user?.id]);

  const handleUserSelect = (user: User) => {
    onMemberSelect(user._id);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUserRemove = (userId: string) => {
    onMemberRemove(userId);
  };

  const handleSelectPeople = () => {
    // Set the callback function in the context
    setSelectionCallback((selected: any[]) => {
      // Ensure selected is an array before processing
      if (Array.isArray(selected)) {
        // Add all selected people
        selected.forEach(member => {
          onMemberSelect(member._id);
        });
      }
    });

    // Navigate to the SelectPeopleScreen
    // @ts-ignore
    navigation.navigate('SelectPeople', {
      selectedMembers: selectedMembers,
      title: 'Select Group Members',
      mode: 'multiple',
    });
  };

  const renderSelectedUser = (user: User) => (
    <View key={user._id} style={[styles.selectedUserItem, { backgroundColor: theme.primary + '20' }]}>
      <Avatar name={user.name} size={30} />
      <View style={styles.selectedUserInfo}>
        <Text style={[styles.selectedUserName, { color: theme.textPrimary }]}>{user.name}</Text>
        <Text style={[styles.selectedUserPhone, { color: theme.textSecondary }]}>{user.phoneNumber}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleUserRemove(user._id)}
        style={[styles.removeButton, { backgroundColor: theme.danger }]}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
      onPress={() => handleUserSelect(item)}
    >
      <Avatar name={item.name} size={40} />
      <View style={styles.searchResultInfo}>
        <Text style={[styles.searchResultName, { color: theme.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.searchResultPhone, { color: theme.textSecondary }]}>{item.phoneNumber}</Text>
      </View>
      <View style={[styles.addButton, { backgroundColor: theme.primary }]}>
        <Text style={styles.addButtonText}>+</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.textPrimary }]}>Group Members</Text>

      {/* Selected members - using ScrollView instead of FlatList for small lists */}
      {selectedUsers.length > 0 && (
        <View style={styles.selectedUsersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedUsersList}
          >
            {selectedUsers.map(renderSelectedUser)}
          </ScrollView>
        </View>
      )}

      {/* Search input */}
      <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search members by name or phone number..."
          placeholderTextColor={theme.textTertiary}
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color={theme.primary}
            style={styles.searchLoader}
          />
        )}
      </View>

      {/* Search results */}
      {searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <ScrollView
            style={[styles.searchResultsList, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            keyboardShouldPersistTaps="handled"
          >
            {searchResults.map(item => renderSearchResult({ item }))}
          </ScrollView>
        </View>
      )}

      {/* No results message */}
      {searchQuery.length >= 2 && searchResults.length === 0 && !loading && (
        <View style={styles.noResultsContainer}>
          <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>
            No users found with that name or phone number
          </Text>
          <Button
            title="Invite via SMS"
            variant="secondary"
            style={styles.inviteButton}
            onPress={() => {
              // In a real app, this would open an SMS invitation flow
              console.log('Invite user via SMS:', searchQuery);
            }}
          />
        </View>
      )}

      {/* Add People button */}
      <Button
        title="+ Add People"
        onPress={handleSelectPeople}
        style={styles.addPeopleButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  selectedUsersContainer: {
    marginBottom: 15,
  },
  selectedUsersList: {
    paddingVertical: 5,
  },
  selectedUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  selectedUserInfo: {
    marginLeft: 8,
    marginRight: 20,
  },
  selectedUserName: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedUserPhone: {
    fontSize: 12,
  },
  removeButton: {
    position: 'absolute',
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
  },
  searchLoader: {
    marginRight: 10,
  },
  searchResultsContainer: {
    maxHeight: 200,
    marginTop: 10,
  },
  searchResultsList: {
    borderRadius: 8,
    borderWidth: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 10,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchResultPhone: {
    fontSize: 14,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    marginBottom: 15,
  },
  inviteButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addPeopleButton: {
    marginTop: 15,
  },
});

export default MemberSelector;