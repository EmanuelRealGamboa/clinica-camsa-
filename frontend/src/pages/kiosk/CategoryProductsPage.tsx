import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { productsApi } from '../../api/products';
import { ordersApi } from '../../api/orders';
import { kioskApi } from '../../api/kiosk';
import type { Product, ProductCategory } from '../../types';
import { ProductCard } from '../../components/kiosk/ProductCard';
import { CartModal } from '../../components/kiosk/CartModal';
import { AddToCartNotification } from '../../components/kiosk/AddToCartNotification';
import { LimitReachedModal } from '../../components/kiosk/LimitReachedModal';
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

interface LocationState {
  cart?: Record<number, number>;
  patientInfo?: PatientInfo;
  activeOrdersItems?: Record<string, number>;
}

export const CategoryProductsPage: React.FC = () => {
  const { deviceId, categoryId } = useParams<{ deviceId: string; categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | undefined;

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(
    locationState?.patientInfo || null
  );
  const [patientId, setPatientId] = useState<number | null>(null);

  // Initialize cart from location state if available
  const [cart, setCart] = useState<Map<number, number>>(() => {
    if (locationState?.cart) {
      return new Map(Object.entries(locationState.cart).map(([k, v]) => [Number(k), v]));
    }
    return new Map();
  });

  const [activeOrdersItems, setActiveOrdersItems] = useState<Map<string, number>>(() => {
    if (locationState?.activeOrdersItems) {
      return new Map(Object.entries(locationState.activeOrdersItems));
    }
    return new Map();
  });

  const [showCart, setShowCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<string>('');
  const [showLimitReachedModal, setShowLimitReachedModal] = useState(false);

  // Use kiosk state hook
  const { updateActivity } = useKioskState(deviceId || '', patientId);

  useEffect(() => {
    loadCategoryData();
  }, [categoryId]);

  const loadCategoryData = async () => {
    if (!categoryId || !deviceId) return;

    try {
      setLoading(true);

      // Load patient info if not passed via state
      if (!patientInfo) {
        try {
          const patientData = await kioskApi.getActivePatient(deviceId);
          setPatientId(patientData.patient.id);
          setPatientInfo({
            full_name: patientData.patient.full_name,
            room_code: patientData.room.code,
            staff_name: patientData.staff.full_name,
            order_limits: patientData.order_limits || {},
          });
        } catch (error) {
          console.error('Error loading patient data:', error);
          // Redirect to home if no patient
          navigate(`/kiosk/${deviceId}`, { replace: true });
          return;
        }
      }

      // Load category details
      const categories = await productsApi.getPublicCategories();
      const categoryData = categories.results?.find(
        (c: ProductCategory) => c.id === parseInt(categoryId)
      ) || null;
      setCategory(categoryData);

      // Load products for this category
      const productsData = await productsApi.getProductsByCategory(parseInt(categoryId));
      setProducts(productsData);

      // Load all products for cart validation
      const allCategoriesProducts: Product[] = [];
      for (const cat of (categories.results || categories)) {
        const catProducts = await productsApi.getProductsByCategory(cat.id);
        allCategoriesProducts.push(...catProducts);
      }
      setAllProducts(allCategoriesProducts);

      // Load active orders items if not passed via state
      if (activeOrdersItems.size === 0 && deviceId) {
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
          console.error('Error loading active orders:', error);
        }
      }

    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message: any) => {
    console.log('WebSocket message received in CategoryProductsPage:', message);

    if (message.type === 'order_created_by_staff') {
      if (deviceId) {
        navigate(`/kiosk/${deviceId}/orders`, { replace: true });
      }
    } else if (message.type === 'order_status_changed') {
      loadCategoryData();
    } else if (message.type === 'limits_updated') {
      loadCategoryData();
    } else if (message.type === 'session_ended') {
      navigate(`/kiosk/${deviceId}`, { replace: true });
    }
  }, [deviceId, navigate]);

  // WebSocket connection
  const wsUrl = deviceId ? `${WS_BASE_URL}/ws/kiosk/orders/?device_uid=${deviceId}` : '';

  useWebSocket({
    url: wsUrl,
    onMessage: handleWebSocketMessage,
    onOpen: () => console.log('CategoryProductsPage WebSocket connected'),
    onClose: () => console.log('CategoryProductsPage WebSocket disconnected'),
    onError: (error) => console.error('CategoryProductsPage WebSocket error:', error),
  });

  const handleAddToCart = (productId: number) => {
    updateActivity();

    const product = products.find(p => p.id === productId) || allProducts.find(p => p.id === productId);
    if (!product) return;

    const categoryType = product.category_type;

    // FOOD category has no limits
    if (categoryType !== 'FOOD' && patientInfo?.order_limits) {
      const limits = patientInfo.order_limits;

      if (categoryType && (categoryType === 'DRINK' || categoryType === 'SNACK')) {
        const limit = limits[categoryType];
        if (limit && limit > 0) {
          // Count how many of this category type are already in cart
          let cartCount = 0;
          cart.forEach((quantity, prodId) => {
            const cartProduct = allProducts.find(p => p.id === prodId);
            if (cartProduct && cartProduct.category_type === categoryType) {
              cartCount += quantity;
            }
          });

          // Count from active orders
          const ordersCount = activeOrdersItems.get(categoryType) || 0;
          const totalCount = cartCount + ordersCount;

          if (totalCount >= limit) {
            console.log(`Limit reached for ${categoryType}: ${totalCount}/${limit}`);
            setShowLimitReachedModal(true);
            return;
          }
        }
      }
    }

    // Add to cart
    setLastAddedProduct(product.name);
    setShowNotification(true);

    setCart((prev) => {
      const newCart = new Map(prev);
      newCart.set(productId, (newCart.get(productId) || 0) + 1);
      return newCart;
    });
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

  const handleBack = () => {
    // Navigate back to category selection, passing cart state
    navigate(`/kiosk/${deviceId}`, {
      state: {
        cart: Object.fromEntries(cart),
        patientInfo,
        activeOrdersItems: Object.fromEntries(activeOrdersItems),
      }
    });
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

  const cartTotal = Array.from(cart.values()).reduce((sum, qty) => sum + qty, 0);

  // Check if this is FOOD category
  const isFood = category?.category_type === 'FOOD';

  // Get current category limit info
  const getCurrentLimitInfo = () => {
    if (!category || !patientInfo?.order_limits) return null;
    const categoryType = category.category_type;
    if (!categoryType || categoryType === 'FOOD' || categoryType === 'OTHER') return null;

    const limit = patientInfo.order_limits[categoryType as 'DRINK' | 'SNACK'];
    if (!limit) return null;

    let cartCount = 0;
    cart.forEach((quantity, productId) => {
      const product = allProducts.find(p => p.id === productId);
      if (product && product.category_type === categoryType) {
        cartCount += quantity;
      }
    });

    const ordersCount = activeOrdersItems.get(categoryType) || 0;
    const totalCount = cartCount + ordersCount;

    return { current: totalCount, limit };
  };

  const limitInfo = getCurrentLimitInfo();

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backButton} onClick={handleBack}>
            ← Volver
          </button>
          <div>
            <h1 style={styles.headerTitle}>
              {category?.icon && <span style={styles.categoryIcon}>{category.icon}</span>}
              {category?.name || 'Productos'}
            </h1>
            <div style={styles.headerMeta}>
              {patientInfo && (
                <span style={styles.roomLabel}>Habitacion: {patientInfo.room_code}</span>
              )}
              {isFood && (
                <span style={styles.foodBadge}>Pago adicional</span>
              )}
              {limitInfo && (
                <span style={{
                  ...styles.limitBadge,
                  backgroundColor: limitInfo.current >= limitInfo.limit ? colors.gray : colors.primary,
                }}>
                  {limitInfo.current}/{limitInfo.limit} seleccionados
                </span>
              )}
            </div>
          </div>
        </div>
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
      </header>

      {/* Products Grid */}
      <div style={styles.content}>
        {products.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No hay productos disponibles en esta categoria</p>
            <button style={styles.emptyButton} onClick={handleBack}>
              Volver a categorias
            </button>
          </div>
        ) : (
          <>
            {isFood && (
              <div style={styles.foodNotice}>
                <span style={styles.foodNoticeIcon}>i</span>
                <p style={styles.foodNoticeText}>
                  Los productos de comida tienen un costo adicional y seran cobrados por separado.
                  Puedes agregar los que desees al carrito.
                </p>
              </div>
            )}
            <div style={styles.productsGrid}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  variant="grid"
                  showPrice={isFood}
                />
              ))}
            </div>
          </>
        )}
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
    backgroundColor: colors.white,
    padding: '24px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: `0 2px 8px ${colors.shadow}`,
    marginBottom: '32px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  backButton: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: colors.primary,
    border: `2px solid ${colors.primary}`,
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: colors.black,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  categoryIcon: {
    fontSize: '32px',
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
  },
  roomLabel: {
    fontSize: '14px',
    color: colors.gray,
  },
  foodBadge: {
    backgroundColor: colors.primary,
    color: colors.white,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  limitBadge: {
    color: colors.white,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
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
  },
  content: {
    padding: '0 40px',
  },
  foodNotice: {
    backgroundColor: '#fff8e1',
    border: '1px solid #ffcc80',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '24px',
  },
  foodNoticeIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#ff9800',
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    flexShrink: 0,
  },
  foodNoticeText: {
    fontSize: '14px',
    color: '#6d4c41',
    margin: 0,
    lineHeight: '1.5',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  emptyText: {
    fontSize: '18px',
    color: colors.gray,
    marginBottom: '24px',
  },
  emptyButton: {
    padding: '14px 32px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};
