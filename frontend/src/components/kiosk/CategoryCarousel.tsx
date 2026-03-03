import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import type { ProductCategory, Product } from '../../types';
import { useWindowSize } from '../../utils/responsive';
import { colors, gradients } from '../../styles/colors';
import { StarRating } from './StarRating';

interface CategoryCarouselProps {
  category: ProductCategory;
  products: Product[];
  onAddToCart: (productId: number) => void;
  onViewAll: (categoryId: number) => void;
  showViewAllButton?: boolean;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  category,
  products,
  onAddToCart,
  onViewAll,
  showViewAllButton = true,
}) => {
  const { isMobile } = useWindowSize();
  const [activeIndex, setActiveIndex] = useState(0);
  const [addedId, setAddedId] = useState<number | null>(null);
  const dragStartX = useRef<number>(0);
  const isDragging = useRef(false);

  const goTo = useCallback((index: number) => {
    setActiveIndex((Math.max(0, Math.min(index, products.length - 1))));
  }, [products.length]);

  const prev = () => goTo(activeIndex > 0 ? activeIndex - 1 : products.length - 1);
  const next = () => goTo(activeIndex < products.length - 1 ? activeIndex + 1 : 0);

  const handleAddToCart = (productId: number) => {
    setAddedId(productId);
    onAddToCart(productId);
    setTimeout(() => setAddedId(null), 1200);
  };

  // Drag/swipe support
  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 60;
    if (info.offset.x < -threshold || info.velocity.x < -400) next();
    else if (info.offset.x > threshold || info.velocity.x > 400) prev();
  };

  if (products.length === 0) return null;

  const activeProduct = products[activeIndex];
  const isOutOfStock = activeProduct.is_available === false;
  const mainTag = activeProduct.tags && activeProduct.tags.length > 0 ? activeProduct.tags[0] : null;
  const isFood = activeProduct.category_type === 'FOOD';

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        ...sectionStyle,
        margin: isMobile ? '0 10px 12px' : '0 auto 20px',
        width: isMobile ? 'calc(100% - 24px)' : 'calc(100% - 40px)',
        borderRadius: isMobile ? '14px' : '20px',
        maxWidth: '1200px',
      }}
    >
      {/* Section Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '10px 12px' : '18px 32px',
        backgroundColor: colors.white,
        borderBottom: `1px solid ${colors.parchment}`,
        width: '100%',
        boxSizing: 'border-box',
        gap: isMobile ? '6px' : '8px',
      }}>
        {/* Left: icon + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '10px', minWidth: 0, overflow: 'hidden' }}>
          {(category.icon_image_url || category.icon) && (
            <div style={{
              ...iconBadge,
              width: isMobile ? '30px' : '46px',
              height: isMobile ? '30px' : '46px',
              flexShrink: 0,
              backgroundColor: colors.ivory,
              border: `1px solid ${colors.parchment}`,
            }}>
              {category.icon_image_url ? (
                <img
                  src={category.icon_image_url}
                  alt={category.name}
                  style={{
                    width: isMobile ? 22 : 30,
                    height: isMobile ? 22 : 30,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  draggable={false}
                />
              ) : (
                <span style={{ fontSize: isMobile ? '16px' : '24px' }}>{category.icon}</span>
              )}
            </div>
          )}
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h2 style={{
              ...sectionTitle,
              fontSize: isMobile ? '15px' : '22px',
              color: colors.textPrimary,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {category.name}
            </h2>
            {!isMobile && category.description && (
              <p style={{ ...sectionDesc, fontSize: '13px', color: colors.textMuted }}>
                {category.description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Ver todo chip */}
        {showViewAllButton && category.id > 0 && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              padding: isMobile ? '3px 10px' : '8px 18px',
              fontSize: isMobile ? '10px' : '14px',
              fontWeight: 600,
              borderRadius: '999px',
              backgroundColor: colors.ivory,
              color: colors.textSecondary,
              border: `1px solid ${colors.parchment}`,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              maxHeight: isMobile ? '22px' : undefined,
            }}
            onClick={() => onViewAll(category.id)}
          >
            Ver todo
          </motion.button>
        )}
      </div>

      {/* Spotlight Area — warm parchment body, image left, info right */}
      <div style={{
        ...spotlightWrapper,
        flexDirection: isMobile ? 'column' : 'row',
        padding: isMobile ? '14px' : '28px 32px',
        gap: isMobile ? '12px' : '40px',
        alignItems: isMobile ? 'stretch' : 'center',
        backgroundColor: colors.ivory,
      }}>
        {/* Image column — left side */}
        <motion.div
          key={activeProduct.id + '-img'}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={handleDragEnd}
          style={{
            ...imageColumn,
            width: isMobile ? '100%' : '45%',
            height: isMobile ? '190px' : '380px',
            cursor: 'grab',
            flexShrink: 0,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProduct.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              style={{ width: '100%', height: '100%', position: 'relative' }}
            >
              {activeProduct.image_url_full ? (
                <img
                  src={activeProduct.image_url_full}
                  alt={activeProduct.name}
                  style={{
                    ...productImage,
                    filter: isOutOfStock ? 'grayscale(90%) brightness(0.75)' : 'none',
                    opacity: isOutOfStock ? 0.7 : 1,
                  }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  draggable={false}
                />
              ) : (
                <div style={imageFallback} />
              )}

              {mainTag && !isOutOfStock && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ ...tagBadge, backgroundColor: mainTag.color }}
                >
                  {mainTag.icon && <span style={{ marginRight: '4px' }}>{mainTag.icon}</span>}
                  {mainTag.name}
                </motion.div>
              )}

              {isOutOfStock && <div style={outOfStockBadge}>Agotado</div>}

              {isMobile && products.length > 1 && (
                <div style={swipeHint}><span>← Desliza →</span></div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Info column — right side */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProduct.id + '-info'}
            initial={{ opacity: 0, x: isMobile ? 0 : 20, y: isMobile ? 10 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: isMobile ? 0 : -20, y: isMobile ? -10 : 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              ...infoColumn,
              flex: 1,
              width: isMobile ? '100%' : undefined,
              justifyContent: 'center',
            }}
          >
            <h3 style={{ ...productName, fontSize: isMobile ? '30px' : '38px' }}>
              {activeProduct.name}
            </h3>

            {activeProduct.unit_label && (
              <p style={{ ...unitLabel, fontSize: isMobile ? '11px' : '14px' }}>{activeProduct.unit_label}</p>
            )}

            <p style={{ ...productDesc, fontSize: isMobile ? '14px' : '24px', WebkitLineClamp: isMobile ? 2 : 5 }}>
              {activeProduct.description}
            </p>

            {activeProduct.benefits && activeProduct.benefits.length > 0 && (
              <div style={benefitsRow}>
                {activeProduct.benefits.slice(0, 3).map((b, i) => (
                  <div key={i} style={{ ...benefitChip, padding: isMobile ? '5px 10px' : '7px 14px' }}>
                    <span style={{ fontSize: isMobile ? '13px' : '16px' }}>{b.icon}</span>
                    <span style={{ fontSize: isMobile ? '11px' : '13px', color: colors.textSecondary, fontWeight: 500 }}>{b.text}</span>
                  </div>
                ))}
              </div>
            )}

            {activeProduct.rating !== undefined && activeProduct.rating > 0 && (
              <div style={{ display: 'flex' }}>
                <StarRating rating={activeProduct.rating} size="large" showCount={false} count={activeProduct.rating_count} />
              </div>
            )}

            {isOutOfStock ? (
              <button style={{ ...addButton, ...addButtonDisabled, fontSize: isMobile ? '14px' : '16px' }} disabled>
                No disponible
              </button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  ...addButton,
                  fontSize: isMobile ? '12px' : '16px',
                  padding: isMobile ? '10px 14px' : '16px 28px',
                  background: addedId === activeProduct.id ? gradients.gold : undefined,
                  backgroundColor: addedId === activeProduct.id ? undefined : colors.white,
                  color: addedId === activeProduct.id ? colors.white : colors.textPrimary,
                }}
                onClick={() => handleAddToCart(activeProduct.id)}
              >
                <AnimatePresence mode="wait">
                  {addedId === activeProduct.id ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      ✓ ¡Agregado!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <ShoppingCart size={isMobile ? 15 : 18} />
                      {isFood ? 'Agregar (Pago adicional)' : 'Agregar a la Orden'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation: arrows + dots */}
      {products.length > 1 && !isMobile && (
        <div style={{ ...navRow, padding: isMobile ? '0 20px 16px' : '0 32px 20px' }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            style={arrowBtn}
            onClick={prev}
            aria-label="Anterior"
          >
            <ChevronLeft size={20} color={colors.primary} />
          </motion.button>

          <div style={dotsContainer}>
            {products.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => goTo(i)}
                animate={{
                  width: i === activeIndex ? 28 : 8,
                  backgroundColor: i === activeIndex ? colors.primaryLight : colors.parchment,
                }}
                transition={{ duration: 0.3 }}
                style={dot}
                aria-label={`Ir a producto ${i + 1}`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            style={arrowBtn}
            onClick={next}
            aria-label="Siguiente"
          >
            <ChevronRight size={20} color={colors.primary} />
          </motion.button>

          <span style={counter}>{activeIndex + 1} / {products.length}</span>
        </div>
      )}

      {/* Thumbnail strip */}
      {products.length > 1 && !isMobile && (
        <div style={{ ...thumbStrip, padding: isMobile ? '0 20px 16px' : '0 32px 20px' }}>
          {products.map((p, i) => (
            <motion.button
              key={p.id}
              onClick={() => goTo(i)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                borderColor: i === activeIndex ? colors.primary : colors.parchment,
                opacity: i === activeIndex ? 1 : 0.55,
              }}
              transition={{ duration: 0.2 }}
              style={thumbBtn}
              aria-label={p.name}
            >
              {p.image_url_full ? (
                <img
                  src={p.image_url_full}
                  alt={p.name}
                  style={thumbImg}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  draggable={false}
                />
              ) : (
                <div style={{ ...thumbImg, backgroundColor: colors.cream }} />
              )}
            </motion.button>
          ))}
        </div>
      )}
    </motion.section>
  );
};

/* ─── Styles ─────────────────────────────────────────── */

const sectionStyle: React.CSSProperties = {
  backgroundColor: colors.ivory,
  border: `1px solid ${colors.parchment}`,
  boxShadow: `0 6px 24px ${colors.shadow}`,
  overflow: 'hidden',
};

const sectionHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  boxSizing: 'border-box',
};

const headerLeft: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const iconBadge: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  backgroundColor: colors.primaryMuted,
  border: `2px solid ${colors.primary}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const sectionTitle: React.CSSProperties = {
  fontWeight: 700,
  color: colors.espresso,
  margin: 0,
  fontFamily: 'var(--font-serif)',
};

const sectionDesc: React.CSSProperties = {
  fontSize: '11px',
  color: colors.textSecondary,
  margin: '2px 0 0 0',
};

const viewAllBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '7px 14px',
  backgroundColor: colors.white,
  color: colors.primary,
  border: `2px solid ${colors.primary}`,
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  flexShrink: 0,
};

/* Horizontal spotlight — image left, info right */
const spotlightWrapper: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const imageColumn: React.CSSProperties = {
  position: 'relative',
  borderRadius: '16px',
  overflow: 'hidden',
  backgroundColor: colors.cream,
  flexShrink: 0,
};

const productImage: React.CSSProperties = {
  width: '100%',
  height: '100%',
  /* contain — entire image visible, no cropping */
  objectFit: 'contain',
  padding: '8px',
  display: 'block',
  userSelect: 'none',
};

const imageFallback: React.CSSProperties = {
  width: '100%',
  height: '100%',
  backgroundColor: colors.parchment,
};

const tagBadge: React.CSSProperties = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  color: colors.white,
  padding: '4px 9px',
  borderRadius: '20px',
  fontSize: '10px',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  boxShadow: `0 1px 4px rgba(0,0,0,0.12)`,
};

const outOfStockBadge: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(44, 24, 16, 0.52)',
  color: colors.white,
  fontSize: '16px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '2px',
};

const swipeHint: React.CSSProperties = {
  position: 'absolute',
  bottom: '8px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(26, 15, 10, 0.50)',
  color: 'rgba(255,255,255,0.85)',
  padding: '3px 10px',
  borderRadius: '20px',
  fontSize: '10px',
  fontWeight: 500,
  pointerEvents: 'none',
};

/* Info column — right side on desktop, below image on mobile */
const infoColumn: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const productName: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 700,
  color: colors.espresso,
  margin: 0,
  lineHeight: 1.25,
};

const unitLabel: React.CSSProperties = {
  fontSize: '11px',
  color: colors.textMuted,
  margin: 0,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const productDesc: React.CSSProperties = {
  color: colors.latte,
  margin: 0,
  lineHeight: 1.6,
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  fontWeight: 500,
};

const benefitsRow: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
};

const benefitChip: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  backgroundColor: colors.white,
  padding: '5px 10px',
  borderRadius: '6px',
  border: `1px solid ${colors.parchment}`,
};

/* Full-width button so it's always proportional to the card */
const addButton: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  width: '100%',
  padding: '12px 20px',
  border: `1px solid ${colors.parchment}`,
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'box-shadow 0.2s',
  boxShadow: `0 1px 6px ${colors.shadow}`,
  fontFamily: 'inherit',
  marginTop: '4px',
};

const addButtonDisabled: React.CSSProperties = {
  backgroundColor: colors.grayBg,
  color: colors.grayLight,
  borderColor: colors.grayLight,
  cursor: 'not-allowed',
  boxShadow: 'none',
};

const navRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  borderTop: `1px solid ${colors.parchment}`,
  paddingTop: '12px',
  backgroundColor: colors.ivory,
};

const arrowBtn: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: colors.white,
  border: `1px solid ${colors.parchment}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  boxShadow: `0 1px 6px ${colors.shadow}`,
};

const dotsContainer: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  flex: 1,
  justifyContent: 'center',
  flexWrap: 'wrap',
};

const dot: React.CSSProperties = {
  height: '7px',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

const counter: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: colors.textMuted,
  flexShrink: 0,
  minWidth: '36px',
  textAlign: 'right',
};

const thumbStrip: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  backgroundColor: colors.ivory,
  borderTop: `1px solid ${colors.parchment}`,
};

const thumbBtn: React.CSSProperties = {
  width: '52px',
  height: '52px',
  borderRadius: '8px',
  overflow: 'hidden',
  border: `2px solid transparent`,
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
  backgroundColor: colors.cream,
};

const thumbImg: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
  userSelect: 'none',
  padding: '3px',
};
