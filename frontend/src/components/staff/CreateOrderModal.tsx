import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import type { Product } from '../../types';
import { colors } from '../../styles/colors';

interface CreateOrderModalProps {
  assignmentId: number;
  patientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  assignmentId,
  patientName,
  onClose,
  onSuccess,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);

      // Load inventory data
      const inventoryResponse = await apiClient.get('/inventory/balances/all_products/');
      const inventoryData = inventoryResponse.data.results || [];

      // Load catalog data with images and category info
      const catalogResponse = await apiClient.get('/catalog/products/');
      const catalogData = catalogResponse.data.results || catalogResponse.data || [];

      // Filter: only active products that are inventoried (have inventory tracking)
      const inventoriedProducts = inventoryData.filter((p: any) => p.inventoried);

      // Combine inventory and catalog data
      const productsWithAvailability = inventoriedProducts.map((invProduct: any) => {
        const catalogProduct = catalogData.find((cp: any) => cp.id === invProduct.id);
        return {
          id: invProduct.id,
          name: invProduct.name,
          category_name: invProduct.category,
          category_type: catalogProduct?.category_type || 'OTHER',
          price: catalogProduct?.price || null,
          image_url_full: catalogProduct?.image_url_full || catalogProduct?.image_url || null,
          available: invProduct.available,
          is_available: invProduct.available > 0,
        };
      });

      setProducts(productsWithAvailability);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId: number) => {
    setCart(prev => {
      const newCart = new Map(prev);
      const currentQty = newCart.get(productId) || 0;
      newCart.set(productId, currentQty + 1);
      return newCart;
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(prev => {
      const newCart = new Map(prev);
      const currentQty = newCart.get(productId) || 0;
      if (currentQty <= 1) {
        newCart.delete(productId);
      } else {
        newCart.set(productId, currentQty - 1);
      }
      return newCart;
    });
  };

  const handleSubmitOrder = async () => {
    if (cart.size === 0) {
      setError('Por favor agrega al menos un artículo a la orden');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const items = Array.from(cart.entries()).map(([product_id, quantity]) => ({
        product_id,
        quantity,
      }));

      await apiClient.post(`/orders/${assignmentId}/create-order/`, {
        items,
      });

      onSuccess();
    } catch (err: any) {
      console.error('Failed to create order:', err);
      setError(err.response?.data?.error || 'Error al crear la orden');
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalItems = () => {
    return Array.from(cart.values()).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalFoodPrice = () => {
    let total = 0;
    cart.forEach((quantity, productId) => {
      const product = products.find(p => p.id === productId);
      if (product && product.category_type === 'FOOD' && product.price) {
        total += product.price * quantity;
      }
    });
    return total;
  };

  // Group products by category type
  const groupedProducts = products.reduce((acc: any, product: any) => {
    const type = product.category_type || 'OTHER';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(product);
    return acc;
  }, {});

  const categoryLabels: { [key: string]: string } = {
    'DRINK': 'Bebidas',
    'SNACK': 'Snacks',
    'FOOD': 'Comida (Pago adicional)',
    'OTHER': 'Otros',
  };

  const categoryOrder = ['DRINK', 'SNACK', 'FOOD', 'OTHER'];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Crear Orden para {patientName}</h2>
            <p style={styles.subtitle}>Sin límites - el personal puede ordenar cualquier cosa</p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <div style={styles.content}>
          {loading ? (
            <div style={styles.loading}>Cargando productos...</div>
          ) : (
            <>
              <div style={styles.productsSection}>
                {categoryOrder.map((categoryType) => {
                  const categoryProducts = groupedProducts[categoryType];
                  if (!categoryProducts || categoryProducts.length === 0) return null;

                  const isFood = categoryType === 'FOOD';

                  return (
                    <div key={categoryType} style={styles.categorySection}>
                      <h3 style={{
                        ...styles.sectionTitle,
                        ...(isFood ? styles.foodSectionTitle : {}),
                      }}>
                        {categoryLabels[categoryType]}
                        {isFood && <span style={styles.foodBadge}>Pago adicional</span>}
                      </h3>
                      <div style={styles.productsGrid}>
                        {categoryProducts.map((product: any) => {
                          const isOutOfStock = !product.is_available;
                          const available = product.available || 0;

                          return (
                            <div
                              key={product.id}
                              style={{
                                ...styles.productCard,
                                opacity: isOutOfStock ? 0.6 : 1,
                                border: isOutOfStock ? '2px solid #e74c3c' : isFood ? '2px solid #ff9800' : '1px solid #e0e0e0',
                              }}
                            >
                              {product.image_url_full && (
                                <img
                                  src={product.image_url_full}
                                  alt={product.name}
                                  style={styles.productImage}
                                />
                              )}
                              <div style={styles.productInfo}>
                                <h4 style={styles.productName}>{product.name}</h4>
                                <p style={styles.productCategory}>{product.category_name}</p>
                                {isFood && product.price != null && (
                                  <p style={styles.productPrice}>${product.price.toFixed(2)} MXN</p>
                                )}
                                <div style={{
                                  ...styles.stockBadge,
                                  backgroundColor: isOutOfStock ? '#e74c3c' : available < 10 ? '#f39c12' : '#27ae60',
                                }}>
                                  {isOutOfStock ? 'AGOTADO' : `Stock: ${available}`}
                                </div>
                              </div>
                              <div style={styles.productActions}>
                                {isOutOfStock ? (
                                  <button
                                    disabled
                                    style={{
                                      ...styles.addButton,
                                      backgroundColor: '#95a5a6',
                                      cursor: 'not-allowed',
                                    }}
                                  >
                                    No disponible
                                  </button>
                                ) : cart.has(product.id) ? (
                                  <div style={styles.quantityControl}>
                                    <button
                                      onClick={() => handleRemoveFromCart(product.id)}
                                      style={styles.quantityButton}
                                    >
                                      -
                                    </button>
                                    <span style={styles.quantity}>{cart.get(product.id)}</span>
                                    <button
                                      onClick={() => handleAddToCart(product.id)}
                                      style={styles.quantityButton}
                                      disabled={cart.get(product.id)! >= available}
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleAddToCart(product.id)}
                                    style={{
                                      ...styles.addButton,
                                      ...(isFood ? { backgroundColor: '#ff9800' } : {}),
                                    }}
                                  >
                                    Agregar
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {cart.size > 0 && (
                <div style={styles.cartSection}>
                  <h3 style={styles.sectionTitle}>Resumen de Orden ({getTotalItems()} items)</h3>
                  <div style={styles.cartItems}>
                    {Array.from(cart.entries()).map(([productId, quantity]) => {
                      const product = products.find((p: any) => p.id === productId);
                      if (!product) return null;
                      const isFood = product.category_type === 'FOOD';
                      return (
                        <div key={productId} style={{
                          ...styles.cartItem,
                          ...(isFood ? { borderLeft: '3px solid #ff9800' } : {}),
                        }}>
                          <span style={styles.cartItemName}>{product.name}</span>
                          <div style={styles.cartItemRight}>
                            {isFood && product.price != null && (
                              <span style={styles.cartItemPrice}>${(product.price * quantity).toFixed(2)}</span>
                            )}
                            <span style={styles.cartItemQty}>x{quantity}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {getTotalFoodPrice() > 0 && (
                    <div style={styles.foodTotalSection}>
                      <span style={styles.foodTotalLabel}>Total Comida (Pago adicional):</span>
                      <span style={styles.foodTotalValue}>${getTotalFoodPrice().toFixed(2)} MXN</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton} disabled={submitting}>
            Cancelar
          </button>
          <button
            onClick={handleSubmitOrder}
            style={{
              ...styles.submitButton,
              opacity: cart.size === 0 || submitting ? 0.5 : 1,
            }}
            disabled={cart.size === 0 || submitting}
          >
            {submitting ? 'Creando Orden...' : `Crear Orden (${getTotalItems()} items)`}
          </button>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: '12px',
    width: '95%',
    maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.3)',
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
    color: colors.black,
  },
  subtitle: {
    fontSize: '14px',
    color: '#ff9800',
    margin: '4px 0 0 0',
    fontWeight: '600',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '36px',
    cursor: 'pointer',
    color: colors.gray,
    padding: 0,
    width: '36px',
    height: '36px',
    lineHeight: '36px',
  },
  error: {
    padding: '12px 24px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderBottom: '1px solid #e0e0e0',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: colors.gray,
  },
  productsSection: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: colors.black,
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  productCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  productImage: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 4px 0',
    color: colors.black,
  },
  productCategory: {
    fontSize: '12px',
    color: colors.gray,
    margin: 0,
  },
  stockBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    color: colors.white,
    marginTop: '8px',
  },
  productActions: {
    marginTop: 'auto',
  },
  addButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#4caf50',
    color: colors.white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: colors.white,
    borderRadius: '6px',
    padding: '8px',
  },
  quantityButton: {
    width: '32px',
    height: '32px',
    backgroundColor: '#4caf50',
    color: colors.white,
    border: 'none',
    borderRadius: '50%',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: '18px',
    fontWeight: 'bold',
    minWidth: '24px',
    textAlign: 'center',
  },
  cartSection: {
    backgroundColor: '#e8f5e9',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
  },
  cartItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px',
    backgroundColor: colors.white,
    borderRadius: '4px',
  },
  cartItemName: {
    fontSize: '14px',
    fontWeight: '600',
  },
  cartItemQty: {
    fontSize: '14px',
    color: colors.gray,
  },
  cartItemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cartItemPrice: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#e65100',
  },
  categorySection: {
    marginBottom: '24px',
  },
  foodSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  foodBadge: {
    backgroundColor: '#ff9800',
    color: colors.white,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#e65100',
    margin: '4px 0 0 0',
  },
  foodTotalSection: {
    marginTop: '16px',
    padding: '12px 16px',
    backgroundColor: '#fff3e0',
    borderRadius: '8px',
    border: '1px solid #ffcc80',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodTotalLabel: {
    fontSize: '14px',
    color: '#6d4c41',
    fontWeight: '500',
  },
  foodTotalValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#e65100',
  },
  footer: {
    padding: '24px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#95a5a6',
    color: colors.white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#4caf50',
    color: colors.white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};
