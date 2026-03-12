import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiCheckCircle, FiClock, FiCreditCard, FiAlertCircle } from 'react-icons/fi'
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
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="confirmation-page">
        <div className="container">
          <div className="error-state">
            <p>Order not found</p>
            <Link to="/" className="btn btn-primary">
              <span>Go Home</span>
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
          <div className="success-icon">
            <FiCheckCircle size={80} />
          </div>

          <h1>Order Received!</h1>
          <p className="text-secondary">
            {order.payment_status === 'completed' 
              ? 'Thank you for your order! Your payment has been received.'
              : 'Thank you for your order. Please complete payment to confirm your order.'}
          </p>

          {/* Payment Status Alert */}
          {order.payment_status === 'pending' && (
            <div className="payment-alert alert-warning">
              <FiAlertCircle size={20} />
              <div>
                <strong>Payment Pending</strong>
                <p>Complete your payment to confirm the order</p>
              </div>
            </div>
          )}

          {order.payment_status === 'completed' && (
            <div className="payment-alert alert-success">
              <FiCheckCircle size={20} />
              <div>
                <strong>Payment Successful</strong>
                <p>Your order has been confirmed</p>
              </div>
            </div>
          )}

          <div className="order-details card">
            <h3>Order Details</h3>
            
            <div className="detail-row">
              <span className="detail-label">Order ID:</span>
              <span className="detail-value">#{order.id.substring(0, 8)}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Order Date:</span>
              <span className="detail-value">
                {format(new Date(order.created_at), 'MMM d, yyyy • h:mm a')}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className="badge badge-success">{order.status}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Payment Status:</span>
              <span className="badge badge-warning">{order.payment_status || 'Pending'}</span>
            </div>

            {order.customer_name && (
              <div className="detail-row">
                <span className="detail-label">Customer Name:</span>
                <span className="detail-value">{order.customer_name}</span>
              </div>
            )}

            {order.phone && (
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{order.phone}</span>
              </div>
            )}

            {order.table_number && (
              <div className="detail-row">
                <span className="detail-label">Table Number:</span>
                <span className="detail-value">{order.table_number}</span>
              </div>
            )}

            <div className="order-items-section">
              <h4>Items Ordered</h4>
              {order.order_items.map(item => (
                <div key={item.id} className="confirmation-item">
                  <span>{item.quantity}x {item.menu_items.name}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="order-total-section">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{order.subtotal || order.total}</span>
              </div>
              {order.tax_amount && (
                <div className="total-row">
                  <span>Tax</span>
                  <span>₹{order.tax_amount}</span>
                </div>
              )}
              <div className="total-row final-total">
                <strong>Total</strong>
                <strong>₹{order.total}</strong>
              </div>
            </div>
          </div>

          <div className="estimated-time card">
            <FiClock className="time-icon" />
            <div>
              <h4>Visit Restaurant</h4>
              <p>Please visit us to complete payment and collect your order</p>
            </div>
          </div>

          <div className="action-buttons">
            {order.payment_status === 'pending' && order.payment_method !== 'pay-at-restaurant' && (
              <button 
                onClick={handlePayNow} 
                className="btn btn-primary"
                disabled={paymentProcessing}
              >
                {paymentProcessing ? (
                  <div className="spinner" style={{ width: 20, height: 20 }}></div>
                ) : (
                  <>
                    <FiCreditCard size={18} />
                    <span>Pay Now</span>
                  </>
                )}
              </button>
            )}
            <Link to={`/order-tracking/${orderId}`} className="btn btn-secondary">
              <span>Track Order</span>
            </Link>
            <Link to="/menu" className="btn btn-secondary">
              <span>Order More</span>
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              <span>View All Orders</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
