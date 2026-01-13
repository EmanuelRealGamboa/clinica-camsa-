import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { colors } from '../../styles/colors';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  sku: string;
  inventoried: boolean;
  on_hand: number | null;
  reserved: number | null;
  available: number | null;
  reorder_level: number | null;
  needs_reorder: boolean;
}

export const InventoryViewPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadInventory();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadInventory = async () => {
    try {
      const response = await apiClient.get('/inventory/balances/all_products/');
      setInventory(response.data.results || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(inventory.map(item => item.category)))];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (item: InventoryItem) => {
    if (!item.inventoried) {
      return { label: 'No Rastreado', color: '#95a5a6' };
    }
    if (item.needs_reorder) {
      return { label: 'Stock Bajo', color: '#e74c3c' };
    }
    if ((item.available || 0) === 0) {
      return { label: 'Agotado', color: '#e67e22' };
    }
    if ((item.available || 0) < 10) {
      return { label: 'Bajo', color: '#f39c12' };
    }
    return { label: 'Bueno', color: '#27ae60' };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Vista de Inventario</h1>
          <p style={styles.subtitle}>Vista de solo lectura de todos los productos y niveles de stock</p>
        </div>
        <Link to="/staff/dashboard" style={styles.backButton}>
          Volver al Panel
        </Link>
      </div>

      <div style={styles.controls}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Buscar por nombre de producto o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filters}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={styles.select}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Todas las Categorías' : cat}
              </option>
            ))}
          </select>

          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={styles.checkbox}
            />
            Auto-actualizar (30s)
          </label>

          <button onClick={loadInventory} style={styles.refreshButton}>
            Actualizar Ahora
          </button>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Cargando inventario...</div>
      ) : (
        <>
          <div style={styles.summary}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Total de Productos:</span>
              <span style={styles.summaryValue}>{filteredInventory.length}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Rastreados:</span>
              <span style={styles.summaryValue}>
                {filteredInventory.filter(i => i.inventoried).length}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Stock Bajo:</span>
              <span style={{ ...styles.summaryValue, color: '#e74c3c' }}>
                {filteredInventory.filter(i => i.needs_reorder).length}
              </span>
            </div>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeader}>Producto</th>
                  <th style={styles.tableHeader}>Categoría</th>
                  <th style={styles.tableHeader}>SKU</th>
                  <th style={styles.tableHeader}>Estado</th>
                  <th style={styles.tableHeader}>En Mano</th>
                  <th style={styles.tableHeader}>Reservado</th>
                  <th style={styles.tableHeader}>Disponible</th>
                  <th style={styles.tableHeader}>Nivel de Reorden</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <strong>{item.name}</strong>
                      </td>
                      <td style={styles.tableCell}>{item.category}</td>
                      <td style={styles.tableCell}>{item.sku}</td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: status.color,
                          }}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        {item.inventoried ? item.on_hand : '-'}
                      </td>
                      <td style={styles.tableCell}>
                        {item.inventoried ? item.reserved : '-'}
                      </td>
                      <td style={styles.tableCell}>
                        {item.inventoried ? (
                          <strong style={{ color: (item.available || 0) < 10 ? '#e74c3c' : '#27ae60' }}>
                            {item.available}
                          </strong>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        {item.inventoried ? item.reorder_level || '-' : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredInventory.length === 0 && (
              <div style={styles.noResults}>
                No se encontraron productos que coincidan con tus criterios
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    backgroundColor: colors.white,
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
    color: colors.black,
  },
  subtitle: {
    fontSize: '14px',
    color: colors.gray,
    margin: '4px 0 0 0',
  },
  backButton: {
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: colors.white,
    border: 'none',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  controls: {
    backgroundColor: colors.white,
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  searchBox: {
    marginBottom: '16px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '6px',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  select: {
    padding: '10px 16px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: colors.white,
    cursor: 'pointer',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  refreshButton: {
    padding: '10px 20px',
    backgroundColor: '#27ae60',
    color: colors.white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  summaryItem: {
    backgroundColor: colors.white,
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: '14px',
    color: colors.gray,
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: colors.black,
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: colors.gray,
    backgroundColor: colors.white,
    borderRadius: '8px',
  },
  tableContainer: {
    backgroundColor: colors.white,
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
  },
  tableHeader: {
    padding: '16px',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#495057',
  },
  tableRow: {
    borderBottom: '1px solid #dee2e6',
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: colors.black,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    color: colors.white,
    fontSize: '12px',
    fontWeight: 'bold',
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    color: colors.gray,
    fontSize: '16px',
  },
};
