import React from 'react';
import type { ProductCategory } from '../../types';
import { colors } from '../../styles/colors';

interface CategoryQuickNavProps {
  categories: ProductCategory[];
  onCategoryClick: (categoryId: number) => void;
  onFoodClick?: () => void; // Special handler for FOOD category
  orderLimits?: { DRINK?: number; SNACK?: number };
  currentCounts?: Map<string, number>; // Current items in cart + active orders per category type
}

export const CategoryQuickNav: React.FC<CategoryQuickNavProps> = ({
  categories,
  onCategoryClick,
  onFoodClick,
  orderLimits = {},
  currentCounts = new Map(),
}) => {
  // Get limit info for a category
  const getLimitInfo = (category: ProductCategory) => {
    const categoryType = category.category_type;

    // Check if this is the FOOD category (by type or name)
    const isFoodCategory =
      categoryType === 'FOOD' ||
      category.name.toLowerCase().includes('comida') ||
      category.name.toLowerCase().includes('ordenar');

    if (!categoryType || categoryType === 'OTHER') return null;

    // FOOD has no limit
    if (isFoodCategory) {
      return { hasLimit: false, text: 'Sin limite' };
    }

    const limit = orderLimits[categoryType as 'DRINK' | 'SNACK'];
    if (!limit) return null;

    const current = currentCounts.get(categoryType) || 0;
    const remaining = Math.max(0, limit - current);
    const isReached = remaining === 0;

    return {
      hasLimit: true,
      current,
      limit,
      remaining,
      isReached,
      text: isReached ? 'Limite alcanzado' : `${remaining} disponible${remaining !== 1 ? 's' : ''}`,
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Categorias</h2>
        <p style={styles.subtitle}>Selecciona una categoria para ver sus productos</p>
      </div>

      <div style={styles.navContainer}>
        {categories.map((category) => {
          const limitInfo = getLimitInfo(category);
          const isLimitReached = limitInfo?.hasLimit && limitInfo?.isReached;

          return (
            <button
              key={category.id}
              style={{
                ...styles.categoryButton,
                ...(isLimitReached ? styles.categoryButtonDisabled : {}),
              }}
              onClick={() => {
                // If FOOD category and we have a special handler, use it
                // Check both category_type and name to be more robust
                const isFoodCategory =
                  category.category_type === 'FOOD' ||
                  category.name.toLowerCase().includes('comida') ||
                  category.name.toLowerCase().includes('ordenar');

                console.log('Category clicked:', {
                  name: category.name,
                  category_type: category.category_type,
                  isFoodCategory,
                  hasOnFoodClick: !!onFoodClick
                });

                if (isFoodCategory && onFoodClick) {
                  onFoodClick();
                } else {
                  onCategoryClick(category.id);
                }
              }}
              className="category-nav-button"
            >
              <div style={styles.iconWrapper}>
                <span style={styles.icon}>{category.icon || '📦'}</span>
              </div>
              <span style={styles.categoryName}>{category.name}</span>
              {limitInfo && (
                <span style={{
                  ...styles.limitBadge,
                  backgroundColor: limitInfo.hasLimit
                    ? (limitInfo.isReached ? '#ef5350' : colors.primary)
                    : '#ff9800',
                  color: colors.white,
                }}>
                  {limitInfo.text}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '32px 40px',
    backgroundColor: colors.white,
    marginBottom: '24px',
    boxShadow: `0 2px 12px ${colors.shadowGold}`,
    borderTop: `1px solid ${colors.primaryMuted}`,
    borderBottom: `1px solid ${colors.primaryMuted}`,
  },
  header: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  title: {
    fontSize: '26px',
    fontWeight: '600',
    color: colors.textPrimary,
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '15px',
    color: colors.textSecondary,
    margin: 0,
  },
  navContainer: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  categoryButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 28px',
    backgroundColor: colors.white,
    border: `2px solid ${colors.primaryMuted}`,
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '150px',
    boxShadow: `0 2px 8px ${colors.shadow}`,
  },
  categoryButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  iconWrapper: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: colors.primaryMuted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    border: `2px solid ${colors.primary}`,
  },
  icon: {
    fontSize: '36px',
  },
  categoryName: {
    fontSize: '16px',
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  limitBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '5px 12px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .category-nav-button {
    background-color: ${colors.white} !important;
  }

  .category-nav-button:hover {
    border-color: ${colors.primary} !important;
    background-color: ${colors.primaryMuted} !important;
    transform: translateY(-3px);
    box-shadow: 0 6px 20px ${colors.shadowGold};
  }

  .category-nav-button:hover .icon-wrapper {
    background-color: ${colors.primary} !important;
    border-color: ${colors.primaryDark} !important;
  }

  .category-nav-button:active {
    transform: translateY(-1px);
    background-color: ${colors.primary} !important;
  }

  .category-nav-button:active span {
    color: ${colors.white} !important;
  }
`;
if (!document.head.querySelector('[data-category-nav-styles]')) {
  styleSheet.setAttribute('data-category-nav-styles', 'true');
  document.head.appendChild(styleSheet);
}
