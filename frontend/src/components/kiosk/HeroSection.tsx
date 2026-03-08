import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Sparkles, Coffee } from 'lucide-react';
import type { Product } from '../../types';
import { useWindowSize } from '../../utils/responsive';

const GOLD = '#C9A227';
const GOLD_LIGHT = '#E8C547';
const GOLD_DARK = '#B8860B';

interface HeroSectionProps {
  product: Product;
  onAddToCart: (productId: number) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ product, onAddToCart }) => {
  const { isMobile } = useWindowSize();
  const title = product.featured_title || product.name;
  const description = product.featured_description || product.description;
  const isOutOfStock = product.is_available === false;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...heroContainer,
        margin: isMobile ? '12px' : '20px auto',
        maxWidth: '1200px',
        borderRadius: isMobile ? '18px' : '24px',
        flexDirection: isMobile ? 'column' : 'row',
        padding: isMobile ? '24px 18px' : '40px 48px',
        gap: isMobile ? '24px' : '48px',
      }}
    >
      {/* Content left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ ...contentArea, maxWidth: isMobile ? '100%' : '480px', textAlign: isMobile ? 'center' : 'left' }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start', marginBottom: '16px' }}
        >
          <div style={badge}>
            <Sparkles size={13} style={{ marginRight: '6px', color: GOLD_DARK }} />
            PRODUCTO ESPECIAL DEL MES
          </div>
        </motion.div>

        {/* Title */}
        <h1 style={{ ...heroTitle, fontSize: isMobile ? '30px' : '44px' }}>{title}</h1>

        {/* Unit label */}
        {product.unit_label && (
          <p style={unitLabel}>{product.unit_label}</p>
        )}

        {/* Description */}
        <p style={{ ...heroDescription, fontSize: isMobile ? '14px' : '16px' }}>{description}</p>

        {/* Benefits Pills */}
        {product.benefits && product.benefits.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            style={{
              ...benefitsContainer,
              justifyContent: isMobile ? 'center' : 'flex-start',
              marginBottom: isMobile ? '20px' : '24px',
            }}
          >
            {product.benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.07 }}
                style={benefitPill}
              >
                <span style={{ fontSize: '14px' }}>{benefit.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>{benefit.text}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Rating */}
        {product.rating !== undefined && product.rating > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', justifyContent: isMobile ? 'center' : 'flex-start' }}
          >
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={16} fill={s <= Math.round(product.rating!) ? GOLD : 'none'} color={GOLD} />
            ))}
            <span style={{ fontSize: '13px', color: '#888', marginLeft: '4px' }}>
              {Number(product.rating).toFixed(1)}
            </span>
          </motion.div>
        )}

        {/* CTA */}
        {!isOutOfStock ? (
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
            style={{ ...ctaButton, width: isMobile ? '100%' : 'auto' }}
            onClick={() => onAddToCart(product.id)}
          >
            <ShoppingCart size={18} style={{ marginRight: '10px' }} />
            Ordenar Ahora
          </motion.button>
        ) : (
          <button style={{ ...ctaButtonDisabled, width: isMobile ? '100%' : 'auto' }} disabled>
            <Coffee size={18} style={{ marginRight: '8px', opacity: 0.6 }} />
            Producto Agotado
          </button>
        )}
      </motion.div>

      {/* Image right */}
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        style={{
          ...imageWrapper,
          maxWidth: isMobile ? '100%' : '440px',
          minWidth: isMobile ? 'auto' : '340px',
          height: isMobile ? '240px' : '320px',
        }}
      >
        {product.image_url_full ? (
          <motion.img
            src={product.image_url_full}
            alt={product.name}
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            style={{
              ...heroImage,
              filter: isOutOfStock ? 'grayscale(90%) brightness(0.7)' : 'none',
              opacity: isOutOfStock ? 0.6 : 1,
            }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div style={imagePlaceholder}>
            <Coffee size={56} color="#ccc" />
          </div>
        )}
        {isOutOfStock && (
          <div style={outOfStockOverlay}>
            <span style={outOfStockText}>Agotado</span>
          </div>
        )}
      </motion.div>
    </motion.section>
  );
};

/* ── Styles ─────────────────────────────────────────── */

const heroContainer: React.CSSProperties = {
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(201, 168, 76, 0.12)',
  border: '1px solid rgba(212, 175, 55, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box',
};

const contentArea: React.CSSProperties = {
  flex: 1,
  position: 'relative',
  zIndex: 1,
};

const badge: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: 'rgba(212, 175, 55, 0.1)',
  color: GOLD_DARK,
  padding: '7px 16px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '1.2px',
  border: '1px solid rgba(212, 175, 55, 0.25)',
};

const heroTitle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 700,
  color: '#1a1a1a',
  margin: '0 0 8px 0',
  lineHeight: 1.15,
};

const unitLabel: React.CSSProperties = {
  fontSize: '13px',
  color: '#999',
  margin: '0 0 12px 0',
  fontWeight: 500,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
};

const heroDescription: React.CSSProperties = {
  color: '#666',
  margin: '0 0 20px 0',
  lineHeight: 1.6,
  fontWeight: 400,
};

const benefitsContainer: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
};

const benefitPill: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  backgroundColor: '#FAFAF5',
  padding: '8px 14px',
  borderRadius: '999px',
  border: '1px solid rgba(212, 175, 55, 0.2)',
};

const ctaButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '14px 36px',
  background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
  color: '#fff',
  border: 'none',
  borderRadius: '999px',
  fontSize: '16px',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 4px 18px rgba(212, 175, 55, 0.3)',
  letterSpacing: '0.3px',
  fontFamily: 'inherit',
};

const ctaButtonDisabled: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '14px 36px',
  backgroundColor: '#eee',
  color: '#999',
  border: '1px solid #ddd',
  borderRadius: '999px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'not-allowed',
  fontFamily: 'inherit',
};

const imageWrapper: React.CSSProperties = {
  flex: 1,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '16px',
  overflow: 'hidden',
  backgroundColor: '#FAFAF5',
};

const heroImage: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '16px',
  display: 'block',
};

const imagePlaceholder: React.CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: '16px',
  backgroundColor: '#f5f5f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const outOfStockOverlay: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'rgba(0,0,0,0.7)',
  padding: '12px 28px',
  borderRadius: '999px',
  zIndex: 2,
};

const outOfStockText: React.CSSProperties = {
  color: '#fff',
  fontSize: '18px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '2px',
};
