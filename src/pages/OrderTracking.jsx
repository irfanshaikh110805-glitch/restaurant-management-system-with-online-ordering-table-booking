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
      const { data: initialOrder, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, menu_items(name, image_url)),
          delivery_addresses(*)
        `)
        .eq('id', orderId)
        .single();

      let orderData = initialOrder;

      if (orderError) {
        // Fallback query if nested join fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single();
        if (fallbackError) throw fallbackError;
        orderData = fallbackData;
      }

      // Guard: only redirect if order belongs to a different logged-in user
      if (user && orderData.user_id && orderData.user_id !== user.id) {
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
        .maybeSingle();

      setTracking(trackingData);

      // Fetch driver info if assigned
      if (trackingData?.driver_id) {
        const { data: driverData } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', trackingData.driver_id)
          .maybeSingle();

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

  const subtotalVal = Number(order.subtotal || order.total || 0);
  const taxVal = Number(order.tax_amount || 0);
  const deliveryVal = Number(order.delivery_fee || 0);
  const discountVal = Number(order.discount_amount || 0);
  const totalVal = Number(order.total ?? order.total_amount ?? (subtotalVal + taxVal + deliveryVal - discountVal));

  return (
    <div className="order-tracking-page">
      <div className="container">
        {/* Header */}
        <div className="tracking-header">
          <div className="header-content">
            <h1>Track Your Order</h1>
            <p className="order-id">Order #{order.id?.slice(0, 8)}</p>
            <div className="order-meta">
              <span className="order-date">
                <FiClock /> {new Date(order.created_at).toLocaleString()}
              </span>
              <span className={`status-badge ${order.status}`}>
                {order.status?.toUpperCase()}
              </span>
            </div>
          </div>
          {tracking?.estimated_delivery_time && (
            <div className="eta-card">
              <div className="eta-label">Estimated Delivery</div>
              <div className="eta-time">{getEstimatedTime()}</div>
            </div>
          )}
        </div>

        {/* Status Tracker */}
        <div className="tracker-card">
          <div className="progress-steps">
            {getStatusSteps().map((step, index) => (
              <div 
                key={step.key} 
                className={`progress-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}
              >
                <div className="step-marker">
                  <div className="step-icon">{step.icon}</div>
                  {index < getStatusSteps().length - 1 && (
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
                  src={item.menu_items?.image_url || item.image_url || '/placeholder.jpg'} 
                  alt={item.menu_items?.name || item.name || 'Dish'}
                  className="item-image"
                />
                <div className="item-info">
                  <div className="item-name">{item.menu_items?.name || item.name || 'Dish Item'}</div>
                  <div className="item-quantity">Qty: {item.quantity}</div>
                </div>
                <div className="item-price">₹{Number(item.price * (item.quantity || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotalVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {deliveryVal > 0 && (
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>₹{deliveryVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Tax (5% GST)</span>
              <span>₹{taxVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {discountVal > 0 && (
              <div className="summary-row success">
                <span>Discount</span>
                <span>-₹{discountVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total Amount</span>
              <strong className="tracking-total-accent">
                ₹{totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
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
