import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCurrentTheme } from '../services/theme.service';
import Avatar from '../components/Avatar';
import { userService } from '../services/user.service';
import { friendService } from '../services/friend.service';
import { contactsService } from '../services/contacts.service';
import Screen from '../components/Screen';
import { useSelection } from '../contexts/SelectionContext';
import { useStore } from '../store/useStore';

// Define interfaces locally to avoid conflicts
interface AppUser {
  _id: string;
  name: string;
  phoneNumber: string;
}

interface Contact {
  id: string;
  name: string;
  phoneNumbers: string[];
}

interface SelectPeopleScreenProps {
  route: any;
  navigation: any;
}

const SelectPeopleScreen: React.FC<SelectPeopleScreenProps> = () => {
  const theme = getCurrentTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { selectionCallback } = useSelection();
  const { user } = useStore();

  const {
    selectedMembers = [],
    title = 'Select People',
    mode = 'multiple', // 'single' or 'multiple'
  } = route.params as {
    selectedMembers?: string[];
    title?: string;
    mode?: string;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AppUser[]>([]);
  const [contactSearchResults, setContactSearchResults] = useState<Contact[]>(
    []
  );
  const [friends, setFriends] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<AppUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load friends when component mounts
  useEffect(() => {
    const loadFriends = async () => {
      setLoadingFriends(true);
      setError(null);
      try {
        // Use the current user's ID to fetch friends
        const userId = user?.id || '';
        if (!userId) {
          setError('User not authenticated');
          setLoadingFriends(false);
          return;
        }

        const friendsData = await friendService.getAllFriends(userId);
        // Map the returned data to our local interface
        const mappedFriends: AppUser[] = friendsData.map((user: any) => ({
          _id: user._id || user.id || '',
          name: user.name || '',
          phoneNumber: user.phoneNumber || '',
        }));
        setFriends(mappedFriends);
      } catch (error) {
        console.error('Error loading friends:', error);
        setError('Failed to load friends. Please try again later.');
        // Set empty array to avoid undefined issues
        setFriends([]);
      } finally {
        setLoadingFriends(false);
      }
    };

    loadFriends();

    // Initialize with pre-selected members
    if (selectedMembers.length > 0) {
      // In a real app, you would fetch user details for selected members
      setSelectedUsers(
        selectedMembers.map(id => ({ _id: id, name: '', phoneNumber: '' }))
      );
    }
  }, []);

  // Search users and contacts when query changes
  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setContactSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Search app users by phone number or name
        const users = await userService.searchUsersByPhoneNumber(searchQuery);
        // Map the returned data to our local interface
        const mappedUsers: AppUser[] = users.map((user: any) => ({
          _id: user._id || user.id || '',
          name: user.name || '',
          phoneNumber: user.phoneNumber || '',
        }));
        // Filter out already selected members
        const filteredUsers = mappedUsers.filter(
          (u: AppUser) =>
            !selectedUsers.some(selected => selected._id === u._id)
        );
        setSearchResults(filteredUsers);

        // Search device contacts
        try {
          const contacts: Contact[] = await contactsService.searchContacts(
            searchQuery
          );
          // Filter out contacts that are already app users or already selected
          const filteredContacts = contacts.filter(contact => {
            // Check if contact is already an app user
            const isAppUser = filteredUsers.some((user: AppUser) => {
              // Check by name match
              if (
                user.name.toLowerCase() === contact.name.toLowerCase() ||
                user.name.toLowerCase().includes(contact.name.toLowerCase()) ||
                contact.name.toLowerCase().includes(user.name.toLowerCase())
              ) {
                return true;
              }

              // Check by phone number match
              return contact.phoneNumbers.some(contactPhone =>
                contactsService.phoneNumbersMatch(
                  contactPhone,
                  user.phoneNumber
                )
              );
            });

            // Check if contact is already selected
            const isSelected = selectedUsers.some(
              selected =>
                selected.phoneNumber &&
                contact.phoneNumbers.some(contactPhone =>
                  contactsService.phoneNumbersMatch(
                    contactPhone,
                    selected.phoneNumber || ''
                  )
                )
            );

            return !isAppUser && !isSelected; // Only show contacts that are not app users and not selected
          });
          setContactSearchResults(filteredContacts);
        } catch (contactError) {
          console.log('Contact search error:', contactError);
          setContactSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setError('Failed to search users. Please try again.');
        setSearchResults([]);
        setContactSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedUsers]);

  const handleUserSelect = (user: AppUser) => {
    if (mode === 'single') {
      // For single selection, return immediately
      if (selectionCallback) {
        selectionCallback([user]);
      }
      navigation.goBack();
      return;
    }

    // For multiple selection, toggle selection
    const isSelected = selectedUsers.some(
      selected => selected._id === user._id
    );

    if (isSelected) {
      // Remove from selected
      setSelectedUsers(
        selectedUsers.filter(selected => selected._id !== user._id)
      );
    } else {
      // Add to selected
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    // For contacts that are not app users, we can show an option to invite them
    Alert.alert(
      'Contact Not in App',
      `${contact.name} is not currently using the app. Would you like to invite them?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Invite',
          onPress: () => {
            // In a real app, this would send an invitation
            console.log('Invite contact:', contact);
            Alert.alert(
              'Invitation',
              `Invitation would be sent to ${contact.name}`
            );
          },
        },
      ]
    );
  };

  const handleComplete = () => {
    if (selectionCallback) {
      // Ensure we're passing an array to the callback
      const selectedArray = Array.isArray(selectedUsers) ? selectedUsers : [];
      selectionCallback(selectedArray);
    }
    navigation.goBack();
  };

  const renderUserResult = ({ item }: { item: AppUser }) => (
    <TouchableOpacity
      style={[styles.resultItem, { borderBottomColor: theme.border }]}
      onPress={() => handleUserSelect(item)}
    >
      <Avatar name={item.name} size={40} />
      <View style={styles.resultInfo}>
        <Text style={[styles.resultName, { color: theme.textPrimary }]}>
          {item.name}
        </Text>
        {item.phoneNumber && (
          <Text style={[styles.resultPhone, { color: theme.textSecondary }]}>
            {contactsService.formatPhoneNumber(item.phoneNumber)}
          </Text>
        )}
      </View>
      <View style={styles.resultActions}>
        {selectedUsers.some(selected => selected._id === item._id) ? (
          <View
            style={[
              styles.selectedIndicator,
              { backgroundColor: theme.primary },
            ]}
          />
        ) : (
          <View style={[styles.addIndicator, { borderColor: theme.primary }]} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderContactResult = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={[styles.resultItem, { borderBottomColor: theme.border }]}
      onPress={() => handleContactSelect(item)}
    >
      <Avatar name={item.name} size={40} />
      <View style={styles.resultInfo}>
        <Text style={[styles.resultName, { color: theme.textPrimary }]}>
          {item.name}
        </Text>
        {item.phoneNumbers.length > 0 && (
          <Text style={[styles.resultPhone, { color: theme.textSecondary }]}>
            {contactsService.formatPhoneNumber(item.phoneNumbers[0])}
          </Text>
        )}
      </View>
      <View style={styles.resultActions}>
        <View
          style={[styles.inviteIndicator, { borderColor: theme.primary }]}
        />
      </View>
    </TouchableOpacity>
  );

  const renderFriendItem = ({ item }: { item: AppUser }) => (
    <TouchableOpacity
      style={[styles.resultItem, { borderBottomColor: theme.border }]}
      onPress={() => handleUserSelect(item)}
    >
      <Avatar name={item.name} size={40} />
      <View style={styles.resultInfo}>
        <Text style={[styles.resultName, { color: theme.textPrimary }]}>
          {item.name}
        </Text>
        {item.phoneNumber && (
          <Text style={[styles.resultPhone, { color: theme.textSecondary }]}>
            {contactsService.formatPhoneNumber(item.phoneNumber)}
          </Text>
        )}
      </View>
      <View style={styles.resultActions}>
        {selectedUsers.some(selected => selected._id === item._id) ? (
          <View
            style={[
              styles.selectedIndicator,
              { backgroundColor: theme.primary },
            ]}
          />
        ) : (
          <View style={[styles.addIndicator, { borderColor: theme.primary }]} />
        )}
      </View>
    </TouchableOpacity>
  );

  // Create a combined list for rendering search results
  const renderSearchResultItem = ({
    item,
    index,
  }: {
    item: AppUser | Contact;
    index: number;
  }) => {
    const isUser = index < searchResults.length;
    return isUser
      ? renderUserResult({ item: item as AppUser })
      : renderContactResult({ item: item as Contact });
  };

  const getSearchResultKey = (
    item: AppUser | Contact,
    index: number
  ): string => {
    const isUser = index < searchResults.length;
    return isUser ? (item as AppUser)._id : `contact-${(item as Contact).id}`;
  };

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View
          style={[styles.header, { backgroundColor: theme.headerBackground }]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.cancelText, { color: theme.primary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {title}
          </Text>
          <TouchableOpacity onPress={handleComplete}>
            <Text style={[styles.doneText, { color: theme.primary }]}>
              {mode === 'single' ? 'Select' : 'Done'}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or phone number..."
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Searching...
            </Text>
          </View>
        )}

        {loadingFriends && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Loading friends...
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.danger }]}>
              {error}
            </Text>
          </View>
        )}

        {searchQuery === '' && friends.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              Your Friends
            </Text>
            <FlatList
              data={friends.filter(
                friend =>
                  !selectedUsers.some(selected => selected._id === friend._id)
              )}
              renderItem={renderFriendItem}
              keyExtractor={item => item._id}
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            />
          </View>
        )}

        {searchQuery !== '' && (
          <View style={styles.section}>
            <FlatList
              data={[...searchResults, ...contactSearchResults]}
              renderItem={renderSearchResultItem}
              keyExtractor={getSearchResultKey}
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              ListHeaderComponent={
                searchResults.length > 0 ? (
                  <Text
                    style={[
                      styles.sectionHeader,
                      { color: theme.textSecondary },
                    ]}
                  >
                    App Users
                  </Text>
                ) : contactSearchResults.length > 0 ? (
                  <Text
                    style={[
                      styles.sectionHeader,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Contacts
                  </Text>
                ) : null
              }
              ListEmptyComponent={
                searchQuery.length >= 2 && !loading && !error ? (
                  <View style={styles.noResultsContainer}>
                    <Text
                      style={[
                        styles.noResultsText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      No users found with that name or phone number
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
        )}

        {selectedUsers.length > 0 && mode !== 'single' && (
          <View
            style={[
              styles.selectedContainer,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <Text style={[styles.selectedTitle, { color: theme.textPrimary }]}>
              Selected ({selectedUsers.length})
            </Text>
            <FlatList
              data={selectedUsers}
              horizontal
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.selectedItem,
                    { backgroundColor: theme.headerBackground },
                  ]}
                >
                  <Avatar name={item.name} size={30} />
                  <Text
                    style={[styles.selectedName, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </View>
              )}
              keyExtractor={item => item._id}
              style={styles.selectedList}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    borderRadius: 8,
    borderWidth: 1,
    margin: 15,
  },
  searchInput: {
    padding: 15,
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  loadingText: {
    marginLeft: 10,
  },
  errorContainer: {
    padding: 15,
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    margin: 15,
    marginBottom: 5,
  },
  resultsList: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 10,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultPhone: {
    fontSize: 14,
  },
  resultActions: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  addIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  inviteIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedContainer: {
    padding: 15,
    borderTopWidth: 1,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  selectedList: {
    height: 40,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedName: {
    fontSize: 14,
    marginLeft: 5,
    maxWidth: 80,
  },
});

export default SelectPeopleScreen;