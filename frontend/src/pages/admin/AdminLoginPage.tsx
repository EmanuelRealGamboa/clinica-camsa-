import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      
      // Check if user is admin/superuser after login
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isSuperAdmin = user?.is_superuser === true;
      const hasAdminRole = user?.roles?.includes('ADMIN');
      
      if (isSuperAdmin || hasAdminRole) {
        navigate('/admin/dashboard');
      } else {
        setError('Acceso denegado. Se requieren privilegios de superadministrador.');
        await logout();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error de inicio de sesión. Por favor verifica tus credenciales.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.header}>
          <h1 style={styles.title}>Panel de Administración</h1>
          <p style={styles.subtitle}>Solo Acceso de Superadministrador</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              autoComplete="email"
              placeholder="admin@test.com"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        <div style={styles.footer}>
          <a href="/staff/login" style={styles.link}>Inicio de Sesión del Personal</a>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  },
  loginBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '420px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    margin: 0,
    marginBottom: '8px',
    color: '#1a1a2e',
    fontSize: '28px',
    fontWeight: 'bold',
  },
  subtitle: {
    margin: 0,
    color: '#e74c3c',
    fontSize: '14px',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
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
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
  },
  button: {
    padding: '14px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.3s',
  },
  error: {
    padding: '12px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '6px',
    fontSize: '14px',
    border: '1px solid #fcc',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
  },
  link: {
    color: '#3498db',
    textDecoration: 'none',
    fontSize: '14px',
  },
};

export default AdminLoginPage;
