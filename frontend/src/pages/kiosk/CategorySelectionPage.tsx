import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/products';
import { ordersApi } from '../../api/orders';
import { kioskApi } from '../../api/kiosk';
import type { ProductCategory, Product } from '../../types';
import { CategoryCard } from '../../components/kiosk/CategoryCard';
import { CartModal } from '../../components/kiosk/CartModal';
import { AddToCartNotification } from '../../components/kiosk/AddToCartNotification';
import { LimitReachedModal } from '../../components/kiosk/LimitReachedModal';
import { WelcomeModal } from '../../components/kiosk/WelcomeModal';
import { InitialWelcomeScreen } from '../../components/kiosk/InitialWelcomeScreen';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useKioskState } from '../../hooks/useKioskState';
import { colors } from '../../styles/colors';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

interface PatientInfo {
  full_name: string;
  room_code: string;
  staff_name: string;
  order_limits?: {
    DRINK?: number;
    SNACK?: number;
  };
}

export const CategorySelectionPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Map<number, number>>(new Map());
  const [showCart, setShowCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<string>('');
  const [showLimitReachedModal, setShowLimitReachedModal] = useState(false);
  const [activeOrdersItems, setActiveOrdersItems] = useState<Map<string, number>>(new Map());

  // Use kiosk state hook for persistent state management
  const { hasSeenWelcome, setHasSeenWelcome, updateActivity } = useKioskState(
    deviceId || '',
    patientId
  );

  const [showWelcomeModal, setShowWelcomeModal] = useState(!hasSeenWelcome);
  const [showInitialWelcome, setShowInitialWelcome] = useState(true);
  const [checkingPatient, setCheckingPatient] = useState(false);
  const [patientAssigned, setPatientAssigned] = useState(false);

  useEffect(() => {
    loadData();
  }, [deviceId]);

  // Check for patient assignment periodically when on initial welcome screen
  useEffect(() => {
    if (!showInitialWelcome || patientAssigned) return;

    const checkPatient = async () => {
      try {
        if (deviceId) {
          const patientData = await kioskApi.getActivePatient(deviceId);
          if (patientData && patientData.patient) {
            setPatientAssigned(true);
          }
        }
      } catch (error) {
        setPatientAssigned(false);
      }
    };

    checkPatient();
    const interval = setInterval(checkPatient, 3000);
    return () => clearInterval(interval);
  }, [deviceId, showInitialWelcome, patientAssigned]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Check for active orders first
      if (deviceId) {
        try {
          const ordersResponse = await ordersApi.getActiveOrdersPublic(deviceId);
          const activeOrders = ordersResponse.orders || [];
          const hasActiveOrders = activeOrders.some((order: any) =>
            ['PLACED', 'PREPARING', 'READY'].includes(order.status)
          );

          if (hasActiveOrders) {
            navigate(`/kiosk/${deviceId}/orders`, { replace: true });
            return;
          }
        } catch (error) {
          console.error('Error checking active orders:', error);
        }
      }

      // Load patient information
      if (deviceId) {
        try {
          const patientData = await kioskApi.getActivePatient(deviceId);
          setPatientId(patientData.patient.id);
          setPatientInfo({
            full_name: patientData.patient.full_name,
            room_code: patientData.room.code,
            staff_name: patientData.staff.full_name,
            order_limits: patientData.order_limits || {},
          });
          setShowInitialWelcome(false);

          if (!hasSeenWelcome) {
            setTimeout(() => setShowWelcomeModal(true), 1000);
          }
        } catch (error) {
          console.error('Error loading patient data:', error);
          setShowInitialWelcome(true);
          setPatientInfo(null);
          setPatientId(null);
        }
      }

      // Load categories (only active ones with products)
      const categoriesResponse = await productsApi.getPublicCategories();
      const allCategories = categoriesResponse.results || categoriesResponse || [];

      // Filter to only show categories with products and specific types
      const filteredCategories = allCategories.filter((cat: ProductCategory) =>
        cat.is_active !== false &&
        (cat.product_count || 0) > 0 &&
        ['DRINK', 'SNACK', 'FOOD'].includes(cat.category_type || '')
      );

      // Sort categories: DRINK first, then SNACK, then FOOD
      const sortedCategories = filteredCategories.sort((a: ProductCategory, b: ProductCategory) => {
        const order = { 'DRINK': 1, 'SNACK': 2, 'FOOD': 3, 'OTHER': 4 };
        return (order[a.category_type || 'OTHER'] || 4) - (order[b.category_type || 'OTHER'] || 4);
      });

      setCategories(sortedCategories);

      // Load all products for cart functionality
      const allProds: Product[] = [];
      for (const category of sortedCategories) {
        const products = await productsApi.getProductsByCategory(category.id);
        allProds.push(...products);
      }
      setAllProducts(allProds);

      // Load active orders to track items already ordered
      if (deviceId) {
        try {
          const ordersResponse = await ordersApi.getActiveOrdersPublic(deviceId);
          const activeOrders = ordersResponse.orders || [];

          const itemsMap = new Map<string, number>();
          activeOrders
            .filter((order: any) => ['PLACED', 'PREPARING', 'READY'].includes(order.status))
            .forEach((order: any) => {
              order.items?.forEach((item: any) => {
                const categoryType = item.category_type || 'OTHER';
                const currentCount = itemsMap.get(categoryType) || 0;
                itemsMap.set(categoryType, currentCount + item.quantity);
              });
            });

          setActiveOrdersItems(itemsMap);
        } catch (error) {
          console.error('Error loading active orders for limits:', error);
        }
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message: any) => {
    console.log('WebSocket message received in CategorySelectionPage:', message);

    if (message.type === 'order_created_by_staff') {
      if (deviceId) {
        navigate(`/kiosk/${deviceId}/orders`, { replace: true });
      }
    } else if (message.type === 'patient_assigned') {
      setPatientAssigned(true);
      loadData();
    } else if (message.type === 'order_status_changed') {
      loadData();
    } else if (message.type === 'limits_updated') {
      loadData();
    } else if (message.type === 'session_ended') {
      setPatientInfo(null);
      setPatientId(null);
      setPatientAssigned(false);
      setShowInitialWelcome(true);
      setShowWelcomeModal(false);
      setCart(new Map());
      setActiveOrdersItems(new Map());
    }
  }, [deviceId, navigate]);

  // WebSocket connection
  const wsUrl = deviceId ? `${WS_BASE_URL}/ws/kiosk/orders/?device_uid=${deviceId}` : '';

  useWebSocket({
    url: wsUrl,
    onMessage: handleWebSocketMessage,
    onOpen: () => console.log('CategorySelectionPage WebSocket connected'),
    onClose: () => console.log('CategorySelectionPage WebSocket disconnected'),
    onError: (error) => console.error('CategorySelectionPage WebSocket error:', error),
  });

  // Calculate current count for each category type (cart + active orders)
  const getCategoryCount = (categoryType: string) => {
    let cartCount = 0;
    cart.forEach((quantity, productId) => {
      const product = allProducts.find(p => p.id === productId);
      if (product && product.category_type === categoryType) {
        cartCount += quantity;
      }
    });

    const ordersCount = activeOrdersItems.get(categoryType) || 0;
    return cartCount + ordersCount;
  };

  // Get limit for category type
  const getCategoryLimit = (categoryType: string): number | null => {
    if (categoryType === 'FOOD') return null; // No limit for food
    if (!patientInfo?.order_limits) return null;
    return patientInfo.order_limits[categoryType as 'DRINK' | 'SNACK'] || null;
  };

  const handleCategoryClick = (category: ProductCategory) => {
    updateActivity();
    navigate(`/kiosk/${deviceId}/products/${category.id}`, {
      state: {
        cart: Object.fromEntries(cart),
        patientInfo,
        activeOrdersItems: Object.fromEntries(activeOrdersItems),
      }
    });
  };

  const handleViewMenu = async () => {
    setCheckingPatient(true);
    try {
      if (deviceId) {
        const patientData = await kioskApi.getActivePatient(deviceId);
        if (patientData && patientData.patient) {
          await loadData();
        }
      }
    } catch (error) {
      console.log('No patient assigned yet');
    } finally {
      setCheckingPatient(false);
    }
  };

  const handleViewOrders = () => {
    navigate(`/kiosk/${deviceId}/orders`);
  };

  const handleCheckout = async () => {
    if (!deviceId || cart.size === 0) return;

    updateActivity();

    try {
      const items = Array.from(cart.entries()).map(([product_id, quantity]) => ({
        product_id,
        quantity,
      }));

      await ordersApi.createOrderPublic({ device_uid: deviceId, items });

      setCart(new Map());
      setShowCart(false);
      navigate(`/kiosk/${deviceId}/orders`, { replace: true });
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorData = error.response?.data;

      if (errorData?.limit_reached) {
        setCart(new Map());
        setShowCart(false);
        setShowLimitReachedModal(true);
      } else {
        alert(errorData?.error || 'Error al confirmar la orden. Por favor intenta de nuevo.');
      }
    }
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    setCart((prev) => {
      const newCart = new Map(prev);
      if (quantity <= 0) {
        newCart.delete(productId);
      } else {
        newCart.set(productId, quantity);
      }
      return newCart;
    });
  };

  const cartTotal = Array.from(cart.values()).reduce((sum, qty) => sum + qty, 0);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  // Show initial welcome screen if no patient is assigned
  if (showInitialWelcome && !patientInfo) {
    return (
      <InitialWelcomeScreen
        deviceUid={deviceId || ''}
        onViewMenu={handleViewMenu}
        loading={checkingPatient}
        patientAssigned={patientAssigned}
      />
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Selecciona una Categoria</h1>
          {patientInfo && (
            <>
              <p style={styles.welcomeText}>Bienvenido, {patientInfo.full_name}</p>
              <p style={styles.nurseText}>Tu enfermera: {patientInfo.staff_name}</p>
            </>
          )}
        </div>
        <div style={styles.headerInfo}>
          {patientInfo && (
            <div style={styles.roomInfo}>
              <div style={styles.roomLabel}>Habitacion: {patientInfo.room_code}</div>
              <div style={styles.deviceLabel}>Dispositivo: {deviceId}</div>
            </div>
          )}
          <div style={styles.headerRight}>
            <button style={styles.ordersButton} onClick={handleViewOrders}>
              Mis Ordenes
            </button>
            {cartTotal > 0 && (
              <button style={styles.cartButton} onClick={() => setShowCart(true)}>
                Carrito ({cartTotal})
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Categories Grid */}
      <div style={styles.content}>
        <div style={styles.categoriesGrid}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              currentCount={getCategoryCount(category.category_type || 'OTHER')}
              limit={getCategoryLimit(category.category_type || 'OTHER')}
              onClick={() => handleCategoryClick(category)}
            />
          ))}
        </div>

        {/* Info Text */}
        <div style={styles.infoSection}>
          <div style={styles.infoCard}>
            <span style={styles.infoIcon}>i</span>
            <div>
              <p style={styles.infoTitle}>Como funciona tu pedido</p>
              <p style={styles.infoText}>
                Las bebidas y snacks son de cortesia con limite de 1 por categoria.
                La comida no tiene limite y se paga por separado.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <CartModal
          cart={cart}
          products={allProducts}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckout={handleCheckout}
          orderLimits={patientInfo?.order_limits || {}}
          activeOrdersItems={activeOrdersItems}
          onLimitReached={() => setShowLimitReachedModal(true)}
        />
      )}

      {/* Add to Cart Notification */}
      <AddToCartNotification
        show={showNotification}
        productName={lastAddedProduct}
        onHide={() => setShowNotification(false)}
      />

      {/* Limit Reached Modal */}
      <LimitReachedModal
        show={showLimitReachedModal}
        nurseName={patientInfo?.staff_name}
        onClose={() => setShowLimitReachedModal(false)}
      />

      {/* Welcome Modal */}
      <WelcomeModal
        show={showWelcomeModal}
        patientName={patientInfo?.full_name || ''}
        orderLimits={patientInfo?.order_limits}
        onClose={() => {
          setShowWelcomeModal(false);
          setHasSeenWelcome(true);
        }}
      />
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.grayBg,
    paddingBottom: '40px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: colors.grayBg,
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: `4px solid ${colors.grayLight}`,
    borderTop: `4px solid ${colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: colors.white,
    padding: '24px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: `0 2px 8px ${colors.shadow}`,
  },
  headerTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: colors.black,
    margin: '0 0 8px 0',
  },
  welcomeText: {
    fontSize: '16px',
    color: colors.gray,
    margin: '4px 0',
    fontWeight: '500',
  },
  nurseText: {
    fontSize: '14px',
    color: colors.gray,
    margin: '4px 0 0 0',
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  roomInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  roomLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: colors.black,
  },
  deviceLabel: {
    fontSize: '12px',
    color: colors.gray,
  },
  headerRight: {
    display: 'flex',
    gap: '16px',
  },
  ordersButton: {
    padding: '12px 24px',
    backgroundColor: '#ff9800',
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  cartButton: {
    padding: '12px 24px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  content: {
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px',
    marginBottom: '40px',
  },
  infoSection: {
    marginTop: '24px',
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  infoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
    flexShrink: 0,
  },
  infoTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: colors.black,
    margin: '0 0 8px 0',
  },
  infoText: {
    fontSize: '14px',
    color: colors.gray,
    margin: 0,
    lineHeight: '1.5',
  },
};

// Add keyframes for spinner animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
