// FormInputWrapper Component - Reduces boilerplate for react-hook-form Controller components

import React from 'react';
import { Controller, useFormContext, FieldValues } from 'react-hook-form';
import { TextInput, TextInputProps } from 'react-native';
import { getCurrentTheme } from '../services/theme.service';

interface FormInputWrapperProps extends TextInputProps {
  name: string;
  rules?: any;
  defaultValue?: any;
  render?: (props: any) => React.ReactNode;
}

const FormInputWrapper: React.FC<FormInputWrapperProps> = ({
  name,
  rules,
  defaultValue,
  render,
  style,
  ...textInputProps
}) => {
  const { control } = useFormContext<FieldValues>();
  const theme = getCurrentTheme();

  // Check if control is available (inside FormProvider)
  if (!control) {
    console.warn('FormInputWrapper must be used within a FormProvider');
    // Fallback to regular TextInput if not inside FormProvider
    return <TextInput {...textInputProps} style={style} />;
  }

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => {
        const commonProps = {
          onChange,
          onBlur,
          value,
        };

        // Handle error styling
        const errorStyle = error
          ? {
              borderColor: theme.danger,
              borderWidth: 2,
            }
          : {};

        if (render) {
          return render({
            ...commonProps,
            ...textInputProps,
            error: error?.message,
            style: [style, errorStyle],
          }) as React.ReactElement;
        }

        return (
          <TextInput
            {...textInputProps}
            {...commonProps}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value?.toString() || ''}
            style={[style, errorStyle]}
          />
        );
      }}
    />
  );
};

export default FormInputWrapper;
