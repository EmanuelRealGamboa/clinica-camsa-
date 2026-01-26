import React, { useEffect } from 'react';
import { colors } from '../../styles/colors';

interface AddToCartNotificationProps {
  itemName: string;
  isVisible: boolean;
  onClose: () => void;
}

export const AddToCartNotification: React.FC<AddToCartNotificationProps> = ({
  itemName,
  isVisible,
  onClose,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.notification}>
        <div style={styles.iconContainer}>
          <span style={styles.checkIcon}>✓</span>
        </div>
        <div style={styles.content}>
          <p style={styles.message}>
            <strong>{itemName}</strong> agregado al carrito
          </p>
        </div>
        <button
          type="button"
          style={styles.closeBtn}
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 20,
    right: 20,
    zIndex: 10000,
    animation: 'slideIn 0.3s ease-out',
  },
  notification: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    backgroundColor: colors.white,
    borderRadius: 12,
    boxShadow: `0 4px 16px ${colors.shadowDark}`,
    border: `1px solid ${colors.border}`,
    minWidth: 300,
    maxWidth: 400,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkIcon: {
    fontSize: 20,
    color: colors.white,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  message: {
    margin: 0,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 1.4,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: colors.grayBg,
    color: colors.textSecondary,
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background-color 0.2s',
  },
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
if (!document.head.querySelector('[data-cart-notification-styles]')) {
  styleSheet.setAttribute('data-cart-notification-styles', 'true');
  document.head.appendChild(styleSheet);
}
