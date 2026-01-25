import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '../../styles/colors';
import { useStoreCart } from '../../hooks/useStoreCart';
import clinicaCamsaLogo from '../../assets/clinica-camsa-logo.png';

interface RenovaHeaderProps {
  activePage?: 'home' | 'store' | 'about';
  onCartClick?: () => void;
}

export const RenovaHeader: React.FC<RenovaHeaderProps> = ({ activePage = 'home', onCartClick }) => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { totalItems } = useStoreCart();

  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        <img src={clinicaCamsaLogo} alt="Clínica CAMSA" style={styles.logo} />
        <h1 style={styles.brandName}>Clínica CAMSA</h1>
      </div>
      <nav style={styles.nav}>
        <button
          type="button"
          style={{
            ...styles.navLink,
            ...(activePage === 'home' ? styles.navLinkActive : {}),
          }}
          onClick={() => navigate(`/kiosk/${deviceId}/renova/home`)}
        >
          Inicio
        </button>
        <button
          type="button"
          style={{
            ...styles.navLink,
            ...(activePage === 'store' ? styles.navLinkActive : {}),
          }}
          onClick={() => navigate(`/kiosk/${deviceId}/store`)}
        >
          Tienda
        </button>
        <button
          type="button"
          style={{
            ...styles.navLink,
            ...(activePage === 'about' ? styles.navLinkActive : {}),
          }}
          onClick={() => navigate(`/kiosk/${deviceId}/renova/about`)}
        >
          Nosotros
        </button>
      </nav>
      <div style={styles.headerRight}>
        <button
          type="button"
          style={styles.cartIconBtn}
          onClick={() => {
            if (onCartClick) {
              onCartClick();
            } else {
              navigate(`/kiosk/${deviceId}/store`);
            }
          }}
        >
          🛒
          {totalItems > 0 && (
            <span style={styles.cartBadge}>{totalItems}</span>
          )}
        </button>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: colors.white,
    borderBottom: `1px solid ${colors.border}`,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    objectFit: 'contain',
  },
  brandName: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    color: colors.textPrimary,
    fontFamily: 'serif',
  },
  nav: {
    display: 'flex',
    gap: 24,
  },
  navLink: {
    background: 'none',
    border: 'none',
    color: colors.textPrimary,
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 500,
    fontFamily: 'serif',
    cursor: 'pointer',
    padding: '4px 8px',
    transition: 'all 0.2s',
  },
  navLinkActive: {
    fontWeight: 700,
    color: colors.primary,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  cartIconBtn: {
    position: 'relative',
    width: 40,
    height: 40,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
