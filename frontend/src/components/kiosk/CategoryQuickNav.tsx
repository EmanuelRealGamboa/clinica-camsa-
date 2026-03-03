import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductCategory } from '../../types';
import { useWindowSize } from '../../utils/responsive';
import { colors } from '../../styles/colors';

interface CategoryQuickNavProps {
  categories: ProductCategory[];
  onCategoryClick: (categoryId: number) => void;
  onFoodClick?: () => void;
  orderLimits?: { DRINK?: number; SNACK?: number };
  currentCounts?: Map<string, number>;
}

export const CategoryQuickNav: React.FC<CategoryQuickNavProps> = ({
  categories,
  onCategoryClick,
  onFoodClick,
  orderLimits = {},
  currentCounts = new Map(),
}) => {
  const { isMobile } = useWindowSize();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const getLimitInfo = (category: ProductCategory) => {
    const categoryType = category.category_type;
    const isFoodCategory =
      categoryType === 'FOOD' ||
      category.name.toLowerCase().includes('comida') ||
      category.name.toLowerCase().includes('ordenar');

    if (!categoryType || categoryType === 'OTHER') return null;
    if (isFoodCategory) return { hasLimit: false, text: 'Sin límite' };

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
      text: isReached ? 'Límite alcanzado' : `${remaining} disponible${remaining !== 1 ? 's' : ''}`,
    };
  };

  const handleCategoryClick = (category: ProductCategory) => {
    const isFoodCategory =
      category.category_type === 'FOOD' ||
      category.name.toLowerCase().includes('comida') ||
      category.name.toLowerCase().includes('ordenar');

    if (isFoodCategory && onFoodClick) {
      onFoodClick();
    } else {
      onCategoryClick(category.id);
    }
  };

  return (
    <section style={{
      ...containerStyle,
      padding: isMobile ? '24px 16px' : '36px 40px',
      marginBottom: isMobile ? '16px' : '24px',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '28px' }}
      >
        <h2 style={{ ...sectionTitle, fontSize: isMobile ? '20px' : '26px' }}>
          Categorías
        </h2>
        <p style={{ ...sectionSubtitle, fontSize: isMobile ? '13px' : '15px' }}>
          Selecciona una categoría para ver sus productos
        </p>
        {/* Gold accent */}
        <div style={goldAccent} />
      </motion.div>

      {/* Category buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, staggerChildren: 0.06 }}
        style={{
          ...navGrid,
          gap: isMobile ? '12px' : '16px',
        }}
      >
        {categories.map((category, index) => {
          const limitInfo = getLimitInfo(category);
          const isReached = limitInfo?.hasLimit && limitInfo?.isReached;
          const isHovered = hoveredId === category.id;

          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={!isReached ? { y: -5, scale: 1.04 } : {}}
              whileTap={!isReached ? { scale: 0.96 } : {}}
              onHoverStart={() => setHoveredId(category.id)}
              onHoverEnd={() => setHoveredId(null)}
              style={{
                ...catButton,
                padding: isMobile ? '14px 16px' : '20px 24px',
                minWidth: isMobile ? '90px' : '140px',
                opacity: isReached ? 0.5 : 1,
                cursor: isReached ? 'not-allowed' : 'pointer',
                borderColor: isHovered && !isReached ? colors.primary : 'rgba(201, 168, 76, 0.25)',
                backgroundColor: isHovered && !isReached
                  ? 'rgba(201, 168, 76, 0.12)'
                  : 'rgba(255, 255, 255, 0.06)',
                boxShadow: isHovered && !isReached
                  ? `0 8px 28px ${colors.shadowGold}`
                  : `0 2px 8px rgba(0,0,0,0.3)`,
              }}
              onClick={() => !isReached && handleCategoryClick(category)}
              aria-disabled={isReached}
            >
              {/* Icon circle */}
              <motion.div
                animate={{
                  backgroundColor: isHovered && !isReached ? colors.primary : 'rgba(201, 168, 76, 0.15)',
                }}
                transition={{ duration: 0.2 }}
                style={{
                  ...iconCircle,
                  width: isMobile ? '48px' : '64px',
                  height: isMobile ? '48px' : '64px',
                  borderRadius: isMobile ? '12px' : '16px',
                  border: `2px solid ${isHovered && !isReached ? colors.primaryDark : colors.primary}`,
                }}
              >
                {category.icon_image_url ? (
                  <img
                    src={category.icon_image_url}
                    alt={category.name}
                    style={{
                      width: isMobile ? 32 : 44,
                      height: isMobile ? 32 : 44,
                      objectFit: 'contain',
                      display: 'block',
                    }}
                    draggable={false}
                  />
                ) : (
                  <span style={{ fontSize: isMobile ? '22px' : '32px' }}>
                    {category.icon || '📦'}
                  </span>
                )}
              </motion.div>

              {/* Name */}
              <span style={{
                ...catName,
                fontSize: isMobile ? '12px' : '15px',
                color: isHovered && !isReached ? colors.goldLight : 'rgba(255,255,255,0.85)',
              }}>
                {category.name}
              </span>

              {/* Limit badge */}
              {limitInfo && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    ...limitBadge,
                    backgroundColor: limitInfo.hasLimit
                      ? (limitInfo.isReached ? '#E53935' : colors.primary)
                      : '#FFA726',
                    fontSize: isMobile ? '9px' : '11px',
                  }}
                >
                  {limitInfo.text}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
};

/* ─── Styles ─────────────────────────────────────────── */

const containerStyle: React.CSSProperties = {
  backgroundColor: 'rgba(30, 14, 6, 0.85)',
  borderTop: `1px solid rgba(201, 168, 76, 0.15)`,
  borderBottom: `1px solid rgba(201, 168, 76, 0.15)`,
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 700,
  color: colors.goldLight,
  margin: '0 0 6px 0',
};

const sectionSubtitle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.55)',
  margin: '0 0 14px 0',
};

const goldAccent: React.CSSProperties = {
  width: '48px',
  height: '3px',
  background: `linear-gradient(90deg, ${colors.goldGradientStart}, ${colors.goldGradientEnd})`,
  borderRadius: '2px',
  margin: '0 auto',
};

const navGrid: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
};

const catButton: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  border: `2px solid rgba(201, 168, 76, 0.25)`,
  borderRadius: '18px',
  transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s',
  fontFamily: 'inherit',
};

const iconCircle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s, border-color 0.2s',
  flexShrink: 0,
};

const catName: React.CSSProperties = {
  fontWeight: 600,
  textAlign: 'center',
  lineHeight: 1.3,
  transition: 'color 0.2s',
  color: 'rgba(255,255,255,0.85)',
};

const limitBadge: React.CSSProperties = {
  color: colors.white,
  padding: '4px 10px',
  borderRadius: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
};
