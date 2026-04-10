import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormProvider, useForm, SubmitHandler } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import firestore from '@react-native-firebase/firestore';

import Button from '../components/Button';
import { useStore } from '../store/useStore';
import Screen from '../components/Screen';
import Avatar from '../components/Avatar';
import FormInputWrapper from '../components/FormInputWrapper';
import { getCurrentTheme } from '../services/theme.service';

// ---------- TYPES ----------
type RootStackParamList = {
  Profile: undefined;
};

type NavigationPropType = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

interface ProfileFormData {
  name: string;
  bio: string | null;
  upiId: string | null; // 🚨 Added UPI ID
}

// ---------- VALIDATION ----------
const schema: yup.ObjectSchema<ProfileFormData> = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters').max(50),
  bio: yup.string().nullable().default(''),
  // 🚨 Make it optional, but if entered, ensure it looks somewhat like a VPA (contains an '@')
  upiId: yup.string()
    .nullable()
    .test('is-valid-upi', 'UPI ID must contain an @ symbol', (value) => {
      if (!value) return true; // It's optional, so empty is fine
      return value.includes('@');
    })
    .default(''),
});

// ---------- COMPONENT ----------
const EditProfileScreen = () => {
  const navigation = useNavigation<NavigationPropType>();
  const { user, setUser } = useStore();
  const [loading, setLoading] = useState(false);

  const theme = getCurrentTheme();

  const methods = useForm<ProfileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio ?? '',
      upiId: user?.upiId ?? '', // 🚨 Pre-fill if exists
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    watch,
  } = methods;

  const bioValue = watch('bio') || '';
  const nameValue = watch('name') || '';

// ---------- SUBMIT ----------
  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    if (!user?._id) return;

    // Clean it up: lowercase and trim spaces
    const cleanUpiId = (data.upiId || '').trim().toLowerCase();

    // 1. Extract the actual saving process into a helper function
    const saveToDatabase = async () => {
      setLoading(true);
      try {
        await firestore()
          .collection('users')
          .doc(user._id)
          .update({
            name: data.name.trim(),
            bio: data.bio || '',
            upiId: cleanUpiId, // Save to Firestore
          });

        setUser({
          ...user,
          name: data.name,
          bio: data.bio || '',
          upiId: cleanUpiId, // Save to local Zustand store
        } as any);

        Alert.alert('Success', 'Profile updated');
        navigation.goBack();
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Failed to update profile');
      } finally {
        setLoading(false);
      }
    };

    // 2. Check if they entered a NEW or CHANGED UPI ID
    if (cleanUpiId && cleanUpiId !== (user.upiId || '')) {
      // Pop the confirmation alert!
      Alert.alert(
        'Confirm UPI ID',
        `You entered:\n\n${cleanUpiId}\n\nIs this exactly correct? Friends will use this to send you real money.`,
        [
          { text: 'Let me edit', style: 'cancel' },
          { text: 'Yes, it is correct', onPress: saveToDatabase },
        ]
      );
    } else {
      // If no UPI ID was entered, or it didn't change, just save immediately
      saveToDatabase();
    }
  };

  // ---------- UI ----------
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar name={nameValue} size={100} variant="circular" />
        </View>

        <FormProvider {...methods}>
          <View style={styles.form}>
            {/* NAME */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>
                Name
              </Text>
              <FormInputWrapper
                name="name"
                style={[
                  styles.input,
                  { backgroundColor: theme.cardBackground, color: theme.textPrimary, borderColor: theme.border },
                ]}
                placeholder="Enter name"
                placeholderTextColor={theme.textSecondary}
              />
              {errors.name && (
                <Text style={[styles.errorText, { color: '#FF3B30' }]}>
                  {errors.name.message}
                </Text>
              )}
            </View>

            {/* BIO */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>
                Bio
              </Text>
              <FormInputWrapper
                name="bio"
                style={[
                  styles.textArea,
                  { backgroundColor: theme.cardBackground, color: theme.textPrimary, borderColor: theme.border },
                ]}
                placeholder="About you"
                multiline
                maxLength={500}
              />
              <Text style={{ color: theme.textSecondary, alignSelf: 'flex-end', marginTop: 4 }}>
                {bioValue.length}/500
              </Text>
              {errors.bio && (
                <Text style={[styles.errorText, { color: '#FF3B30' }]}>
                  {errors.bio.message}
                </Text>
              )}
            </View>

            {/* 🚨 UPI ID SECTION */}
            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.label, { color: theme.textPrimary }]}>
                  UPI ID
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                  Optional
                </Text>
              </View>
              <FormInputWrapper
                name="upiId"
                style={[
                  styles.input,
                  { backgroundColor: theme.cardBackground, color: theme.textPrimary, borderColor: theme.border },
                ]}
                placeholder="e.g. name@bank"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.upiId && (
                <Text style={[styles.errorText, { color: '#FF3B30' }]}>
                  {errors.upiId.message}
                </Text>
              )}
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>
                Allows friends to pay you back directly via Google Pay, PhonePe, etc.
              </Text>
            </View>

            {/* PHONE (Read Only) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>
                Phone
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.cardBackground, color: theme.textSecondary, borderColor: theme.border },
                ]}
                value={user?.phoneNumber || 'No phone added'} 
                editable={false}
              />
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>
                Phone number cannot be changed
              </Text>
            </View>

          </View>
        </FormProvider>

        {/* BUTTONS */}
        <View style={styles.buttonContainer}>
          <Button
            title="Save"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
          />
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12, 
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 10,
  },
  cancelButton: {
    marginTop: 12,
  },
});

export default EditProfileScreen;