import React, { useState } from 'react';
import { colors } from '../../styles/colors';

interface OrderLimitsConfiguratorProps {
  currentLimits: {
    DRINK?: number;
    SNACK?: number;
  };
  onSave: (limits: { DRINK: number; SNACK: number }) => void;
  onCancel: () => void;
}

export const OrderLimitsConfigurator: React.FC<OrderLimitsConfiguratorProps> = ({
  currentLimits,
  onSave,
  onCancel,
}) => {
  const [drinkLimit, setDrinkLimit] = useState(currentLimits.DRINK || 1);
  const [snackLimit, setSnackLimit] = useState(currentLimits.SNACK || 1);

  const handleSave = () => {
    onSave({
      DRINK: drinkLimit,
      SNACK: snackLimit,
    });
  };

  const handleReset = () => {
    setDrinkLimit(1);
    setSnackLimit(1);
  };

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>Configurar Límites de Pedido</h2>
        <p style={styles.subtitle}>
          Establece cuántos productos puede pedir el paciente durante su estancia
        </p>

        <div style={styles.limitsContainer}>
          {/* Drink Limit */}
          <div style={styles.limitRow}>
            <div style={styles.limitInfo}>
              <span style={styles.limitIcon}>🥤</span>
              <div>
                <div style={styles.limitLabel}>Bebidas</div>
                <div style={styles.limitDescription}>
                  Incluye agua, café, té, jugos
                </div>
              </div>
            </div>
            <select
              style={styles.select}
              value={drinkLimit}
              onChange={(e) => setDrinkLimit(Number(e.target.value))}
            >
              <option value={0}>Sin límite</option>
              <option value={1}>1 bebida</option>
              <option value={2}>2 bebidas</option>
              <option value={3}>3 bebidas</option>
              <option value={4}>4 bebidas</option>
              <option value={5}>5 bebidas</option>
            </select>
          </div>

          {/* Snack Limit */}
          <div style={styles.limitRow}>
            <div style={styles.limitInfo}>
              <span style={styles.limitIcon}>🍪</span>
              <div>
                <div style={styles.limitLabel}>Snacks</div>
                <div style={styles.limitDescription}>
                  Incluye frutas, galletas, pan
                </div>
              </div>
            </div>
            <select
              style={styles.select}
              value={snackLimit}
              onChange={(e) => setSnackLimit(Number(e.target.value))}
            >
              <option value={0}>Sin límite</option>
              <option value={1}>1 snack</option>
              <option value={2}>2 snacks</option>
              <option value={3}>3 snacks</option>
              <option value={4}>4 snacks</option>
              <option value={5}>5 snacks</option>
            </select>
          </div>
        </div>

        <div style={styles.infoBox}>
          <span style={styles.infoIcon}>ℹ️</span>
          <p style={styles.infoText}>
            Los límites se resetean cuando finaliza la asignación del paciente.
            El paciente verá un mensaje cuando alcance el límite.
          </p>
        </div>

        <div style={styles.buttons}>
          <button style={styles.resetButton} onClick={handleReset}>
            Restablecer
          </button>
          <div style={styles.actionButtons}>
            <button style={styles.cancelButton} onClick={onCancel}>
              Cancelar
            </button>
            <button style={styles.saveButton} onClick={handleSave}>
              Guardar Límites
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
    zIndex: 10000,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '600px',
    width: '90%',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: colors.black,
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: colors.gray,
    margin: '0 0 24px 0',
  },
  limitsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
  },
  limitRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    border: '2px solid #e9ecef',
  },
  limitInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  limitIcon: {
    fontSize: '32px',
  },
  limitLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: '4px',
  },
  limitDescription: {
    fontSize: '13px',
    color: colors.gray,
  },
  select: {
    padding: '10px 16px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#ff9800',
    border: '2px solid #ff9800',
    borderRadius: '8px',
    backgroundColor: colors.white,
    cursor: 'pointer',
    minWidth: '150px',
  },
  infoBox: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  infoIcon: {
    fontSize: '20px',
  },
  infoText: {
    fontSize: '13px',
    color: '#1976d2',
    margin: 0,
    lineHeight: '1.5',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resetButton: {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    color: colors.gray,
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: colors.white,
    color: colors.gray,
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  saveButton: {
    padding: '12px 32px',
    backgroundColor: '#ff9800',
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};
