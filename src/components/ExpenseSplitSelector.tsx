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
import { getCurrentTheme } from '../services/theme.service';
import Avatar from './Avatar';

interface SplitParticipant {
  id: string;
  name: string;
  amount: string;
  percentage?: string;
}

interface ExpenseSplitSelectorProps {
  groupMembers: any[];
  paidById: string;
  totalAmount: number;
  onSplitsChange: (participants: SplitParticipant[]) => void;
  style?: any;
}

const ExpenseSplitSelector: React.FC<ExpenseSplitSelectorProps> = ({
  groupMembers,
  paidById,
  totalAmount,
  onSplitsChange,
  style,
}) => {
  const theme = getCurrentTheme();
  const [participants, setParticipants] = useState<SplitParticipant[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'unequal'>('equal');
  const [showMemberSelector, setShowMemberSelector] = useState(false);
  const [includePaidByUser, setIncludePaidByUser] = useState(true);

  // Initialize participants with group members
  useEffect(() => {
    if (groupMembers.length > 0) {
      updateParticipantsList();
    }
  }, [groupMembers, paidById, includePaidByUser]);

  // Update splits when participants or amounts change
  useEffect(() => {
    // Only update if we have participants
    if (participants.length > 0) {
      onSplitsChange(participants);
    }
  }, [participants]);

  const updateParticipantsList = () => {
    // Filter members based on whether to include the payer
    const membersToInclude = includePaidByUser
      ? groupMembers
      : groupMembers.filter(member => member._id !== paidById);

    // Create participant objects with empty amounts for unequal split mode
    const newParticipants = membersToInclude.map(member => ({
      id: member._id,
      name: member.name,
      amount: splitType === 'equal' ? '0.00' : '', // Empty for unequal, 0 for equal
    }));

    setParticipants(newParticipants);

    // If we have participants and in equal split mode, split equally
    if (newParticipants.length > 0 && splitType === 'equal') {
      splitEqually(newParticipants, totalAmount);
    }
  };

  const splitEqually = (
    participantsList: SplitParticipant[],
    amount: number
  ) => {
    if (participantsList.length === 0) return;

    const equalShare = amount / participantsList.length;
    const updatedParticipants = participantsList.map(participant => ({
      ...participant,
      amount: equalShare.toFixed(2),
    }));

    setParticipants(updatedParticipants);
  };

  const updateParticipantAmount = (id: string, amount: string) => {
    const updatedParticipants = participants.map(participant =>
      participant.id === id ? { ...participant, amount } : participant
    );
    setParticipants(updatedParticipants);
  };

  const addParticipant = (member: any) => {
    const newParticipant: SplitParticipant = {
      id: member._id,
      name: member.name,
      amount: splitType === 'equal' ? '0.00' : '', // Empty for unequal, 0 for equal
    };

    const updatedParticipants = [...participants, newParticipant];
    setParticipants(updatedParticipants);

    // Recalculate equal split when adding a participant
    if (splitType === 'equal') {
      splitEqually(updatedParticipants, totalAmount);
    }

    setShowMemberSelector(false);
  };

  const removeParticipant = (id: string) => {
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
    setIncludePaidByUser(!includePaidByUser);
  };

  const totalSplit = calculateTotalSplit();
  const difference = Math.abs(totalSplit - totalAmount);

  const renderMemberItem = (item: any) => (
    <TouchableOpacity
      style={[styles.memberItem, { borderBottomColor: theme.border }]}
      onPress={() => addParticipant(item)}
    >
      <Avatar name={item.name} size={40} />
      <Text style={[styles.memberName, { color: theme.textPrimary }]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderParticipant = (participant: SplitParticipant) => (
    <View key={participant.id} style={styles.participantRow}>
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
          onChangeText={value => updateParticipantAmount(participant.id, value)}
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
          onPress={() => removeParticipant(participant.id)}
        >
          <Text style={styles.removeText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Get available members to add (not already selected)
  const availableMembers = groupMembers.filter(
    member => !participants.some(p => p.id === member._id)
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
          Split Among
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

      {availableMembers.length > 0 && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => setShowMemberSelector(true)}
        >
          <Text style={styles.addText}>+ Add Member</Text>
        </TouchableOpacity>
      )}

      {showMemberSelector && (
        <View
          style={[
            styles.memberSelector,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={styles.memberSelectorHeader}>
            <Text
              style={[styles.memberSelectorTitle, { color: theme.textPrimary }]}
            >
              Select Member
            </Text>
            <TouchableOpacity onPress={() => setShowMemberSelector(false)}>
              <Text style={[styles.closeText, { color: theme.textSecondary }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.memberList}>
            {availableMembers.map(renderMemberItem)}
          </ScrollView>
        </View>
      )}
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
  memberSelector: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    padding: 15,
    zIndex: 10,
  },
  memberSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  memberSelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeText: {
    fontSize: 24,
  },
  memberList: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  memberName: {
    fontSize: 16,
    marginLeft: 15,
  },
});

export default ExpenseSplitSelector;