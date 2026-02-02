import React from 'react';
import type { Product } from '../../types';
import { StarRating } from './StarRating';
import { useWindowSize } from '../../utils/responsive';
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
  const { isMobile } = useWindowSize();
  const isOutOfStock = product.is_available === false;
  const mainBenefit = product.benefits && product.benefits.length > 0 ? product.benefits[0] : null;
  const mainTag = product.tags && product.tags.length > 0 ? product.tags[0] : null;
  const isFood = product.category_type === 'FOOD';
  const hasPrice = isFood && product.price !== undefined && product.price !== null && product.price > 0;

  const baseCardStyles = variant === 'carousel'
    ? { ...styles.card, ...styles.carouselCard }
    : styles.card;

  const cardStyles = {
    ...baseCardStyles,
    ...(isMobile && responsiveStyles.card),
    ...(isMobile && variant === 'carousel' && responsiveStyles.carouselCard),
  };

  // Format price as Mexican Pesos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  return (
    <div
      style={{
        ...cardStyles,
        opacity: isOutOfStock ? 0.6 : 1,
      }}
    >
      {/* Image Container */}
      <div style={{
        ...styles.imageContainer,
        ...(isMobile && variant === 'carousel' && responsiveStyles.carouselImageContainer),
      }}>
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

        {/* Food Badge (for paid items) */}
        {isFood && !isOutOfStock && !mainTag && (
          <div style={styles.foodBadge}>
            Pago adicional
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
      <div style={{
        ...styles.content,
        ...(isMobile && responsiveStyles.content),
        ...(isMobile && variant === 'carousel' && responsiveStyles.carouselContent),
      }}>
        <h3 style={{
          ...styles.title,
          ...(isMobile && responsiveStyles.title),
          ...(isMobile && variant === 'carousel' && responsiveStyles.carouselTitle),
        }}>{product.name}</h3>
        <p style={{
          ...styles.description,
          ...(isMobile && responsiveStyles.description),
          ...(isMobile && variant === 'carousel' && responsiveStyles.carouselDescription),
        }}>{product.description}</p>

        {/* Price for FOOD items */}
        {hasPrice && (
          <div style={styles.priceContainer}>
            <span style={styles.priceLabel}>Precio:</span>
            <span style={styles.price}>{formatPrice(product.price!)}</span>
          </div>
        )}

        {/* Benefit - hidden in carousel mobile for compactness */}
        {mainBenefit && !isOutOfStock && !(isMobile && variant === 'carousel') && (
          <div style={styles.benefit}>
            <span style={styles.benefitIcon}>{mainBenefit.icon}</span>
            <span style={styles.benefitText}>{mainBenefit.text}</span>
          </div>
        )}

        {/* Rating - hidden in carousel mobile for compactness */}
        {product.rating !== undefined && product.rating > 0 && !(isMobile && variant === 'carousel') && (
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
      <div style={{
        ...styles.actions,
        ...(isMobile && responsiveStyles.actions),
        ...(isMobile && variant === 'carousel' && responsiveStyles.carouselActions),
      }}>
        {isOutOfStock ? (
          <button
            style={{
              ...styles.addButton,
              ...styles.disabledButton,
              ...(isMobile && responsiveStyles.addButton),
            }}
            disabled
          >
            No disponible
          </button>
        ) : (
          <button
            style={{
              ...styles.addButton,
              ...(isFood ? styles.foodButton : {}),
              ...(isMobile && responsiveStyles.addButton),
              ...(isMobile && variant === 'carousel' && responsiveStyles.carouselAddButton),
            }}
            onClick={() => onAddToCart(product.id)}
          >
            {isFood 
              ? (isMobile ? 'Agregar (+)' : 'Agregar (Pago adicional)')
              : 'Agregar a la Orden'}
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
    border: `1px solid ${colors.primaryMuted}`,
  },
  carouselCard: {
    minWidth: '280px',
    maxWidth: '280px',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '200px',
    backgroundColor: colors.cream,
    borderBottom: `1px solid ${colors.primaryMuted}`,
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
    fontSize: '17px',
    fontWeight: '600',
    color: colors.textPrimary,
    margin: 0,
    marginBottom: '6px',
  },
  description: {
    fontSize: '14px',
    color: colors.textSecondary,
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
    backgroundColor: colors.primaryMuted,
    padding: '8px 12px',
    borderRadius: '8px',
    marginTop: '4px',
    border: `1px solid ${colors.primary}`,
  },
  benefitIcon: {
    fontSize: '16px',
  },
  benefitText: {
    fontSize: '13px',
    color: colors.primaryDark,
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
    backgroundColor: colors.white,
    color: colors.primary,
    border: `2px solid ${colors.primary}`,
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden',
  },
  disabledButton: {
    backgroundColor: colors.grayBg,
    color: colors.grayLight,
    borderColor: colors.grayLight,
    cursor: 'not-allowed',
  },
  foodBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: colors.primary,
    color: colors.white,
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: colors.primaryMuted,
    padding: '10px 14px',
    borderRadius: '8px',
    marginTop: '8px',
    border: `1px solid ${colors.primary}`,
  },
  priceLabel: {
    fontSize: '14px',
    color: colors.primaryDark,
    fontWeight: '500',
  },
  price: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: colors.primary,
  },
  foodButton: {
    backgroundColor: colors.primary,
    color: colors.white,
  },
};

// Responsive styles for mobile
const responsiveStyles: { [key: string]: React.CSSProperties } = {
  card: {
    borderRadius: '12px',
  },
  carouselCard: {
    minWidth: '160px',
    maxWidth: '160px',
  },
  carouselImageContainer: {
    height: '110px',
  },
  carouselContent: {
    padding: '12px',
    gap: '4px',
  },
  carouselTitle: {
    fontSize: '13px',
    marginBottom: '2px',
  },
  carouselDescription: {
    fontSize: '12px',
    WebkitLineClamp: 1,
  },
  carouselActions: {
    padding: '0 12px 12px 12px',
  },
  carouselAddButton: {
    padding: '8px',
    fontSize: '12px',
  },
  content: {
    padding: '16px',
    gap: '6px',
  },
  title: {
    fontSize: '15px',
    marginBottom: '4px',
  },
  description: {
    fontSize: '13px',
    WebkitLineClamp: 2,
  },
  actions: {
    padding: '0 16px 16px 16px',
  },
  addButton: {
    padding: '12px',
    fontSize: '14px',
  },
};

// Add CSS animations for button click effect and card hover
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes buttonPulse {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }

  /* Product card hover */
  [style*="border-radius: 16px"][style*="cursor: pointer"]:hover {
    border-color: ${colors.primary} !important;
    box-shadow: 0 4px 16px ${colors.shadowGold} !important;
    transform: translateY(-2px);
  }

  /* Add button hover - white to gold */
  [style*="border: 2px solid"][style*="${colors.primary}"]:not(:disabled):hover {
    background-color: ${colors.primary} !important;
    color: ${colors.white} !important;
  }

  [style*="border: 2px solid"][style*="${colors.primary}"]:not(:disabled):active {
    background-color: ${colors.primaryDark} !important;
    border-color: ${colors.primaryDark} !important;
    animation: buttonPulse 0.3s ease;
  }
`;
if (!document.head.querySelector('[data-product-card-styles]')) {
  styleSheet.setAttribute('data-product-card-styles', 'true');
  document.head.appendChild(styleSheet);
}
