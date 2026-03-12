import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiMapPin } from 'react-icons/fi'
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
        toast.error('Failed to place order. Please try again.')
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
          <motion.div 
            className="checkout-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="card">
              <h2>Order Details</h2>
              <form onSubmit={handleCheckout}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Table Number (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="e.g., Table 5"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Special Instructions (Optional)</label>
                  <textarea
                    className="form-control"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Any special requests?"
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <div className="payment-methods">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pay-at-restaurant"
                        checked={paymentMethod === 'pay-at-restaurant'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span>Pay at Restaurant</span>
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={paymentMethod === 'online'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span>Pay Online (Razorpay)</span>
                    </label>
                  </div>
                </div>

                <motion.div 
                  className="order-summary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3>Order Summary</h3>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <motion.span
                      key={subtotal}
                      initial={{ scale: 1.2, color: 'var(--primary)' }}
                      animate={{ scale: 1, color: 'var(--text-primary)' }}
                    >
                      ₹{subtotal.toFixed(2)}
                    </motion.span>
                  </div>
                  <div className="summary-row">
                    <span>Tax (5%)</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <motion.span
                      key={finalTotal}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                    >
                      ₹{finalTotal.toFixed(2)}
                    </motion.span>
                  </div>
                  {paymentMethod === 'pay-at-restaurant' ? (
                    <p className="payment-note">
                      <FiMapPin size={16} style={{ marginRight: '8px' }} />
                      Pay at restaurant when you visit
                    </p>
                  ) : (
                    <p className="payment-note">
                      You will be redirected to secure payment gateway
                    </p>
                  )}
                </motion.div>

                <motion.button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? <div className="spinner" style={{ width: 20, height: 20 }}></div> : <span>Place Order</span>}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
