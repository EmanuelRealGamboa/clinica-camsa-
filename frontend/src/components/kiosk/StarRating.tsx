import React from 'react';
import { colors } from '../../styles/colors';

interface StarRatingProps {
  rating: number; // 0-5
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  count?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 'medium',
  showCount = false,
  count,
}) => {
  const sizes = {
    small: 14,
    medium: 18,
    large: 32,
  };

  const starSize = sizes[size];

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} style={{ color: colors.primary, fontSize: `${starSize}px` }}>
          ★
        </span>
      );
    }

    // Half star
    if (hasHalfStar && fullStars < 5) {
      stars.push(
        <span key="half" style={{ color: colors.primary, fontSize: `${starSize}px`, position: 'relative' }}>
          <span style={{ position: 'absolute', overflow: 'hidden', width: '50%' }}>★</span>
          <span style={{ color: colors.grayLight }}>★</span>
        </span>
      );
    }

    // Empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} style={{ color: colors.grayLight, fontSize: `${starSize}px` }}>
          ★
        </span>
      );
    }

    return stars;
  };

  return (
    <div style={styles.container}>
      <div style={styles.stars}>{renderStars()}</div>
      {showCount && count !== undefined && (
        <span style={{ ...styles.count, fontSize: size === 'small' ? '12px' : '14px' }}>
          {Number(rating).toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stars: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    lineHeight: 1,
  },
  count: {
    color: colors.gray,
    fontWeight: 'normal',
  },
};
