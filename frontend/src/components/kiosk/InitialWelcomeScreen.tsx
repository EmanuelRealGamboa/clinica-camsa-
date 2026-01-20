import React from 'react';
import { colors } from '../../styles/colors';
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
  
  return (
    <div style={{ ...styles.container, ...responsiveStyles.container }}>
      {/* Logo Section */}
      <div style={{ ...styles.logoContainer, ...responsiveStyles.logoContainer }}>
        <div style={{ ...styles.logoPlaceholder, ...responsiveStyles.logoPlaceholder }}>
          <img src={logoHorizontal} alt="Clínica CAMSA" style={styles.logoImage} />
        </div>
      </div>

      {/* Welcome Content */}
      <div style={styles.content}>
        <h1 style={{ ...styles.title, ...responsiveStyles.title }}>¡Bienvenido!</h1>

        <div style={{ ...styles.messageContainer, ...responsiveStyles.messageContainer }}>
          <div style={{ ...styles.messageCard, ...responsiveStyles.messageCard }}>
            <div style={{ ...styles.iconCircle, ...responsiveStyles.iconCircle }}>
              <span style={{ ...styles.icon, ...responsiveStyles.icon }}>🎁</span>
            </div>
            <h2 style={{ ...styles.messageTitle, ...responsiveStyles.messageTitle }}>Cortesías Gratuitas</h2>
            <p style={{ ...styles.messageText, ...responsiveStyles.messageText }}>
              Durante tu consulta, disfruta de bebidas y snacks completamente gratis.
            </p>
          </div>

          <div style={{ ...styles.messageCard, ...responsiveStyles.messageCard }}>
            <div style={{ ...styles.iconCircle, ...responsiveStyles.iconCircle }}>
              <span style={{ ...styles.icon, ...responsiveStyles.icon }}>🍽️</span>
            </div>
            <h2 style={{ ...styles.messageTitle, ...responsiveStyles.messageTitle }}>Ordena Comida</h2>
            <p style={{ ...styles.messageText, ...responsiveStyles.messageText }}>
              También puedes ordenar alimentos adicionales desde nuestro menú.
            </p>
          </div>
        </div>

        <button
          style={isButtonDisabled 
            ? { ...styles.buttonDisabled, ...responsiveStyles.button } 
            : { ...styles.button, ...responsiveStyles.button }}
          onClick={onViewMenu}
          disabled={isButtonDisabled}
        >
          {loading ? 'Verificando...' : patientAssigned ? 'Ver Menú' : 'Esperando registro...'}
        </button>

        {!patientAssigned && (
          <p style={{ ...styles.waitingMessage, ...responsiveStyles.waitingMessage }}>
            Por favor espera a que tu enfermera te registre en el sistema
          </p>
        )}

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
    backgroundColor: colors.primary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  logoContainer: {
    marginBottom: '60px',
  },
  logoPlaceholder: {
    width: '300px',
    height: '120px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    padding: '20px',
  },
  logoImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    height: 'auto',
    width: 'auto',
    objectFit: 'contain',
  },
  content: {
    textAlign: 'center',
    maxWidth: '900px',
    width: '100%',
  },
  title: {
    fontSize: '56px',
    fontWeight: 'bold',
    color: colors.white,
    margin: '0 0 60px 0',
    textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  },
  messageContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    marginBottom: '60px',
  },
  messageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '40px 30px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  iconCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: colors.primaryLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px auto',
  },
  icon: {
    fontSize: '50px',
  },
  messageTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: colors.primary,
    margin: '0 0 16px 0',
  },
  messageText: {
    fontSize: '18px',
    color: colors.gray,
    lineHeight: '1.6',
    margin: 0,
  },
  button: {
    padding: '24px 80px',
    backgroundColor: colors.white,
    color: colors.primary,
    border: `3px solid ${colors.white}`,
    borderRadius: '50px',
    fontSize: '28px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  buttonDisabled: {
    padding: '24px 80px',
    backgroundColor: colors.grayLight,
    color: colors.white,
    border: `3px solid ${colors.grayLight}`,
    borderRadius: '50px',
    fontSize: '28px',
    fontWeight: 'bold',
    cursor: 'not-allowed',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    opacity: 0.7,
  },
  footer: {
    marginTop: '40px',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  waitingMessage: {
    marginTop: '20px',
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
  },
};

// Responsive styles helper
const getResponsiveStyles = (isMobile: boolean) => {
  if (!isMobile) {
    return {};
  }
  
  return {
    container: {
      padding: '20px 16px',
    },
    logoContainer: {
      marginBottom: '30px',
    },
    logoPlaceholder: {
      width: '100%',
      maxWidth: '280px',
      height: '100px',
      padding: '15px',
    },
    title: {
      fontSize: '36px',
      marginBottom: '30px',
    },
    messageContainer: {
      gridTemplateColumns: '1fr',
      gap: '20px',
      marginBottom: '30px',
    },
    messageCard: {
      padding: '24px 20px',
    },
    iconCircle: {
      width: '80px',
      height: '80px',
      marginBottom: '16px',
    },
    icon: {
      fontSize: '40px',
    },
    messageTitle: {
      fontSize: '22px',
      marginBottom: '12px',
    },
    messageText: {
      fontSize: '15px',
    },
    button: {
      padding: '18px 32px',
      fontSize: '18px',
      width: '100%',
      maxWidth: '100%',
    },
    waitingMessage: {
      fontSize: '15px',
      marginTop: '16px',
    },
    footer: {
      fontSize: '12px',
      marginTop: '24px',
    },
  };
};

// Add hover effect
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (hover: hover) {
    .welcome-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.25);
    }

    .welcome-button:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }

    .welcome-button:active:not(:disabled) {
      transform: scale(0.98);
    }
  }
`;
if (!document.head.querySelector('[data-initial-welcome-styles]')) {
  styleSheet.setAttribute('data-initial-welcome-styles', 'true');
  document.head.appendChild(styleSheet);
}
