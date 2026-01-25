import React from 'react';
import { colors } from '../../styles/colors';

interface ConfirmationStepProps {
  orderNumber: string;
  onBackToHome: () => void;
  onContinueShopping: () => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  orderNumber,
  onBackToHome,
  onContinueShopping,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.successCard}>
        <div style={styles.successIcon}>✓</div>
        <h2 style={styles.successTitle}>¡Pedido Confirmado!</h2>
        <p style={styles.successText}>
          Gracias por tu compra. Hemos enviado los detalles de tu pedido a tu correo electrónico.
        </p>
        <div style={styles.orderNumberCard}>
          <span style={styles.orderNumberLabel}>Número de pedido:</span>
          <span style={styles.orderNumber}>{orderNumber}</span>
        </div>
        <div style={styles.actions}>
          <button type="button" style={styles.backBtn} onClick={onBackToHome}>
            Volver al Inicio
          </button>
          <button type="button" style={styles.continueBtn} onClick={onContinueShopping}>
            Seguir Comprando
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
  successCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 48,
    textAlign: 'center',
    maxWidth: 600,
    boxShadow: `0 2px 12px ${colors.shadow}`,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    lineHeight: 1,
  },
  successTitle: {
    margin: '0 0 12px 0',
    fontSize: 28,
    fontWeight: 700,
    color: colors.textPrimary,
  },
  successText: {
    margin: '0 0 32px 0',
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 1.6,
  },
  orderNumberCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.ivory,
    borderRadius: 12,
    marginBottom: 32,
  },
  orderNumberLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.primary,
    textDecoration: 'underline',
    textDecorationColor: colors.primary,
  },
  actions: {
    display: 'flex',
    gap: 12,
  },
  backBtn: {
    flex: 1,
    padding: '14px 24px',
    backgroundColor: colors.white,
    color: colors.textPrimary,
    border: `2px solid ${colors.border}`,
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  continueBtn: {
    flex: 1,
    padding: '14px 24px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
