import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/products';
import type { Product, ProductCategory } from '../../types';
import { ProductCard } from '../../components/kiosk/ProductCard';
import { colors } from '../../styles/colors';

export const KioskCategoryPage: React.FC = () => {
  const { deviceId, categoryId } = useParams<{ deviceId: string; categoryId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    loadCategoryData();
  }, [categoryId]);

  const loadCategoryData = async () => {
    if (!categoryId) return;

    try {
      setLoading(true);

      // Load category details
      const categories = await productsApi.getPublicCategories();
      const categoryData = categories.results?.find((c: ProductCategory) => c.id === parseInt(categoryId)) || null;
      setCategory(categoryData);

      // Load products for this category
      const productsData = await productsApi.getProductsByCategory(parseInt(categoryId));
      setProducts(productsData);

    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId: number) => {
    setCart((prev) => {
      const newCart = new Map(prev);
      newCart.set(productId, (newCart.get(productId) || 0) + 1);
      return newCart;
    });
  };

  const handleBack = () => {
    navigate(`/kiosk/${deviceId}`);
  };

  const handleViewOrders = () => {
    navigate(`/kiosk/${deviceId}/orders`);
  };

  const cartTotal = Array.from(cart.values()).reduce((sum, qty) => sum + qty, 0);

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
            <p style={styles.headerSubtitle}>Habitación: 001</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.ordersButton} onClick={handleViewOrders}>
            Mis Órdenes
          </button>
          {cartTotal > 0 && (
            <button style={styles.cartButton}>
              🛒 Carrito ({cartTotal})
            </button>
          )}
        </div>
      </header>

      {/* Products Grid */}
      <div style={styles.content}>
        {products.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No hay productos disponibles en esta categoría</p>
            <button style={styles.emptyButton} onClick={handleBack}>
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
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  backButton: {
    padding: '10px 20px',
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
  headerSubtitle: {
    fontSize: '16px',
    color: colors.gray,
    margin: '8px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    gap: '16px',
  },
  ordersButton: {
    padding: '12px 24px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  cartButton: {
    padding: '12px 24px',
    backgroundColor: colors.success,
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
