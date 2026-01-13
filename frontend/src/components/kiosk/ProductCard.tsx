import React from 'react';
import type { Product } from '../../types';
import { StarRating } from './StarRating';
import { colors } from '../../styles/colors';

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
  const isOutOfStock = product.is_available === false;
  const mainBenefit = product.benefits && product.benefits.length > 0 ? product.benefits[0] : null;
  const mainTag = product.tags && product.tags.length > 0 ? product.tags[0] : null;

  const cardStyles = variant === 'carousel'
    ? { ...styles.card, ...styles.carouselCard }
    : styles.card;

  return (
    <div
      style={{
        ...cardStyles,
        opacity: isOutOfStock ? 0.6 : 1,
      }}
    >
      {/* Image Container */}
      <div style={styles.imageContainer}>
        {product.image_url_full && (
          <img
            src={product.image_url_full}
            alt={product.name}
            style={{
              ...styles.image,
              filter: isOutOfStock ? 'grayscale(100%)' : 'none',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}

        {/* Tag Badge */}
        {mainTag && !isOutOfStock && (
          <div
            style={{
              ...styles.tagBadge,
              backgroundColor: mainTag.color,
            }}
          >
            {mainTag.icon && <span style={{ marginRight: '4px' }}>{mainTag.icon}</span>}
            {mainTag.name}
          </div>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div style={styles.outOfStockBadge}>
            Agotado
          </div>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h3 style={styles.title}>{product.name}</h3>
        <p style={styles.description}>{product.description}</p>

        {/* Benefit */}
        {mainBenefit && !isOutOfStock && (
          <div style={styles.benefit}>
            <span style={styles.benefitIcon}>{mainBenefit.icon}</span>
            <span style={styles.benefitText}>{mainBenefit.text}</span>
          </div>
        )}

        {/* Rating - Large stars */}
        {product.rating !== undefined && product.rating > 0 && (
          <div style={styles.ratingContainer}>
            <StarRating
              rating={product.rating}
              size="large"
              showCount={false}
              count={product.rating_count}
            />
          </div>
        )}
      </div>

      {/* Action Button */}
      <div style={styles.actions}>
        {isOutOfStock ? (
          <button
            style={{
              ...styles.addButton,
              ...styles.disabledButton,
            }}
            disabled
          >
            No disponible
          </button>
        ) : (
          <button
            style={styles.addButton}
            onClick={() => onAddToCart(product.id)}
          >
            Agregar a la Orden
          </button>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    boxShadow: `0 2px 8px ${colors.shadow}`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  carouselCard: {
    minWidth: '280px',
    maxWidth: '280px',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '200px',
    backgroundColor: colors.grayBg,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '10px',
  },
  tagBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    color: colors.white,
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    boxShadow: `0 2px 4px ${colors.shadowDark}`,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: colors.white,
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    zIndex: 10,
  },
  content: {
    padding: '20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: colors.black,
    margin: 0,
    marginBottom: '8px',
  },
  description: {
    fontSize: '14px',
    color: colors.gray,
    margin: 0,
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  benefit: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: `${colors.primary}15`,
    padding: '8px 12px',
    borderRadius: '8px',
    marginTop: '4px',
  },
  benefitIcon: {
    fontSize: '16px',
  },
  benefitText: {
    fontSize: '13px',
    color: colors.primary,
    fontWeight: '600',
  },
  ratingContainer: {
    marginTop: '12px',
    marginBottom: '8px',
  },
  actions: {
    padding: '0 20px 20px 20px',
  },
  addButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden',
  },
  disabledButton: {
    backgroundColor: colors.grayLight,
    cursor: 'not-allowed',
  },
};

// Add CSS animations for button click effect
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes buttonPulse {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }

  button:active {
    animation: buttonPulse 0.3s ease;
  }
`;
if (!document.head.querySelector('[data-product-card-styles]')) {
  styleSheet.setAttribute('data-product-card-styles', 'true');
  document.head.appendChild(styleSheet);
}
