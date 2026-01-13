/**
 * Color palette for the Kiosk application
 * Based on the design mockups with orange/golden theme
 */

export const colors = {
  // Primary colors (orange/golden)
  primary: '#D97706',
  primaryLight: '#F59E0B',
  primaryDark: '#B45309',

  // Neutral colors
  white: '#FFFFFF',
  black: '#2C2C2C',
  gray: '#666666',
  grayLight: '#999999',
  grayBg: '#F5F5F5',
  grayDark: '#333333',

  // Status colors
  success: '#27ae60',
  error: '#e74c3c',
  warning: '#f39c12',
  info: '#3498db',

  // Order status colors
  orderPlaced: '#e74c3c',
  orderPreparing: '#f39c12',
  orderReady: '#3498db',
  orderDelivered: '#27ae60',
  orderCancelled: '#95a5a6',

  // UI element colors
  border: '#ddd',
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
};

export const gradients = {
  hero: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
  subtle: `linear-gradient(180deg, ${colors.white} 0%, ${colors.grayBg} 100%)`,
};
