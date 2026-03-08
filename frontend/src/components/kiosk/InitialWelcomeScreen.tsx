import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, PlayCircle, Store, Utensils, Gift } from 'lucide-react';
import {
  TIENDA_CAMSA_URL,
  RESTAURANTES_CAMSA_URL,
  KIOSK_LANDING_VIDEO_IDS,
  KIOSK_PRODUCT_IMAGES,
  getYoutubeEmbedUrl,
  getProductImageUrl,
} from '../../constants/urls';
import { useWindowSize } from '../../utils/responsive';
import logoHorizontal from '../../assets/logos/logo-horizontal.png';

interface InitialWelcomeScreenProps {
  deviceUid: string;
  onViewMenu: () => void;
  loading?: boolean;
  patientAssigned?: boolean;
}

const VIDEO_ROTATION_MS = 15000;

export const InitialWelcomeScreen: React.FC<InitialWelcomeScreenProps> = ({
  deviceUid,
  onViewMenu,
  loading = false,
  patientAssigned = false,
}) => {
  const { isMobile } = useWindowSize();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [videoUnavailable, setVideoUnavailable] = useState(false);

  useEffect(() => {
    if (KIOSK_LANDING_VIDEO_IDS.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveVideoIndex((prev) => (prev + 1) % KIOSK_LANDING_VIDEO_IDS.length);
    }, VIDEO_ROTATION_MS);
    return () => window.clearInterval(id);
  }, []);

  const activeVideoId = KIOSK_LANDING_VIDEO_IDS[activeVideoIndex] || '';
  const activeVideoUrl = useMemo(
    () => (activeVideoId ? getYoutubeEmbedUrl(activeVideoId) : ''),
    [activeVideoId],
  );

  useEffect(() => {
    setVideoUnavailable(false);
  }, [activeVideoId]);

  const mainSize = isMobile ? 320 : 480;
  const thumbSize = isMobile ? 160 : 220;
  const orbitRadius = isMobile ? 280 : 420;

  const productAngles = KIOSK_PRODUCT_IMAGES.map((_, i) => {
    const start = -90;
    const step = 360 / KIOSK_PRODUCT_IMAGES.length;
    return start + step * i;
  });

  return (
    <div style={page}>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={logoHorizontal}
          alt="Clínica CAMSA"
          style={{ height: isMobile ? 34 : 44, width: 'auto', objectFit: 'contain' }}
        />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        style={titleBlock}
      >
        <p style={eyebrow}>Descubre CAMSA</p>
        <h1 style={{ ...titleMain, fontSize: isMobile ? '26px' : '42px' }}>
          Descubre nuestros productos{' '}
          <span style={titleAccent}>mientras esperas</span>
        </h1>
        <p style={{ ...subtitle, fontSize: isMobile ? '13px' : '15px' }}>
          Tienda, comida y cortesías para ti.
        </p>
      </motion.div>

      {/* Orbit area: main video + product thumbnails */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        style={{
          position: 'relative',
          width: orbitRadius * 2 + thumbSize,
          height: orbitRadius * 2 + thumbSize,
          flexShrink: 0,
        }}
      >
        {/* Central video circle */}
        <div
          style={{
            ...videoCircle,
            width: mainSize,
            height: mainSize,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <AnimatePresence mode="wait">
            {activeVideoUrl && !videoUnavailable ? (
              <motion.div
                key={activeVideoId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={videoInner}
              >
                <iframe
                  title="Productos CAMSA"
                  src={activeVideoUrl}
                  style={videoIframe}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  onError={() => setVideoUnavailable(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="fallback"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={videoFallback}
              >
                <PlayCircle size={48} color="#fff" strokeWidth={1.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Orbiting product circles */}
        {KIOSK_PRODUCT_IMAGES.map((product, i) => {
          const angleDeg = productAngles[i];
          const angleRad = (angleDeg * Math.PI) / 180;
          const cx = orbitRadius * Math.cos(angleRad);
          const cy = orbitRadius * Math.sin(angleRad);

          return (
            <motion.a
              key={product.label}
              href={TIENDA_CAMSA_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.3 + i * 0.08 }}
              whileHover={{ scale: 1.12 }}
              style={{
                ...thumbCircle,
                width: thumbSize,
                height: thumbSize,
                position: 'absolute',
                top: `calc(50% + ${cy}px - ${thumbSize / 2}px)`,
                left: `calc(50% + ${cx}px - ${thumbSize / 2}px)`,
              }}
              title={product.label}
            >
              <img
                src={getProductImageUrl(product.filename)}
                alt={product.label}
                style={thumbImg}
                draggable={false}
              />
            </motion.a>
          );
        })}
      </motion.div>

      {/* Video dots */}
      {KIOSK_LANDING_VIDEO_IDS.length > 1 && (
        <div style={dotsRow}>
          {KIOSK_LANDING_VIDEO_IDS.map((vid, i) => (
            <button
              key={vid}
              type="button"
              onClick={() => setActiveVideoIndex(i)}
              aria-label={`Video ${i + 1}`}
              style={{ ...dotBtn, ...(i === activeVideoIndex ? dotActive : {}) }}
            />
          ))}
        </div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.4 }}
        style={{ ...buttonsWrap, flexDirection: isMobile ? 'column' : 'row' }}
      >
        <a href={TIENDA_CAMSA_URL} target="_blank" rel="noopener noreferrer" style={linkReset}>
          <span style={{ ...btnPill, ...btnGold }}>
            <Store size={20} />
            Visitar tienda online
          </span>
        </a>
        <a href={RESTAURANTES_CAMSA_URL} target="_blank" rel="noopener noreferrer" style={linkReset}>
          <span style={{ ...btnPill, ...btnGoldDark }}>
            <Utensils size={20} />
            Pedir comida
          </span>
        </a>
      </motion.div>

      {/* Cortesias */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        style={cortesiasWrap}
      >
        <button
          type="button"
          onClick={onViewMenu}
          disabled={!patientAssigned || loading}
          style={{
            ...btnPill,
            ...(patientAssigned && !loading ? btnOutlineActive : btnOutline),
            ...((!patientAssigned || loading) ? btnDisabled : {}),
            width: isMobile ? '100%' : '380px',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Verificando...
            </>
          ) : (
            <>
              <Gift size={20} />
              Ver menú de cortesías
            </>
          )}
        </button>
        {!patientAssigned && (
          <p style={waitingMsg}>Esperando registro de paciente</p>
        )}
      </motion.div>

      <p style={footer}>Dispositivo: {deviceUid}</p>
    </div>
  );
};

/* ── Palette ─────────────────────────────────────────── */
const GOLD = '#C9A227';
const GOLD_LIGHT = '#E8C547';
const GOLD_DARK = '#B8860B';
const BG = '#FAFAF5';

/* ── Page ────────────────────────────────────────────── */
const page: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: BG,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
  padding: '28px 20px',
  boxSizing: 'border-box',
};

/* ── Title ───────────────────────────────────────────── */
const titleBlock: React.CSSProperties = {
  textAlign: 'center',
  maxWidth: '600px',
};

const eyebrow: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: GOLD_DARK,
  textTransform: 'uppercase',
  letterSpacing: '2px',
  margin: '0 0 10px 0',
};

const titleMain: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 700,
  color: '#1a1a1a',
  lineHeight: 1.15,
  margin: '0 0 10px 0',
};

const titleAccent: React.CSSProperties = {
  color: GOLD,
  fontStyle: 'italic',
};

const subtitle: React.CSSProperties = {
  color: '#888',
  fontWeight: 400,
  margin: 0,
  lineHeight: 1.5,
};

/* ── Video circle (center) ───────────────────────────── */
const videoCircle: React.CSSProperties = {
  borderRadius: '50%',
  overflow: 'hidden',
  border: `3px solid rgba(212, 175, 55, 0.35)`,
  boxShadow: '0 10px 50px rgba(212, 175, 55, 0.14), 0 2px 12px rgba(0,0,0,0.04)',
  zIndex: 2,
};

const videoInner: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
};

const videoIframe: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '200%',
  height: '200%',
  transform: 'translate(-50%, -50%)',
  border: 'none',
  pointerEvents: 'none',
};

const videoFallback: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
};

/* ── Product thumbnail circles ───────────────────────── */
const thumbCircle: React.CSSProperties = {
  borderRadius: '50%',
  overflow: 'hidden',
  border: `2px solid rgba(212, 175, 55, 0.4)`,
  boxShadow: '0 4px 20px rgba(212, 175, 55, 0.15), 0 1px 6px rgba(0,0,0,0.05)',
  zIndex: 1,
  cursor: 'pointer',
  display: 'block',
  textDecoration: 'none',
  backgroundColor: '#fff',
};

const thumbImg: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

/* ── Dots ────────────────────────────────────────────── */
const dotsRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginTop: '-6px',
};

const dotBtn: React.CSSProperties = {
  width: '9px',
  height: '9px',
  borderRadius: '999px',
  border: '1.5px solid rgba(0,0,0,0.18)',
  backgroundColor: 'transparent',
  padding: 0,
  cursor: 'pointer',
  transition: 'background-color 0.2s, border-color 0.2s',
};

const dotActive: React.CSSProperties = {
  backgroundColor: GOLD,
  borderColor: GOLD,
};

/* ── Buttons ─────────────────────────────────────────── */
const buttonsWrap: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '14px',
};

const linkReset: React.CSSProperties = {
  textDecoration: 'none',
  display: 'block',
};

const btnPill: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  borderRadius: '999px',
  padding: '16px 36px',
  fontSize: '17px',
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: 'pointer',
  border: 'none',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  whiteSpace: 'nowrap',
};

const btnGold: React.CSSProperties = {
  background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
  color: '#fff',
  boxShadow: '0 4px 20px rgba(212, 175, 55, 0.32)',
};

const btnGoldDark: React.CSSProperties = {
  background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`,
  color: '#fff',
  boxShadow: '0 4px 20px rgba(184, 134, 11, 0.32)',
};

const btnOutline: React.CSSProperties = {
  background: 'transparent',
  color: GOLD_DARK,
  border: `2px solid rgba(212, 175, 55, 0.45)`,
  boxShadow: 'none',
};

const btnOutlineActive: React.CSSProperties = {
  background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
  color: '#fff',
  border: '2px solid transparent',
  boxShadow: '0 4px 20px rgba(212, 175, 55, 0.32)',
};

const btnDisabled: React.CSSProperties = {
  cursor: 'not-allowed',
  opacity: 0.55,
};

const cortesiasWrap: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
};

const waitingMsg: React.CSSProperties = {
  fontSize: '13px',
  color: '#aaa',
  margin: 0,
};

const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#ccc',
  marginTop: '4px',
};
