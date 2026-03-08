import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';
import type { Product } from '../../types';
import { StarRating } from './StarRating';
import { useWindowSize } from '../../utils/responsive';

const GOLD = '#C9A227';
const GOLD_LIGHT = '#E8C547';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
  variant?: 'carousel' | 'grid';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  variant = 'grid',
}) => {
  const { isMobile } = useWindowSize();
  const [added, setAdded] = useState(false);
  const isOutOfStock = product.is_available === false;
  const mainBenefit = product.benefits && product.benefits.length > 0 ? product.benefits[0] : null;
  const mainTag = product.tags && product.tags.length > 0 ? product.tags[0] : null;
  const isFood = product.category_type === 'FOOD';
  const hasPrice = isFood && product.price !== undefined && product.price !== null && product.price > 0;

  const isCarousel = variant === 'carousel';
  const isMobileCarousel = isMobile && isCarousel;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    setAdded(true);
    onAddToCart(product.id);
    setTimeout(() => setAdded(false), 1100);
  };

  const cardWidth = isMobileCarousel ? '160px' : isCarousel ? '280px' : undefined;

  return (
    <motion.div
      whileHover={!isOutOfStock ? { y: -4, scale: 1.01 } : {}}
      whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{
        ...cardBase,
        minWidth: cardWidth,
        maxWidth: cardWidth,
        opacity: isOutOfStock ? 0.6 : 1,
      }}
    >
      {/* Image */}
      <div style={{
        ...imageWrap,
        height: isMobileCarousel ? '110px' : '200px',
      }}>
        {product.image_url_full && (
          <img
            src={product.image_url_full}
            alt={product.name}
            style={{
              ...imageStyle,
              filter: isOutOfStock ? 'grayscale(90%) brightness(0.75)' : 'none',
            }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        )}

        {mainTag && !isOutOfStock && (
          <div style={{ ...tagBadge, backgroundColor: mainTag.color }}>
            {mainTag.icon && <span style={{ marginRight: '4px' }}>{mainTag.icon}</span>}
            {mainTag.name}
          </div>
        )}

        {isFood && !isOutOfStock && !mainTag && (
          <div style={{ ...tagBadge, backgroundColor: '#C4722A' }}>
            Pago adicional
          </div>
        )}

        {isOutOfStock && (
          <div style={outOfStockOverlay}>
            <span style={outOfStockText}>AGOTADO</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{
        ...contentStyle,
        padding: isMobileCarousel ? '10px 10px 0' : '16px 16px 0',
        gap: isMobileCarousel ? '4px' : '6px',
      }}>
        <h3 style={{
          ...titleStyle,
          fontSize: isMobileCarousel ? '13px' : '16px',
        }}>
          {product.name}
        </h3>

        {!isMobileCarousel && (
          <p style={descStyle}>{product.description}</p>
        )}

        {hasPrice && !isMobileCarousel && (
          <div style={priceRow}>
            <span style={priceLabel}>Precio:</span>
            <span style={priceValue}>{formatPrice(product.price!)}</span>
          </div>
        )}

        {mainBenefit && !isOutOfStock && !isMobileCarousel && (
          <div style={benefitChip}>
            <span style={{ fontSize: '14px' }}>{mainBenefit.icon}</span>
            <span style={benefitText}>{mainBenefit.text}</span>
          </div>
        )}

        {product.rating !== undefined && product.rating > 0 && !isMobileCarousel && (
          <div style={{ marginBottom: '4px' }}>
            <StarRating rating={product.rating} size="large" showCount={false} count={product.rating_count} />
          </div>
        )}
      </div>

      {/* Action */}
      <div style={{
        padding: isMobileCarousel ? '8px 10px 10px' : '10px 16px 16px',
      }}>
        {isOutOfStock ? (
          <button style={disabledBtn} disabled>
            No disponible
          </button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            style={{
              ...addBtn,
              background: added ? `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)` : '#fff',
              color: added ? '#fff' : '#1a1a1a',
              padding: isMobileCarousel ? '8px 6px' : '12px 16px',
              fontSize: isMobileCarousel ? '12px' : '14px',
            }}
            onClick={handleAddToCart}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                >
                  <Check size={isMobileCarousel ? 13 : 16} />
                  {!isMobileCarousel && '¡Agregado!'}
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                >
                  <ShoppingCart size={isMobileCarousel ? 13 : 15} />
                  {isMobileCarousel
                    ? 'Agregar'
                    : (isFood ? 'Agregar (Pago)' : 'Agregar a la Orden')}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

/* ── Styles ─────────────────────────────────────────── */

const cardBase: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid rgba(212, 175, 55, 0.15)',
  cursor: 'pointer',
  position: 'relative',
  transition: 'box-shadow 0.2s, transform 0.2s',
};

const imageWrap: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  backgroundColor: '#FAFAF5',
  overflow: 'hidden',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
  transition: 'transform 0.3s ease',
  padding: '8px',
};

const tagBadge: React.CSSProperties = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  color: '#fff',
  padding: '4px 9px',
  borderRadius: '999px',
  fontSize: '10px',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  zIndex: 2,
};

const outOfStockOverlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3,
};

const outOfStockText: React.CSSProperties = {
  color: '#fff',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '2px',
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 700,
  color: '#1a1a1a',
  margin: 0,
  lineHeight: 1.3,
};

const descStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#777',
  margin: 0,
  lineHeight: 1.5,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const priceRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: '#FAFAF5',
  padding: '7px 10px',
  borderRadius: '8px',
  border: '1px solid rgba(212, 175, 55, 0.12)',
};

const priceLabel: React.CSSProperties = {
  fontSize: '13px',
  color: '#888',
  fontWeight: 500,
};

const priceValue: React.CSSProperties = {
  fontSize: '17px',
  fontWeight: 700,
  color: '#1a1a1a',
};

const benefitChip: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  backgroundColor: '#FAFAF5',
  padding: '6px 10px',
  borderRadius: '8px',
  border: '1px solid rgba(212, 175, 55, 0.12)',
};

const benefitText: React.CSSProperties = {
  fontSize: '12px',
  color: '#777',
  fontWeight: 500,
};

const addBtn: React.CSSProperties = {
  width: '100%',
  border: '1px solid rgba(212, 175, 55, 0.2)',
  borderRadius: '10px',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'box-shadow 0.2s',
  boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
  letterSpacing: '0.2px',
  fontFamily: 'inherit',
};

const disabledBtn: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: '#f5f5f0',
  color: '#bbb',
  border: '1px solid #eee',
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'not-allowed',
  fontFamily: 'inherit',
};
