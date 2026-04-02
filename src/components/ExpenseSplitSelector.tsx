import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { getCurrentTheme } from '../services/theme.service';
import Avatar from './Avatar';

interface SplitParticipant {
  id: string;
  name: string;
  amount: string;
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

  // Recalculate equal splits whenever the total or participant count changes
  useEffect(() => {
    if (splitType === 'equal' && participants.length > 0) {
      const equalShare = totalAmount / participants.length;
      const updatedParticipants = participants.map(participant => ({
        ...participant,
        amount: equalShare.toFixed(2),
      }));
      
      // Prevent infinite loops by checking if the math actually changed
      const currentAmounts = participants.map(p => p.amount).join();
      const newAmounts = updatedParticipants.map(p => p.amount).join();
      
      if (currentAmounts !== newAmounts) {
        setParticipants(updatedParticipants);
      }
    }
  }, [totalAmount, participants.length, splitType]);

  useEffect(() => {
    onSplitsChange(participants);
  }, [participants]);

  const updateParticipantAmount = (id: string, amount: string) => {
    const updatedParticipants = participants.map(participant =>
      participant.id === id ? { ...participant, amount } : participant
    );
    setParticipants(updatedParticipants);
  };

const addParticipant = (member: any) => {
    if (participants.some(p => p.id === (member.id || member._id || member))) {
      // setShowMemberSelector(false);
      return;
    }

    const newParticipant: SplitParticipant = {
      id: member.id || member._id || member, 
      name: member.name || 'User',
      amount: splitType === 'equal' ? '0.00' : '', 
    };

    setParticipants([...participants, newParticipant]);
    // setShowMemberSelector(false);
  };

  const removeParticipant = (id: string) => {
    const updatedParticipants = participants.filter(
      participant => participant.id !== id
    );
    setParticipants(updatedParticipants);
  };

  const calculateTotalSplit = () => {
    return participants.reduce(
      (sum, participant) => sum + (parseFloat(participant.amount) || 0),
      0
    );
  };

  const totalSplit = calculateTotalSplit();
  const difference = Math.abs(totalSplit - totalAmount);

  const renderMemberItem = (item: any) => (
    <TouchableOpacity
      key={item.id || item._id || item} 
      style={[styles.memberItem, { borderBottomColor: theme.border }]}
      onPress={() => addParticipant(item)}
    >
      <Avatar name={item.name || 'User'} size={40} />
      <Text style={[styles.memberName, { color: theme.textPrimary }]}>
        {item.name || 'User'}
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

      <TouchableOpacity
        style={[styles.removeButton, { backgroundColor: theme.danger }]}
        onPress={() => removeParticipant(participant.id)}
      >
        <Text style={styles.removeText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const availableMembers = groupMembers.filter(
    member => !participants.some(p => p.id === (member.id || member._id || member))
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
        
        {/* Custom Segmented Pill Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleOption,
              splitType === 'equal' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setSplitType('equal')}
          >
            <Text
              style={[
                styles.toggleText,
                { color: splitType === 'equal' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Equal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleOption,
              splitType === 'unequal' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setSplitType('unequal')}
          >
            <Text
              style={[
                styles.toggleText,
                { color: splitType === 'unequal' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Unequal
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {difference > 0.01 && splitType === 'unequal' && totalAmount > 0 && (
        <Text style={[styles.warningText, { color: '#FF9500' }]}>
          Split amounts must sum to total amount (Difference:{' '}
          {difference.toFixed(2)})
        </Text>
      )}

      <View style={styles.participantsContainer}>
        {participants.length === 0 && (
          <Text style={{ color: theme.textSecondary, marginBottom: 15, fontStyle: 'italic' }}>
            No members selected yet.
          </Text>
        )}
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 4,
  },
  toggleOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '500',
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
    marginTop: 5,
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  memberSelector: {
    
    marginTop: 10,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)', 
  },
  memberSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, 
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
    maxHeight: 250,
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