import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { ProductCategory } from '../../types';
import { useWindowSize } from '../../utils/responsive';

const GOLD = '#C9A227';
const GOLD_DARK = '#B8860B';

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
      padding: isMobile ? '20px 14px' : '32px 40px',
      margin: isMobile ? '0 12px 16px' : '0 auto 24px',
      maxWidth: '1200px',
      borderRadius: isMobile ? '16px' : '20px',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ textAlign: 'center', marginBottom: isMobile ? '16px' : '24px' }}
      >
        <h2 style={{ ...sectionTitle, fontSize: isMobile ? '18px' : '24px' }}>
          Categorías
        </h2>
        <p style={{ ...sectionSubtitle, fontSize: isMobile ? '12px' : '14px' }}>
          Selecciona una categoría para ver sus productos
        </p>
        <div style={goldAccent} />
      </motion.div>

      {/* Category grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        style={{
          ...navGrid,
          gap: isMobile ? '10px' : '14px',
        }}
      >
        {categories.map((category, index) => {
          const limitInfo = getLimitInfo(category);
          const isReached = limitInfo?.hasLimit && limitInfo?.isReached;
          const isHovered = hoveredId === category.id;

          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
              whileHover={!isReached ? { y: -4, scale: 1.03 } : {}}
              whileTap={!isReached ? { scale: 0.96 } : {}}
              onHoverStart={() => setHoveredId(category.id)}
              onHoverEnd={() => setHoveredId(null)}
              style={{
                ...catButton,
                padding: isMobile ? '12px 14px' : '18px 22px',
                minWidth: isMobile ? '85px' : '120px',
                opacity: isReached ? 0.45 : 1,
                cursor: isReached ? 'not-allowed' : 'pointer',
                borderColor: isHovered && !isReached ? GOLD : 'rgba(212, 175, 55, 0.2)',
                backgroundColor: isHovered && !isReached ? 'rgba(212, 175, 55, 0.06)' : '#fff',
                boxShadow: isHovered && !isReached
                  ? '0 6px 24px rgba(212, 175, 55, 0.18)'
                  : '0 2px 8px rgba(0,0,0,0.04)',
              }}
              onClick={() => !isReached && handleCategoryClick(category)}
              aria-disabled={isReached}
            >
              {/* Icon */}
              <div style={{
                ...iconCircle,
                width: isMobile ? '44px' : '56px',
                height: isMobile ? '44px' : '56px',
                borderRadius: isMobile ? '12px' : '14px',
                borderColor: isHovered && !isReached ? GOLD : 'rgba(212, 175, 55, 0.2)',
                backgroundColor: isHovered && !isReached ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.06)',
              }}>
                {category.icon_image_url ? (
                  <img
                    src={category.icon_image_url}
                    alt={category.name}
                    style={{
                      width: isMobile ? 28 : 36,
                      height: isMobile ? 28 : 36,
                      objectFit: 'contain',
                      display: 'block',
                    }}
                    draggable={false}
                  />
                ) : (
                  <span style={{ fontSize: isMobile ? '20px' : '28px' }}>
                    {category.icon || '📦'}
                  </span>
                )}
              </div>

              {/* Name */}
              <span style={{
                ...catName,
                fontSize: isMobile ? '12px' : '14px',
                color: isHovered && !isReached ? GOLD_DARK : '#444',
              }}>
                {category.name}
              </span>

              {/* Limit badge */}
              {limitInfo && (
                <span style={{
                  ...limitBadge,
                  backgroundColor: limitInfo.hasLimit
                    ? (limitInfo.isReached ? '#E53935' : GOLD)
                    : '#FFA726',
                  fontSize: isMobile ? '9px' : '10px',
                }}>
                  {limitInfo.text}
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
};

/* ── Styles ─────────────────────────────────────────── */

const containerStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid rgba(212, 175, 55, 0.15)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
  boxSizing: 'border-box',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 700,
  color: '#1a1a1a',
  margin: '0 0 6px 0',
};

const sectionSubtitle: React.CSSProperties = {
  color: '#999',
  margin: '0 0 12px 0',
};

const goldAccent: React.CSSProperties = {
  width: '40px',
  height: '2px',
  background: `linear-gradient(90deg, #E8C547, #B8860B)`,
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
  gap: '8px',
  border: '1px solid rgba(212, 175, 55, 0.2)',
  borderRadius: '16px',
  transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s',
  fontFamily: 'inherit',
};

const iconCircle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s, border-color 0.2s',
  flexShrink: 0,
  border: '1px solid rgba(212, 175, 55, 0.2)',
};

const catName: React.CSSProperties = {
  fontWeight: 600,
  textAlign: 'center',
  lineHeight: 1.3,
  transition: 'color 0.2s',
};

const limitBadge: React.CSSProperties = {
  color: '#fff',
  padding: '3px 8px',
  borderRadius: '999px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
  whiteSpace: 'nowrap',
};
