import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import { useAuth } from '../../auth/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('PLACED,PREPARING');
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // WebSocket connection for real-time updates
  const token = localStorage.getItem('access_token');
  const wsUrl = `${WS_BASE_URL}/ws/staff/orders/?token=${token}`;

  const { isConnected } = useWebSocket({
    url: wsUrl,
    onMessage: (message: any) => {
      if (message.type === 'new_order') {
        console.log('✅ New order received:', message.order_id);
        loadOrders();
      }
    },
    onOpen: () => {
      console.log('✅ WebSocket connected');
    },
    onClose: () => {
      console.log('❌ WebSocket disconnected');
    },
    onError: (error) => {
      console.error('⚠️ WebSocket error:', error);
    },
    reconnectInterval: 5000,  // Wait 5 seconds before reconnecting
    maxReconnectAttempts: 3,  // Only try 3 times
  });

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Admins see all orders, staff see only their assigned patient's orders
      const myOrdersFilter = !user?.is_superuser;
      const response = await ordersApi.getOrderQueue(filter, myOrdersFilter);
      setOrders(response.orders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED':
        return '#e74c3c';
      case 'PREPARING':
        return '#f39c12';
      case 'READY':
        return '#3498db';
      case 'DELIVERED':
        return '#27ae60';
      case 'CANCELLED':
        return '#95a5a6';
      default:
        return '#95a5a6';
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1>Orders Dashboard</h1>
          <div style={styles.userInfo}>
            {user?.email} |
            <span style={{ marginLeft: '10px', color: isConnected ? '#27ae60' : '#e74c3c' }}>
              {isConnected ? '● Connected' : '○ Disconnected'}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </header>

      <div style={styles.filters}>
        <button
          onClick={() => setFilter('PLACED,PREPARING')}
          style={filter === 'PLACED,PREPARING' ? styles.filterButtonActive : styles.filterButton}
        >
          Active Orders
        </button>
        <button
          onClick={() => setFilter('READY')}
          style={filter === 'READY' ? styles.filterButtonActive : styles.filterButton}
        >
          Ready
        </button>
        <button
          onClick={() => setFilter('DELIVERED')}
          style={filter === 'DELIVERED' ? styles.filterButtonActive : styles.filterButton}
        >
          Delivered
        </button>
        <button
          onClick={() => setFilter('PLACED,PREPARING,READY,DELIVERED,CANCELLED')}
          style={filter === 'PLACED,PREPARING,READY,DELIVERED,CANCELLED' ? styles.filterButtonActive : styles.filterButton}
        >
          All
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading orders...</div>
      ) : (
        <div style={styles.ordersGrid}>
          {orders.length === 0 ? (
            <div style={styles.emptyState}>No orders found</div>
          ) : (
            orders.map((order) => (
              <Link
                key={order.id}
                to={`/staff/orders/${order.id}`}
                style={styles.orderCard}
              >
                <div style={styles.orderHeader}>
                  <h3>Order #{order.id}</h3>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(order.status),
                    }}
                  >
                    {order.status_display}
                  </span>
                </div>
                <div style={styles.orderInfo}>
                  <p>Room: {order.room_code || 'N/A'}</p>
                  <p>Device: {order.device_uid || 'N/A'}</p>
                  <p>Items: {order.items.length}</p>
                  <p style={styles.timestamp}>
                    {new Date(order.placed_at).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
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
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    fontSize: '14px',
    opacity: 0.9,
    marginTop: '5px',
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  filters: {
    display: 'flex',
    gap: '10px',
    padding: '20px',
    backgroundColor: 'white',
    borderBottom: '1px solid #ddd',
  },
  filterButton: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  filterButtonActive: {
    padding: '10px 20px',
    border: '1px solid #3498db',
    borderRadius: '5px',
    backgroundColor: '#3498db',
    color: 'white',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#666',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#999',
  },
  ordersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    padding: '20px',
  },
  orderCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.2s',
    cursor: 'pointer',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  statusBadge: {
    padding: '5px 10px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  orderInfo: {
    fontSize: '14px',
    color: '#666',
  },
  timestamp: {
    fontSize: '12px',
    color: '#999',
    marginTop: '10px',
  },
};

export default OrdersPage;
