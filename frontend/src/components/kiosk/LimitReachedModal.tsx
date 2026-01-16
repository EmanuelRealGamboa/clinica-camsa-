import React from 'react';
import { colors } from '../../styles/colors';

interface LimitReachedModalProps {
  show: boolean;
  nurseName?: string;
  onClose: () => void;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({
  show,
  nurseName,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>⚠️</span>
        </div>
        <h2 style={styles.title}>Límite Alcanzado</h2>

        <div style={styles.messageContainer}>
          <p style={styles.message}>
            Has alcanzado tu límite de productos permitidos.
          </p>
          <p style={styles.message}>
            Por favor, contacta a tu enfermera si necesitas más productos.
          </p>
        </div>

        {nurseName && (
          <div style={styles.nurseInfo}>
            <p style={styles.nurseLabel}>Tu enfermera</p>
            <p style={styles.nurseName}>{nurseName}</p>
          </div>
        )}

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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10001,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: '20px',
    padding: '48px 40px',
    maxWidth: '550px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.3)',
  },
  iconContainer: {
    marginBottom: '24px',
    animation: 'heartbeat 1.5s ease-in-out infinite',
  },
  icon: {
    fontSize: '80px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#ff9800',
    margin: '0 0 24px 0',
  },
  messageContainer: {
    marginBottom: '32px',
  },
  message: {
    fontSize: '18px',
    color: colors.gray,
    lineHeight: '1.6',
    margin: '8px 0',
  },
  nurseInfo: {
    backgroundColor: '#fff5e6',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    border: '2px solid #ff9800',
  },
  nurseLabel: {
    fontSize: '14px',
    color: colors.gray,
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
  },
  nurseName: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#ff9800',
    margin: 0,
  },
  enjoyMessage: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: colors.black,
    margin: '0 0 32px 0',
  },
  button: {
    padding: '16px 48px',
    backgroundColor: '#ff9800',
    color: colors.white,
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
  },
};

// Add heartbeat animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.1); }
    50% { transform: scale(1); }
  }
`;
document.head.appendChild(styleSheet);
