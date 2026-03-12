import { useState, useEffect } from 'react'
import { FiDollarSign, FiShoppingBag, FiCalendar, FiTrendingUp } from 'react-icons/fi'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    todayBookings: 0,
    pendingOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')

      const [
        { data: ordersData, error: ordersError },
        { data: bookingsData, error: bookingsError },
        { data: recentOrdersData, error: recentOrdersError },
        { data: profilesData, error: profilesError }
      ] = await Promise.all([
        supabase.from('orders').select('total, status'),
        supabase.from('bookings').select('*').eq('booking_date', today),
        supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase.from('profiles').select('id, full_name')
      ])

      if (ordersError) throw ordersError
      if (bookingsError) throw bookingsError
      if (recentOrdersError) throw recentOrdersError
      if (profilesError) throw profilesError

      if (ordersData) {
        const totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.total), 0)
        const pendingOrders = ordersData.filter(o => o.status === 'pending').length
        setStats(prev => ({
          ...prev,
          totalOrders: ordersData.length,
          totalRevenue,
          pendingOrders
        }))
      }

      if (bookingsData) {
        setStats(prev => ({
          ...prev,
          todayBookings: bookingsData.length
        }))
      }

      const profileMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.id] = profile
        return acc
      }, {})

      if (recentOrdersData) {
        const withProfiles = recentOrdersData.map((order) => ({
          ...order,
          profile: profileMap[order.user_id] || null
        }))
        setRecentOrders(withProfiles)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error?.message || error, error?.code || '')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
            <FiDollarSign size={28} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">₹{stats.totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--info)' }}>
            <FiShoppingBag size={28} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{stats.totalOrders}</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'rgba(217, 119, 6, 0.2)', color: 'var(--primary)' }}>
            <FiCalendar size={28} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Today's Bookings</span>
            <span className="stat-value">{stats.todayBookings}</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' }}>
            <FiTrendingUp size={28} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending Orders</span>
            <span className="stat-value">{stats.pendingOrders}</span>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="recent-section card">
        <h2>Recent Orders</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id.substring(0, 8)}</td>
                  <td>{order.profile?.full_name || 'Unknown'}</td>
                  <td>₹{order.total}</td>
                  <td>
                    <span className={`badge badge-${
                      order.status === 'completed' || order.status === 'delivered' ? 'success' :
                      order.status === 'pending' ? 'warning' :
                      order.status === 'cancelled' ? 'error' : 'info'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{format(new Date(order.created_at), 'MMM d, h:mm a')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
