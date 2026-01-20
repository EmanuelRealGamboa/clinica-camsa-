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

        <button style={styles.button} onClick={onClose} className="limit-btn">
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
    backgroundColor: colors.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10001,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: '24px',
    padding: '48px 40px',
    maxWidth: '550px',
    width: '90%',
    textAlign: 'center',
    boxShadow: `0 12px 48px ${colors.shadowGold}`,
    border: `2px solid ${colors.warning}`,
  },
  iconContainer: {
    marginBottom: '24px',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 167, 38, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px auto',
    border: `3px solid ${colors.warning}`,
    animation: 'heartbeat 1.5s ease-in-out infinite',
  },
  icon: {
    fontSize: '56px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: colors.warning,
    margin: '0 0 24px 0',
  },
  messageContainer: {
    marginBottom: '32px',
  },
  message: {
    fontSize: '18px',
    color: colors.textSecondary,
    lineHeight: '1.6',
    margin: '8px 0',
  },
  nurseInfo: {
    backgroundColor: colors.cream,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    border: `2px solid ${colors.primary}`,
  },
  nurseLabel: {
    fontSize: '14px',
    color: colors.textSecondary,
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
  },
  nurseName: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: colors.primary,
    margin: 0,
  },
  enjoyMessage: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: colors.textPrimary,
    margin: '0 0 32px 0',
  },
  button: {
    padding: '16px 48px',
    backgroundColor: colors.white,
    color: colors.primary,
    border: `2px solid ${colors.primary}`,
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: `0 4px 12px ${colors.shadowGold}`,
  },
};

// Add animations and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.08); }
    50% { transform: scale(1); }
  }

  .limit-btn:hover {
    background-color: ${colors.primary} !important;
    color: ${colors.white} !important;
    transform: scale(1.03);
    box-shadow: 0 6px 20px ${colors.shadowGold} !important;
  }

  .limit-btn:active {
    background-color: ${colors.primaryDark} !important;
    transform: scale(0.98);
  }
`;
if (!document.head.querySelector('[data-limit-modal-styles]')) {
  styleSheet.setAttribute('data-limit-modal-styles', 'true');
  document.head.appendChild(styleSheet);
}
