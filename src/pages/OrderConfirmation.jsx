import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiCheckCircle, FiClock, FiCreditCard, FiAlertCircle, FiShoppingBag, FiUser, FiArrowRight } from 'react-icons/fi'
import { format } from 'date-fns'

import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { initiateRazorpayPayment } from '../utils/paymentGateway'
import { useAuth } from '../context/AuthContext'
import './OrderConfirmation.css'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentProcessing, setPaymentProcessing] = useState(false)

  useEffect(() => {
    fetchOrder()
    
    // Subscribe to real-time order updates
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, (payload) => {
        setOrder(prev => ({ ...prev, ...payload.new }))
        if (payload.new.status !== payload.old.status) {
          toast.success(`Order status updated: ${payload.new.status}`)
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, menu_items!order_items_menu_item_id_fkey(name, price))')
        .eq('id', orderId)
        .single()

      if (error) throw error
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayNow = async () => {
    if (!order) return
    
    setPaymentProcessing(true)
    try {
      const paymentResult = await initiateRazorpayPayment({
        amount: order.total,
        orderId: order.id,
        razorpayOrderId: order.razorpay_order_id,
        customerName: order.customer_name || user?.email,
        email: user?.email,
        phone: order.phone
      })

      if (paymentResult.success) {
        // Update order payment status
        await supabase
          .from('orders')
          .update({ 
            payment_status: 'completed',
            status: 'confirmed'
          })
          .eq('id', order.id)

        // Create payment record
        await supabase.from('payments').insert({
          order_id: order.id,
          amount: order.total,
          payment_method: 'razorpay',
          transaction_id: paymentResult.paymentId,
          status: 'completed'
        })

        toast.success('Payment successful!')
        fetchOrder() // Refresh order data
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.message || 'Payment failed. Please try again.')
    } finally {
      setPaymentProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="confirmation-loading-wrap">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="confirmation-page">
        <div className="container">
          <div className="confirmation-error-card">
            <FiAlertCircle size={48} className="error-icon" />
            <h2>Order Not Found</h2>
            <p>We couldn't locate the requested order details.</p>
            <Link to="/" className="btn-confirm-action primary">
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="confirmation-page">
      <div className="container">
        <div className="confirmation-content">
          {/* Top Success Badge */}
          <div className="confirmation-hero">
            <div className="success-icon-wrap">
              <FiCheckCircle className="success-icon-svg" />
            </div>

            <h1 className="confirmation-title">Order Received!</h1>
            <p className="confirmation-subtitle">
              {order.payment_status === 'completed' 
                ? 'Thank you for dining with Hotel Everest. Your payment is confirmed and the kitchen is preparing your order.'
                : 'Thank you for your order. Please complete payment to confirm your culinary experience.'}
            </p>
          </div>

          {/* Payment Status Alert Banner */}
          {order.payment_status === 'pending' && (
            <div className="payment-alert alert-pending">
              <FiAlertCircle size={22} className="alert-icon" />
              <div className="alert-text-group">
                <strong>Payment Pending</strong>
                <p>Complete your payment online or choose pay-at-counter upon collection.</p>
              </div>
            </div>
          )}

          {order.payment_status === 'completed' && (
            <div className="payment-alert alert-success">
              <FiCheckCircle size={22} className="alert-icon" />
              <div className="alert-text-group">
                <strong>Payment Successful</strong>
                <p>Transaction verified. Receipt sent to your account.</p>
              </div>
            </div>
          )}

          {/* Main Order Details Card */}
          <div className="order-details-card">
            <div className="card-top-header">
              <h3>Order Summary</h3>
              <span className="order-code-badge">#{order.id.substring(0, 8).toUpperCase()}</span>
            </div>
            
            <div className="detail-rows-container">
              <div className="detail-row">
                <span className="detail-label">Order Date & Time</span>
                <span className="detail-value">
                  {format(new Date(order.created_at), 'MMM d, yyyy • h:mm a')}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Order Status</span>
                <span className={`confirm-status-pill status-${order.status}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Payment Status</span>
                <span className={`confirm-payment-pill payment-${order.payment_status === 'completed' ? 'paid' : 'pending'}`}>
                  {order.payment_status === 'completed' ? 'PAID' : 'PENDING'}
                </span>
              </div>

              {order.customer_name && (
                <div className="detail-row">
                  <span className="detail-label">Customer Name</span>
                  <span className="detail-value font-bold">{order.customer_name}</span>
                </div>
              )}

              {order.phone && (
                <div className="detail-row">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">{order.phone}</span>
                </div>
              )}

              {order.table_number && (
                <div className="detail-row">
                  <span className="detail-label">Table Number</span>
                  <span className="detail-value">Table #{order.table_number}</span>
                </div>
              )}

              {order.delivery_address && (
                <div className="detail-row">
                  <span className="detail-label">Delivery Address</span>
                  <span className="detail-value">{order.delivery_address}</span>
                </div>
              )}
            </div>

            {/* Items Ordered Receipt List */}
            <div className="order-items-section">
              <h4 className="items-section-title">Items Ordered ({order.order_items?.length || 0})</h4>
              <div className="items-receipt-list">
                {order.order_items?.map(item => (
                  <div key={item.id} className="confirmation-item-row">
                    <div className="item-left-group">
                      <span className="item-qty-badge">{item.quantity}x</span>
                      <span className="item-name-label">{item.menu_items?.name || 'Menu Item'}</span>
                    </div>
                    <span className="item-price-val">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Section */}
            <div className="order-total-section">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{Number(order.subtotal || order.total || 0).toLocaleString('en-IN')}</span>
              </div>
              {order.tax_amount && (
                <div className="total-row">
                  <span>GST / Taxes</span>
                  <span>₹{Number(order.tax_amount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="total-row final-total">
                <strong>Grand Total</strong>
                <strong className="total-accent">₹{Number(order.total || 0).toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {/* Visit / Collection Banner */}
          <div className="estimated-time-card">
            <div className="time-icon-wrap">
              <FiClock size={24} />
            </div>
            <div className="time-text-wrap">
              <h4>Ready for Collection / Table Service</h4>
              <p>Please show your Order ID at the counter or to your steward.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="confirmation-actions-grid">
            {order.payment_status === 'pending' && order.payment_method !== 'pay-at-restaurant' && (
              <button 
                onClick={handlePayNow} 
                className="btn-confirm-action primary pay-now-btn"
                disabled={paymentProcessing}
                type="button"
              >
                {paymentProcessing ? (
                  <div className="spinner-sm"></div>
                ) : (
                  <>
                    <FiCreditCard size={18} />
                    <span>Pay Now ₹{order.total}</span>
                  </>
                )}
              </button>
            )}

            <Link to={`/order-tracking/${orderId}`} className="btn-confirm-action primary">
              <span>Track Live Order</span>
              <FiArrowRight size={16} />
            </Link>

            <Link to="/menu" className="btn-confirm-action secondary">
              <FiShoppingBag size={16} />
              <span>Order More Dishes</span>
            </Link>

            <Link to="/profile" className="btn-confirm-action secondary">
              <FiUser size={16} />
              <span>My Orders</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
