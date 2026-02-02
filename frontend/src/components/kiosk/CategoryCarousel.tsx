import React, { useRef } from 'react';
import type { ProductCategory, Product } from '../../types';
import { ProductCard } from './ProductCard';
import { useWindowSize } from '../../utils/responsive';
import { colors } from '../../styles/colors';

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
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    const scrollAmount = isMobile ? -170 : -320;
    carouselRef.current?.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const scrollRight = () => {
    const scrollAmount = isMobile ? 170 : 320;
    carouselRef.current?.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (products.length === 0) {
    return null;
  }

  const containerStyles = {
    ...styles.container,
    ...(isMobile && responsiveStyles.container),
  };

  const headerStyles = {
    ...styles.header,
    ...(isMobile && responsiveStyles.header),
  };

  const carouselWrapperStyles = {
    ...styles.carouselWrapper,
    ...(isMobile && responsiveStyles.carouselWrapper),
  };

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div style={{ ...styles.headerLeft, ...(isMobile && responsiveStyles.headerLeft) }}>
          {category.icon && (
            <div style={{ ...styles.iconContainer, ...(isMobile && responsiveStyles.iconContainer) }}>
              <span style={{ ...styles.icon, ...(isMobile && responsiveStyles.icon) }}>{category.icon}</span>
            </div>
          )}
          <div>
            <h2 style={{ ...styles.title, ...(isMobile && responsiveStyles.title) }}>{category.name}</h2>
            {category.description && !isMobile && (
              <p style={styles.description}>{category.description}</p>
            )}
          </div>
        </div>
        {showViewAllButton && category.id > 0 && (
          <button
            style={{ ...styles.viewAllButton, ...(isMobile && responsiveStyles.viewAllButton) }}
            onClick={() => onViewAll(category.id)}
            className="view-all-button"
          >
            {isMobile ? 'Ver todos' : 'Ver todos'}
          </button>
        )}
      </div>

      {/* Carousel */}
      <div style={carouselWrapperStyles}>
        {/* Left Arrow */}
        {!isMobile && (
          <button
            className="carousel-arrow"
            style={{ ...styles.arrow, ...styles.arrowLeft }}
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}

        {/* Products Container - carousel with smaller cards on mobile */}
        <div ref={carouselRef} style={{
          ...styles.carousel,
          ...(isMobile && responsiveStyles.carousel),
        }}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              variant="carousel"
            />
          ))}
        </div>

        {/* Right Arrow */}
        {!isMobile && (
          <button
            className="carousel-arrow"
            style={{ ...styles.arrow, ...styles.arrowRight }}
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginBottom: '40px',
    padding: '24px 0',
    backgroundColor: colors.white,
    borderRadius: '16px',
    margin: '0 20px 24px 20px',
    boxShadow: `0 2px 8px ${colors.shadow}`,
    border: `1px solid ${colors.primaryMuted}`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '0 24px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: colors.primaryMuted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${colors.primary}`,
  },
  icon: {
    fontSize: '28px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    color: colors.textPrimary,
    margin: 0,
  },
  description: {
    fontSize: '14px',
    color: colors.textSecondary,
    margin: '4px 0 0 0',
  },
  carouselWrapper: {
    position: 'relative',
    padding: '0 50px',
  },
  carousel: {
    display: 'flex',
    gap: '16px',
    overflowX: 'scroll',
    overflowY: 'hidden',
    scrollBehavior: 'smooth',
    padding: '8px 16px',
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
    WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
    flexWrap: 'nowrap', // Prevent wrapping
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: colors.white,
    color: colors.primary,
    border: `2px solid ${colors.primary}`,
    fontSize: '28px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    boxShadow: `0 2px 8px ${colors.shadowGold}`,
    transition: 'all 0.2s',
  },
  arrowLeft: {
    left: '8px',
  },
  arrowRight: {
    right: '8px',
  },
  viewAllButton: {
    padding: '10px 20px',
    backgroundColor: colors.white,
    color: colors.primary,
    border: `2px solid ${colors.primary}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

// Responsive styles for mobile
const responsiveStyles: { [key: string]: React.CSSProperties } = {
  container: {
    margin: '0 12px 20px 12px',
    padding: '20px 0',
    borderRadius: '12px',
  },
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '0 16px',
    marginBottom: '16px',
  },
  headerLeft: {
    width: '100%',
    gap: '12px',
  },
  iconContainer: {
    width: '48px',
    height: '48px',
  },
  icon: {
    fontSize: '24px',
  },
  title: {
    fontSize: '18px',
  },
  carouselWrapper: {
    padding: '0 8px',
  },
  carousel: {
    padding: '8px',
    gap: '12px',
  },
  viewAllButton: {
    width: '100%',
    padding: '12px 20px',
    fontSize: '14px',
  },
};

// Hide scrollbar for webkit browsers and add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .carousel::-webkit-scrollbar {
    display: none;
  }

  .carousel-arrow:hover {
    background-color: ${colors.primary} !important;
    color: ${colors.white} !important;
    transform: translateY(-50%) scale(1.08);
    box-shadow: 0 4px 12px ${colors.shadowGold} !important;
  }

  .carousel-arrow:active {
    transform: translateY(-50%) scale(0.95);
    background-color: ${colors.primaryDark} !important;
  }

  .view-all-button:hover {
    background-color: ${colors.primary} !important;
    color: ${colors.white} !important;
    transform: scale(1.02);
  }

  .view-all-button:active {
    background-color: ${colors.primaryDark} !important;
    transform: scale(0.98);
  }
`;
if (!document.head.querySelector('[data-carousel-styles]')) {
  styleSheet.setAttribute('data-carousel-styles', 'true');
  document.head.appendChild(styleSheet);
}
