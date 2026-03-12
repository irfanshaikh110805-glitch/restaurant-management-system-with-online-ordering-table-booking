import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { FiUser, FiMail, FiPhone, FiCalendar, FiShoppingBag, FiX, FiRefreshCw, FiMapPin, FiCreditCard } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import ConfirmDialog from '../components/ConfirmDialog'
import './Profile.css'

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('bookings')
  const [cancelDialog, setCancelDialog] = useState({ open: false, bookingId: null })
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: ''
  })
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (user) {
      fetchData()
      // Subscribe to real-time updates
      const ordersSub = supabase
        .channel(`user-orders-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        }, handleOrderUpdate)
        .subscribe()

      const bookingsSub = supabase
        .channel(`user-bookings-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        }, handleBookingUpdate)
        .subscribe()

      return () => {
        ordersSub.unsubscribe()
        bookingsSub.unsubscribe()
      }
    }
  }, [user])

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        phone: profile.phone || ''
      })
    }
  }, [profile])

  const fetchData = async () => {
    try {
      const [bookingsRes, ordersRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('orders')
          .select('*, order_items(*, menu_items!order_items_menu_item_id_fkey(id, name, price))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ])

      if (bookingsRes.data) setBookings(bookingsRes.data)
      if (ordersRes.data) setOrders(ordersRes.data)
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderUpdate = (payload) => {
    if (payload.eventType === 'INSERT') {
      setOrders(prev => [payload.new, ...prev])
      toast.success('New order received!')
    } else if (payload.eventType === 'UPDATE') {
      setOrders(prev => prev.map(order => 
        order.id === payload.new.id ? { ...order, ...payload.new } : order
      ))
      if (payload.new.status !== payload.old.status) {
        toast.success(`Order status updated to: ${payload.new.status}`)
      }
    }
  }

  const handleBookingUpdate = (payload) => {
    if (payload.eventType === 'INSERT') {
      setBookings(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setBookings(prev => prev.map(booking => 
        booking.id === payload.new.id ? { ...booking, ...payload.new } : booking
      ))
      if (payload.new.status !== payload.old.status) {
        toast.success(`Booking status updated to: ${payload.new.status}`)
      }
    }
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!user) return
    setSavingProfile(true)
    try {
      const updates = {
        full_name: profileForm.full_name,
        phone: profileForm.phone
      }
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
      if (error) {
        throw error
      }
      await refreshProfile()
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    // Bug fix: open styled ConfirmDialog instead of native browser window.confirm
    setCancelDialog({ open: true, bookingId })
  }

  const confirmCancelBooking = async () => {
    const bookingId = cancelDialog.bookingId
    setCancelDialog({ open: false, bookingId: null })

    const previousBookings = bookings.map(b => ({ ...b }))

    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
      )
    )

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      if (error) throw error

      toast.success('Booking cancelled successfully')
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Failed to cancel booking')
      setBookings(previousBookings)
    }
  }

  const handleReorder = (order) => {
    order.order_items.forEach(item => {
      addItem({
        id: item.menu_items.id,
        name: item.menu_items.name,
        price: item.menu_items.price,
        quantity: item.quantity
      })
    })
    toast.success('Items added to cart!')
    navigate('/cart')
  }

  const getStatusBadge = (status) => {
    if (!status) return null
    const classes = {
      pending: 'badge-warning',
      confirmed: 'badge-success',
      cancelled: 'badge-error',
      completed: 'badge-success',
      preparing: 'badge-info',
      ready: 'badge-success',
      delivered: 'badge-success',
      failed: 'badge-error'
    }
    return <span className={`badge ${classes[status] || ''}`}>{status}</span>
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
      <div className="profile-page">
        <div className="container">
        <h1>My Profile</h1>

        {/* Profile Info */}
        <div className="profile-card card">
          <div className="profile-header">
            <div className="profile-avatar">
              {profile?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-details">
              <h2>{profile?.full_name}</h2>
              {profile?.role === 'admin' && (
                <span className="badge badge-info">Admin</span>
              )}
            </div>
          </div>
          <div className="profile-info-grid">
            <div className="info-item">
              <FiMail className="info-icon" />
              <div>
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email}</span>
              </div>
            </div>
            {profile?.phone && (
              <div className="info-item">
                <FiPhone className="info-icon" />
                <div>
                  <span className="info-label">Phone</span>
                  <span className="info-value">{profile.phone}</span>
                </div>
              </div>
            )}
          </div>
          <form className="profile-edit-form" onSubmit={handleProfileSave}>
            <div className="profile-info-grid">
              <div className="info-item">
                <FiUser className="info-icon" />
                <div>
                  <span className="info-label">Full Name</span>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.full_name}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, full_name: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="info-item">
                <FiPhone className="info-icon" />
                <div>
                  <span className="info-label">Phone</span>
                  <input
                    type="tel"
                    className="form-control"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
            type="button"
          >
            <FiCalendar /> Bookings ({bookings.length})
          </button>
          <button
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
            type="button"
          >
            <FiShoppingBag /> Orders ({orders.length})
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="tab-content">
            {bookings.length === 0 ? (
              <div className="empty-state">
                <p>No bookings yet</p>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => (
                  <div key={booking.id} className="booking-item card">
                    <div className="booking-info">
                      <div>
                        <h4>{format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}</h4>
                        <p className="text-secondary">{booking.booking_time} • {booking.guests} Guests</p>
                        {booking.special_requests && (
                          <p className="text-muted">{booking.special_requests}</p>
                        )}
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    {/* Cancel button — only show for cancellable statuses */}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="btn btn-danger btn-sm"
                          type="button"
                        >
                          <FiX size={14} /> Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="tab-content">
            {orders.length === 0 ? (
              <div className="empty-state">
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-item card">
                    <div className="order-header">
                      <div>
                        <h4>Order #{order.id.substring(0, 8)}</h4>
                        <p className="text-secondary">
                          {format(new Date(order.created_at), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                      <div className="order-status">
                        {getStatusBadge(order.status)}
                        {getStatusBadge(order.payment_status)}
                      </div>
                    </div>
                    <div className="order-items">
                      {order.order_items.map(item => (
                        <div key={item.id} className="order-item-row">
                          <span>{item.quantity}x {item.menu_items.name}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <div className="order-total-info">
                        <strong>Total: ₹{order.total}</strong>
                        <span className="payment-method-label">
                          {order.payment_method === 'pay-at-restaurant' ? 'Pay at Restaurant' : 'Online Payment'}
                        </span>
                      </div>
                      <div className="order-actions">
                        {order.payment_status === 'pending' && order.payment_method !== 'pay-at-restaurant' && (
                          <Link
                            to={`/order-confirmation/${order.id}`}
                            className="btn btn-primary btn-sm"
                            title="Complete payment"
                          >
                            <FiCreditCard size={14} /> Pay Now
                          </Link>
                        )}
                        {['confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status) && (
                          <Link
                            to={`/order-tracking/${order.id}`}
                            className="btn btn-secondary btn-sm"
                            title="Track this order"
                          >
                            <FiMapPin size={14} /> Track
                          </Link>
                        )}
                        <button
                          onClick={() => handleReorder(order)}
                          className="btn btn-secondary btn-sm"
                          title="Add all items from this order back to cart"
                          type="button"
                        >
                          <FiRefreshCw size={14} /> Reorder
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Bug fix: ConfirmDialog replaces native window.confirm */}
    <ConfirmDialog
      isOpen={cancelDialog.open}
      onClose={() => setCancelDialog({ open: false, bookingId: null })}
      onConfirm={confirmCancelBooking}
      title="Cancel Booking"
      message="Are you sure you want to cancel this booking? This action cannot be undone."
      confirmText="Yes, Cancel"
      cancelText="Keep Booking"
      variant="danger"
    />
    </>
  )
}
