import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronRight, Star } from 'lucide-react';
import { colors, gradients } from '../../styles/colors';
import { TIENDA_CAMSA_URL, RESTAURANTES_CAMSA_URL } from '../../constants/urls';
import { useWindowSize } from '../../utils/responsive';
import logoHorizontal from '../../assets/logos/logo-horizontal.png';
import iconTe from '../../assets/icons/te.png';
import iconStore from '../../assets/icons/store.png';
import iconComida from '../../assets/icons/comida.png';

interface InitialWelcomeScreenProps {
  deviceUid: string;
  onViewMenu: () => void;
  loading?: boolean;
  patientAssigned?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } },
  hover: {
    y: -8,
    scale: 1.03,
    transition: { type: 'spring' as const, stiffness: 320, damping: 22 },
  },
  tap: { scale: 0.97 },
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  accent?: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, href, accent, delay = 0 }) => {
  const cardContent = (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
      style={{
        ...cardStyle,
        borderTop: `4px solid ${accent || colors.primary}`,
      }}
      custom={delay}
    >
      <div style={{ ...iconCircle, backgroundColor: accent ? `${accent}18` : colors.primaryMuted, border: `2px solid ${accent || colors.primary}` }}>
        <span style={{ color: accent || colors.primaryDark }}>{icon}</span>
      </div>
      <h3 style={cardTitle}>{title}</h3>
      <p style={cardDescription}>{description}</p>
      {href && (
        <div style={cardLink}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: accent || colors.primaryDark }}>Explorar</span>
          <ChevronRight size={14} color={accent || colors.primaryDark} />
        </div>
      )}
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
        {cardContent}
      </a>
    );
  }
  return cardContent;
};

export const InitialWelcomeScreen: React.FC<InitialWelcomeScreenProps> = ({
  deviceUid,
  onViewMenu,
  loading = false,
  patientAssigned = false,
}) => {
  const { isMobile } = useWindowSize();
  const isButtonDisabled = !patientAssigned || loading;

  return (
    <div style={containerStyle}>
      {/* Background decorative elements */}
      <div style={bgCircle1} />
      <div style={bgCircle2} />
      <div style={bgDots} />

      {/* Logo / Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={headerStyle}
      >
        <div style={logoBadgeStyle}>
          <img src={logoHorizontal} alt="Clínica CAMSA" style={{ height: isMobile ? 48 : 68, width: 'auto', objectFit: 'contain' }} />
        </div>
        {/* Gold accent line */}
        <div style={goldLine} />
      </motion.div>

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={mainContent}
      >
        {/* Welcome heading */}
        <motion.div variants={itemVariants} style={{ textAlign: 'center' }}>
          <p style={eyebrow}>
            <Star size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Servicio Premium
          </p>
          <h1 style={{ ...welcomeTitle, fontSize: isMobile ? '38px' : '60px' }}>
            ¡Bienvenido!
          </h1>
          <p style={{ ...welcomeSubtitle, fontSize: isMobile ? '16px' : '20px' }}>
            Tu comodidad es nuestra prioridad
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={containerVariants}
          style={{
            ...cardsGrid,
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            maxWidth: isMobile ? '420px' : '960px',
          }}
        >
          <FeatureCard
            icon={
              <img
                src={iconTe}
                alt="Cortesías gratuitas"
                style={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, objectFit: 'contain', display: 'block' }}
                draggable={false}
              />
            }
            title="Cortesías Gratuitas"
            description="Durante tu consulta, disfruta de bebidas y snacks completamente gratis."
            accent={colors.primary}
          />
          <FeatureCard
            icon={
              <img
                src={iconStore}
                alt="Conoce nuestros productos"
                style={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, objectFit: 'contain', display: 'block' }}
                draggable={false}
              />
            }
            title="Conoce nuestros productos"
            description="Explora nuestra tienda en línea y descubre más opciones disponibles."
            href={TIENDA_CAMSA_URL}
            accent={colors.latte}
          />
          <FeatureCard
            icon={
              <img
                src={iconComida}
                alt="Pedir comida"
                style={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, objectFit: 'contain', display: 'block' }}
                draggable={false}
              />
            }
            title="Pedir comida"
            description="Ordena comida de restaurantes cercanos y disfrútala en la clínica."
            href={RESTAURANTES_CAMSA_URL}
            accent={colors.caramel}
          />
        </motion.div>

        {/* Divider */}
        <motion.div variants={itemVariants} style={divider}>
          <div style={dividerLine} />
          <span style={dividerText}>Registro de paciente</span>
          <div style={dividerLine} />
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants} style={{ width: '100%', maxWidth: isMobile ? '400px' : '560px' }}>
          <AnimatePresence mode="wait">
            {patientAssigned ? (
              <motion.button
                key="ready"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={onViewMenu}
                disabled={loading}
                style={buttonReady}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '10px' }} />
                    Verificando...
                  </>
                ) : (
                  <>
                    Ver Menú
                    <ChevronRight size={22} style={{ marginLeft: '8px' }} />
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={buttonWaiting}
                disabled
              >
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <Loader2 size={20} style={{ animation: 'spin 1.5s linear infinite' }} />
                  Esperando registro...
                </motion.div>
              </motion.button>
            )}
          </AnimatePresence>

          {!patientAssigned && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={waitingMessage}
            >
              Por favor espera a que tu enfermera te registre en el sistema
            </motion.p>
          )}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={footerStyle}
      >
        Dispositivo: {deviceUid}
      </motion.p>
    </div>
  );
};

/* ─── Styles ─────────────────────────────────────────── */

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: colors.ivory,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '32px 24px',
  boxSizing: 'border-box',
  position: 'relative',
  overflow: 'hidden',
};

const bgCircle1: React.CSSProperties = {
  position: 'absolute',
  top: '-120px',
  right: '-120px',
  width: '400px',
  height: '400px',
  borderRadius: '50%',
  background: `radial-gradient(circle, ${colors.primaryMuted} 0%, transparent 70%)`,
  pointerEvents: 'none',
  zIndex: 0,
};

const bgCircle2: React.CSSProperties = {
  position: 'absolute',
  bottom: '-80px',
  left: '-80px',
  width: '300px',
  height: '300px',
  borderRadius: '50%',
  background: `radial-gradient(circle, ${colors.cream} 0%, transparent 70%)`,
  pointerEvents: 'none',
  zIndex: 0,
};

const bgDots: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage: `radial-gradient(circle, ${colors.parchment} 1.5px, transparent 1.5px)`,
  backgroundSize: '32px 32px',
  pointerEvents: 'none',
  zIndex: 0,
  opacity: 0.6,
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  position: 'relative',
  zIndex: 1,
  flexShrink: 0,
};

const logoBadgeStyle: React.CSSProperties = {
  backgroundColor: colors.white,
  borderRadius: '20px',
  padding: '16px 48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 4px 24px ${colors.shadowGold}, 0 1px 4px ${colors.shadow}`,
  border: `1px solid ${colors.parchment}`,
};

const goldLine: React.CSSProperties = {
  width: '60px',
  height: '3px',
  background: gradients.gold,
  borderRadius: '2px',
};

const mainContent: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '36px',
  width: '100%',
  position: 'relative',
  zIndex: 1,
};

const eyebrow: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: colors.primary,
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const welcomeTitle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 700,
  color: colors.espresso,
  lineHeight: 1.1,
  margin: '0 0 12px 0',
};

const welcomeSubtitle: React.CSSProperties = {
  color: colors.textSecondary,
  fontWeight: 400,
  margin: 0,
};

const cardsGrid: React.CSSProperties = {
  display: 'grid',
  gap: '20px',
  width: '100%',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.white,
  borderRadius: '20px',
  padding: '28px 24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: '14px',
  boxShadow: `0 4px 24px ${colors.shadow}, 0 1px 4px ${colors.shadowGold}`,
  border: `1px solid ${colors.parchment}`,
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
};

const iconCircle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const cardTitle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: colors.espresso,
  margin: 0,
  lineHeight: 1.3,
};

const cardDescription: React.CSSProperties = {
  fontSize: '14px',
  color: colors.textSecondary,
  margin: 0,
  lineHeight: 1.6,
  flex: 1,
};

const cardLink: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginTop: '4px',
};

const divider: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  width: '100%',
  maxWidth: '560px',
};

const dividerLine: React.CSSProperties = {
  flex: 1,
  height: '1px',
  backgroundColor: colors.parchment,
};

const dividerText: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: colors.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  whiteSpace: 'nowrap',
};

const buttonBase: React.CSSProperties = {
  width: '100%',
  padding: '20px 40px',
  borderRadius: '14px',
  fontSize: '18px',
  fontWeight: 700,
  cursor: 'pointer',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  letterSpacing: '0.5px',
  transition: 'box-shadow 0.2s',
};

const buttonReady: React.CSSProperties = {
  ...buttonBase,
  background: gradients.gold,
  color: colors.white,
  boxShadow: `0 6px 28px ${colors.shadowGold}`,
};

const buttonWaiting: React.CSSProperties = {
  ...buttonBase,
  background: gradients.gold,
  color: colors.white,
  opacity: 0.75,
  cursor: 'not-allowed',
  boxShadow: `0 4px 16px ${colors.shadowGold}`,
};

const waitingMessage: React.CSSProperties = {
  marginTop: '14px',
  fontSize: '14px',
  color: colors.textSecondary,
  textAlign: 'center',
  lineHeight: 1.5,
};

const footerStyle: React.CSSProperties = {
  fontSize: '12px',
  color: colors.textMuted,
  position: 'relative',
  zIndex: 1,
  flexShrink: 0,
};
