// Edit Profile Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '../components/Button';
import { useStore } from '../store/useStore';
import Screen from '../components/Screen';
import Avatar from '../components/Avatar';
import FormInputWrapper from '../components/FormInputWrapper'; // Import FormInputWrapper
import { getCurrentTheme } from '../services/theme.service';
import api from '../services/api';

type RootStackParamList = {
  Profile: undefined;
};

type EditProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

// Define the form data type
interface ProfileFormData {
  name: string;
  bio?: string | null;
  email?: string | null;
}

// Create validation schema with yup
const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  bio: yup
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .nullable(),
  email: yup.string().email('Please enter a valid email').optional().nullable(),
});

const EditProfileScreen = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { user, setUser } = useStore();
  const [loading, setLoading] = useState(false);

  const theme = getCurrentTheme();

  // Initialize react-hook-form with yup resolver
  const methods = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      email: user?.email || '',
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    watch,
  } = methods;

  // Watch bio field to show character count
  const bioValue = watch('bio', user?.bio || '');

  const onSubmit = async (data: {
    name: string;
    bio?: string | null;
    email?: string | null;
  }) => {
    setLoading(true);
    try {
      // Update user profile
      const response = await api.put(`/users/${user?.id}/profile`, {
        name: data.name.trim(),
        bio: data.bio || undefined, // Send undefined to clear bio if empty
        email: data.email || undefined, // Send undefined to clear email if empty
      });

      // Update user in store
      setUser({
        ...user,
        name: response.data.name,
        bio: response.data.bio,
        email: response.data.email,
      } as any);

      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error: any) {
      console.error('Update profile error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarContainer}>
          <FormInputWrapper
            name="name"
            render={({ value }) => (
              <Avatar name={value} size={100} variant="circular" />
            )}
          />
          <Text style={[styles.changeAvatarText, { color: theme.primary }]}>
            Change Avatar
          </Text>
        </View>

        <FormProvider {...methods}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>
                Name
              </Text>
              <FormInputWrapper
                name="name"
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Enter your name"
                placeholderTextColor={theme.textSecondary}
              />
              {errors.name && (
                <Text style={[styles.errorText, { color: theme.danger }]}>
                  {errors.name.message}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>
                Bio
              </Text>
              <FormInputWrapper
                name="bio"
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Tell us about yourself"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text
                style={[styles.characterCount, { color: theme.textSecondary }]}
              >
                {(bioValue || '').length}/500
              </Text>
              {errors.bio && (
                <Text style={[styles.errorText, { color: theme.danger }]}>
                  {errors.bio.message}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>
                Email (Optional)
              </Text>
              <FormInputWrapper
                name="email"
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={[styles.errorText, { color: theme.danger }]}>
                  {errors.email.message}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>
                Phone Number
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.cardBackground,
                    color: theme.textSecondary,
                    borderColor: theme.border,
                  },
                ]}
                value={user?.phoneNumber || ''}
                editable={false}
                selectTextOnFocus={false}
              />
              <Text style={[styles.phoneNote, { color: theme.textSecondary }]}>
                Phone number cannot be changed
              </Text>
            </View>
          </View>
        </FormProvider>

        <View style={styles.buttonContainer}>
          <Button
            title="Save Changes"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  changeAvatarText: {
    fontSize: 16,
    fontWeight: '600',
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
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 2,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    height: 100,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  phoneNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  errorText: {
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 20,
  },
  cancelButton: {
    marginTop: 10,
  },
});

export default EditProfileScreen;