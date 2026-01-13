import React from 'react';
import { colors } from '../../styles/colors';

interface OrderLimitsIndicatorProps {
  limits: {
    DRINK?: number;
    SNACK?: number;
  };
  onClose: () => void;
}

export const OrderLimitsIndicator: React.FC<OrderLimitsIndicatorProps> = ({
  limits,
  onClose,
}) => {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>⚠️</span>
        </div>
        <h2 style={styles.title}>Límites de Pedido</h2>

        <button style={styles.button} onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  iconContainer: {
    marginBottom: '20px',
  },
  icon: {
    fontSize: '64px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#ff9800',
    margin: '0 0 32px 0',
  },
  button: {
    padding: '14px 48px',
    backgroundColor: '#ff9800',
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};
