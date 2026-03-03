import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Sparkles, Coffee } from 'lucide-react';
import type { Product } from '../../types';
import { colors, gradients } from '../../styles/colors';
import { useWindowSize } from '../../utils/responsive';

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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...heroContainer,
        margin: isMobile ? '12px' : '20px',
        borderRadius: isMobile ? '20px' : '28px',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: isMobile ? 'auto' : '420px',
        padding: isMobile ? '28px 20px' : '48px 56px',
        gap: isMobile ? '28px' : '64px',
      }}
    >
      {/* Decorative background orbs */}
      <div style={orb1} />
      <div style={orb2} />

      {/* Content left */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ ...contentArea, maxWidth: isMobile ? '100%' : '520px', textAlign: isMobile ? 'center' : 'left' }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start', marginBottom: '20px' }}
        >
          <div style={badge}>
            <Sparkles size={13} style={{ marginRight: '6px', color: colors.primaryDark }} />
            Producto Especial del Mes
          </div>
        </motion.div>

        {/* Title */}
        <h1 style={{ ...heroTitle, fontSize: isMobile ? '34px' : '50px' }}>{title}</h1>

        {/* Unit label */}
        {product.unit_label && (
          <p style={unitLabel}>{product.unit_label}</p>
        )}

        {/* Description */}
        <p style={{ ...heroDescription, fontSize: isMobile ? '15px' : '17px' }}>{description}</p>

        {/* Benefits Pills */}
        {product.benefits && product.benefits.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              ...benefitsContainer,
              justifyContent: isMobile ? 'center' : 'flex-start',
              marginBottom: isMobile ? '24px' : '32px',
            }}
          >
            {product.benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.08 }}
                style={benefitPill}
              >
                <span style={{ fontSize: '15px' }}>{benefit.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: colors.espresso }}>{benefit.text}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Rating stars if available */}
        {product.rating !== undefined && product.rating > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '28px', justifyContent: isMobile ? 'center' : 'flex-start' }}
          >
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={16} fill={s <= Math.round(product.rating!) ? colors.primary : 'none'} color={colors.primary} />
            ))}
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginLeft: '4px' }}>
              {Number(product.rating).toFixed(1)}
            </span>
          </motion.div>
        )}

        {/* CTA Button */}
        {!isOutOfStock ? (
          <motion.button
            whileHover={{ scale: 1.04, y: -2, boxShadow: `0 10px 32px rgba(255,255,255,0.35)` }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
            style={{ ...ctaButton, width: isMobile ? '100%' : 'auto' }}
            onClick={() => onAddToCart(product.id)}
          >
            <ShoppingCart size={20} style={{ marginRight: '10px' }} />
            Ordenar Ahora
          </motion.button>
        ) : (
          <button style={{ ...ctaButtonDisabled, width: isMobile ? '100%' : 'auto' }} disabled>
            <Coffee size={18} style={{ marginRight: '8px', opacity: 0.7 }} />
            Producto Agotado
          </button>
        )}
      </motion.div>

      {/* Image right */}
      <motion.div
        initial={{ opacity: 0, x: 30, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          ...imageWrapper,
          maxWidth: isMobile ? '100%' : '480px',
          minWidth: isMobile ? 'auto' : '380px',
          height: isMobile ? '260px' : '340px',
        }}
      >
        {product.image_url_full ? (
          <>
            {/* Glow ring behind image */}
            <div style={imageGlow} />
            <motion.img
              src={product.image_url_full}
              alt={product.name}
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              style={{
                ...heroImage,
                filter: isOutOfStock ? 'grayscale(90%) brightness(0.7)' : 'none',
                opacity: isOutOfStock ? 0.65 : 1,
              }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            {isOutOfStock && (
              <div style={outOfStockOverlay}>
                <span style={outOfStockText}>Agotado</span>
              </div>
            )}
          </>
        ) : (
          <div style={imagePlaceholder}>
            <Coffee size={64} color={`rgba(255,255,255,0.35)`} />
          </div>
        )}
      </motion.div>
    </motion.section>
  );
};

/* ─── Styles ─────────────────────────────────────────── */

const heroContainer: React.CSSProperties = {
  background: `linear-gradient(135deg, #4A2C0A 0%, #2C1810 55%, #1A0F0A 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 12px 48px rgba(44, 24, 16, 0.35), 0 2px 8px rgba(201, 168, 76, 0.2)`,
  border: `1px solid rgba(201, 168, 76, 0.25)`,
  position: 'relative',
  overflow: 'hidden',
};

const orb1: React.CSSProperties = {
  position: 'absolute',
  top: '-80px',
  right: '-60px',
  width: '320px',
  height: '320px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(201, 168, 76, 0.18) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const orb2: React.CSSProperties = {
  position: 'absolute',
  bottom: '-60px',
  left: '-40px',
  width: '240px',
  height: '240px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(139, 94, 60, 0.25) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const contentArea: React.CSSProperties = {
  flex: 1,
  position: 'relative',
  zIndex: 1,
};

const badge: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.96)',
  color: colors.primaryDark,
  padding: '8px 18px',
  borderRadius: '30px',
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '0.3px',
  boxShadow: `0 4px 14px rgba(0,0,0,0.15)`,
};

const heroTitle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 700,
  color: colors.white,
  margin: '0 0 10px 0',
  lineHeight: 1.1,
  textShadow: '0 2px 8px rgba(0,0,0,0.25)',
};

const unitLabel: React.CSSProperties = {
  fontSize: '14px',
  color: 'rgba(255,255,255,0.65)',
  margin: '0 0 14px 0',
  fontWeight: 500,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
};

const heroDescription: React.CSSProperties = {
  color: 'rgba(255,255,255,0.88)',
  margin: '0 0 24px 0',
  lineHeight: 1.6,
  fontWeight: 400,
};

const benefitsContainer: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
};

const benefitPill: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'rgba(255,255,255,0.96)',
  padding: '10px 18px',
  borderRadius: '30px',
  boxShadow: `0 3px 10px rgba(0,0,0,0.12)`,
  border: `1px solid rgba(201, 168, 76, 0.3)`,
};

const ctaButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px 40px',
  backgroundColor: colors.white,
  color: colors.espresso,
  border: 'none',
  borderRadius: '12px',
  fontSize: '17px',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: `0 6px 28px rgba(255,255,255,0.25)`,
  letterSpacing: '0.3px',
};

const ctaButtonDisabled: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px 40px',
  backgroundColor: 'rgba(255,255,255,0.2)',
  color: 'rgba(255,255,255,0.55)',
  border: '2px solid rgba(255,255,255,0.2)',
  borderRadius: '12px',
  fontSize: '17px',
  fontWeight: 600,
  cursor: 'not-allowed',
  letterSpacing: '0.3px',
};

const imageWrapper: React.CSSProperties = {
  flex: 1,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const imageGlow: React.CSSProperties = {
  position: 'absolute',
  inset: '10%',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(201, 168, 76, 0.20) 0%, transparent 70%)',
  filter: 'blur(20px)',
  pointerEvents: 'none',
};

const heroImage: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '20px',
  boxShadow: `0 0 0 5px rgba(255,255,255,0.12),
              0 0 0 10px rgba(255,255,255,0.06),
              0 24px 48px rgba(0,0,0,0.35)`,
  position: 'relative',
  zIndex: 1,
};

const imagePlaceholder: React.CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: '20px',
  backgroundColor: 'rgba(255,255,255,0.06)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const outOfStockOverlay: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'rgba(26, 15, 10, 0.88)',
  padding: '14px 32px',
  borderRadius: '12px',
  zIndex: 2,
};

const outOfStockText: React.CSSProperties = {
  color: colors.white,
  fontSize: '22px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '2px',
};
