import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiMapPin, FiCreditCard } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { createOrder } from '../utils/backendHelpers'
import { sanitizeString, sanitizePhone } from '../utils/inputSanitizer'
import { pageTransition, fadeInUp, staggerContainer, scaleIn } from '../utils/animations'
import { initiateRazorpayPayment } from '../utils/paymentGateway'
import './Cart.css'

export default function Cart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [instructions, setInstructions] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('pay-at-restaurant')
  const [checkoutExpanded, setCheckoutExpanded] = useState(true) // Start expanded on mobile

  const subtotal = total
  const taxAmount = subtotal * 0.05 // 5% tax
  const finalTotal = subtotal + taxAmount

  const handleCheckout = async (e) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error('Cart is empty')
      return
    }

    // Sanitize and validate inputs
    const sanitizedName = sanitizeString(customerName, { maxLength: 100 });
    const sanitizedPhone = sanitizePhone(phone);
    const sanitizedTableNumber = sanitizeString(tableNumber, { maxLength: 20 });
    const sanitizedInstructions = sanitizeString(instructions, { maxLength: 500 });

    if (!sanitizedName || sanitizedName.length < 2) {
      toast.error('Please enter a valid name (at least 2 characters)')
      return
    }

    if (!sanitizedPhone) {
      toast.error('Please enter a valid phone number')
      return
    }

    const orderItems = items.map(item => ({
      id: String(item.id),
      name: String(item.name),
      price: Number(item.price),
      quantity: Number(item.quantity)
    }))

    setLoading(true)

    try {
      // Create order for dine-in/takeout
      const orderData = {
        userId: user?.id || null,
        customerName: sanitizedName,
        items: orderItems,
        total: finalTotal,
        subtotal: subtotal,
        taxAmount: taxAmount,
        phone: sanitizedPhone,
        tableNumber: sanitizedTableNumber || null,
        orderType: 'dine-in',
        instructions: sanitizedInstructions,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'online' ? 'pending' : 'pending'
      }

      const result = await createOrder(orderData, user?.id)

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create order')
      }

      // Handle online payment
      if (paymentMethod === 'online') {
        try {
          const paymentResult = await initiateRazorpayPayment({
            amount: finalTotal,
            orderId: result.order.id,
            razorpayOrderId: result.order.razorpay_order_id,
            customerName: sanitizedName,
            email: user?.email,
            phone: sanitizedPhone
          })

          if (paymentResult.success) {
            // Update order payment status
            await supabase
              .from('orders')
              .update({ 
                payment_status: 'completed',
                status: 'confirmed'
              })
              .eq('id', result.order.id)

            // Create payment record
            await supabase.from('payments').insert({
              order_id: result.order.id,
              amount: finalTotal,
              payment_method: 'razorpay',
              transaction_id: paymentResult.paymentId,
              status: 'completed'
            })

            toast.success('Payment successful! Order confirmed.')
          }
        } catch (paymentError) {
          console.error('Payment error:', paymentError)
          toast.error('Payment failed. You can pay at the restaurant.')
          // Order is still created, just payment failed
        }
      }

      // Create notification if user is logged in
      if (user) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          notification_type: 'order',
          title: 'Order Received',
          message: `Your order #${result.order.id.substring(0, 8)} has been received. Please visit the restaurant to complete payment.`,
          reference_id: result.order.id
        })
      }

      clearCart()
      toast.success('Order placed! Please visit the restaurant to pay.')
      navigate(`/order-confirmation/${result.order.id}`)
    } catch (error) {
      console.error('Checkout error:', error)
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        toast.error(error.message)
      } else if (error.code === 'VALIDATION_FAILED') {
        toast.error('Please check your order details')
      } else {
        toast.error(error.message || 'Failed to place order. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <motion.div 
        className="empty-cart"
        initial="initial"
        animate="animate"
        variants={pageTransition}
      >
        <div className="container">
          <motion.div 
            className="empty-cart-content"
            variants={scaleIn}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FiShoppingBag size={80} className="empty-icon" />
            </motion.div>
            <h2>Your Cart is Empty</h2>
            <p>Add some delicious items to your cart!</p>
            <motion.button 
              onClick={() => navigate('/menu')} 
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Browse Menu</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="cart-page"
      initial="initial"
      animate="animate"
      variants={pageTransition}
    >
      <div className="container">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Cart
        </motion.h1>

        <div className="cart-layout">
          {/* Cart Items */}
          <motion.div 
            className="cart-items"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  className="cart-item card"
                  variants={fadeInUp}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.01 }}
                >
                  {item.image_url && (
                    <motion.img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="cart-item-image"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p className="text-secondary">{item.description}</p>
                    <span className="cart-item-price">₹{item.price}</span>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <motion.button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="quantity-btn"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiMinus size={16} />
                      </motion.button>
                      <motion.span 
                        className="quantity"
                        key={item.quantity}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {item.quantity}
                      </motion.span>
                      <motion.button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="quantity-btn"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiPlus size={16} />
                      </motion.button>
                    </div>
                    <motion.button
                      onClick={() => removeItem(item.id)}
                      className="remove-btn"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiTrash2 size={18} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Checkout Form */}
          <div 
            className={`checkout-section ${checkoutExpanded ? '' : 'collapsed'}`}
            style={{ opacity: 1, transform: 'translateX(0)' }}
          >
            <div className="card">
              <h2 onClick={(e) => {
                // Only toggle if clicking the header itself, not form elements
                if (e.target === e.currentTarget || e.target.tagName === 'SPAN') {
                  setCheckoutExpanded(!checkoutExpanded)
                }
              }}>
                <span>
                  {checkoutExpanded ? 'Order Details' : `Tap to checkout • Total: ₹${finalTotal.toFixed(2)}`}
                </span>
              </h2>
              <form onSubmit={handleCheckout} onClick={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto' }}>
                <div className="form-fields-grid">
                  <div className="form-group" style={{ pointerEvents: 'auto' }}>
                    <label className="form-label" style={{ pointerEvents: 'none' }}>Your Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Enter your name"
                      required
                      aria-label="Your name"
                      autoComplete="name"
                    />
                  </div>
                  
                  <div className="form-group" style={{ pointerEvents: 'auto' }}>
                    <label className="form-label" style={{ pointerEvents: 'none' }}>Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="+91 98765 43210"
                      required
                      aria-label="Phone number"
                      autoComplete="tel"
                    />
                  </div>

                  <div className="form-group" style={{ pointerEvents: 'auto' }}>
                    <label className="form-label" style={{ pointerEvents: 'none' }}>Table Number (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="e.g., Table 5"
                      aria-label="Table number"
                      autoComplete="off"
                    />
                  </div>

                  <div className="form-group" style={{ pointerEvents: 'auto' }}>
                    <label className="form-label" style={{ pointerEvents: 'none' }}>Special Requests (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="e.g., Less spicy"
                      aria-label="Special instructions"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>

                  <div className="payment-methods-grid">
                    <label className="payment-method-card active">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pay-at-restaurant"
                        checked={true}
                        onChange={() => setPaymentMethod('pay-at-restaurant')}
                        className="payment-radio-input"
                        aria-label="Pay at restaurant"
                      />
                      <div className="payment-method-body">
                        <FiMapPin size={18} className="payment-icon" />
                        <div className="payment-text-wrap">
                          <div className="payment-header-row">
                            <span className="payment-title">Pay at Restaurant</span>
                            <span className="payment-active-badge">Active</span>
                          </div>
                          <span className="payment-desc">Pay cash or UPI upon dining / collection</span>
                        </div>
                      </div>
                    </label>

                    <div 
                      className="payment-method-card disabled-card"
                      onClick={() => toast('Online payment gateway is temporarily under maintenance. Please use Pay at Restaurant.', {
                        icon: '💳',
                        duration: 4000,
                        style: {
                          borderRadius: '16px',
                          background: '#1C1917',
                          color: '#FAF7F2',
                          border: '1px solid rgba(223, 191, 119, 0.4)',
                          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.4)'
                        }
                      })}
                      role="button"
                      tabIndex={0}
                      aria-label="Pay online not available"
                    >
                      <div className="payment-method-body">
                        <FiCreditCard size={18} className="payment-icon text-muted" />
                        <div className="payment-text-wrap">
                          <div className="payment-header-row">
                            <span className="payment-title text-muted">Pay Online</span>
                            <span className="payment-unavailable-badge">Not Available Still</span>
                          </div>
                          <span className="payment-desc">Online gateway currently unavailable</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div 
                  className="order-summary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="summary-title">Order Summary</h3>
                  <div className="summary-row">
                    <span className="summary-label">Subtotal</span>
                    <motion.span
                      key={subtotal}
                      className="summary-value"
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                    >
                      ₹{subtotal.toFixed(2)}
                    </motion.span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Tax (5% GST)</span>
                    <span className="summary-value">₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span className="summary-label">Grand Total</span>
                    <motion.span
                      key={finalTotal}
                      className="summary-value total-val"
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                    >
                      ₹{finalTotal.toFixed(2)}
                    </motion.span>
                  </div>
                  {paymentMethod === 'pay-at-restaurant' ? (
                    <div className="payment-note-pill">
                      <FiMapPin size={14} className="note-icon" />
                      <span>Pay at restaurant when you visit</span>
                    </div>
                  ) : (
                    <div className="payment-note-pill">
                      <FiCreditCard size={14} className="note-icon" />
                      <span>Instant confirmation via Razorpay</span>
                    </div>
                  )}
                </motion.div>

                <motion.button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={loading ? 'Placing order...' : 'Place order'}
                >
                  {loading ? <div className="spinner" style={{ width: 20, height: 20 }}></div> : <span>Place Order • ₹{finalTotal.toFixed(2)}</span>}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
