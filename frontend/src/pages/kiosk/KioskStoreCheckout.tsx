import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS, MOCK_SERVICES } from '../../types/store';
import { useStoreCart, getCartItems } from '../../hooks/useStoreCart';
import { getStoredCoupon, clearStoredCoupon } from '../../components/store/CartSidebar';
import { OrderSummary } from '../../components/store/OrderSummary';
import { DeliveryStep } from '../../components/store/DeliveryStep';
import { PaymentStep } from '../../components/store/PaymentStep';
import { ConfirmationStep } from '../../components/store/ConfirmationStep';
import { colors } from '../../styles/colors';
import clinicaCamsaLogo from '../../assets/clinica-camsa-logo.png';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

type CheckoutStep = 1 | 2 | 3;

/** Prototipo: Checkout de 3 pasos según diseño Clínica CAMSA */
export const KioskStoreCheckout: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { cart, clear } = useStoreCart();
  const coupon = getStoredCoupon();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [orderNumber, setOrderNumber] = useState<string>('');

  // Datos del formulario
  const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'clinic' | null>(null);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const items = getCartItems(cart, MOCK_PRODUCTS, MOCK_SERVICES);
  const subtotal = items.reduce((s, { item, quantity }) => s + item.price * quantity, 0);
  const shippingCost = deliveryMethod === 'home' ? 99 : 0;
  const discount = coupon
    ? Math.round((subtotal * coupon.discountPercent) / 100 * 100) / 100
    : 0;
  const total = Math.max(0, subtotal - discount + shippingCost);

  const handleDeliveryMethodChange = (method: 'home' | 'clinic') => {
    setDeliveryMethod(method);
  };

  const handleContactInfoChange = (info: Partial<typeof contactInfo>) => {
    setContactInfo((prev) => ({ ...prev, ...info }));
  };

  const handleShippingAddressChange = (address: Partial<typeof shippingAddress>) => {
    setShippingAddress((prev) => ({ ...prev, ...address }));
  };

  const handleContinueToPayment = () => {
    if (deliveryMethod && contactInfo.name && contactInfo.email) {
      setCurrentStep(2);
    }
  };

  const handlePaymentComplete = () => {
    // Generar número de pedido
    const newOrderNumber = `RC-${Math.floor(Math.random() * 100000000)}`;
    setOrderNumber(newOrderNumber);
    clear();
    clearStoredCoupon();
    setCurrentStep(3);
  };

  const handleBackToHome = () => {
    navigate(`/kiosk/${deviceId}`);
  };

  const handleContinueShopping = () => {
    navigate(`/kiosk/${deviceId}/store`);
  };

  if (items.length === 0 && currentStep !== 3) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.ivory }}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <img src={clinicaCamsaLogo} alt="Clínica CAMSA" style={styles.logo} />
            <h1 style={styles.brandName}>Clínica CAMSA</h1>
          </div>
          <div style={styles.securityBadge}>
            <span style={styles.lockIcon}>🔒</span>
            <span>Pago Seguro</span>
          </div>
        </header>
        <main style={styles.main}>
          <div style={styles.empty}>
            <p>No hay productos en el carrito.</p>
            <button
              type="button"
              style={styles.btnShop}
              onClick={() => navigate(`/kiosk/${deviceId}/store`)}
            >
              Ir a tienda
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.ivory }}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/kiosk/${deviceId}/store`);
            }}
            style={styles.backLink}
          >
            ← Volver a la tienda
          </a>
        </div>
        <div style={styles.headerCenter}>
          <img src={clinicaCamsaLogo} alt="Clínica CAMSA" style={styles.logo} />
          <h1 style={styles.brandName}>Clínica CAMSA</h1>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.securityBadge}>
            <span style={styles.lockIcon}>🔒</span>
            <span>Pago Seguro</span>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      {currentStep !== 3 && (
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.step,
              ...(currentStep >= 1 ? styles.stepActive : {}),
            }}
          >
            <div
              style={{
                ...styles.stepCircle,
                ...(currentStep >= 1 ? styles.stepCircleActive : {}),
              }}
            >
              {currentStep > 1 ? '✓' : '1'}
            </div>
            <span style={styles.stepLabel}>Entrega</span>
          </div>
          <div
            style={{
              ...styles.step,
              ...(currentStep >= 2 ? styles.stepActive : {}),
            }}
          >
            <div
              style={{
                ...styles.stepCircle,
                ...(currentStep >= 2 ? styles.stepCircleActive : {}),
              }}
            >
              {currentStep > 2 ? '✓' : '2'}
            </div>
            <span style={styles.stepLabel}>Pago</span>
          </div>
          <div
            style={{
              ...styles.step,
              ...(currentStep >= 3 ? styles.stepActive : {}),
            }}
          >
            <div
              style={{
                ...styles.stepCircle,
                ...(currentStep >= 3 ? styles.stepCircleActive : {}),
              }}
            >
              3
            </div>
            <span style={styles.stepLabel}>Confirmación</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={styles.main}>
        {currentStep === 1 && (
          <div style={styles.layout}>
            <div style={styles.formSection}>
              <DeliveryStep
                deliveryMethod={deliveryMethod}
                onDeliveryMethodChange={handleDeliveryMethodChange}
                contactInfo={contactInfo}
                onContactInfoChange={handleContactInfoChange}
                shippingAddress={shippingAddress}
                onShippingAddressChange={handleShippingAddressChange}
              />
              <div style={styles.stepActions}>
                <button
                  type="button"
                  style={styles.continueBtn}
                  onClick={handleContinueToPayment}
                  disabled={!deliveryMethod || !contactInfo.name || !contactInfo.email}
                >
                  Continuar al Pago
                </button>
              </div>
            </div>
            <div style={styles.summarySection}>
              <div style={styles.summaryCard}>
                <h3 style={styles.summaryTitle}>Resumen del Pedido</h3>
                <div style={styles.itemsList}>
                  {items.map(({ item, quantity, reservationDate, reservationTime }) => (
                    <div key={`${item.type}-${item.id}`} style={styles.summaryItem}>
                      {item.image && (
                        <img src={item.image} alt={item.name} style={styles.summaryImage} />
                      )}
                      <div style={styles.summaryItemInfo}>
                        <div style={styles.summaryItemName}>{item.name}</div>
                        <div style={styles.summaryItemMeta}>
                          Cantidad: {quantity}
                        </div>
                        {item.type === 'service' && reservationDate && reservationTime && (
                          <div style={styles.summaryItemMeta}>
                            📅 {reservationDate.toLocaleDateString('es-MX')} {reservationTime}
                          </div>
                        )}
                        <div style={styles.summaryItemPrice}>
                          {formatPrice(item.price * quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={styles.summaryBreakdown}>
                  <div style={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {shippingCost > 0 && (
                    <div style={styles.summaryRow}>
                      <span>Envío</span>
                      <span>{formatPrice(shippingCost)}</span>
                    </div>
                  )}
                  {coupon && (
                    <div style={styles.summaryRow}>
                      <span>Descuento ({coupon.code})</span>
                      <span style={{ color: colors.success }}>
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}
                  <div style={{ ...styles.summaryRow, ...styles.summaryTotal }}>
                    <span>Total</span>
                    <span style={styles.totalPrice}>{formatPrice(total)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  style={styles.payButton}
                  onClick={handleContinueToPayment}
                  disabled={!deliveryMethod || !contactInfo.name || !contactInfo.email}
                >
                  Pagar {formatPrice(total)}
                </button>
                <div style={styles.securityIcons}>
                  <div style={styles.securityIcon}>
                    <span>🔒</span>
                    <span>Pago Seguro</span>
                  </div>
                  <div style={styles.securityIcon}>
                    <span>🔒</span>
                    <span>SSL Encriptado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div style={styles.layout}>
            <div style={styles.formSection}>
              <PaymentStep
                onNext={handlePaymentComplete}
                onBack={() => setCurrentStep(1)}
              />
            </div>
            <div style={styles.summarySection}>
              <div style={styles.summaryCard}>
                <h3 style={styles.summaryTitle}>Resumen del Pedido</h3>
                <div style={styles.itemsList}>
                  {items.map(({ item, quantity }) => (
                    <div key={`${item.type}-${item.id}`} style={styles.summaryItem}>
                      {item.image && (
                        <img src={item.image} alt={item.name} style={styles.summaryImage} />
                      )}
                      <div style={styles.summaryItemInfo}>
                        <div style={styles.summaryItemName}>{item.name}</div>
                        <div style={styles.summaryItemMeta}>Cantidad: {quantity}</div>
                        <div style={styles.summaryItemPrice}>
                          {formatPrice(item.price * quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={styles.summaryBreakdown}>
                  <div style={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {shippingCost > 0 && (
                    <div style={styles.summaryRow}>
                      <span>Envío</span>
                      <span>{formatPrice(shippingCost)}</span>
                    </div>
                  )}
                  {coupon && (
                    <div style={styles.summaryRow}>
                      <span>Descuento ({coupon.code})</span>
                      <span style={{ color: colors.success }}>
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}
                  <div style={{ ...styles.summaryRow, ...styles.summaryTotal }}>
                    <span>Total</span>
                    <span style={styles.totalPrice}>{formatPrice(total)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  style={styles.payButton}
                  onClick={handlePaymentComplete}
                >
                  Pagar {formatPrice(total)}
                </button>
                <div style={styles.securityIcons}>
                  <div style={styles.securityIcon}>
                    <span>🔒</span>
                    <span>Pago Seguro</span>
                  </div>
                  <div style={styles.securityIcon}>
                    <span>🔒</span>
                    <span>SSL Encriptado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <ConfirmationStep
            orderNumber={orderNumber}
            onBackToHome={handleBackToHome}
            onContinueShopping={handleContinueShopping}
          />
        )}
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: colors.white,
    borderBottom: `1px solid ${colors.border}`,
  },
  headerLeft: {
    flex: 1,
  },
  backLink: {
    color: colors.textPrimary,
    textDecoration: 'none',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  headerCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    objectFit: 'contain',
  },
  brandName: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    color: colors.textPrimary,
    fontFamily: 'serif',
  },
  headerRight: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: colors.textSecondary,
  },
  lockIcon: {
    fontSize: 14,
  },
  progressBar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    padding: '2rem',
    backgroundColor: colors.white,
    borderBottom: `1px solid ${colors.border}`,
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  stepActive: {
    color: colors.primary,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: `2px solid ${colors.border}`,
    backgroundColor: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 700,
    color: colors.textMuted,
  },
  stepCircleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    color: colors.white,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.textSecondary,
  },
  main: {
    padding: '2rem',
    maxWidth: 1200,
    margin: '0 auto',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: 32,
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  stepActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  continueBtn: {
    padding: '14px 32px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  summarySection: {
    alignSelf: 'start',
    position: 'sticky',
    top: 24,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    boxShadow: `0 2px 8px ${colors.shadow}`,
  },
  summaryTitle: {
    margin: '0 0 20px 0',
    fontSize: 18,
    fontWeight: 700,
    color: colors.textPrimary,
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottom: `1px solid ${colors.border}`,
  },
  summaryItem: {
    display: 'flex',
    gap: 12,
  },
  summaryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    objectFit: 'cover',
    flexShrink: 0,
  },
  summaryItemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  summaryItemName: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.textPrimary,
  },
  summaryItemMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.textPrimary,
    marginTop: 4,
  },
  summaryBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTop: `1px solid ${colors.border}`,
    fontSize: 18,
    fontWeight: 700,
    color: colors.textPrimary,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.primary,
  },
  payButton: {
    width: '100%',
    padding: 16,
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 16,
  },
  securityIcons: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    fontSize: 12,
    color: colors.textMuted,
  },
  securityIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  empty: {
    textAlign: 'center',
    padding: 48,
    color: colors.textMuted,
  },
  btnShop: {
    marginTop: 16,
    padding: '12px 24px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
