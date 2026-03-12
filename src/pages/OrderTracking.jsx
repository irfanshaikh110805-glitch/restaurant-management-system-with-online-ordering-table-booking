import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  FiPackage, 
  FiCheckCircle, 
  FiTruck, 
  FiMapPin, 
  FiPhone,
  FiClock,
  FiDollarSign,
  FiMessageSquare
} from 'react-icons/fi';
import './OrderTracking.css';

const OrderTracking = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      // Set up real-time subscription
      const subscription = supabase
        .channel(`order-${orderId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'delivery_tracking',
          filter: `order_id=eq.${orderId}`
        }, handleTrackingUpdate)
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch order with items
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*,  menu_items(name, image_url)),
          delivery_addresses(*)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Guard: if not logged in or order belongs to another user, redirect safely
      if (!user || orderData.user_id !== user.id) {
        navigate('/profile');
        return;
      }

      setOrder(orderData);

      // Fetch tracking info
      const { data: trackingData } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', orderId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      setTracking(trackingData);

      // Fetch driver info if assigned
      if (trackingData?.driver_id) {
        const { data: driverData } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', trackingData.driver_id)
          .single();

        setDriver(driverData);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackingUpdate = (payload) => {
    setTracking(payload.new);
  };

  const getStatusSteps = () => {
    const statuses = [
      { key: 'confirmed', label: 'Order Confirmed', icon: <FiCheckCircle /> },
      { key: 'preparing', label: 'Preparing', icon: <FiPackage /> },
      { key: 'ready', label: 'Ready for Pickup', icon: <FiCheckCircle /> },
      { key: 'picked_up', label: 'Out for Delivery', icon: <FiTruck /> },
      { key: 'delivered', label: 'Delivered', icon: <FiCheckCircle /> }
    ];

    const currentIndex = statuses.findIndex(s => s.key === tracking?.delivery_status);
    
    return statuses.map((status, index) => ({
      ...status,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  const getEstimatedTime = () => {
    if (!tracking) return 'Calculating...';
    
    const eta = new Date(tracking.estimated_delivery_time);
    const now = new Date();
    const diff = eta - now;
    
    if (diff <= 0) return 'Arriving soon!';
    
    const minutes = Math.floor(diff / 60000);
    return `${minutes} mins`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container">
        <div className="error-state">
          <h2>Order Not Found</h2>
          <button onClick={() => navigate('/profile')} className="btn-primary">
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const steps = getStatusSteps();

  return (
    <div className="order-tracking-page">
      <div className="container">
        <div className="tracking-header">
          <h1>Track Your Order</h1>
          <div className="order-id">Order #{order.id.slice(0, 8).toUpperCase()}</div>
        </div>

        {/* ETA Banner */}
        {tracking?.delivery_status !== 'delivered' && (
          <div className="eta-banner">
            <FiClock className="eta-icon" />
            <div className="eta-content">
              <div className="eta-label">Estimated Delivery</div>
              <div className="eta-time">{getEstimatedTime()}</div>
            </div>
          </div>
        )}

        {/* Tracking Progress */}
        <div className="tracking-progress">
          <div className="progress-steps">
            {steps.map((step, index) => (
              <div key={step.key} className={`progress-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}>
                <div className="step-marker">
                  <div className="step-icon">{step.icon}</div>
                  {index < steps.length - 1 && (
                    <div className={`step-line ${step.completed ? 'completed' : ''}`} />
                  )}
                </div>
                <div className="step-label">{step.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Driver Info */}
        {driver && tracking?.delivery_status !== 'delivered' && (
          <div className="driver-card">
            <div className="driver-info">
              <div className="driver-avatar">
                {driver.full_name?.charAt(0)}
              </div>
              <div className="driver-details">
                <h3>{driver.full_name}</h3>
                <p>Your Delivery Partner</p>
              </div>
            </div>
            <div className="driver-actions">
              <a href={`tel:${driver.phone}`} className="btn-secondary">
                <FiPhone /> Call
              </a>
              {/* Bug fix: message button now opens SMS app on mobile */}
              <a
                href={`sms:${driver.phone}`}
                className="btn-secondary"
              >
                <FiMessageSquare /> Message
              </a>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="order-details-card">
          <h2>Order Details</h2>
          
          <div className="order-items">
            {order.order_items?.map(item => (
              <div key={item.id} className="order-item">
                <img 
                  src={item.menu_items?.image_url || '/placeholder.jpg'} 
                  alt={item.menu_items?.name}
                  className="item-image"
                />
                <div className="item-info">
                  <div className="item-name">{item.menu_items?.name}</div>
                  <div className="item-quantity">Qty: {item.quantity}</div>
                </div>
                <div className="item-price">₹{item.price}</div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>₹{order.delivery_fee || 0}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>₹{order.tax_amount || 0}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="summary-row success">
                <span>Discount</span>
                <span>-₹{order.discount_amount}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{order.total_amount}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {order.delivery_addresses && (
          <div className="delivery-address-card">
            <h3><FiMapPin /> Delivery Address</h3>
            <div className="address-content">
              <div className="address-label">{order.delivery_addresses.label}</div>
              <p>{order.delivery_addresses.address_line1}</p>
              {order.delivery_addresses.address_line2 && (
                <p>{order.delivery_addresses.address_line2}</p>
              )}
              {order.delivery_addresses.landmark && (
                <p className="landmark">Landmark: {order.delivery_addresses.landmark}</p>
              )}
              <p>
                {order.delivery_addresses.city}, {order.delivery_addresses.state} - {order.delivery_addresses.pincode}
              </p>
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="payment-info-card">
          <h3><FiDollarSign /> Payment Information</h3>
          <div className="payment-details">
            <div className="payment-method">
              <span>Method:</span>
              <span className="method-value">{order.payment_method?.toUpperCase() || 'COD'}</span>
            </div>
            <div className="payment-status">
              <span>Status:</span>
              <span className={`status-badge ${order.payment_status}`}>
                {order.payment_status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Instructions */}
        {tracking?.delivery_notes && (
          <div className="delivery-notes-card">
            <h3>Delivery Instructions</h3>
            <p>{tracking.delivery_notes}</p>
          </div>
        )}

        {/* Help Section */}
        <div className="help-section">
          <h3>Need Help?</h3>
          <div className="help-actions">
            <a href="tel:+911234567890" className="help-btn">
              <FiPhone /> Contact Support
            </a>
            <a
              href="https://wa.me/911234567890?text=Hi%2C%20I%20need%20help%20with%20my%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="help-btn"
            >
              <FiMessageSquare /> Chat with Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
