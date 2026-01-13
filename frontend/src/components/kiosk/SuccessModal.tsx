import React from 'react';
import { colors } from '../../styles/colors';

interface SuccessModalProps {
  show: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  show,
  title,
  message,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.iconContainer}>
          <div style={styles.successIcon}>✓</div>
        </div>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>
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
    zIndex: 9999,
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
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#4caf50',
    color: colors.white,
    fontSize: '48px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
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
