import React from 'react';
import { colors } from '../../styles/colors';
import type { ProductCategory, CategoryType } from '../../types';

interface CategoryCardProps {
  category: ProductCategory;
  currentCount: number; // Items already ordered/in cart for this category type
  limit: number | null; // null means no limit (for FOOD)
  onClick: () => void;
  disabled?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  currentCount,
  limit,
  onClick,
  disabled = false,
}) => {
  const isFood = category.category_type === 'FOOD';
  const isLimitReached = limit !== null && currentCount >= limit;
  const isDisabled = disabled || (isLimitReached && !isFood);

  const getStatusText = () => {
    if (isFood) {
      return 'Sin límite - Se paga aparte';
    }
    if (limit === null) {
      return 'Sin límite';
    }
    if (isLimitReached) {
      return 'Límite alcanzado';
    }
    return `${currentCount}/${limit} seleccionados`;
  };

  const getProgressPercentage = () => {
    if (limit === null || limit === 0) return 0;
    return Math.min((currentCount / limit) * 100, 100);
  };

  return (
    <div
      style={{
        ...styles.card,
        ...(isDisabled && !isFood ? styles.cardDisabled : {}),
        ...(isFood ? styles.cardFood : {}),
        cursor: isDisabled && !isFood ? 'not-allowed' : 'pointer',
      }}
      onClick={() => !isDisabled && onClick()}
    >
      {/* Icon */}
      <div style={styles.iconContainer}>
        <span style={styles.icon}>{category.icon || '📦'}</span>
      </div>

      {/* Category Name */}
      <h2 style={styles.name}>{category.name}</h2>

      {/* Status/Limit Indicator */}
      <div style={styles.statusContainer}>
        {!isFood && limit !== null && (
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${getProgressPercentage()}%`,
                backgroundColor: isLimitReached ? colors.gray : colors.primary,
              }}
            />
          </div>
        )}
        <p style={{
          ...styles.statusText,
          color: isFood ? colors.primary : (isLimitReached ? colors.gray : colors.black),
        }}>
          {getStatusText()}
        </p>
      </div>

      {/* Product Count */}
      <p style={styles.productCount}>
        {category.product_count || 0} productos disponibles
      </p>

      {/* Food Badge */}
      {isFood && (
        <div style={styles.foodBadge}>
          💰 Pago adicional
        </div>
      )}

      {/* Limit Reached Overlay */}
      {isLimitReached && !isFood && (
        <div style={styles.limitOverlay}>
          <span style={styles.limitIcon}>✓</span>
          <span>Ya seleccionaste tu {category.category_type === 'DRINK' ? 'bebida' : 'snack'}</span>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    position: 'relative',
    backgroundColor: colors.white,
    borderRadius: '24px',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    minHeight: '280px',
    overflow: 'hidden',
  },
  cardDisabled: {
    opacity: 0.6,
    filter: 'grayscale(50%)',
  },
  cardFood: {
    border: `3px solid ${colors.primary}`,
    backgroundColor: '#f8fff8',
  },
  iconContainer: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: colors.primaryLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  icon: {
    fontSize: '64px',
  },
  name: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: colors.black,
    margin: '0 0 16px 0',
    textAlign: 'center',
  },
  statusContainer: {
    width: '100%',
    marginBottom: '12px',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: colors.grayBg,
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  statusText: {
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'center',
    margin: 0,
  },
  productCount: {
    fontSize: '14px',
    color: colors.gray,
    margin: 0,
  },
  foodBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: colors.primary,
    color: colors.white,
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  limitOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '24px',
    gap: '12px',
  },
  limitIcon: {
    fontSize: '48px',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
