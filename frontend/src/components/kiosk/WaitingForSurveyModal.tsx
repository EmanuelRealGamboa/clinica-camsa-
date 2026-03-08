import React from 'react';
import { colors } from '../../styles/colors';
import { TIENDA_CAMSA_URL, RESTAURANTES_CAMSA_URL, KIOSK_LANDING_VIDEO_IDS, getYoutubeEmbedUrl } from '../../constants/urls';

interface WaitingForSurveyModalProps {
  onReturnToMenu: () => void;
}

const WaitingForSurveyModal: React.FC<WaitingForSurveyModalProps> = ({ onReturnToMenu }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.content}>
          <div style={styles.iconContainer}>
            <span style={styles.icon}>⏳</span>
          </div>
          <h2 style={styles.title}>Esperando confirmación de encuesta</h2>
          <p style={styles.message}>
            Tu orden ha sido entregada. Estamos esperando que tu enfermera habilite la encuesta para que puedas compartir tu opinión.
          </p>
          <p style={styles.note}>
            Mientras tanto, puedes regresar al menú, pero no podrás realizar nuevas órdenes a menos que tu enfermera las cree por ti.
          </p>

          {/* Video grande tipo landing mientras espera */}
          {KIOSK_LANDING_VIDEO_IDS.length > 0 && (
            <div style={styles.videoSection}>
              <div style={styles.videoCircleLarge}>
                <iframe
                  title="Productos CAMSA"
                  src={getYoutubeEmbedUrl(KIOSK_LANDING_VIDEO_IDS[0])}
                  style={styles.videoIframe}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </div>
          )}

          <div style={styles.buttonsContainer}>
            <button
              type="button"
              onClick={() => window.open(TIENDA_CAMSA_URL, '_blank', 'noopener,noreferrer')}
              style={styles.tiendaButton}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = colors.primaryMuted;
                e.currentTarget.style.borderColor = colors.primaryDark;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = colors.white;
                e.currentTarget.style.borderColor = colors.primary;
              }}
            >
              <span style={styles.tiendaButtonIcon}>🛒</span>
              <span>Conoce nuestros productos</span>
            </button>
            <button
              type="button"
              onClick={() => window.open(RESTAURANTES_CAMSA_URL, '_blank', 'noopener,noreferrer')}
              style={styles.tiendaButton}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = colors.primaryMuted;
                e.currentTarget.style.borderColor = colors.primaryDark;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = colors.white;
                e.currentTarget.style.borderColor = colors.primary;
              }}
            >
              <span style={styles.tiendaButtonIcon}>🍽️</span>
              <span>Pedir comida</span>
            </button>
            <button
              onClick={onReturnToMenu}
              style={styles.button}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = colors.primaryDark;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
              }}
            >
              Volver al Menú
            </button>
          </div>
        </div>
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
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '560px',
    width: '100%',
    maxHeight: '95vh',
    overflowY: 'auto',
    boxShadow: colors.shadowGold,
    border: `1px solid ${colors.primaryMuted}`,
    textAlign: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: colors.primaryMuted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  icon: {
    fontSize: '40px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: colors.textPrimary,
    margin: 0,
  },
  message: {
    fontSize: '16px',
    color: colors.textSecondary,
    lineHeight: 1.6,
    margin: 0,
  },
  note: {
    fontSize: '14px',
    color: colors.textSecondary,
    lineHeight: 1.5,
    fontStyle: 'italic',
    margin: 0,
  },
  videoSection: {
    display: 'flex',
    justifyContent: 'center',
    margin: '16px 0',
  },
  videoCircleLarge: {
    width: 400,
    height: 400,
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid rgba(212, 175, 55, 0.35)',
    boxShadow: '0 10px 50px rgba(212, 175, 55, 0.14), 0 2px 12px rgba(0,0,0,0.04)',
    position: 'relative' as const,
  },
  videoIframe: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    width: '200%',
    height: '200%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    pointerEvents: 'none' as const,
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    marginTop: '10px',
  },
  tiendaButton: {
    backgroundColor: colors.white,
    color: colors.primary,
    border: `3px solid ${colors.primary}`,
    borderRadius: '12px',
    padding: '18px 36px',
    fontSize: '18px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    boxShadow: `0 4px 16px ${colors.shadowGold}`,
    minHeight: '56px',
  },
  tiendaButtonIcon: {
    fontSize: '28px',
    lineHeight: 1,
  },
  button: {
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px',
  },
};

export default WaitingForSurveyModal;
