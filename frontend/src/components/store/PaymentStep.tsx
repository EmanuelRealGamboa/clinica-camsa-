import React, { useState } from 'react';
import { colors } from '../../styles/colors';

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

/** Validación básica (prototipo). No procesa pagos reales. */
function formatCardNumber(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({ onNext, onBack }) => {
  const [name, setName] = useState('');
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nombre requerido';
    if (card.replace(/\s/g, '').length < 16) e.card = 'Tarjeta inválida';
    if (expiry.length < 5) e.expiry = 'Fecha requerida';
    const [mm, yy] = expiry.split('/').map((x) => parseInt(x, 10));
    if (mm < 1 || mm > 12) e.expiry = 'Mes inválido';
    const now = new Date();
    const y = now.getFullYear() % 100;
    const m = now.getMonth() + 1;
    if (yy < y || (yy === y && mm < m)) e.expiry = 'Tarjeta expirada';
    if (!/^\d{3,4}$/.test(cvv)) e.cvv = 'CVV inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onNext();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardIcon}>💳</span>
          <h3 style={styles.cardTitle}>Información de Pago</h3>
        </div>
        <p style={styles.cardSubtitle}>
          Ingresa los datos de tu tarjeta de crédito o débito
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Número de Tarjeta</label>
            <input
              type="text"
              value={card}
              onChange={(e) => setCard(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              style={{
                ...styles.input,
                borderColor: errors.card ? colors.error : colors.border,
              }}
            />
            {errors.card && <span style={styles.error}>{errors.card}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Nombre en la Tarjeta</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como aparece en la tarjeta"
              style={{
                ...styles.input,
                borderColor: errors.name ? colors.error : colors.border,
              }}
            />
            {errors.name && <span style={styles.error}>{errors.name}</span>}
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Fecha de Expiración (MM/AA)</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/AA"
                maxLength={5}
                style={{
                  ...styles.input,
                  borderColor: errors.expiry ? colors.error : colors.border,
                }}
              />
              {errors.expiry && <span style={styles.error}>{errors.expiry}</span>}
            </div>
            <div style={styles.field}>
              <label style={styles.label}>CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                maxLength={4}
                style={{
                  ...styles.input,
                  borderColor: errors.cvv ? colors.error : colors.border,
                }}
              />
              {errors.cvv && <span style={styles.error}>{errors.cvv}</span>}
            </div>
          </div>

          <div style={styles.securityBanner}>
            <span style={styles.shieldIcon}>🛡️</span>
            <span style={styles.securityText}>
              Tus datos están protegidos con encriptación SSL de 256 bits
            </span>
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.backBtn} onClick={onBack}>
              ← Volver a Entrega
            </button>
            <button type="submit" style={styles.submitBtn}>
              Pagar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    boxShadow: `0 2px 8px ${colors.shadow}`,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    margin: '0 0 24px 0',
    fontSize: 14,
    color: colors.textSecondary,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.textPrimary,
  },
  input: {
    padding: '12px 16px',
    borderRadius: 8,
    border: `2px solid ${colors.border}`,
    fontSize: 15,
    backgroundColor: colors.white,
    fontFamily: 'inherit',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  error: {
    fontSize: 12,
    color: colors.error,
  },
  securityBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.primaryMuted,
    borderRadius: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  shieldIcon: {
    fontSize: 18,
  },
  securityText: {
    flex: 1,
  },
  actions: {
    display: 'flex',
    gap: 12,
    marginTop: 8,
  },
  backBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    border: `2px solid ${colors.border}`,
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
