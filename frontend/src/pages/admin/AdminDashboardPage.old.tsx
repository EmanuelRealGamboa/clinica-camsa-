import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { adminApi } from '../../api/admin';
import { ordersApi } from '../../api/orders';

const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalDevices: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [users, products, devices, orders] = await Promise.all([
        adminApi.getUsers().catch(() => ({ results: [] })),
        adminApi.getProducts().catch(() => ({ results: [] })),
        adminApi.getDevices().catch(() => ({ results: [] })),
        ordersApi.getAllOrders().catch(() => ({ results: [] })),
      ]);

      setStats({
        totalUsers: users.count || users.results?.length || 0,
        totalProducts: products.count || products.results?.length || 0,
        totalDevices: devices.count || devices.results?.length || 0,
        totalOrders: orders.count || orders.results?.length || 0,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1>Admin Dashboard</h1>
          <div style={styles.userInfo}>
            {user?.email} <span style={styles.badge}>Superadmin</span>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </header>

      {loading ? (
        <div style={styles.loading}>Loading dashboard...</div>
      ) : (
        <>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>👥</div>
              <div style={styles.statValue}>{stats.totalUsers}</div>
              <div style={styles.statLabel}>Total Users</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📦</div>
              <div style={styles.statValue}>{stats.totalProducts}</div>
              <div style={styles.statLabel}>Products</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📱</div>
              <div style={styles.statValue}>{stats.totalDevices}</div>
              <div style={styles.statLabel}>Devices</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📋</div>
              <div style={styles.statValue}>{stats.totalOrders}</div>
              <div style={styles.statLabel}>Total Orders</div>
            </div>
          </div>

          <div style={styles.sectionsGrid}>
            <Link to="/admin/users" style={styles.sectionCard}>
              <div style={{...styles.sectionIcon, backgroundColor: '#3498db'}}>👥</div>
              <h3 style={styles.sectionTitle}>User Management</h3>
              <p style={styles.sectionDescription}>
                Manage staff users, assign roles, and control access
              </p>
            </Link>

            <Link to="/admin/products" style={styles.sectionCard}>
              <div style={{...styles.sectionIcon, backgroundColor: '#2ecc71'}}>📦</div>
              <h3 style={styles.sectionTitle}>Products</h3>
              <p style={styles.sectionDescription}>
                Manage product catalog and categories
              </p>
            </Link>

            <Link to="/admin/devices" style={styles.sectionCard}>
              <div style={{...styles.sectionIcon, backgroundColor: '#9b59b6'}}>📱</div>
              <h3 style={styles.sectionTitle}>Devices</h3>
              <p style={styles.sectionDescription}>
                Manage kiosk devices and configurations
              </p>
            </Link>

            <Link to="/staff/orders" style={styles.sectionCard}>
              <div style={{...styles.sectionIcon, backgroundColor: '#f39c12'}}>📋</div>
              <h3 style={styles.sectionTitle}>Orders</h3>
              <p style={styles.sectionDescription}>
                View and manage all orders
              </p>
            </Link>

            <Link to="/admin/feedback" style={styles.sectionCard}>
              <div style={{...styles.sectionIcon, backgroundColor: '#1abc9c'}}>💬</div>
              <h3 style={styles.sectionTitle}>Feedback & Satisfaction</h3>
              <p style={styles.sectionDescription}>
                View customer satisfaction surveys and feedback
              </p>
            </Link>

            <Link to="/admin/reports" style={styles.sectionCard}>
              <div style={{...styles.sectionIcon, backgroundColor: '#e74c3c'}}>📊</div>
              <h3 style={styles.sectionTitle}>Reports</h3>
              <p style={styles.sectionDescription}>
                View analytics and generate reports
              </p>
            </Link>

            <Link to="/admin/inventory" style={styles.sectionCard}>
              <div style={{...styles.sectionIcon, backgroundColor: '#34495e'}}>📦</div>
              <h3 style={styles.sectionTitle}>Inventory</h3>
              <p style={styles.sectionDescription}>
                Manage product stock levels and inventory
              </p>
            </Link>
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
  },
  header: {
    backgroundColor: '#1a1a2e',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  userInfo: {
    fontSize: '14px',
    opacity: 0.9,
    marginTop: '5px',
  },
  badge: {
    backgroundColor: '#e74c3c',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    marginLeft: '8px',
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#666',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    padding: '20px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '10px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#7f8c8d',
  },
  sectionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    padding: '20px',
  },
  sectionCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  sectionIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    marginBottom: '15px',
  },
  sectionTitle: {
    margin: 0,
    marginBottom: '10px',
    fontSize: '18px',
    color: '#2c3e50',
  },
  sectionDescription: {
    margin: 0,
    fontSize: '14px',
    color: '#7f8c8d',
    lineHeight: '1.5',
  },
};

export default AdminDashboardPage;
