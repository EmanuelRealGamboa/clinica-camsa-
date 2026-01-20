import React, { useRef } from 'react';
import type { ProductCategory, Product } from '../../types';
import { ProductCard } from './ProductCard';
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
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 320, behavior: 'smooth' });
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          {category.icon && (
            <div style={styles.iconContainer}>
              <span style={styles.icon}>{category.icon}</span>
            </div>
          )}
          <div>
            <h2 style={styles.title}>{category.name}</h2>
            {category.description && (
              <p style={styles.description}>{category.description}</p>
            )}
          </div>
        </div>
        {showViewAllButton && category.id > 0 && (
          <button
            style={styles.viewAllButton}
            onClick={() => onViewAll(category.id)}
            className="view-all-button"
          >
            Ver todos
          </button>
        )}
      </div>

      {/* Carousel */}
      <div style={styles.carouselWrapper}>
        {/* Left Arrow */}
        <button
          className="carousel-arrow"
          style={{ ...styles.arrow, ...styles.arrowLeft }}
          onClick={scrollLeft}
          aria-label="Scroll left"
        >
          ‹
        </button>

        {/* Products Container */}
        <div ref={carouselRef} style={styles.carousel}>
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
        <button
          className="carousel-arrow"
          style={{ ...styles.arrow, ...styles.arrowRight }}
          onClick={scrollRight}
          aria-label="Scroll right"
        >
          ›
        </button>
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
