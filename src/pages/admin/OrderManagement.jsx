import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { FiClock, FiUser, FiPhone, FiMapPin, FiChevronDown, FiChevronUp, FiPackage } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

export default function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const [{ data: ordersData, error: ordersError }, { data: profilesData, error: profilesError }] =
        await Promise.all([
          supabase
            .from('orders')
            .select('*, order_items(*, menu_items!order_items_menu_item_id_fkey(name))')
            .order('created_at', { ascending: false }),
          supabase.from('profiles').select('id, full_name, phone')
        ])

      if (ordersError) throw ordersError
      if (profilesError) throw profilesError

      const profileMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.id] = profile
        return acc
      }, {})

      const withProfiles = (ordersData || []).map((order) => ({
        ...order,
        profile: profileMap[order.user_id] || null
      }))

      setOrders(withProfiles)
    } catch (error) {
      console.error('Error fetching orders:', error?.message || error, error?.code || '')
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      toast.success(`Order status updated to ${status}!`)
      fetchOrders()
    } catch (error) {
      console.error('Error updating order:', error?.message || error, error?.code || '')
      toast.error('Failed to update order')
    }
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter)

  // Status counts for tabs
  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="order-management">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1>Order Management</h1>
          <p className="page-subtitle">Track, prepare, and update kitchen & delivery orders in real-time</p>
        </div>
        <div className="filter-buttons">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'preparing', label: 'Preparing' },
            { id: 'ready', label: 'Ready' },
            { id: 'delivered', label: 'Delivered' }
          ].map(({ id, label }) => (
            <button 
              key={id}
              className={`filter-tab-btn ${filter === id ? 'active' : ''}`}
              onClick={() => setFilter(id)}
              type="button"
            >
              <span>{label}</span>
              <span className="filter-count-badge">{counts[id] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="orders-container">
        {filteredOrders.map(order => (
          <div key={order.id} className="order-card">
            {/* Header */}
            <div className="order-card-header">
              <div className="order-title-group">
                <div className="order-id-badge">
                  <span className="order-id-prefix">#</span>
                  <span className="order-id-value">{order.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="order-time-stamp">
                  <FiClock size={13} />
                  <span>{format(new Date(order.created_at), 'MMM d, yyyy • h:mm a')}</span>
                </div>
              </div>

              <div className="order-status-badges">
                <span className={`status-pill status-${order.status}`}>
                  {order.status.toUpperCase()}
                </span>
                <span className={`payment-pill payment-${order.payment_status === 'completed' ? 'paid' : 'pending'}`}>
                  {order.payment_status === 'completed' ? 'PAID' : 'PAYMENT PENDING'}
                </span>
              </div>
            </div>

            {/* Customer Box */}
            <div className="order-customer-box">
              <div className="customer-detail-row customer-name-row">
                <FiUser size={15} className="customer-icon" />
                <strong>{order.profile?.full_name || 'Guest Customer'}</strong>
              </div>
              {order.profile?.phone && (
                <div className="customer-detail-row">
                  <FiPhone size={14} className="customer-icon" />
                  <span>{order.profile.phone}</span>
                </div>
              )}
              {order.delivery_address && (
                <div className="customer-detail-row">
                  <FiMapPin size={14} className="customer-icon" />
                  <span>{order.delivery_address}</span>
                </div>
              )}
            </div>

            {/* Expand / Collapse Items Toggle */}
            <div className="order-items-toggle-wrap">
              <button 
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="btn-toggle-items"
                type="button"
              >
                <div className="toggle-left">
                  <FiPackage size={15} />
                  <span>
                    {expandedOrder === order.id ? 'Hide Items' : `View ${order.order_items?.length || 0} Items`}
                  </span>
                </div>
                <div className="toggle-right">
                  <span className="order-card-subtotal">Total: ₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
                  {expandedOrder === order.id ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </div>
              </button>
            </div>

            {/* Items Receipt Table */}
            {expandedOrder === order.id && (
              <div className="order-items-list">
                <div className="order-items-header">Ordered Dishes</div>
                {order.order_items?.map(item => (
                  <div key={item.id} className="order-item-row">
                    <div className="item-qty-name">
                      <span className="item-qty-badge">{item.quantity}x</span>
                      <span className="item-name-text">{item.menu_items?.name || 'Menu Item'}</span>
                    </div>
                    <span className="item-price-text">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="order-total-row">
                  <span className="total-label">Grand Total</span>
                  <span className="total-amount">₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {/* Footer Status & Actions */}
            <div className="order-card-footer">
              <div className="status-dropdown-group">
                <label className="status-dropdown-label">Status:</label>
                <select
                  className="status-dropdown-select"
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="order-quick-actions">
                {order.status === 'pending' && (
                  <button 
                    className="btn-action-primary"
                    onClick={() => updateOrderStatus(order.id, 'confirmed')}
                    type="button"
                  >
                    Confirm
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button 
                    className="btn-action-primary"
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    type="button"
                  >
                    Start Prep
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button 
                    className="btn-action-primary"
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    type="button"
                  >
                    Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button 
                    className="btn-action-success"
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    type="button"
                  >
                    Deliver
                  </button>
                )}
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <button 
                    className="btn-action-cancel"
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    type="button"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="admin-empty-card">
            <FiPackage size={44} className="empty-icon" />
            <h3>No Orders Found</h3>
            <p>There are no {filter !== 'all' ? filter : ''} orders at this moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
