import { useState, useEffect } from 'react'
import { format } from 'date-fns'
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
      toast.success('Order status updated!')
      fetchOrders()
    } catch (error) {
      console.error('Error updating order:', error?.message || error, error?.code || '')
      toast.error('Failed to update order')
    }
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter)

  if (loading) {
    return <div className="spinner"></div>
  }

  return (
    <div className="order-management">
      <div className="page-header">
        <h1>Order Management</h1>
        <div className="filter-buttons">
          {['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered'].map(status => (
            <button 
              key={status}
              className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(status)}
            >
              <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="orders-container">
        {filteredOrders.map(order => (
          <div key={order.id} className="order-card card">
            <div className="order-card-header">
              <div>
                <h3>Order #{order.id.substring(0, 8)}</h3>
                <p className="text-secondary">
                  {format(new Date(order.created_at), 'MMM d, yyyy • h:mm a')}
                </p>
              </div>
              <div className="order-badges">
                <span className={`badge badge-${
                  order.status === 'delivered' ? 'success' :
                  order.status === 'pending' ? 'warning' :
                  order.status === 'cancelled' ? 'error' : 'info'
                }`}>
                  {order.status}
                </span>
                <span className={`badge badge-${
                  order.payment_status === 'completed' ? 'success' : 'warning'
                }`}>
                  {order.payment_status}
                </span>
              </div>
            </div>

            <div className="order-card-body">
              <div className="customer-info">
                <strong>{order.profile?.full_name || 'Unknown'}</strong>
                <p className="text-secondary">{order.profile?.phone}</p>
                <p className="text-secondary">{order.delivery_address}</p>
              </div>

              <button 
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="btn btn-secondary btn-sm"
              >
                <span>{expandedOrder === order.id ? 'Hide Items' : 'View Items'}</span>
              </button>

              {expandedOrder === order.id && (
                <div className="order-items-list">
                  {order.order_items.map(item => (
                    <div key={item.id} className="order-item-row">
                      <span>{item.quantity}x {item.menu_items.name}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="order-total-row">
                    <strong>Total</strong>
                    <strong>₹{order.total}</strong>
                  </div>
                </div>
              )}
            </div>

            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="order-card-footer">
                <label className="form-label">Update Status:</label>
                <select
                  className="form-control"
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
            )}
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="empty-state">
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  )
}
