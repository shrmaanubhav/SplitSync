import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { getCurrentTheme } from '../services/theme.service';

interface Participant {
  id: string;
  name: string;
  amount: string;
}

interface ParticipantSelectorProps {
  participants: Participant[];
  onParticipantChange: (participants: Participant[]) => void;
  totalAmount: number;
  style?: any;
}

const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  participants,
  onParticipantChange,
  totalAmount,
  style,
}) => {
  const theme = getCurrentTheme();

  const addParticipant = () => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: '',
      amount: '',
    };
    onParticipantChange([...participants, newParticipant]);
  };

  const updateParticipant = (
    id: string,
    field: keyof Participant,
    value: string
  ) => {
    const updatedParticipants = participants.map(participant =>
      participant.id === id ? { ...participant, [field]: value } : participant
    );
    onParticipantChange(updatedParticipants);
  };

  const removeParticipant = (id: string) => {
    if (participants.length <= 1) {
      Alert.alert('Error', 'At least one participant is required');
      return;
    }
    const updatedParticipants = participants.filter(
      participant => participant.id !== id
    );
    onParticipantChange(updatedParticipants);
  };

  const calculateTotalSplit = () => {
    return participants.reduce(
      (sum, participant) => sum + parseFloat(participant.amount || '0'),
      0
    );
  };

  const totalSplit = calculateTotalSplit();
  const difference = Math.abs(totalSplit - totalAmount);

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
        <Text style={[styles.totalText, { color: theme.textSecondary }]}>
          Total: {totalSplit.toFixed(2)} / {totalAmount.toFixed(2)}
        </Text>
      </View>

      {difference > 0.01 && (
        <Text style={[styles.warningText, { color: '#FF9500' }]}>
          Split amounts must sum to total amount (difference:{' '}
          {difference.toFixed(2)})
        </Text>
      )}

      {participants.map(participant => (
        <View key={participant.id} style={styles.participantRow}>
          <TextInput
            style={[
              styles.input,
              styles.nameInput,
              {
                backgroundColor: theme.cardBackground,
                color: theme.textPrimary,
                borderColor: theme.border,
              },
            ]}
            value={participant.name}
            onChangeText={value =>
              updateParticipant(participant.id, 'name', value)
            }
            placeholder="Name"
            placeholderTextColor={theme.textTertiary}
          />
          <TextInput
            style={[
              styles.input,
              styles.amountInput,
              {
                backgroundColor: theme.cardBackground,
                color: theme.textPrimary,
                borderColor: theme.border,
              },
            ]}
            value={participant.amount}
            onChangeText={value =>
              updateParticipant(participant.id, 'amount', value)
            }
            placeholder="Amount"
            placeholderTextColor={theme.textTertiary}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: theme.danger }]}
            onPress={() => removeParticipant(participant.id)}
          >
            <Text style={styles.removeText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={addParticipant}
      >
        <Text style={styles.addText}>+ Add Participant</Text>
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
  totalText: {
    fontSize: 14,
  },
  warningText: {
    fontSize: 14,
    marginBottom: 10,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
  },
  nameInput: {
    flex: 2,
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#FFFFFF',
    fontSize: 20,
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

export default ParticipantSelector;
