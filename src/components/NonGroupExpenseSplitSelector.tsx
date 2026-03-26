import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getCurrentTheme } from '../services/theme.service';
import Avatar from './Avatar';
import { userService } from '../services/user.service';
import { friendService } from '../services/friend.service';
import { contactsService } from '../services/contacts.service';
import { useStore } from '../store/useStore';
import { useSelection } from '../contexts/SelectionContext';

interface SplitParticipant {
  id: string;
  name: string;
  phoneNumber?: string;
  amount: string;
  isFriend?: boolean;
  isContact?: boolean;
}

interface NonGroupExpenseSplitSelectorProps {
  paidById: string;
  totalAmount: number;
  onSplitsChange: (participants: SplitParticipant[]) => void;
  style?: any;
}

const NonGroupExpenseSplitSelector: React.FC<
  NonGroupExpenseSplitSelectorProps
> = ({ paidById, totalAmount, onSplitsChange, style }) => {
  const theme = getCurrentTheme();
  const navigation = useNavigation();
  const { setSelectionCallback } = useSelection();
  const { user } = useStore();
  const [participants, setParticipants] = useState<SplitParticipant[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'unequal'>('equal');
  const [includePaidByUser, setIncludePaidByUser] = useState(true);

  // Initialize with the payer as the first participant
  useEffect(() => {
    if (user) {
      setParticipants([
        {
          id: user.id || '',
          name: user.name || 'You',
          phoneNumber: user.phoneNumber || '',
          amount: '0.00',
          isFriend: false,
          isContact: false,
        },
      ]);
    }
  }, [user]);

  // Update splits when participants or amounts change
  useEffect(() => {
    // Only update if we have participants
    if (participants.length > 0) {
      onSplitsChange(participants);
    }
  }, [participants]);

  // Update participant amounts when total amount or split type changes
  useEffect(() => {
    if (splitType === 'equal') {
      splitEqually(participants, totalAmount);
    }
  }, [totalAmount, splitType, includePaidByUser]);

  const splitEqually = (
    participantsList: SplitParticipant[],
    amount: number
  ) => {
    if (participantsList.length === 0) return;

    const membersToInclude = includePaidByUser
      ? participantsList
      : participantsList.filter(participant => participant.id !== paidById);

    if (membersToInclude.length === 0) return;

    const equalShare = amount / membersToInclude.length;
    const updatedParticipants = participantsList.map(participant => {
      if (includePaidByUser || participant.id !== paidById) {
        return {
          ...participant,
          amount: equalShare.toFixed(2),
        };
      }
      return participant;
    });

    setParticipants(updatedParticipants);
  };

  const updateParticipantAmount = (id: string, amount: string) => {
    const updatedParticipants = participants.map(participant =>
      participant.id === id ? { ...participant, amount } : participant
    );
    setParticipants(updatedParticipants);
  };

  const addParticipant = (member: any) => {
    // Check if participant is already added
    const memberId = member._id || member.id || '';

    const isAlreadyAdded = participants.some(p => {
      const match =
        p.id === memberId ||
        p.phoneNumber === (member.phoneNumber || member.phoneNumbers?.[0]);
      return match;
    });

    if (isAlreadyAdded) {
      Alert.alert('Already Added', 'This person is already in the split');
      return;
    }

    const newParticipant: SplitParticipant = {
      id: memberId,
      name: member.name || 'Unknown',
      phoneNumber: member.phoneNumber || member.phoneNumbers?.[0] || '',
      amount: splitType === 'equal' ? '0.00' : '',
      isFriend: member.isFriend || false,
      isContact: member.isContact || false,
    };

    const updatedParticipants = [...participants, newParticipant];
    setParticipants(updatedParticipants);

    // Recalculate equal split when adding a participant
    if (splitType === 'equal') {
      splitEqually(updatedParticipants, totalAmount);
    }
  };

  const removeParticipant = (id: string) => {
    // Prevent removing the payer if they're included
    if (id === paidById && includePaidByUser) {
      Alert.alert('Error', 'Cannot remove yourself from the split');
      return;
    }

    // Prevent removing the last participant
    if (participants.length <= 1) {
      Alert.alert('Error', 'At least one participant is required');
      return;
    }

    const updatedParticipants = participants.filter(
      participant => participant.id !== id
    );
    setParticipants(updatedParticipants);

    // Recalculate equal split when removing a participant
    if (splitType === 'equal') {
      splitEqually(updatedParticipants, totalAmount);
    }
  };

  const calculateTotalSplit = () => {
    return participants.reduce(
      (sum, participant) => sum + (parseFloat(participant.amount) || 0),
      0
    );
  };

  const toggleSplitType = () => {
    const newType = splitType === 'equal' ? 'unequal' : 'equal';
    setSplitType(newType);

    // Reset amounts when toggling split type
    const updatedParticipants = participants.map(participant => ({
      ...participant,
      amount: newType === 'equal' ? '0.00' : '', // Empty for unequal, 0 for equal
    }));

    setParticipants(updatedParticipants);

    if (newType === 'equal') {
      splitEqually(updatedParticipants, totalAmount);
    }
  };

  const toggleIncludePaidByUser = () => {
    const newValue = !includePaidByUser;
    setIncludePaidByUser(newValue);

    // Update amounts based on new setting
    if (splitType === 'equal') {
      splitEqually(participants, totalAmount);
    }
  };

  const handleSelectPeople = () => {
    // Set the callback function in the context
    setSelectionCallback((selected: any[]) => {
      // Ensure selected is an array before processing
      if (Array.isArray(selected)) {
        // Add selected people to participants
        selected.forEach(member => {
          addParticipant({
            _id: member._id || member.id || '',
            name: member.name,
            phoneNumber: member.phoneNumber || member.phoneNumbers?.[0] || '',
            isFriend: true, // Assume they're friends for now
          });
        });
      }
    });

    // Navigate to the SelectPeopleScreen
    // @ts-ignore
    navigation.navigate('SelectPeople', {
      selectedMembers: participants
        .map(p => p.id)
        .filter(id => id !== user?.id),
      title: 'Select People to Split With',
      mode: 'multiple',
    });
  };

  const totalSplit = calculateTotalSplit();
  const difference = Math.abs(totalSplit - totalAmount);

  const renderParticipant = (participant: SplitParticipant) => (
    <View
      key={participant.id || participant.phoneNumber}
      style={styles.participantRow}
    >
      <Avatar name={participant.name} size={40} />
      <View style={styles.participantInfo}>
        <Text style={[styles.participantName, { color: theme.textPrimary }]}>
          {participant.name}
          {participant.id === paidById && (
            <Text style={[styles.paidByText, { color: theme.primary }]}>
              {' '}
              (Paid)
            </Text>
          )}
        </Text>
        {participant.phoneNumber && (
          <Text
            style={[styles.participantPhone, { color: theme.textSecondary }]}
          >
            {contactsService.formatPhoneNumber(participant.phoneNumber)}
          </Text>
        )}
        {participant.isFriend && (
          <Text style={[styles.participantTag, { color: theme.primary }]}>
            Friend
          </Text>
        )}
        {participant.isContact && !participant.isFriend && (
          <Text style={[styles.participantTag, { color: theme.textTertiary }]}>
            Contact
          </Text>
        )}
      </View>

      {/* Only show input field when in unequal split mode */}
      {splitType === 'unequal' ? (
        <TextInput
          style={[
            styles.amountInput,
            {
              backgroundColor: theme.cardBackground,
              color: theme.textPrimary,
              borderColor: theme.border,
            },
          ]}
          value={participant.amount}
          onChangeText={value =>
            updateParticipantAmount(
              participant.id || participant.phoneNumber || '',
              value
            )
          }
          placeholder="0.00"
          placeholderTextColor={theme.textTertiary}
          keyboardType="decimal-pad"
        />
      ) : (
        <Text style={[styles.amountText, { color: theme.textPrimary }]}>
          {participant.amount}
        </Text>
      )}

      {(participant.id !== paidById || !includePaidByUser) && (
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: theme.danger }]}
          onPress={() =>
            removeParticipant(participant.id || participant.phoneNumber || '')
          }
        >
          <Text style={styles.removeText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        style,
        { backgroundColor: theme.cardBackground },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Split With
        </Text>
        <TouchableOpacity onPress={toggleSplitType}>
          <Text style={[styles.splitTypeText, { color: theme.primary }]}>
            {splitType === 'equal' ? 'Equal Split' : 'Unequal Split'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.includeToggleContainer}>
        <Text style={[styles.includeToggleText, { color: theme.textPrimary }]}>
          Include me in split
        </Text>
        <Switch
          value={includePaidByUser}
          onValueChange={toggleIncludePaidByUser}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={includePaidByUser ? theme.primaryLight : '#FFFFFF'}
        />
      </View>

      {difference > 0.01 && splitType === 'unequal' && totalAmount > 0 && (
        <Text style={[styles.warningText, { color: '#FF9500' }]}>
          Split amounts must sum to total amount (difference:{' '}
          {difference.toFixed(2)})
        </Text>
      )}

      <View style={styles.participantsContainer}>
        {participants.map(renderParticipant)}
      </View>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={handleSelectPeople}
      >
        <Text style={styles.addText}>+ Add Person</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  splitTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  includeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  includeToggleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  warningText: {
    fontSize: 14,
    marginBottom: 10,
  },
  participantsContainer: {
    marginBottom: 10,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  participantInfo: {
    flex: 1,
    marginLeft: 10,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
  },
  participantPhone: {
    fontSize: 14,
  },
  participantTag: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  paidByText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  amountInput: {
    width: 80,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    textAlign: 'center',
  },
  amountText: {
    width: 80,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NonGroupExpenseSplitSelector;
