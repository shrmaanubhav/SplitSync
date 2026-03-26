import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface RatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  maxRating?: number;
  readonly?: boolean;
  style?: any;
}

const Rating: React.FC<RatingProps> = ({
  rating,
  onRatingChange,
  maxRating = 5,
  readonly = false,
  style,
}) => {
  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => !readonly && onRatingChange && onRatingChange(i)}
          disabled={readonly}
          style={styles.star}
        >
          <Text style={[styles.starText, i <= rating && styles.filledStar]}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }

    return stars;
  };

  return (
    <View style={[styles.container, style]}>
      {renderStars()}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
  starText: {
    fontSize: 24,
    color: '#C7C7CC',
  },
  filledStar: {
    color: '#FFCC00',
  },
  ratingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default Rating;
