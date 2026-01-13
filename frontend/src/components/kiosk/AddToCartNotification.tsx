import React, { useEffect, useState } from 'react';
import { colors } from '../../styles/colors';

interface AddToCartNotificationProps {
  show: boolean;
  productName: string;
  onHide: () => void;
}

export const AddToCartNotification: React.FC<AddToCartNotificationProps> = ({
  show,
  productName,
  onHide,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onHide, 300); // Wait for fade out animation
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show && !isVisible) return null;

  return (
    <div
      style={{
        ...styles.notification,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
      }}
    >
      <div style={styles.icon}>✓</div>
      <div style={styles.content}>
        <div style={styles.title}>¡Agregado al carrito!</div>
        <div style={styles.productName}>{productName}</div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  notification: {
    position: 'fixed',
    top: '100px',
    right: '20px',
    backgroundColor: colors.white,
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: `0 8px 24px ${colors.shadowDark}`,
    zIndex: 2000,
    minWidth: '320px',
    border: `2px solid ${colors.success}`,
    transition: 'all 0.3s ease',
  },
  icon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: colors.success,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: '4px',
  },
  productName: {
    fontSize: '14px',
    color: colors.gray,
  },
};
