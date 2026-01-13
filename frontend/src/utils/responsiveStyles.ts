/**
 * Responsive styles helper functions
 * Provides responsive style objects that can be used with inline React styles
 */

import { useWindowSize } from './responsive';
import { spacing, typography } from './responsive';

/**
 * Get responsive padding for containers
 */
export const getContainerPadding = (breakpoint: 'mobile' | 'tablet' | 'desktop'): string => {
  return spacing.container[breakpoint];
};

/**
 * Get responsive padding X (horizontal)
 */
export const getPaddingX = (breakpoint: 'mobile' | 'tablet' | 'desktop'): string => {
  return spacing.paddingX[breakpoint];
};

/**
 * Get responsive padding Y (vertical)
 */
export const getPaddingY = (breakpoint: 'mobile' | 'tablet' | 'desktop'): string => {
  return spacing.paddingY[breakpoint];
};

/**
 * Get responsive font size for headings
 */
export const getHeadingSize = (
  level: 'h1' | 'h2' | 'h3' | 'h4',
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): string => {
  return typography[level][breakpoint];
};

/**
 * Get responsive gap
 */
export const getGap = (
  size: 'small' | 'medium' | 'large',
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): string => {
  return spacing.gap[size][breakpoint];
};

/**
 * Responsive header styles for pages
 */
export const useResponsiveHeaderStyles = () => {
  const { isMobile, isTablet, breakpoint } = useWindowSize();

  return {
    padding: `${getPaddingY(breakpoint)} ${getPaddingX(breakpoint)}`,
    flexDirection: isMobile ? ('column' as const) : ('row' as const),
    alignItems: isMobile ? ('flex-start' as const) : ('center' as const),
    gap: getGap('medium', breakpoint),
    fontSize: getHeadingSize('h2', breakpoint),
  };
};

/**
 * Responsive container styles
 */
export const useResponsiveContainerStyles = () => {
  const { breakpoint } = useWindowSize();

  return {
    padding: getContainerPadding(breakpoint),
    paddingBottom: getPaddingY(breakpoint),
  };
};

/**
 * Responsive card styles
 */
export const useResponsiveCardStyles = () => {
  const { isMobile, breakpoint } = useWindowSize();

  return {
    padding: isMobile ? '16px' : '24px',
    gap: getGap('medium', breakpoint),
  };
};

/**
 * Responsive grid columns for product listings
 */
export const useResponsiveProductGrid = () => {
  const { isMobile, isTablet } = useWindowSize();

  if (isMobile) {
    return '1fr'; // Single column on mobile
  } else if (isTablet) {
    return 'repeat(auto-fill, minmax(250px, 1fr))'; // 2-3 columns on tablet
  } else {
    return 'repeat(auto-fill, minmax(300px, 1fr))'; // 3-4 columns on desktop
  }
};

/**
 * Responsive grid columns for dashboard cards
 */
export const useResponsiveDashboardGrid = () => {
  const { isMobile, isTablet } = useWindowSize();

  if (isMobile) {
    return '1fr';
  } else if (isTablet) {
    return 'repeat(2, 1fr)';
  } else {
    return 'repeat(auto-fit, minmax(280px, 1fr))';
  }
};

/**
 * Responsive button styles
 */
export const useResponsiveButtonStyles = () => {
  const { isMobile, breakpoint } = useWindowSize();

  return {
    padding: isMobile ? '10px 16px' : '12px 24px',
    fontSize: typography.button[breakpoint],
    width: isMobile ? '100%' : 'auto', // Full width buttons on mobile
  };
};

/**
 * Responsive table wrapper styles (for overflow scroll)
 */
export const useResponsiveTableStyles = () => {
  const { isMobile } = useWindowSize();

  return {
    overflowX: isMobile ? ('auto' as const) : ('visible' as const),
    WebkitOverflowScrolling: 'touch' as const,
  };
};
