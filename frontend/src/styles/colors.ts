/**
 * Color palette for Clínica CAMSA — Café Elegante Identity
 * Inspired by premium coffee shop aesthetics: deep espresso, warm gold, cream
 */

export const colors = {
  // Primary gold tones — richer, more vivid gold
  primary: '#C9A84C',        // Dorado vivo — más rico que el anterior
  primaryLight: '#E8C87A',   // Dorado claro cálido
  primaryDark: '#9A7430',    // Dorado profundo/ámbar
  primaryMuted: '#F2E8C8',   // Dorado muy suave para fondos

  // Espresso/coffee browns — nueva identidad café
  espresso: '#2C1810',       // Marrón espresso profundo
  latte: '#8B5E3C',          // Café con leche medio
  mocha: '#5C3317',          // Marrón mocha
  caramel: '#C4722A',        // Caramelo cálido

  // Secondary gold tones (compatibilidad)
  gold: '#C9A84C',
  goldLight: '#E8C87A',
  goldDark: '#9A7430',
  goldGradientStart: '#E8C87A',
  goldGradientEnd: '#9A7430',

  // Neutral backgrounds — crema cálida
  white: '#FFFFFF',
  ivory: '#FDF8F0',          // Crema muy cálida, base del fondo
  cream: '#F5EDD9',          // Pergamino cálido
  parchment: '#EDE0C8',      // Pergamino más oscuro para separadores
  black: '#1A0F0A',          // Negro espresso profundo

  // Grises
  gray: '#6B5E54',
  grayLight: '#A89890',
  grayBg: '#F5EDD9',
  grayDark: '#2C1810',

  // Text colors
  textPrimary: '#2C1810',    // Espresso para texto principal
  textSecondary: '#6B5E54',  // Café medio para texto secundario
  textMuted: '#A89890',      // Beige oscuro para texto terciario
  textGold: '#C9A84C',       // Dorado para texto de acento

  // Status colors
  success: '#4CAF50',
  error: '#E53935',
  warning: '#FFA726',
  info: '#42A5F5',

  // Order status colors
  orderPlaced: '#E53935',
  orderPreparing: '#FFA726',
  orderReady: '#42A5F5',
  orderDelivered: '#4CAF50',
  orderCancelled: '#9E9E9E',

  // UI element colors
  border: '#DDD0BC',
  borderGold: '#C9A84C',
  shadow: 'rgba(44, 24, 16, 0.08)',
  shadowMedium: 'rgba(44, 24, 16, 0.14)',
  shadowDark: 'rgba(44, 24, 16, 0.22)',
  shadowGold: 'rgba(201, 168, 76, 0.35)',
  shadowEspresso: 'rgba(44, 24, 16, 0.30)',
  overlay: 'rgba(44, 24, 16, 0.55)',
  overlayDark: 'rgba(26, 15, 10, 0.75)',
  overlayLight: 'rgba(253, 248, 240, 0.92)',
};

export const gradients = {
  // Gradiente dorado premium
  gold: `linear-gradient(135deg, ${colors.goldGradientStart} 0%, ${colors.goldGradientEnd} 100%)`,
  goldVertical: `linear-gradient(180deg, ${colors.goldGradientStart} 0%, ${colors.goldGradientEnd} 100%)`,
  goldSubtle: `linear-gradient(135deg, ${colors.primaryMuted} 0%, ${colors.cream} 100%)`,

  // Gradiente espresso (hero sections)
  espresso: `linear-gradient(135deg, ${colors.mocha} 0%, ${colors.espresso} 100%)`,
  espressoWarm: `linear-gradient(135deg, ${colors.latte} 0%, ${colors.espresso} 100%)`,

  // Gradiente dorado-espresso (hero elegante)
  hero: `linear-gradient(135deg, ${colors.latte} 0%, ${colors.espresso} 100%)`,
  heroGold: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.mocha} 100%)`,

  // Fondos suaves
  subtle: `linear-gradient(180deg, ${colors.white} 0%, ${colors.ivory} 100%)`,
  card: `linear-gradient(180deg, ${colors.white} 0%, ${colors.cream} 100%)`,
  parchment: `linear-gradient(135deg, ${colors.ivory} 0%, ${colors.parchment} 100%)`,
};

export const buttonStyles = {
  primary: {
    default: {
      backgroundColor: colors.white,
      color: colors.primary,
      border: `2px solid ${colors.primary}`,
    },
    hover: {
      backgroundColor: colors.primary,
      color: colors.white,
      border: `2px solid ${colors.primary}`,
    },
    active: {
      backgroundColor: colors.primaryDark,
      color: colors.white,
      border: `2px solid ${colors.primaryDark}`,
    },
  },
  secondary: {
    default: {
      backgroundColor: colors.primary,
      color: colors.white,
      border: `2px solid ${colors.primary}`,
    },
    hover: {
      backgroundColor: colors.primaryDark,
      color: colors.white,
      border: `2px solid ${colors.primaryDark}`,
    },
  },
  espresso: {
    default: {
      backgroundColor: colors.espresso,
      color: colors.white,
      border: `2px solid ${colors.espresso}`,
    },
    hover: {
      backgroundColor: colors.mocha,
      color: colors.white,
      border: `2px solid ${colors.mocha}`,
    },
  },
  outline: {
    default: {
      backgroundColor: 'transparent',
      color: colors.primary,
      border: `1px solid ${colors.primary}`,
    },
    hover: {
      backgroundColor: colors.primaryMuted,
      color: colors.primaryDark,
      border: `1px solid ${colors.primary}`,
    },
  },
};
