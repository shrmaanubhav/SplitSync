// Reusable Avatar Component

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface AvatarProps {
  name?: string;
  size?: 'small' | 'medium' | 'large' | number;
  variant?: 'circular' | 'rounded' | 'square';
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  editable?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'medium',
  variant = 'circular',
  onPress,
  style,
  textStyle,
  editable = false,
}) => {
  const getSize = () => {
    if (typeof size === 'number') {
      return size;
    }
    switch (size) {
      case 'small':
        return 40;
      case 'large':
        return 80;
      default:
        return 60;
    }
  };

  const getBorderRadius = () => {
    const sizeValue = getSize();
    switch (variant) {
      case 'circular':
        return sizeValue / 2;
      case 'rounded':
        return sizeValue / 4;
      case 'square':
        return 0;
      default:
        return sizeValue / 2;
    }
  };

  const avatarSize = getSize();
  const borderRadius = getBorderRadius();

  const avatarStyles = [
    styles.avatar,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: borderRadius,
      backgroundColor: '#FF7A45',
    },
    style,
  ];

  const textStyles = [
    styles.avatarText,
    {
      fontSize: avatarSize / 2.5,
    },
    textStyle,
  ];

  const content = (
    <View style={avatarStyles}>
      <Text style={textStyles}>{name?.charAt(0).toUpperCase() || 'U'}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={editable ? 0.7 : 1}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF7A45',
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default Avatar;
