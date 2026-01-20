import React from 'react';
import { colors } from '../../styles/colors';

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
    maxWidth: '500px',
    width: '100%',
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
