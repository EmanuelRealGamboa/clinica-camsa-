import React, { useState, useEffect } from 'react';
import { ordersApi } from '../../api/orders';
import { useWindowSize } from '../../utils/responsive';
import { colors } from '../../styles/colors';

interface CompleteSurveyModalProps {
  patientAssignmentId: number;
  deviceUid: string;
  onComplete: () => void;
}

interface Order {
  id: number;
  status: string;
  items: Array<{
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    unit_label: string;
  }>;
}

const CompleteSurveyModal: React.FC<CompleteSurveyModalProps> = ({
  patientAssignmentId,
  deviceUid,
  onComplete,
}) => {
  const { isMobile } = useWindowSize();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productRatings, setProductRatings] = useState<{
    [orderId: string]: { [productId: string]: number };
  }>({});
  const [staffRating, setStaffRating] = useState<number>(0);
  const [stayRating, setStayRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [deviceUid]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Get active orders and filter delivered ones
      if (deviceUid) {
        const ordersResponse = await ordersApi.getActiveOrdersPublic(deviceUid);
        const deliveredOrders = (ordersResponse.orders || []).filter(
          (order: Order) => order.status === 'DELIVERED'
        );
        setOrders(deliveredOrders);
        
        // Initialize product ratings
        const initialRatings: { [orderId: string]: { [productId: string]: number } } = {};
        deliveredOrders.forEach((order: Order) => {
          initialRatings[order.id.toString()] = {};
          order.items.forEach((item) => {
            initialRatings[order.id.toString()][item.product_id.toString()] = 0;
          });
        });
        setProductRatings(initialRatings);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductRating = (orderId: number, productId: number, rating: number) => {
    setProductRatings((prev) => ({
      ...prev,
      [orderId.toString()]: {
        ...prev[orderId.toString()],
        [productId.toString()]: rating,
      },
    }));
  };

  const handleSubmit = async () => {
    // Validate all product ratings are set (at least 0)
    for (const order of orders) {
      for (const item of order.items) {
        const rating = productRatings[order.id.toString()]?.[item.product_id.toString()];
        if (rating === undefined || rating === null) {
          alert('Por favor califica todos los productos');
          return;
        }
      }
    }

    if (staffRating === 0) {
      alert('Por favor califica la interacción con el personal');
      return;
    }

    if (stayRating === 0) {
      alert('Por favor califica tu estancia');
      return;
    }

    try {
      setSubmitting(true);
      await ordersApi.submitCompleteFeedback({
        patient_assignment_id: patientAssignmentId,
        product_ratings: productRatings,
        staff_rating: staffRating,
        stay_rating: stayRating,
        comment: comment || undefined,
      });
      onComplete();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error.response?.data?.error || 'Error al enviar la encuesta. Por favor intenta de nuevo.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating: React.FC<{
    value: number;
    onChange: (value: number) => void;
    label: string;
  }> = ({ value, onChange, label }) => (
    <div style={styles.starRatingContainer}>
      <label style={styles.starRatingLabel}>{label}</label>
      <div style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            style={{
              ...styles.starButton,
              color: star <= value ? colors.primary : colors.gray,
            }}
            onClick={() => onChange(star)}
            onMouseEnter={(e) => {
              if (star <= value) {
                e.currentTarget.style.color = colors.primaryDark;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = star <= value ? colors.primary : colors.gray;
            }}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <p>Cargando encuesta...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <p>No hay órdenes entregadas para calificar.</p>
          <button onClick={onComplete}>Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modal, ...(isMobile && responsiveStyles.modal) }}>
        <h2 style={{ ...styles.title, ...(isMobile && responsiveStyles.title) }}>
          Encuesta de Satisfacción
        </h2>

        {/* Section 1: Product Ratings */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>1. Califica los productos que ordenaste</h3>
          {orders.map((order) => (
            <div key={order.id} style={styles.orderSection}>
              <h4 style={styles.orderTitle}>Orden #{order.id}</h4>
              {order.items.map((item) => (
                <div key={item.id} style={styles.productItem}>
                  <div style={styles.productInfo}>
                    <span style={styles.productName}>{item.product_name}</span>
                    <span style={styles.productQuantity}>
                      {item.quantity} {item.unit_label}
                    </span>
                  </div>
                  <StarRating
                    value={productRatings[order.id.toString()]?.[item.product_id.toString()] || 0}
                    onChange={(rating) => handleProductRating(order.id, item.product_id, rating)}
                    label=""
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Section 2: Staff Rating */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>2. Califica la interacción con el personal</h3>
          <StarRating value={staffRating} onChange={setStaffRating} label="" />
        </div>

        {/* Section 3: Stay Rating */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>3. Califica tu estancia en el lugar</h3>
          <StarRating value={stayRating} onChange={setStayRating} label="" />
        </div>

        {/* Optional Comment */}
        <div style={styles.section}>
          <label style={styles.commentLabel}>Comentario (opcional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={styles.commentInput}
            placeholder="Comparte tus comentarios..."
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            ...styles.submitButton,
            ...(isMobile && responsiveStyles.submitButton),
            opacity: submitting ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!submitting) {
              e.currentTarget.style.backgroundColor = colors.primaryDark;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary;
          }}
        >
          {submitting ? 'Enviando...' : 'Enviar Encuesta'}
        </button>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: colors.shadowGold,
    border: `1px solid ${colors.primaryMuted}`,
  },
  title: {
    fontSize: '28px',
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: '30px',
    textAlign: 'center',
  },
  section: {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: `1px solid ${colors.primaryMuted}`,
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: '20px',
  },
  orderSection: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: colors.cream,
    borderRadius: '8px',
  },
  orderTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: colors.primaryDark,
    marginBottom: '15px',
  },
  productItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: colors.white,
    borderRadius: '8px',
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  productName: {
    fontSize: '16px',
    fontWeight: 600,
    color: colors.textPrimary,
  },
  productQuantity: {
    fontSize: '14px',
    color: colors.textSecondary,
  },
  starRatingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  starRatingLabel: {
    fontSize: '14px',
    color: colors.textSecondary,
  },
  starContainer: {
    display: 'flex',
    gap: '5px',
  },
  starButton: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    padding: 0,
    transition: 'color 0.2s',
  },
  commentLabel: {
    display: 'block',
    fontSize: '16px',
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: '10px',
  },
  commentInput: {
    width: '100%',
    padding: '12px',
    border: `1px solid ${colors.primaryMuted}`,
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'border-color 0.2s',
  },
  submitButton: {
    width: '100%',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '20px',
  },
};

const responsiveStyles: { [key: string]: React.CSSProperties } = {
  modal: {
    padding: '20px',
    maxHeight: '95vh',
  },
  title: {
    fontSize: '24px',
  },
  submitButton: {
    padding: '14px 24px',
    fontSize: '16px',
  },
};

export default CompleteSurveyModal;
