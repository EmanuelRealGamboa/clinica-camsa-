import React from 'react';
import { colors } from '../../styles/colors';
import { useWindowSize } from '../../utils/responsive';
import { Check, ClipboardCheck, ChefHat, BellRing, PackageCheck } from 'lucide-react';

interface OrderStatusProgressProps {
  currentStatus: 'PLACED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
}

interface Step {
  id: number;
  status: string;
  label: string;
}

const steps: Step[] = [
  { id: 1, status: 'PLACED', label: 'Realizado' },
  { id: 2, status: 'PREPARING', label: 'Preparando' },
  { id: 3, status: 'READY', label: 'Listo' },
  { id: 4, status: 'DELIVERED', label: 'Entregado' },
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
  const getStepIcon = (status: string, isCompleted: boolean, isCurrent: boolean) => {
    const size = isMobile ? 14 : 18;
    const color = isCompleted || isCurrent ? colors.primary : colors.textMuted;
    if (isCompleted) return <Check size={size} color={colors.primaryDark} />;
    if (status === 'PLACED') return <ClipboardCheck size={size} color={color} />;
    if (status === 'PREPARING') return <ChefHat size={size} color={color} />;
    if (status === 'READY') return <BellRing size={size} color={color} />;
    return <PackageCheck size={size} color={color} />;
  };

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
                {getStepIcon(step.status, isCompleted, isCurrent)}
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
    backgroundColor: colors.parchment,
    borderRadius: '2px',
  },
  progressBarFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: colors.primary,
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
    border: `2px solid ${colors.parchment}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    color: colors.textMuted,
    marginBottom: '12px',
    transition: 'all 0.3s ease',
  },
  stepCircleCompleted: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
    color: colors.primaryDark,
  },
  stepCircleCurrent: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    color: colors.primary,
    boxShadow: `0 0 0 4px ${colors.shadowGold}`,
  },
  stepLabel: {
    fontSize: '14px',
    color: colors.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  stepLabelCurrent: {
    color: colors.primary,
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
