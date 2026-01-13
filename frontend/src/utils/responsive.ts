/**
 * Responsive breakpoints and utilities for Clinica CAMSA
 * Optimized for tablets, iPads, and mobile devices
 */

// Breakpoint values in pixels
export const breakpoints = {
  mobile: 640,    // Small phones
  tablet: 768,    // Tablets and large phones
  desktop: 1024,  // Desktop and iPads in landscape
  wide: 1440,     // Large desktops
};

// Media query strings for inline styles
export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.mobile}px)`,
  tablet: `@media (min-width: ${breakpoints.mobile + 1}px) and (max-width: ${breakpoints.tablet}px)`,
  desktop: `@media (min-width: ${breakpoints.desktop}px)`,
  wide: `@media (min-width: ${breakpoints.wide}px)`,
};

// Responsive spacing scale
export const spacing = {
  // Padding X (horizontal)
  paddingX: {
    mobile: '12px',
    tablet: '20px',
    desktop: '32px',
    wide: '40px',
  },
  // Padding Y (vertical)
  paddingY: {
    mobile: '16px',
    tablet: '20px',
    desktop: '24px',
    wide: '32px',
  },
  // Container padding
  container: {
    mobile: '15px',
    tablet: '20px',
    desktop: '40px',
  },
  // Gap between items
  gap: {
    small: { mobile: '8px', tablet: '12px', desktop: '16px' },
    medium: { mobile: '12px', tablet: '16px', desktop: '20px' },
    large: { mobile: '16px', tablet: '20px', desktop: '24px' },
  },
};

// Responsive font sizes
export const typography = {
  // Headings
  h1: { mobile: '24px', tablet: '28px', desktop: '32px' },
  h2: { mobile: '20px', tablet: '24px', desktop: '28px' },
  h3: { mobile: '18px', tablet: '20px', desktop: '24px' },
  h4: { mobile: '16px', tablet: '18px', desktop: '20px' },
  // Body text
  body: { mobile: '14px', tablet: '15px', desktop: '16px' },
  bodyLarge: { mobile: '16px', tablet: '17px', desktop: '18px' },
  bodySmall: { mobile: '12px', tablet: '13px', desktop: '14px' },
  // Button text
  button: { mobile: '14px', tablet: '15px', desktop: '16px' },
  buttonLarge: { mobile: '16px', tablet: '17px', desktop: '18px' },
};

// Grid columns responsive helper
export const gridColumns = {
  // Auto-fit with responsive min width
  products: {
    mobile: '1fr',
    tablet: 'repeat(auto-fill, minmax(250px, 1fr))',
    desktop: 'repeat(auto-fill, minmax(300px, 1fr))',
  },
  cards: {
    mobile: '1fr',
    tablet: 'repeat(2, 1fr)',
    desktop: 'repeat(3, 1fr)',
  },
  dashboard: {
    mobile: '1fr',
    tablet: 'repeat(2, 1fr)',
    desktop: 'repeat(auto-fit, minmax(280px, 1fr))',
  },
};

/**
 * Hook to get current window size and breakpoint
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  React.useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ...windowSize,
    isMobile: windowSize.width < breakpoints.tablet,
    isTablet: windowSize.width >= breakpoints.tablet && windowSize.width < breakpoints.desktop,
    isDesktop: windowSize.width >= breakpoints.desktop,
    breakpoint: windowSize.width < breakpoints.tablet
      ? 'mobile'
      : windowSize.width < breakpoints.desktop
      ? 'tablet'
      : 'desktop',
  };
};

// Helper to get responsive value based on current breakpoint
export const getResponsiveValue = <T,>(
  values: { mobile: T; tablet?: T; desktop?: T },
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): T => {
  if (breakpoint === 'mobile') return values.mobile;
  if (breakpoint === 'tablet') return values.tablet || values.mobile;
  return values.desktop || values.tablet || values.mobile;
};

import React from 'react';
