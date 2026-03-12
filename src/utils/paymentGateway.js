// Payment Gateway Integration (Razorpay)
// Install: npm install razorpay (for backend) or use Razorpay Checkout for frontend

/**
 * Initialize Razorpay payment
 * @param {Object} orderData - Order details
 * @returns {Promise} Payment result
 */
export const initiateRazorpayPayment = (orderData) => {
  return new Promise((resolve, reject) => {
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      reject(new Error('Razorpay SDK not loaded. Please add the script to index.html'))
      return
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Add to .env
      amount: Math.round(orderData.amount * 100), // Amount in paise
      currency: 'INR',
      name: 'Restaurant Name',
      description: `Order #${orderData.orderId?.substring(0, 8)}`,
      order_id: orderData.razorpayOrderId, // Generated from backend
      handler: function (response) {
        // Payment successful
        resolve({
          success: true,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature
        })
      },
      prefill: {
        name: orderData.customerName,
        email: orderData.email,
        contact: orderData.phone
      },
      theme: {
        color: '#d4af37'
      },
      modal: {
        ondismiss: function() {
          reject(new Error('Payment cancelled by user'))
        }
      }
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  })
}

/**
 * Verify payment signature (should be done on backend)
 * @param {Object} paymentData - Payment response data
 * @returns {Promise<boolean>}
 */
export const verifyPaymentSignature = async (paymentData) => {
  try {
    // This should be done on your backend for security
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    })
    
    const result = await response.json()
    return result.verified
  } catch (error) {
    console.error('Payment verification error:', error)
    return false
  }
}

/**
 * Process Stripe payment
 * Alternative payment gateway option
 */
export const initiateStripePayment = async () => {
  // Stripe integration would go here
  // Requires Stripe.js and backend integration
  throw new Error('Stripe integration not implemented yet')
}

/**
 * Get payment method display name
 */
export const getPaymentMethodName = (method) => {
  const methods = {
    'razorpay': 'Online Payment',
    'cod': 'Cash on Delivery',
    'pay-at-restaurant': 'Pay at Restaurant',
    'upi': 'UPI',
    'card': 'Credit/Debit Card',
    'wallet': 'Wallet'
  }
  return methods[method] || method
}

/**
 * Format payment status for display
 */
export const getPaymentStatusBadge = (status) => {
  const statusConfig = {
    pending: { label: 'Pending', class: 'badge-warning' },
    completed: { label: 'Paid', class: 'badge-success' },
    failed: { label: 'Failed', class: 'badge-error' },
    refunded: { label: 'Refunded', class: 'badge-info' },
    processing: { label: 'Processing', class: 'badge-info' }
  }
  return statusConfig[status] || { label: status, class: 'badge-default' }
}
