import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { useAuth } from '../../auth/AuthContext';

const DevicesManagementPage: React.FC = () => {
  const { logout } = useAuth();
  const [devices, setDevices] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'devices' | 'rooms'>('devices');

  const [deviceForm, setDeviceForm] = useState({
    device_uid: '',
    device_type: 'IPAD',
    room: '',
    assigned_staff: [] as number[],
    is_active: true,
  });

  const [roomForm, setRoomForm] = useState({
    code: '',
    floor: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [devicesData, roomsData, staffData] = await Promise.all([
        adminApi.getDevices(),
        adminApi.getRooms(),
        adminApi.getUsers({ is_staff: true }),
      ]);

      const devicesArray = devicesData.results || (Array.isArray(devicesData) ? devicesData : []);
      const roomsArray = roomsData.results || (Array.isArray(roomsData) ? roomsData : []);
      const staffArray = staffData.results || (Array.isArray(staffData) ? staffData : []);

      setDevices(devicesArray);
      setRooms(roomsArray);
      setStaff(staffArray);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Device handlers
  const handleDeviceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...deviceForm,
        room: deviceForm.room ? parseInt(deviceForm.room) : null,
      };

      if (editingDevice) {
        await adminApi.updateDevice(editingDevice.id, data);
      } else {
        await adminApi.createDevice(data);
      }

      setShowDeviceModal(false);
      setEditingDevice(null);
      resetDeviceForm();
      loadData();
    } catch (err: any) {
      console.error('Failed to save device:', err);
      alert(err.response?.data?.error || err.response?.data?.device_uid?.[0] || 'Error al guardar el dispositivo');
    }
  };

  const handleDeleteDevice = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este dispositivo?')) {
      try {
        await adminApi.deleteDevice(id);
        loadData();
      } catch (err) {
        console.error('Failed to delete device:', err);
      }
    }
  };

  const handleEditDevice = (device: any) => {
    setEditingDevice(device);
    setDeviceForm({
      device_uid: device.device_uid,
      device_type: device.device_type,
      room: device.room ? device.room.toString() : '',
      assigned_staff: device.assigned_staff || [],
      is_active: device.is_active,
    });
    setShowDeviceModal(true);
  };

  const resetDeviceForm = () => {
    setDeviceForm({
      device_uid: '',
      device_type: 'IPAD',
      room: '',
      assigned_staff: [],
      is_active: true,
    });
  };

  // Room handlers
  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await adminApi.updateRoom(editingRoom.id, roomForm);
      } else {
        await adminApi.createRoom(roomForm);
      }

      setShowRoomModal(false);
      setEditingRoom(null);
      resetRoomForm();
      loadData();
    } catch (err: any) {
      console.error('Failed to save room:', err);
      alert(err.response?.data?.error || err.response?.data?.code?.[0] || 'Error al guardar la habitación');
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta habitación? Los dispositivos en esta habitación quedarán sin asignar.')) {
      try {
        await adminApi.deleteRoom(id);
        loadData();
      } catch (err) {
        console.error('Failed to delete room:', err);
      }
    }
  };

  const handleEditRoom = (room: any) => {
    setEditingRoom(room);
    setRoomForm({
      code: room.code,
      floor: room.floor || '',
      is_active: room.is_active,
    });
    setShowRoomModal(true);
  };

  const resetRoomForm = () => {
    setRoomForm({
      code: '',
      floor: '',
      is_active: true,
    });
  };

  const getRoomName = (roomId: number | null) => {
    if (!roomId) return 'Sin habitación asignada';
    const room = rooms.find(r => r.id === roomId);
    return room ? room.code : 'Desconocido';
  };

  const toggleStaffAssignment = (staffId: number) => {
    setDeviceForm(prev => ({
      ...prev,
      assigned_staff: prev.assigned_staff.includes(staffId)
        ? prev.assigned_staff.filter(id => id !== staffId)
        : [...prev.assigned_staff, staffId]
    }));
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <Link to="/admin/dashboard" style={styles.backLink}>← Volver al Panel</Link>
          <h1>Gestión de Dispositivos y Habitaciones</h1>
        </div>
        <button onClick={() => logout()} style={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </header>

      <div style={styles.content}>
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('devices')}
            style={activeTab === 'devices' ? styles.tabActive : styles.tab}
          >
            Dispositivos ({devices.length})
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            style={activeTab === 'rooms' ? styles.tabActive : styles.tab}
          >
            Habitaciones ({rooms.length})
          </button>
        </div>

        {activeTab === 'devices' ? (
          <>
            <div style={styles.toolbar}>
              <h2>Dispositivos</h2>
              <button
                onClick={() => {
                  resetDeviceForm();
                  setEditingDevice(null);
                  setShowDeviceModal(true);
                }}
                style={styles.addButton}
              >
                + Agregar Dispositivo
              </button>
            </div>

            {loading ? (
              <div style={styles.loading}>Cargando dispositivos...</div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>UID del Dispositivo</th>
                      <th style={styles.th}>Tipo</th>
                      <th style={styles.th}>Habitación</th>
                      <th style={styles.th}>Personal Asignado</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((device) => (
                      <tr key={device.id} style={styles.tr}>
                        <td style={styles.td}>{device.id}</td>
                        <td style={styles.td}>{device.device_uid}</td>
                        <td style={styles.td}>{device.device_type_display}</td>
                        <td style={styles.td}>{getRoomName(device.room)}</td>
                        <td style={styles.td}>
                          {device.assigned_staff_details?.length > 0 ? (
                            <div>
                              {device.assigned_staff_details.map((s: any) => (
                                <span key={s.id} style={styles.staffBadge}>{s.full_name || s.email}</span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#999' }}>Sin personal asignado</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: device.is_active ? '#27ae60' : '#95a5a6'
                          }}>
                            {device.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleEditDevice(device)}
                            style={styles.editButton}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteDevice(device.id)}
                            style={styles.deleteButton}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={styles.toolbar}>
              <h2>Habitaciones</h2>
              <button
                onClick={() => {
                  resetRoomForm();
                  setEditingRoom(null);
                  setShowRoomModal(true);
                }}
                style={styles.addButton}
              >
                + Agregar Habitación
              </button>
            </div>

            {loading ? (
              <div style={styles.loading}>Cargando habitaciones...</div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Código de Habitación</th>
                      <th style={styles.th}>Piso</th>
                      <th style={styles.th}>Dispositivos</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id} style={styles.tr}>
                        <td style={styles.td}>{room.id}</td>
                        <td style={styles.td}>{room.code}</td>
                        <td style={styles.td}>{room.floor || 'N/A'}</td>
                        <td style={styles.td}>
                          {devices.filter(d => d.room === room.id).length}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: room.is_active ? '#27ae60' : '#95a5a6'
                          }}>
                            {room.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleEditRoom(room)}
                            style={styles.editButton}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            style={styles.deleteButton}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Device Modal */}
      {showDeviceModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeviceModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editingDevice ? 'Editar Dispositivo' : 'Agregar Nuevo Dispositivo'}</h2>
            <form onSubmit={handleDeviceSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>UID del Dispositivo *</label>
                <input
                  type="text"
                  value={deviceForm.device_uid}
                  onChange={(e) => setDeviceForm({...deviceForm, device_uid: e.target.value})}
                  style={styles.input}
                  required
                  placeholder="01, IPAD-001, etc."
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo de Dispositivo *</label>
                <select
                  value={deviceForm.device_type}
                  onChange={(e) => setDeviceForm({...deviceForm, device_type: e.target.value})}
                  style={styles.input}
                  required
                >
                  <option value="IPAD">iPad</option>
                  <option value="WEB">Navegador Web</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Habitación</label>
                <select
                  value={deviceForm.room}
                  onChange={(e) => setDeviceForm({...deviceForm, room: e.target.value})}
                  style={styles.input}
                >
                  <option value="">Sin habitación asignada</option>
                  {rooms.filter(r => r.is_active).map(room => (
                    <option key={room.id} value={room.id}>{room.code} {room.floor ? `(Piso ${room.floor})` : ''}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Personal Asignado (Enfermeras)</label>
                <div style={styles.checkboxGroup}>
                  {staff.map(s => (
                    <label key={s.id} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={deviceForm.assigned_staff.includes(s.id)}
                        onChange={() => toggleStaffAssignment(s.id)}
                        style={{ marginRight: '8px' }}
                      />
                      {s.full_name || s.email}
                    </label>
                  ))}
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <input
                    type="checkbox"
                    checked={deviceForm.is_active}
                    onChange={(e) => setDeviceForm({...deviceForm, is_active: e.target.checked})}
                    style={{marginRight: '8px'}}
                  />
                  Activo
                </label>
              </div>
              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowDeviceModal(false)} style={styles.cancelButton}>
                  Cancelar
                </button>
                <button type="submit" style={styles.submitButton}>
                  {editingDevice ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {showRoomModal && (
        <div style={styles.modalOverlay} onClick={() => setShowRoomModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editingRoom ? 'Editar Habitación' : 'Agregar Nueva Habitación'}</h2>
            <form onSubmit={handleRoomSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Código de Habitación *</label>
                <input
                  type="text"
                  value={roomForm.code}
                  onChange={(e) => setRoomForm({...roomForm, code: e.target.value})}
                  style={styles.input}
                  required
                  placeholder="101, A-205, etc."
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Piso</label>
                <input
                  type="text"
                  value={roomForm.floor}
                  onChange={(e) => setRoomForm({...roomForm, floor: e.target.value})}
                  style={styles.input}
                  placeholder="1, 2, Planta Baja, etc."
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <input
                    type="checkbox"
                    checked={roomForm.is_active}
                    onChange={(e) => setRoomForm({...roomForm, is_active: e.target.checked})}
                    style={{marginRight: '8px'}}
                  />
                  Activo
                </label>
              </div>
              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowRoomModal(false)} style={styles.cancelButton}>
                  Cancelar
                </button>
                <button type="submit" style={styles.submitButton}>
                  {editingRoom ? 'Actualizar' : 'Crear'}
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
    backgroundColor: '#1a1a2e',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backLink: {
    color: '#3498db',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'block',
    marginBottom: '10px',
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
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  tab: {
    padding: '12px 24px',
    backgroundColor: 'white',
    border: '2px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  tabActive: {
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    border: '2px solid #3498db',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  addButton: {
    padding: '12px 24px',
    backgroundColor: '#27ae60',
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
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
  },
  tr: {
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '16px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  staffBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#3498db',
    color: 'white',
    borderRadius: '12px',
    fontSize: '11px',
    marginRight: '4px',
    marginBottom: '4px',
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '8px',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
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
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '200px',
    overflow: 'auto',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '10px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    cursor: 'pointer',
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

export default DevicesManagementPage;
