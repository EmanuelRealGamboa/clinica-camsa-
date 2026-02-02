import React from 'react';
import { colors } from '../../styles/colors';
import { useWindowSize } from '../../utils/responsive';

interface OrderStatusProgressProps {
  currentStatus: 'PLACED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
}

interface Step {
  id: number;
  status: string;
  label: string;
  icon: string;
}

const steps: Step[] = [
  { id: 1, status: 'PLACED', label: 'Realizado', icon: '✓' },
  { id: 2, status: 'PREPARING', label: 'Preparando', icon: '✓' },
  { id: 3, status: 'READY', label: 'Listo', icon: '3' },
  { id: 4, status: 'DELIVERED', label: 'Entregado', icon: '4' },
];

export const OrderStatusProgress: React.FC<OrderStatusProgressProps> = ({ currentStatus }) => {
  const { isMobile } = useWindowSize();

  const getStepIndex = (status: string): number => {
    const index = steps.findIndex(s => s.status === status);
    return index === -1 ? 0 : index;
  };

  const currentStepIndex = getStepIndex(currentStatus);

  const getStepState = (stepIndex: number): 'completed' | 'current' | 'pending' => {
    if (currentStatus === 'CANCELLED') return 'pending';
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'pending';
  };

  const containerStyles = { ...styles.container, ...(isMobile && responsiveStyles.container) };
  const progressBarStyles = { ...styles.progressBarContainer, ...(isMobile && responsiveStyles.progressBarContainer) };
  const stepCircleStyles = (isCompleted: boolean, isCurrent: boolean) => ({
    ...styles.stepCircle,
    ...(isMobile && responsiveStyles.stepCircle),
    ...(isCompleted && styles.stepCircleCompleted),
    ...(isCurrent && styles.stepCircleCurrent),
  });
  const stepLabelStyles = (isCurrent: boolean) => ({
    ...styles.stepLabel,
    ...(isMobile && responsiveStyles.stepLabel),
    ...(isCurrent && styles.stepLabelCurrent),
  });

  return (
    <div style={containerStyles}>
      {/* Progress Bar Background */}
      <div style={progressBarStyles}>
        <div style={styles.progressBarBg} />
        <div
          style={{
            ...styles.progressBarFill,
            width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>

      {/* Steps */}
      <div style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const state = getStepState(index);
          const isCompleted = state === 'completed';
          const isCurrent = state === 'current';

          return (
            <div key={step.id} style={styles.stepWrapper}>
              {/* Step Circle */}
              <div style={stepCircleStyles(isCompleted, isCurrent)}>
                {isCompleted ? '✓' : step.id}
              </div>

              {/* Step Label */}
              <div style={stepLabelStyles(isCurrent)}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancelled Status */}
      {currentStatus === 'CANCELLED' && (
        <div style={{ ...styles.cancelledBadge, ...(isMobile && responsiveStyles.cancelledBadge) }}>
          Pedido cancelado
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    padding: '40px 20px 20px 20px',
  },
  progressBarContainer: {
    position: 'absolute',
    top: '60px',
    left: '15%',
    right: '15%',
    height: '4px',
  },
  progressBarBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: '2px',
  },
  progressBarFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#ff9800',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
  stepsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  stepWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: colors.white,
    border: '3px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#9e9e9e',
    marginBottom: '12px',
    transition: 'all 0.3s ease',
  },
  stepCircleCompleted: {
    backgroundColor: '#ff9800',
    borderColor: '#ff9800',
    color: colors.white,
  },
  stepCircleCurrent: {
    backgroundColor: colors.white,
    borderColor: '#ff9800',
    color: '#ff9800',
    boxShadow: '0 0 0 4px rgba(255, 152, 0, 0.2)',
  },
  stepLabel: {
    fontSize: '14px',
    color: '#9e9e9e',
    fontWeight: '500',
    textAlign: 'center',
  },
  stepLabelCurrent: {
    color: '#ff9800',
    fontWeight: 'bold',
  },
  cancelledBadge: {
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#f44336',
    color: colors.white,
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
  },
};

const responsiveStyles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '24px 12px 12px 12px',
  },
  progressBarContainer: {
    top: '36px',
    left: '12%',
    right: '12%',
  },
  stepCircle: {
    width: '32px',
    height: '32px',
    fontSize: '12px',
    marginBottom: '8px',
    border: '2px solid #e0e0e0',
  },
  stepLabel: {
    fontSize: '11px',
  },
  cancelledBadge: {
    marginTop: '12px',
    padding: '10px 16px',
    fontSize: '14px',
  },
};
