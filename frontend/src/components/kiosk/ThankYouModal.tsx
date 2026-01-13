import React from 'react';
import { colors } from '../../styles/colors';

interface ThankYouModalProps {
  show: boolean;
  onClose: () => void;
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.iconContainer}>
          <div style={styles.heartIcon}>❤️</div>
        </div>
        <h2 style={styles.title}>¡Gracias por tu feedback!</h2>
        <p style={styles.message}>
          Tu opinión es muy importante para nosotros y nos ayuda a mejorar nuestro servicio.
        </p>
        <button style={styles.button} onClick={onClose}>
          OK
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
    maxWidth: '480px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  iconContainer: {
    marginBottom: '24px',
  },
  heartIcon: {
    fontSize: '64px',
    animation: 'heartbeat 1s ease-in-out',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: colors.black,
    margin: '0 0 16px 0',
  },
  message: {
    fontSize: '16px',
    color: colors.gray,
    lineHeight: '1.5',
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
