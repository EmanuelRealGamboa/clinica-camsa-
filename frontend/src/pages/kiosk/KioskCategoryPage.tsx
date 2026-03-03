import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ClipboardList, ShoppingCart, Sparkles } from 'lucide-react';
import { productsApi } from '../../api/products';
import { ordersApi } from '../../api/orders';
import { kioskApi } from '../../api/kiosk';
import type { Product, ProductCategory } from '../../types';
import { ProductCard } from '../../components/kiosk/ProductCard';
import { MobileHeaderMenu, type MobileHeaderMenuAction } from '../../components/kiosk/MobileHeaderMenu';
import { CartModal } from '../../components/kiosk/CartModal';
import { AddToCartNotification } from '../../components/kiosk/AddToCartNotification';
import { LimitReachedModal } from '../../components/kiosk/LimitReachedModal';
import { CannotOrderModal } from '../../components/kiosk/CannotOrderModal';
import ProductRatingsModal from '../../components/kiosk/ProductRatingsModal';
import StaffRatingModal from '../../components/kiosk/StaffRatingModal';
import StayRatingModal from '../../components/kiosk/StayRatingModal';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useSurvey } from '../../contexts/SurveyContext';
import { useWindowSize } from '../../utils/responsive';
import { colors } from '../../styles/colors';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

// Storage key for cart persistence
const CART_STORAGE_KEY = 'kiosk_cart';

interface LocationState {
  cart?: [number, number][];
  orderLimits?: { DRINK?: number; SNACK?: number };
  activeOrdersItems?: [string, number][];
}

export const KioskCategoryPage: React.FC = () => {
  const { deviceId, categoryId } = useParams<{ deviceId: string; categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useWindowSize();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartProducts, setCartProducts] = useState<Product[]>([]); // Products from cart (may be from other categories)
  const [patientInfo, setPatientInfo] = useState<{
    full_name: string;
    room_code: string;
    staff_name: string;
    order_limits?: { DRINK?: number; SNACK?: number };
    can_patient_order?: boolean;
  } | null>(null);

  // Initialize cart from location state or localStorage
  const [cart, setCart] = useState<Map<number, number>>(() => {
    const navState = location.state as LocationState | null;
    if (navState?.cart) {
      return new Map(navState.cart);
    }
    try {
      const stored = localStorage.getItem(`${CART_STORAGE_KEY}_${deviceId}`);
      if (stored) {
        return new Map(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading cart from localStorage:', e);
    }
    return new Map();
  });

  // Initialize order limits and active orders from location state
  const [orderLimits, setOrderLimits] = useState<{ DRINK?: number; SNACK?: number }>(() => {
    const navState = location.state as LocationState | null;
    return navState?.orderLimits || {};
  });

  const [activeOrdersItems, setActiveOrdersItems] = useState<Map<string, number>>(() => {
    const navState = location.state as LocationState | null;
    if (navState?.activeOrdersItems) {
      return new Map(navState.activeOrdersItems);
    }
    return new Map();
  });

  const [showCart, setShowCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<string>('');
  const [showLimitReachedModal, setShowLimitReachedModal] = useState(false);
  const [showCannotOrderModal, setShowCannotOrderModal] = useState(false);
  
  // Survey context
  const { surveyState, startSurvey, setProductRatings, setStaffRating, completeSurvey } = useSurvey();

  useEffect(() => {
    loadCategoryData();
  }, [categoryId]);

  // WebSocket to listen for survey_enabled and other messages
  const wsUrl = deviceId ? `${WS_BASE_URL}/ws/kiosk/orders/?device_uid=${deviceId}` : '';
  
  useWebSocket({
    url: wsUrl,
    onMessage: (message: any) => {
      if (message.type === 'survey_enabled') {
        console.log('Survey enabled via WebSocket - starting survey immediately');
        const assignmentId = message.assignment_id;
        
        // Update can_patient_order to false
        setPatientInfo(prev => prev ? { ...prev, can_patient_order: false } : null);
        
        // Get staff name from patient info or load it
        const staffName = patientInfo?.staff_name || 'Personal';
        
        if (assignmentId) {
          startSurvey(assignmentId, staffName);
        } else {
          // If no assignment_id, try to get it from patient data
          if (deviceId) {
            kioskApi.getActivePatient(deviceId).then(patientData => {
              if (patientData.id) {
                startSurvey(patientData.id, patientData.staff?.full_name || staffName);
              }
            }).catch(error => {
              console.error('Error loading patient data for survey:', error);
              // Try with assignment_id from message if available
              if (assignmentId) {
                startSurvey(assignmentId, staffName);
              }
            });
          }
        }
      } else if (message.type === 'session_ended') {
        console.log('Session ended - redirecting to home');
        navigate(`/kiosk/${deviceId}`, { replace: true });
      } else if (message.type === 'limits_updated') {
        // Reload patient info to update can_patient_order
        if (deviceId) {
          kioskApi.getActivePatient(deviceId).then(patientData => {
            setPatientInfo(prev => prev ? {
              ...prev,
              can_patient_order: patientData.can_patient_order !== false,
              order_limits: patientData.order_limits || {},
            } : null);
          });
        }
      }
    },
    onOpen: () => console.log('✅ Category WebSocket connected'),
    onClose: () => console.log('❌ Category WebSocket disconnected'),
    onError: (error) => console.error('⚠️ Category WebSocket error:', error),
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (deviceId && cart.size > 0) {
      try {
        localStorage.setItem(
          `${CART_STORAGE_KEY}_${deviceId}`,
          JSON.stringify(Array.from(cart.entries()))
        );
      } catch (e) {
        console.error('Error saving cart to localStorage:', e);
      }
    } else if (deviceId && cart.size === 0) {
      localStorage.removeItem(`${CART_STORAGE_KEY}_${deviceId}`);
    }
  }, [cart, deviceId]);

  const loadCategoryData = async () => {
    if (!categoryId) return;

    try {
      setLoading(true);

      // Load patient info if not passed in state
      if (deviceId && !patientInfo) {
        try {
          const patientData = await kioskApi.getActivePatient(deviceId);
          setPatientInfo({
            full_name: patientData.patient.full_name,
            room_code: patientData.room.code,
            staff_name: patientData.staff.full_name,
            order_limits: patientData.order_limits || {},
            can_patient_order: patientData.can_patient_order !== false, // Default to true
          });
          setOrderLimits(patientData.order_limits || {});
        } catch (error) {
          console.error('Error loading patient data:', error);
        }
      }

      // Load category details
      const categories = await productsApi.getPublicCategories();
      const categoryData = categories.results?.find((c: ProductCategory) => c.id === parseInt(categoryId)) || null;
      setCategory(categoryData);

      // Load ALL products for this category (not just most ordered)
      const productsData = await productsApi.getProductsByCategory(parseInt(categoryId));
      setProducts(productsData);

      // Load products that are in the cart but not in this category
      // This is needed for the CartModal to display all cart items
      const currentCart = cart;
      if (currentCart.size > 0) {
        const productIdsInCart = Array.from(currentCart.keys());
        const productIdsInCategory = new Set(productsData.map((p: Product) => p.id));
        const missingProductIds = productIdsInCart.filter(id => !productIdsInCategory.has(id));

        if (missingProductIds.length > 0) {
          try {
            // Load all public products to find the missing ones
            const allPublicProducts = await productsApi.getPublicProducts();
            const missingProducts = allPublicProducts.results?.filter((p: Product) =>
              missingProductIds.includes(p.id)
            ) || [];
            setCartProducts(missingProducts);
          } catch (error) {
            console.error('Error loading cart products:', error);
          }
        }
      }

      // Load active orders if not passed in state
      if (deviceId && activeOrdersItems.size === 0) {
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

  const handleAddToCart = (productId: number) => {
    // Check if patient can order
    if (patientInfo && patientInfo.can_patient_order === false) {
      setShowCannotOrderModal(true);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if we have order limits configured
    const limits = orderLimits || patientInfo?.order_limits;
    if (limits) {
      const categoryType = product.category_type;

      // Only validate if product has a category type with a limit (DRINK or SNACK)
      // FOOD has no limit
      if (categoryType && (categoryType === 'DRINK' || categoryType === 'SNACK')) {
        const limit = limits[categoryType];
        if (limit && limit > 0) {
          // Count how many of this category type are already in cart
          let cartCount = 0;
          cart.forEach((quantity, prodId) => {
            const cartProduct = products.find(p => p.id === prodId);
            if (cartProduct && cartProduct.category_type === categoryType) {
              cartCount += quantity;
            }
          });

          // Count how many are in active orders
          const ordersCount = activeOrdersItems.get(categoryType) || 0;

          // Total count = cart + active orders
          const totalCount = cartCount + ordersCount;

          // Check if adding this would exceed the limit
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
    // Navigate back to home and pass cart state
    navigate(`/kiosk/${deviceId}`, {
      state: {
        cart: Array.from(cart.entries()),
      }
    });
  };

  const handleViewOrders = () => {
    navigate(`/kiosk/${deviceId}/orders`);
  };

  const handleCheckout = async () => {
    if (!deviceId || cart.size === 0) return;

    try {
      const items = Array.from(cart.entries()).map(([product_id, quantity]) => ({
        product_id,
        quantity,
      }));

      const orderData = {
        device_uid: deviceId,
        items,
      };

      console.log('Sending order data:', orderData);
      const response = await ordersApi.createOrderPublic(orderData);
      console.log('Order created successfully:', response);

      // Clear cart and close modal
      setCart(new Map());
      localStorage.removeItem(`${CART_STORAGE_KEY}_${deviceId}`);
      setShowCart(false);

      // Redirect to orders page
      navigate(`/kiosk/${deviceId}/orders`, { replace: true });
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorData = error.response?.data;

      if (errorData?.limit_reached) {
        setCart(new Map());
        setShowCart(false);
        setShowLimitReachedModal(true);
      } else {
        const errorMessage = errorData?.error || 'Error al confirmar la orden. Por favor intenta de nuevo.';
        alert(errorMessage);
      }
    }
  };

  // Get all products including those in cart from other categories
  const getAllProducts = (): Product[] => {
    // Combine products from this category with products from cart (other categories)
    const allProducts = [...products, ...cartProducts];
    // Remove duplicates by id
    const uniqueProducts = allProducts.filter((product, index, self) =>
      index === self.findIndex(p => p.id === product.id)
    );
    return uniqueProducts;
  };

  const cartTotal = Array.from(cart.values()).reduce((sum, qty) => sum + qty, 0);
  const mobileMenuActions: MobileHeaderMenuAction[] = [
    {
      id: 'orders',
      label: 'Mis Ordenes',
      icon: <ClipboardList size={16} />,
      group: 'navigation',
      onClick: handleViewOrders,
    },
  ];

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
      <header style={{ ...styles.header, ...(isMobile ? styles.mobileHeader : {}) }}>
        <div style={{ ...styles.headerLeft, ...(isMobile ? styles.mobileHeaderLeft : {}) }}>
          <button
            style={{ ...styles.backButton, ...(isMobile ? styles.mobileBackButton : {}) }}
            onClick={handleBack}
            className="cat-back-btn"
          >
            <ArrowLeft size={16} />
            <span style={{ display: isMobile ? 'none' : 'inline' }}>Volver</span>
          </button>
          <div>
            <h1 style={{ ...styles.headerTitle, ...(isMobile ? styles.mobileHeaderTitle : {}) }}>
              {category?.icon && <span style={styles.categoryIcon}>{category.icon}</span>}
              {category?.name || 'Productos'}
            </h1>
            <p style={{ ...styles.headerSubtitle, ...(isMobile ? styles.mobileHeaderSubtitle : {}) }}>
              {patientInfo ? `Habitación: ${patientInfo.room_code}` : `Dispositivo: ${deviceId}`}
            </p>
          </div>
        </div>
        <div style={{ ...styles.headerRight, ...(isMobile ? styles.mobileHeaderRight : {}) }}>
          {isMobile ? (
            <div style={styles.mobileControlsWrap}>
              {cartTotal > 0 && (
                <button
                  style={{ ...styles.cartButton, ...styles.mobileCartButton }}
                  onClick={() => setShowCart(true)}
                  aria-label="Carrito"
                >
                  <ShoppingCart size={16} style={{ flexShrink: 0 }} />
                  <span style={{ ...styles.mobileCartBadge }}>{cartTotal}</span>
                </button>
              )}
              <div style={styles.mobileMenuWrap}>
                <MobileHeaderMenu actions={mobileMenuActions} buttonLabel="Menu categoria" />
              </div>
            </div>
          ) : (
            <>
              <button style={styles.ordersButton} onClick={handleViewOrders} className="cat-orders-btn">
                <ClipboardList size={16} />
                Mis Órdenes
              </button>
              {cartTotal > 0 && (
                <button style={styles.cartButton} onClick={() => setShowCart(true)} className="cat-cart-btn">
                  <ShoppingCart size={16} />
                  Carrito ({cartTotal})
                </button>
              )}
            </>
          )}
        </div>
      </header>

      {/* Products Grid */}
      <div style={styles.content}>
        <div style={styles.summaryBar}>
          <div style={styles.summaryLeft}>
            <Sparkles size={16} color={colors.primaryDark} />
            <span style={styles.summaryText}>
              {products.length} producto{products.length === 1 ? '' : 's'} disponibles
            </span>
          </div>
          {category?.description && (
            <span style={styles.summaryDescription}>{category.description}</span>
          )}
        </div>

        {products.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No hay productos disponibles en esta categoría</p>
            <button style={styles.emptyButton} onClick={handleBack} className="cat-empty-btn">
              Volver al inicio
            </button>
          </div>
        ) : (
          <div style={styles.productsGrid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                variant="grid"
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <CartModal
          cart={cart}
          products={getAllProducts()}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckout={handleCheckout}
          orderLimits={orderLimits || patientInfo?.order_limits || {}}
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

      {/* Cannot Order Modal */}
      <CannotOrderModal
        show={showCannotOrderModal}
        onClose={() => setShowCannotOrderModal(false)}
      />

      {/* Survey Modals - Global Context - Show from any page */}
      {surveyState.showProductRatings && surveyState.patientAssignmentId && (
        <ProductRatingsModal
          patientAssignmentId={surveyState.patientAssignmentId}
          onNext={(ratings) => {
            setProductRatings(ratings);
          }}
        />
      )}

      {surveyState.showStaffRating && surveyState.patientAssignmentId && (
        <StaffRatingModal
          staffName={surveyState.staffName}
          onNext={(rating) => {
            setStaffRating(rating);
          }}
        />
      )}

      {surveyState.showStayRating && surveyState.patientAssignmentId && (
        <StayRatingModal
          onComplete={async (stayRating, comment) => {
            try {
              await completeSurvey(stayRating, comment);
              // After survey completion, session will end automatically via WebSocket
              navigate(`/kiosk/${deviceId}`, { replace: true });
            } catch (error: any) {
              console.error('Error completing survey:', error);
              const errorMessage = error.response?.data?.error || 'Error al enviar la encuesta. Por favor intenta de nuevo.';
              alert(errorMessage);
            }
          }}
        />
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1A0D05',
    paddingBottom: '40px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#1A0D05',
    color: colors.cream,
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: `4px solid ${colors.primaryMuted}`,
    borderTop: `4px solid ${colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    backgroundColor: colors.white,
    padding: '20px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: `0 2px 10px ${colors.shadow}`,
    marginBottom: '20px',
    borderBottom: `1px solid ${colors.parchment}`,
    position: 'sticky',
    top: 0,
    zIndex: 5,
  },
  mobileHeader: {
    padding: '14px 14px 10px',
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: '8px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  mobileHeaderLeft: {
    width: '100%',
    minWidth: 0,
    gap: '10px',
  },
  backButton: {
    padding: '10px 14px',
    backgroundColor: colors.white,
    color: colors.textSecondary,
    border: `1px solid ${colors.parchment}`,
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  mobileBackButton: {
    padding: 0,
    width: '36px',
    height: '36px',
    borderRadius: '999px',
    fontSize: '13px',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: '34px',
    fontWeight: 700,
    color: colors.textPrimary,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  mobileHeaderTitle: {
    fontSize: '26px',
    gap: '8px',
    lineHeight: 1.1,
  },
  categoryIcon: {
    fontSize: '32px',
  },
  headerSubtitle: {
    fontSize: '14px',
    color: colors.textMuted,
    margin: '8px 0 0 0',
  },
  mobileHeaderSubtitle: {
    marginTop: '6px',
    fontSize: '12px',
  },
  headerRight: {
    display: 'flex',
    gap: '12px',
  },
  mobileHeaderRight: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  mobileControlsWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    width: '100%',
  },
  mobileMenuWrap: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  mobileCartButton: {
    width: '44px',
    height: '44px',
    padding: 0,
    borderRadius: '10px',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: `0 2px 8px ${colors.shadow}`,
  },
  mobileCartBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    minWidth: '18px',
    height: '18px',
    padding: '0 4px',
    borderRadius: '9px',
    backgroundColor: colors.primary,
    color: colors.white,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 700,
  },
  ordersButton: {
    padding: '10px 16px',
    backgroundColor: colors.white,
    color: colors.textSecondary,
    border: `1px solid ${colors.parchment}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cartButton: {
    padding: '10px 16px',
    backgroundColor: colors.primaryMuted,
    color: colors.primaryDark,
    border: `1px solid ${colors.primary}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  content: {
    padding: '0 24px',
    maxWidth: '1480px',
    margin: '0 auto',
  },
  summaryBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    backgroundColor: colors.white,
    border: `1px solid ${colors.parchment}`,
    borderRadius: '10px',
    padding: '10px 14px',
    marginBottom: '16px',
  },
  summaryLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  summaryText: {
    fontSize: '14px',
    color: colors.textPrimary,
    fontWeight: 600,
  },
  summaryDescription: {
    fontSize: '13px',
    color: colors.textMuted,
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '18px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: colors.white,
    borderRadius: '14px',
    border: `1px solid ${colors.parchment}`,
  },
  emptyText: {
    fontSize: '18px',
    color: colors.textSecondary,
    marginBottom: '24px',
  },
  emptyButton: {
    padding: '12px 22px',
    backgroundColor: colors.white,
    color: colors.textSecondary,
    border: `1px solid ${colors.parchment}`,
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .cat-back-btn:hover {
    border-color: ${colors.primary} !important;
    color: ${colors.primaryDark} !important;
    transform: translateY(-1px);
  }

  .cat-orders-btn:hover {
    border-color: ${colors.primary} !important;
    color: ${colors.primaryDark} !important;
    transform: translateY(-1px);
  }

  .cat-cart-btn:hover {
    background-color: ${colors.primaryLight} !important;
    transform: translateY(-1px);
    box-shadow: 0 3px 10px ${colors.shadow};
  }

  .cat-empty-btn:hover {
    border-color: ${colors.primary} !important;
    color: ${colors.primaryDark} !important;
  }
`;
if (!document.head.querySelector('[data-category-page-styles]')) {
  styleSheet.setAttribute('data-category-page-styles', 'true');
  document.head.appendChild(styleSheet);
}
