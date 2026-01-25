import React, { useState, useEffect } from 'react';
import type { Service } from '../../types/store';
import { CalendarPicker } from './CalendarPicker';
import { TimeSlotPicker } from './TimeSlotPicker';
import { getMockTimeSlotsForDate } from '../../hooks/useServiceBooking';
import { colors } from '../../styles/colors';

interface ServiceReservationModalProps {
  service: Service;
  onConfirm: (date: Date, timeSlot: string, notes?: string) => void;
  onClose: () => void;
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

export const ServiceReservationModal: React.FC<ServiceReservationModalProps> = ({
  service,
  onConfirm,
  onClose,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const timeSlots = selectedDate
    ? getMockTimeSlotsForDate(selectedDate, service)
    : [];

  const canConfirm = selectedDate && selectedTimeSlot;

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm(selectedDate!, selectedTimeSlot!, notes || undefined);
    }
  };

  return (
    <>
      <div style={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Reservar {service.name}</h2>
          <button
            type="button"
            style={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.serviceInfo}>
            <h3 style={styles.serviceName}>{service.name}</h3>
            <p style={styles.serviceDesc}>{service.description}</p>
            <div style={styles.serviceMeta}>
              <span>{formatPrice(service.price)}</span>
              <span>•</span>
              <span>{service.duration} min</span>
            </div>
          </div>

          <div style={styles.formSection}>
            <div style={styles.step}>
              <h4 style={styles.stepTitle}>1. Selecciona la fecha</h4>
              <CalendarPicker
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                availableDays={service.availableDays}
              />
            </div>

            {selectedDate && (
              <div style={styles.step}>
                <h4 style={styles.stepTitle}>2. Selecciona el horario</h4>
                <TimeSlotPicker
                  slots={timeSlots}
                  selected={selectedTimeSlot}
                  onSelect={setSelectedTimeSlot}
                  duration={service.duration}
                />
              </div>
            )}

            <div style={styles.step}>
              <h4 style={styles.stepTitle}>3. Notas adicionales (opcional)</h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalles adicionales sobre tu reservación..."
                style={styles.textarea}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button
            type="button"
            style={styles.cancelBtn}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            style={{
              ...styles.confirmBtn,
              ...(!canConfirm ? styles.confirmBtnDisabled : {}),
            }}
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            Confirmar Reservación
          </button>
        </div>
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: colors.overlay,
    zIndex: 999,
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 600,
    maxHeight: '90vh',
    backgroundColor: colors.white,
    borderRadius: 16,
    boxShadow: `0 4px 24px ${colors.shadowDark}`,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: `1px solid ${colors.border}`,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: 'none',
    backgroundColor: colors.grayBg,
    cursor: 'pointer',
    fontSize: 18,
    color: colors.textSecondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  serviceInfo: {
    padding: 16,
    backgroundColor: colors.ivory,
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
  },
  serviceName: {
    margin: '0 0 8px 0',
    fontSize: 18,
    fontWeight: 700,
    color: colors.textPrimary,
  },
  serviceDesc: {
    margin: '0 0 12px 0',
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 1.5,
  },
  serviceMeta: {
    display: 'flex',
    gap: 8,
    fontSize: 14,
    color: colors.textMuted,
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  stepTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: colors.textPrimary,
  },
  textarea: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    border: `2px solid ${colors.border}`,
    fontSize: 14,
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: 80,
  },
  footer: {
    display: 'flex',
    gap: 12,
    padding: '20px 24px',
    borderTop: `1px solid ${colors.border}`,
  },
  cancelBtn: {
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
  confirmBtn: {
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
  confirmBtnDisabled: {
    backgroundColor: colors.grayLight,
    cursor: 'not-allowed',
    opacity: 0.6,
  },
};
