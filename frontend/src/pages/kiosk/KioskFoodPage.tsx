import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { kioskApi } from '../../api/kiosk';
import ProductRatingsModal from '../../components/kiosk/ProductRatingsModal';
import StaffRatingModal from '../../components/kiosk/StaffRatingModal';
import StayRatingModal from '../../components/kiosk/StayRatingModal';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useSurvey } from '../../contexts/SurveyContext';
import { colors } from '../../styles/colors';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

// Mock data for restaurants - this will be replaced with API data later
const MOCK_RESTAURANTS = [
  {
    id: 1,
    name: 'La Cocina de María',
    description: 'Comida casera tradicional mexicana',
    logo: '🍲',
    rating: 4.8,
    deliveryTime: '30-45 min',
    categories: ['Mexicana', 'Casera'],
    isOpen: true,
  },
  {
    id: 2,
    name: 'Sushi Express',
    description: 'Sushi fresco y rollos especiales',
    logo: '🍣',
    rating: 4.6,
    deliveryTime: '25-35 min',
    categories: ['Japonesa', 'Sushi'],
    isOpen: true,
  },
  {
    id: 3,
    name: 'Pizza Italiana',
    description: 'Pizzas artesanales al horno de leña',
    logo: '🍕',
    rating: 4.7,
    deliveryTime: '35-50 min',
    categories: ['Italiana', 'Pizzas'],
    isOpen: true,
  },
  {
    id: 4,
    name: 'Ensaladas & Más',
    description: 'Opciones saludables y frescas',
    logo: '🥗',
    rating: 4.5,
    deliveryTime: '20-30 min',
    categories: ['Saludable', 'Ensaladas'],
    isOpen: false,
  },
];

interface Restaurant {
  id: number;
  name: string;
  description: string;
  logo: string;
  rating: number;
  deliveryTime: string;
  categories: string[];
  isOpen: boolean;
}

export const KioskFoodPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [patientInfo, setPatientInfo] = useState<{
    full_name: string;
    room_code: string;
    staff_name?: string;
  } | null>(null);

  // Survey context
  const { surveyState, startSurvey, setProductRatings, setStaffRating, completeSurvey } = useSurvey();

  useEffect(() => {
    loadData();
  }, [deviceId]);

  // WebSocket to listen for survey_enabled and other messages
  const wsUrl = deviceId ? `${WS_BASE_URL}/ws/kiosk/orders/?device_uid=${deviceId}` : '';
  
  useWebSocket({
    url: wsUrl,
    onMessage: (message: any) => {
      if (message.type === 'survey_enabled') {
        console.log('Survey enabled via WebSocket - starting survey immediately');
        const assignmentId = message.assignment_id;
        
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
      }
    },
    onOpen: () => console.log('✅ Food WebSocket connected'),
    onClose: () => console.log('❌ Food WebSocket disconnected'),
    onError: (error) => console.error('⚠️ Food WebSocket error:', error),
  });

  const loadData = async () => {
    try {
      setLoading(true);

      // Load patient info
      if (deviceId) {
        try {
      const patientData = await kioskApi.getActivePatient(deviceId);
      setPatientInfo({
        full_name: patientData.patient.full_name,
        room_code: patientData.room.code,
        staff_name: patientData.staff?.full_name,
      });
        } catch (error) {
          console.error('Error loading patient data:', error);
        }
      }

      // TODO: Replace with actual API call to get restaurants
      // For now using mock data
      setRestaurants(MOCK_RESTAURANTS);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/kiosk/${deviceId}`);
  };

  const handleSelectRestaurant = (restaurantId: number) => {
    // TODO: Navigate to restaurant menu page
    navigate(`/kiosk/${deviceId}/food/restaurant/${restaurantId}`);
  };

  const handleViewOrders = () => {
    navigate(`/kiosk/${deviceId}/orders`);
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Cargando restaurantes...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backButton} onClick={handleBack} className="food-back-btn">
            ← Volver
          </button>
          <div>
            <h1 style={styles.headerTitle}>
              <span style={styles.headerIcon}>🛵</span>
              Ordenar Comida
            </h1>
            <p style={styles.headerSubtitle}>
              {patientInfo ? `Habitación: ${patientInfo.room_code}` : `Dispositivo: ${deviceId}`}
            </p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.ordersButton} onClick={handleViewOrders} className="food-orders-btn">
            Mis Órdenes
          </button>
        </div>
      </header>

      {/* Info Banner */}
      <div style={styles.infoBanner}>
        <div style={styles.infoIcon}>💳</div>
        <div style={styles.infoContent}>
          <h3 style={styles.infoTitle}>Pago Adicional Requerido</h3>
          <p style={styles.infoText}>
            Los pedidos de comida de restaurantes tienen un costo adicional que se cobrará
            directamente a tu habitación. El precio se mostrará antes de confirmar tu pedido.
          </p>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>Restaurantes Aliados</h2>
        <p style={styles.sectionSubtitle}>Selecciona un restaurante para ver su menú</p>

        <div style={styles.restaurantsGrid}>
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              style={{
                ...styles.restaurantCard,
                opacity: restaurant.isOpen ? 1 : 0.6,
                cursor: restaurant.isOpen ? 'pointer' : 'not-allowed',
              }}
              onClick={() => restaurant.isOpen && handleSelectRestaurant(restaurant.id)}
              className="restaurant-card"
            >
              {/* Restaurant Logo */}
              <div style={styles.restaurantLogo}>
                <span style={styles.logoEmoji}>{restaurant.logo}</span>
              </div>

              {/* Restaurant Info */}
              <div style={styles.restaurantInfo}>
                <h3 style={styles.restaurantName}>{restaurant.name}</h3>
                <p style={styles.restaurantDescription}>{restaurant.description}</p>

                {/* Categories */}
                <div style={styles.categoriesContainer}>
                  {restaurant.categories.map((cat, index) => (
                    <span key={index} style={styles.categoryTag}>
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Rating and Delivery Time */}
                <div style={styles.restaurantMeta}>
                  <div style={styles.rating}>
                    <span style={styles.starIcon}>⭐</span>
                    <span style={styles.ratingValue}>{restaurant.rating}</span>
                  </div>
                  <div style={styles.deliveryTime}>
                    <span style={styles.clockIcon}>🕐</span>
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              {!restaurant.isOpen && (
                <div style={styles.closedBadge}>
                  Cerrado
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Section */}
      <div style={styles.comingSoon}>
        <h3 style={styles.comingSoonTitle}>🚀 Próximamente</h3>
        <p style={styles.comingSoonText}>
          Más restaurantes se unirán pronto. ¡Mantente atento!
        </p>
      </div>

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
    backgroundColor: colors.ivory,
    paddingBottom: '40px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: colors.ivory,
    color: colors.textSecondary,
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
    padding: '24px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: `0 2px 12px ${colors.shadowGold}`,
    marginBottom: '24px',
    borderBottom: `2px solid ${colors.primaryMuted}`,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: colors.white,
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
    color: colors.textPrimary,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerIcon: {
    fontSize: '32px',
  },
  headerSubtitle: {
    fontSize: '16px',
    color: colors.textSecondary,
    margin: '8px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    gap: '16px',
  },
  ordersButton: {
    padding: '12px 24px',
    backgroundColor: colors.white,
    color: colors.primary,
    border: `2px solid ${colors.primary}`,
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  infoBanner: {
    margin: '0 40px 24px 40px',
    padding: '20px 24px',
    backgroundColor: colors.cream,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    border: `2px solid ${colors.primary}`,
  },
  infoIcon: {
    fontSize: '32px',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: colors.primaryDark,
    margin: '0 0 8px 0',
  },
  infoText: {
    fontSize: '14px',
    color: colors.textSecondary,
    margin: 0,
    lineHeight: '1.5',
  },
  content: {
    padding: '0 40px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: colors.textPrimary,
    margin: '0 0 8px 0',
  },
  sectionSubtitle: {
    fontSize: '16px',
    color: colors.textSecondary,
    margin: '0 0 24px 0',
  },
  restaurantsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  restaurantCard: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    boxShadow: `0 4px 12px ${colors.shadow}`,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    position: 'relative',
    border: `1px solid ${colors.primaryMuted}`,
  },
  restaurantLogo: {
    height: '120px',
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: '64px',
  },
  restaurantInfo: {
    padding: '20px',
  },
  restaurantName: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: colors.textPrimary,
    margin: '0 0 8px 0',
  },
  restaurantDescription: {
    fontSize: '14px',
    color: colors.textSecondary,
    margin: '0 0 12px 0',
    lineHeight: '1.4',
  },
  categoriesContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  categoryTag: {
    padding: '4px 12px',
    backgroundColor: colors.primaryMuted,
    color: colors.primaryDark,
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: `1px solid ${colors.primary}`,
  },
  restaurantMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: `1px solid ${colors.primaryMuted}`,
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  starIcon: {
    fontSize: '16px',
  },
  ratingValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  deliveryTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: colors.textSecondary,
  },
  clockIcon: {
    fontSize: '14px',
  },
  closedBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: colors.white,
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  comingSoon: {
    margin: '40px',
    padding: '32px',
    backgroundColor: colors.white,
    borderRadius: '16px',
    textAlign: 'center',
    border: `2px dashed ${colors.primary}`,
  },
  comingSoonTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: colors.primary,
    margin: '0 0 8px 0',
  },
  comingSoonText: {
    fontSize: '16px',
    color: colors.textSecondary,
    margin: 0,
  },
};

// Add hover effects and animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .restaurant-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px ${colors.shadowGold} !important;
    border-color: ${colors.primary} !important;
  }

  .food-back-btn:hover {
    background-color: ${colors.primary} !important;
    color: ${colors.white} !important;
  }

  .food-orders-btn:hover {
    background-color: ${colors.primary} !important;
    color: ${colors.white} !important;
    transform: scale(1.02);
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (!document.head.querySelector('[data-food-page-styles]')) {
  styleSheet.setAttribute('data-food-page-styles', 'true');
  document.head.appendChild(styleSheet);
}
