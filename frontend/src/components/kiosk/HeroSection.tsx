import React from 'react';
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

  const heroStyles = {
    ...styles.hero,
    ...(isMobile && responsiveStyles.hero),
  };

  const contentStyles = {
    ...styles.content,
    ...(isMobile && responsiveStyles.content),
  };

  return (
    <div style={heroStyles}>
      <div style={contentStyles}>
        {/* Badge */}
        <div style={{ ...styles.badge, ...(isMobile && responsiveStyles.badge) }}>
          ✨ Producto Especial del Mes
        </div>

        {/* Title */}
        <h1 style={{ ...styles.title, ...(isMobile && responsiveStyles.title) }}>{title}</h1>

        {/* Unit label removed - not shown in featured banner */}

        {/* Description */}
        <p style={{ ...styles.description, ...(isMobile && responsiveStyles.description) }}>{description}</p>

        {/* Benefits Pills */}
        {product.benefits && product.benefits.length > 0 && (
          <div style={{ ...styles.benefitsContainer, ...(isMobile && responsiveStyles.benefitsContainer) }}>
            {product.benefits.map((benefit, index) => (
              <div key={index} style={{ ...styles.benefitPill, ...(isMobile && responsiveStyles.benefitPill) }}>
                <span style={styles.benefitIcon}>{benefit.icon}</span>
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        {!isOutOfStock ? (
          <button
            style={{ ...styles.ctaButton, ...(isMobile && responsiveStyles.ctaButton) }}
            onClick={() => onAddToCart(product.id)}
            className="hero-cta-button"
          >
            Ordenar Ahora
          </button>
        ) : (
          <button style={{ ...styles.ctaButtonDisabled, ...(isMobile && responsiveStyles.ctaButton) }} disabled>
            Producto Agotado
          </button>
        )}
      </div>

      {/* Product Image */}
      <div style={{ ...styles.imageContainer, ...(isMobile && responsiveStyles.imageContainer) }}>
        {product.image_url_full && (
          <img
            src={product.image_url_full}
            alt={product.name}
            style={{
              ...styles.image,
              filter: isOutOfStock ? 'grayscale(100%)' : 'none',
              opacity: isOutOfStock ? 0.6 : 1,
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        {isOutOfStock && (
          <div style={styles.outOfStockOverlay}>
            <span style={styles.outOfStockText}>Agotado</span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  hero: {
    background: gradients.hero,
    padding: '50px 60px',
    borderRadius: '24px',
    margin: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '80px',
    boxShadow: `0 8px 32px ${colors.shadowGold}`,
    minHeight: '450px',
    border: `2px solid ${colors.primaryLight}`,
  },
  content: {
    flex: 1,
    maxWidth: '550px',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: colors.primaryDark,
    padding: '10px 20px',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '20px',
    boxShadow: `0 2px 8px ${colors.shadowGold}`,
  },
  title: {
    fontSize: '52px',
    fontWeight: 'bold',
    color: colors.white,
    margin: '0 0 16px 0',
    lineHeight: '1.1',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  description: {
    fontSize: '19px',
    color: 'rgba(255, 255, 255, 0.95)',
    margin: '0 0 28px 0',
    lineHeight: '1.5',
  },
  benefitsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '32px',
  },
  benefitPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: colors.primaryDark,
    padding: '12px 20px',
    borderRadius: '28px',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: `0 2px 8px ${colors.shadowGold}`,
    border: `1px solid ${colors.primaryLight}`,
  },
  benefitIcon: {
    fontSize: '18px',
  },
  ctaButton: {
    backgroundColor: colors.white,
    color: colors.primary,
    padding: '18px 48px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: `2px solid ${colors.white}`,
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: `0 4px 16px ${colors.shadowGold}`,
  },
  ctaButtonDisabled: {
    backgroundColor: colors.grayLight,
    color: colors.white,
    padding: '18px 48px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  imageContainer: {
    flex: 1,
    maxWidth: '600px',
    minWidth: '450px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'cover',
    borderRadius: '24px',
    boxShadow: `0 0 0 6px rgba(255, 255, 255, 0.3),
                 0 0 0 12px rgba(255, 255, 255, 0.15),
                 0 20px 40px ${colors.shadowGold}`,
    border: `4px solid ${colors.white}`,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: '16px 32px',
    borderRadius: '12px',
  },
  outOfStockText: {
    color: colors.white,
    fontSize: '24px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
};

// Responsive styles for mobile
const responsiveStyles: { [key: string]: React.CSSProperties } = {
  hero: {
    flexDirection: 'column',
    padding: '30px 20px',
    margin: '12px',
    gap: '24px',
    minHeight: 'auto',
    borderRadius: '16px',
  },
  content: {
    maxWidth: '100%',
    textAlign: 'center',
  },
  badge: {
    fontSize: '12px',
    padding: '8px 16px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  description: {
    fontSize: '16px',
    marginBottom: '20px',
  },
  benefitsContainer: {
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  benefitPill: {
    fontSize: '13px',
    padding: '10px 16px',
  },
  ctaButton: {
    width: '100%',
    padding: '16px 24px',
    fontSize: '16px',
  },
  imageContainer: {
    maxWidth: '100%',
    minWidth: 'auto',
    width: '100%',
    height: '250px',
  },
};

// Add hover effects for CTA button
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .hero-cta-button:hover {
    background-color: ${colors.primaryDark} !important;
    color: ${colors.white} !important;
    border-color: ${colors.primaryDark} !important;
    transform: scale(1.03);
    box-shadow: 0 6px 24px ${colors.shadowGold} !important;
  }

  .hero-cta-button:active {
    transform: scale(0.98);
    background-color: ${colors.gold} !important;
  }
`;
if (!document.head.querySelector('[data-hero-styles]')) {
  styleSheet.setAttribute('data-hero-styles', 'true');
  document.head.appendChild(styleSheet);
}
