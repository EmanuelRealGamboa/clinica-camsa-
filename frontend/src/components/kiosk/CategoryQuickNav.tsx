import React from 'react';
import type { ProductCategory } from '../../types';
import { colors } from '../../styles/colors';

interface CategoryQuickNavProps {
  categories: ProductCategory[];
  onCategoryClick: (categoryId: number) => void;
  orderLimits?: { DRINK?: number; SNACK?: number };
  currentCounts?: Map<string, number>; // Current items in cart + active orders per category type
}

export const CategoryQuickNav: React.FC<CategoryQuickNavProps> = ({
  categories,
  onCategoryClick,
  orderLimits = {},
  currentCounts = new Map(),
}) => {
  // Get limit info for a category
  const getLimitInfo = (category: ProductCategory) => {
    const categoryType = category.category_type;
    if (!categoryType || categoryType === 'OTHER') return null;

    // FOOD has no limit
    if (categoryType === 'FOOD') {
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
              onClick={() => onCategoryClick(category.id)}
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
    padding: '24px 40px',
    backgroundColor: colors.white,
    marginBottom: '24px',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: colors.black,
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: colors.gray,
    margin: 0,
  },
  navContainer: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  categoryButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 24px',
    backgroundColor: colors.grayBg,
    border: `2px solid transparent`,
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '120px',
  },
  categoryButtonDisabled: {
    opacity: 0.6,
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: colors.primaryLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  icon: {
    fontSize: '32px',
  },
  categoryName: {
    fontSize: '16px',
    fontWeight: '600',
    color: colors.black,
    textAlign: 'center',
  },
  limitBadge: {
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .category-nav-button:hover {
    border-color: ${colors.primary} !important;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .category-nav-button:hover .icon-wrapper {
    background-color: ${colors.primary} !important;
  }

  .category-nav-button:active {
    transform: translateY(-2px);
  }
`;
if (!document.head.querySelector('[data-category-nav-styles]')) {
  styleSheet.setAttribute('data-category-nav-styles', 'true');
  document.head.appendChild(styleSheet);
}
