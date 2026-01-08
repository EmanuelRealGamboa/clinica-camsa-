import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import apiClient from '../../api/client';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [devices, setDevices] = useState<any[]>([]);
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [stats, setStats] = useState({
    activeOrders: 0,
    todayOrders: 0,
    readyOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientForm, setPatientForm] = useState({
    full_name: '',
    phone_e164: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get devices assigned to current user
      const devicesResponse = await apiClient.get('/clinic/devices/', {
        params: { my_devices: 'true' }
      });
      const devicesData = devicesResponse.data;
      const devicesArray = devicesData.results || (Array.isArray(devicesData) ? devicesData : []);
      setDevices(devicesArray);

      // Get active patient assignment
      try {
        const assignmentResponse = await apiClient.get('/clinic/patient-assignments/my_active/');
        setActiveAssignment(assignmentResponse.data);
      } catch (err: any) {
        if (err.response?.status !== 404) {
          console.error('Failed to load active assignment:', err);
        }
        setActiveAssignment(null);
      }

      // Get order stats - admins see all, staff see only their assigned patient's orders
      const params: any = { status: 'PLACED,PREPARING,READY' };
      if (!user?.is_superuser) {
        params.my_orders = 'true';
      }
      const ordersResponse = await apiClient.get('/orders/queue/', { params });
      const ordersData = ordersResponse.data;
      const orders = ordersData.orders || [];

      setStats({
        activeOrders: orders.filter((o: any) => o.status === 'PLACED' || o.status === 'PREPARING').length,
        todayOrders: orders.length,
        readyOrders: orders.filter((o: any) => o.status === 'READY').length,
      });
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/staff/login');
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that user has an assigned device
    if (devices.length === 0) {
      alert('You need to have a device assigned before registering a patient');
      return;
    }

    // Check if there's already an active assignment
    if (activeAssignment) {
      alert(`You are already attending ${activeAssignment.patient_details.full_name}. Please end that care first.`);
      return;
    }

    const firstDevice = devices[0];

    try {
      // Create patient
      const patientResponse = await apiClient.post('/clinic/patients/', patientForm);
      const patient = patientResponse.data;

      // Create patient assignment
      await apiClient.post('/clinic/patient-assignments/', {
        patient: patient.id,
        staff: user?.id,
        device: firstDevice.id,
        room: firstDevice.room
      });

      alert('Patient registered and assigned successfully!');
      setShowPatientModal(false);
      setPatientForm({ full_name: '', phone_e164: '' });

      // Reload data to show new assignment
      loadData();
    } catch (err: any) {
      console.error('Failed to create patient:', err);
      const errorMsg = err.response?.data?.phone_e164?.[0]
        || err.response?.data?.detail
        || err.response?.data?.non_field_errors?.[0]
        || 'Failed to register patient';
      alert(errorMsg);
    }
  };

  const handleEndCare = async () => {
    if (!activeAssignment) return;

    if (!confirm(`Are you sure you want to end care for ${activeAssignment.patient_details.full_name}?`)) {
      return;
    }

    try {
      await apiClient.post(`/clinic/patient-assignments/${activeAssignment.id}/end_care/`);
      alert('Patient care ended successfully');
      loadData();
    } catch (err: any) {
      console.error('Failed to end care:', err);
      alert(err.response?.data?.detail || 'Failed to end patient care');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1>Staff Dashboard</h1>
          <div style={styles.userInfo}>
            {user?.full_name || user?.email}
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </header>

      <div style={styles.content}>
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : (
          <>
            {/* Active Patient Assignment */}
            {activeAssignment && (
              <div style={styles.activePatientSection}>
                <div style={styles.activePatientHeader}>
                  <h2>🏥 Currently Attending Patient</h2>
                  <button onClick={handleEndCare} style={styles.endCareButton}>
                    End Care
                  </button>
                </div>
                <div style={styles.activePatientCard}>
                  <div style={styles.patientIcon}>👤</div>
                  <div style={styles.patientInfo}>
                    <h3>{activeAssignment.patient_details.full_name}</h3>
                    <div style={styles.patientDetails}>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Phone:</span>
                        <span>{activeAssignment.patient_details.phone_e164}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Room:</span>
                        <span>{activeAssignment.room_details.code}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Device:</span>
                        <span>{activeAssignment.device_details.device_uid}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Started:</span>
                        <span>{new Date(activeAssignment.started_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Device & Room Info */}
            <div style={styles.deviceSection}>
              <h2>My Assigned Devices & Rooms</h2>
              {devices.length === 0 ? (
                <div style={styles.noDevices}>
                  <p>⚠️ No devices assigned to you yet.</p>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    Please contact your administrator to assign you to a device and room.
                  </p>
                </div>
              ) : (
                <div style={styles.devicesGrid}>
                  {devices.map((device) => (
                    <div key={device.id} style={styles.deviceCard}>
                      <div style={styles.deviceIcon}>📱</div>
                      <h3>{device.device_uid}</h3>
                      <p style={styles.deviceType}>{device.device_type_display}</p>
                      <div style={styles.deviceInfo}>
                        <div style={styles.infoRow}>
                          <span style={styles.infoLabel}>Room:</span>
                          <span style={styles.infoValue}>
                            {device.room_code || 'No room assigned'}
                          </span>
                        </div>
                        <div style={styles.infoRow}>
                          <span style={styles.infoLabel}>Status:</span>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: device.is_active ? '#27ae60' : '#95a5a6'
                          }}>
                            {device.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={styles.statsSection}>
              <h2>Order Statistics</h2>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>📋</div>
                  <div style={styles.statValue}>{stats.activeOrders}</div>
                  <div style={styles.statLabel}>Active Orders</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>✅</div>
                  <div style={styles.statValue}>{stats.readyOrders}</div>
                  <div style={styles.statLabel}>Ready for Delivery</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>📊</div>
                  <div style={styles.statValue}>{stats.todayOrders}</div>
                  <div style={styles.statLabel}>Today's Orders</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={styles.actionsSection}>
              <h2>Quick Actions</h2>
              <div style={styles.actionsGrid}>
                <Link to="/staff/orders" style={styles.actionCard}>
                  <div style={{...styles.actionIcon, backgroundColor: '#3498db'}}>📦</div>
                  <h3>View Orders</h3>
                  <p>See and manage all orders from your assigned rooms</p>
                </Link>

                <button onClick={() => setShowPatientModal(true)} style={styles.actionCardButton}>
                  <div style={{...styles.actionIcon, backgroundColor: '#2ecc71'}}>👤</div>
                  <h3>Register Patient</h3>
                  <p>Add a new patient to the system</p>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Patient Registration Modal */}
      {showPatientModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPatientModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Register New Patient</h2>
            <form onSubmit={handleCreatePatient} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  value={patientForm.full_name}
                  onChange={(e) => setPatientForm({...patientForm, full_name: e.target.value})}
                  style={styles.input}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number (E.164 format) *</label>
                <input
                  type="tel"
                  value={patientForm.phone_e164}
                  onChange={(e) => setPatientForm({...patientForm, phone_e164: e.target.value})}
                  style={styles.input}
                  required
                  placeholder="+1234567890"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Must start with + followed by country code and number (e.g., +1234567890)
                </small>
              </div>
              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowPatientModal(false)} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  Register Patient
                </button>
              </div>
            </form>
          </div>
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
  content: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#666',
  },
  activePatientSection: {
    marginBottom: '30px',
    backgroundColor: '#e8f5e9',
    padding: '20px',
    borderRadius: '8px',
    border: '2px solid #4caf50',
  },
  activePatientHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  endCareButton: {
    padding: '10px 20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  activePatientCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
  },
  patientIcon: {
    fontSize: '64px',
    flexShrink: 0,
  },
  patientInfo: {
    flex: 1,
  },
  patientDetails: {
    marginTop: '15px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
  },
  detailRow: {
    display: 'flex',
    gap: '10px',
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  deviceSection: {
    marginBottom: '30px',
  },
  noDevices: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
  },
  devicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    marginTop: '15px',
  },
  deviceCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  deviceIcon: {
    fontSize: '48px',
    marginBottom: '10px',
  },
  deviceType: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '15px',
  },
  deviceInfo: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #eee',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  infoLabel: {
    fontSize: '14px',
    color: '#666',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  statsSection: {
    marginBottom: '30px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '15px',
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
  actionsSection: {
    marginBottom: '30px',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '15px',
  },
  actionCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  actionCardButton: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  actionIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    marginBottom: '15px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default DashboardPage;
