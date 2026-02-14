import React from 'react';
import { colors } from '../../styles/colors';
import { TIENDA_CAMSA_URL, RESTAURANTES_CAMSA_URL } from '../../constants/urls';
import { useWindowSize } from '../../utils/responsive';
import logoHorizontal from '../../assets/logos/logo-horizontal.png';

interface InitialWelcomeScreenProps {
  deviceUid: string;
  onViewMenu: () => void;
  loading?: boolean;
  patientAssigned?: boolean;
}

export const InitialWelcomeScreen: React.FC<InitialWelcomeScreenProps> = ({
  deviceUid,
  onViewMenu,
  loading = false,
  patientAssigned = false,
}) => {
  const { isMobile } = useWindowSize();
  const isButtonDisabled = !patientAssigned || loading;
  const responsiveStyles = getResponsiveStyles(isMobile);

  const hexagonClipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

  const HexagonBlock = ({
    icon,
    title,
    description,
    href,
    className = '',
  }: {
    icon: string;
    title: string;
    description: string;
    href?: string;
    className?: string;
  }) => {
    const content = (
      <>
        <div
          className="hexagon-shape"
          style={{ ...styles.hexagonShape, ...(responsiveStyles.hexagonShape || {}), clipPath: hexagonClipPath, WebkitClipPath: hexagonClipPath }}
        >
          <div style={{ ...styles.hexagonInner, ...responsiveStyles.hexagonInner }}>
            <span style={{ ...styles.hexagonIcon, ...responsiveStyles.hexagonIcon }}>{icon}</span>
            <span style={{ ...styles.hexagonTitle, ...responsiveStyles.hexagonTitle }}>{title}</span>
          </div>
        </div>
        <p style={{ ...styles.hexagonDescription, ...responsiveStyles.hexagonDescription }}>{description}</p>
      </>
    );

    if (href) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.hexagonWrapper}
          className={`hexagon-link ${className}`}
        >
          {content}
        </a>
      );
    }

    return (
      <div style={styles.hexagonWrapper} className={className}>
        {content}
      </div>
    );
  };

  return (
    <div style={{ ...styles.container, ...responsiveStyles.container }}>
      {/* Logo Section - Badge gris claro */}
      <div style={{ ...styles.logoContainer, ...responsiveStyles.logoContainer }}>
        <div style={{ ...styles.logoBadge, ...responsiveStyles.logoBadge }}>
          <img src={logoHorizontal} alt="Clínica CAMSA" style={{ ...styles.logoImage, ...responsiveStyles.logoImage }} />
        </div>
      </div>

      {/* Welcome Content */}
      <div style={styles.content}>
        <h1 style={{ ...styles.title, ...responsiveStyles.title }}>¡Bienvenido!</h1>

        {/* Hexagons - Layout 1-2 */}
        <div style={{ ...styles.hexagonsContainer, ...responsiveStyles.hexagonsContainer }}>
          {/* Top row - single hexagon (Cortesías) */}
          <div style={{ ...styles.hexagonRowTop, ...responsiveStyles.hexagonRowTop }}>
            <HexagonBlock
              icon="🎁"
              title="Cortesías Gratuitas"
              description="Durante tu consulta, disfruta de bebidas y snacks completamente gratis."
            />
          </div>
          {/* Bottom row - two hexagons (Tienda, Pedir comida) */}
          <div style={{ ...styles.hexagonRowBottom, ...responsiveStyles.hexagonRowBottom }}>
            <HexagonBlock
              icon="🛒"
              title="Conoce nuestros productos"
              description="Explora nuestra tienda en línea y descubre más opciones disponibles."
              href={TIENDA_CAMSA_URL}
            />
            <HexagonBlock
              icon="🍽️"
              title="Pedir comida"
              description="Ordena comida de restaurantes cercanos y disfrútala en la clínica."
              href={RESTAURANTES_CAMSA_URL}
            />
          </div>
        </div>

        {/* Barra inferior - Esperando registro / Ver Menú */}
        <div style={styles.bottomSection}>
          <button
            style={isButtonDisabled
              ? { ...styles.buttonBarDisabled, ...responsiveStyles.buttonBar }
              : { ...styles.buttonBar, ...responsiveStyles.buttonBar }}
            onClick={onViewMenu}
            disabled={isButtonDisabled}
            className="welcome-button-bar"
          >
            {loading ? 'Verificando...' : patientAssigned ? 'Ver Menú' : 'Esperando registro...'}
          </button>
          {!patientAssigned && (
            <p style={{ ...styles.waitingMessage, ...responsiveStyles.waitingMessage }}>
              Por favor espera a que tu enfermera te registre en el sistema
            </p>
          )}
        </div>

        <p style={{ ...styles.footer, ...responsiveStyles.footer }}>
          Dispositivo: {deviceUid}
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.ivory,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'min(3vh, 24px) min(4vw, 32px)',
    boxSizing: 'border-box',
  },
  logoContainer: {
    flexShrink: 0,
  },
  logoBadge: {
    backgroundColor: colors.cream,
    borderRadius: '16px',
    padding: 'min(2vh, 20px) min(4vw, 48px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  },
  logoImage: {
    maxWidth: '100%',
    maxHeight: 'clamp(70px, 10vh, 120px)',
    height: 'auto',
    width: 'auto',
    objectFit: 'contain',
  },
  content: {
    textAlign: 'center',
    maxWidth: 'min(1100px, 95vw)',
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(16px, 2.5vh, 28px)',
  },
  title: {
    fontSize: 'clamp(36px, 5vw, 72px)',
    fontWeight: 'bold',
    color: colors.textPrimary,
    margin: 0,
  },
  hexagonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'clamp(20px, 3vh, 36px)',
  },
  hexagonRowTop: {
    display: 'flex',
    justifyContent: 'center',
  },
  hexagonRowBottom: {
    display: 'flex',
    gap: 'clamp(24px, 4vw, 56px)',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  hexagonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
  },
  hexagonShape: {
    width: 'clamp(220px, 22vw, 320px)',
    height: 'clamp(253px, 25vw, 368px)',
    background: 'linear-gradient(135deg, #fde880 0%, #d9a70f 45%, #b78a0b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  hexagonInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(10px, 1.5vh, 18px)',
    padding: 'clamp(16px, 2vw, 28px)',
  },
  hexagonIcon: {
    fontSize: 'clamp(48px, 5vw, 72px)',
    lineHeight: 1,
  },
  hexagonTitle: {
    fontSize: 'clamp(16px, 1.8vw, 24px)',
    fontWeight: 600,
    color: colors.white,
    textAlign: 'center',
  },
  hexagonDescription: {
    marginTop: 'clamp(12px, 1.5vh, 20px)',
    fontSize: 'clamp(15px, 1.6vw, 20px)',
    color: colors.textSecondary,
    lineHeight: 1.4,
    maxWidth: 'clamp(260px, 28vw, 380px)',
  },
  bottomSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: 'min(700px, 90vw)',
    margin: '0 auto',
    flexShrink: 0,
  },
  buttonBar: {
    width: '100%',
    padding: 'clamp(18px, 2.2vh, 28px) clamp(32px, 4vw, 56px)',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: 'clamp(18px, 2vw, 26px)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    boxShadow: `0 4px 12px ${colors.shadowGold}`,
  },
  buttonBarDisabled: {
    width: '100%',
    padding: 'clamp(18px, 2.2vh, 28px) clamp(32px, 4vw, 56px)',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: 'clamp(18px, 2vw, 26px)',
    fontWeight: 600,
    cursor: 'not-allowed',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    opacity: 0.85,
    boxShadow: `0 4px 12px ${colors.shadowGold}`,
  },
  waitingMessage: {
    marginTop: 'clamp(10px, 1.2vh, 16px)',
    fontSize: 'clamp(15px, 1.6vw, 19px)',
    color: colors.textSecondary,
  },
  footer: {
    flexShrink: 0,
    marginTop: 'clamp(12px, 1.5vh, 20px)',
    fontSize: 'clamp(12px, 1.2vw, 15px)',
    color: colors.textMuted,
  },
};

const getResponsiveStyles = (isMobile: boolean): { [key: string]: React.CSSProperties } => {
  if (!isMobile) return {};

  return {
    hexagonRowBottom: {
      flexDirection: 'column' as const,
    },
  } as { [key: string]: React.CSSProperties };
};

// Inject global styles for hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (hover: hover) {
    .hexagon-link:hover .hexagon-shape,
    .hexagon-link:hover [style*="clip-path"] {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    }

    .welcome-button-bar:hover:not(:disabled) {
      background-color: #9A7D4A !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(201, 169, 97, 0.4) !important;
    }

    .welcome-button-bar:active:not(:disabled) {
      transform: translateY(0);
    }
  }
`;
if (!document.head.querySelector('[data-initial-welcome-styles]')) {
  styleSheet.setAttribute('data-initial-welcome-styles', 'true');
  document.head.appendChild(styleSheet);
}
