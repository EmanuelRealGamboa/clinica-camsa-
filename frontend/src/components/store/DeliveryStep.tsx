import React, { useState } from 'react';
import { colors } from '../../styles/colors';

interface DeliveryStepProps {
  deliveryMethod: 'home' | 'clinic' | null;
  onDeliveryMethodChange: (method: 'home' | 'clinic') => void;
  contactInfo: {
    name: string;
    lastName: string;
    email: string;
    phone: string;
  };
  onContactInfoChange: (info: Partial<DeliveryStepProps['contactInfo']>) => void;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  onShippingAddressChange: (address: Partial<DeliveryStepProps['shippingAddress']>) => void;
}

export const DeliveryStep: React.FC<DeliveryStepProps> = ({
  deliveryMethod,
  onDeliveryMethodChange,
  contactInfo,
  onContactInfoChange,
  shippingAddress,
  onShippingAddressChange,
}) => {
  return (
    <div style={styles.container}>
      {/* Método de Entrega */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Método de Entrega</h3>
        <p style={styles.cardSubtitle}>Selecciona cómo deseas recibir tu pedido</p>
        <div style={styles.deliveryOptions}>
          <button
            type="button"
            style={{
              ...styles.deliveryOption,
              ...(deliveryMethod === 'home' ? styles.deliveryOptionActive : {}),
            }}
            onClick={() => onDeliveryMethodChange('home')}
          >
            <div style={styles.radioWrapper}>
              <div
                style={{
                  ...styles.radio,
                  ...(deliveryMethod === 'home' ? styles.radioActive : {}),
                }}
              >
                {deliveryMethod === 'home' && <div style={styles.radioDot} />}
              </div>
            </div>
            <div style={styles.optionContent}>
              <div style={styles.optionIcon}>🚚</div>
              <div style={styles.optionInfo}>
                <div style={styles.optionTitle}>Envío a Domicilio</div>
                <div style={styles.optionDesc}>
                  Recibe tu pedido en la comodidad de tu hogar
                </div>
                <div style={styles.optionMeta}>
                  <span>3-5 días hábiles</span>
                  <span style={styles.optionPrice}>$99.00</span>
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            style={{
              ...styles.deliveryOption,
              ...(deliveryMethod === 'clinic' ? styles.deliveryOptionActive : {}),
            }}
            onClick={() => onDeliveryMethodChange('clinic')}
          >
            <div style={styles.radioWrapper}>
              <div
                style={{
                  ...styles.radio,
                  ...(deliveryMethod === 'clinic' ? styles.radioActive : {}),
                }}
              >
                {deliveryMethod === 'clinic' && <div style={styles.radioDot} />}
              </div>
            </div>
            <div style={styles.optionContent}>
              <div style={styles.optionIcon}>🏢</div>
              <div style={styles.optionInfo}>
                <div style={styles.optionTitle}>Recoger en Clínica</div>
                <div style={styles.optionDesc}>
                  Recoge tu pedido en nuestra sucursal
                </div>
                <div style={styles.optionMeta}>
                  <span>Listo en 24h</span>
                  <span style={styles.optionPriceFree}>Gratis</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Información de Contacto */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Información de Contacto</h3>
        <p style={styles.cardSubtitle}>
          Necesitamos estos datos para enviarte actualizaciones sobre tu pedido
        </p>
        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre</label>
            <input
              type="text"
              value={contactInfo.name}
              onChange={(e) => onContactInfoChange({ name: e.target.value })}
              placeholder="Tu nombre"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Apellido</label>
            <input
              type="text"
              value={contactInfo.lastName}
              onChange={(e) => onContactInfoChange({ lastName: e.target.value })}
              placeholder="Tu apellido"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => onContactInfoChange({ email: e.target.value })}
              placeholder="tu@email.com"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Teléfono</label>
            <input
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => onContactInfoChange({ phone: e.target.value })}
              placeholder="+52 55 1234 5678"
              style={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Dirección de Envío (solo si es envío a domicilio) */}
      {deliveryMethod === 'home' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Dirección de Envío</h3>
          <p style={styles.cardSubtitle}>Indícanos dónde entregaremos tu pedido</p>
          <div style={styles.formGrid}>
            <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
              <label style={styles.label}>Dirección</label>
              <input
                type="text"
                value={shippingAddress.address}
                onChange={(e) => onShippingAddressChange({ address: e.target.value })}
                placeholder="Calle, número, colonia"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Ciudad</label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) => onShippingAddressChange({ city: e.target.value })}
                placeholder="Ciudad de México"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Estado</label>
              <select
                value={shippingAddress.state}
                onChange={(e) => onShippingAddressChange({ state: e.target.value })}
                style={styles.input}
              >
                <option value="">Selecciona estado</option>
                <option value="CDMX">Ciudad de México</option>
                <option value="Jalisco">Jalisco</option>
                <option value="Nuevo León">Nuevo León</option>
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Código Postal</label>
              <input
                type="text"
                value={shippingAddress.postalCode}
                onChange={(e) => onShippingAddressChange({ postalCode: e.target.value })}
                placeholder="00000"
                style={styles.input}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    boxShadow: `0 2px 8px ${colors.shadow}`,
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: 18,
    fontWeight: 700,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    margin: '0 0 20px 0',
    fontSize: 14,
    color: colors.textSecondary,
  },
  deliveryOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  deliveryOption: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    padding: 20,
    backgroundColor: colors.white,
    border: `2px solid ${colors.border}`,
    borderRadius: 12,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  deliveryOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.ivory,
  },
  radioWrapper: {
    marginTop: 4,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: `2px solid ${colors.border}`,
    backgroundColor: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: colors.primary,
  },
  optionContent: {
    flex: 1,
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
  },
  optionIcon: {
    fontSize: 32,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  optionMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 14,
    color: colors.textMuted,
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.primary,
  },
  optionPriceFree: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.success,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
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
};
