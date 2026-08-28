import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { FiCheck, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

export default function BookingManagement() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const [{ data: bookingsData, error: bookingsError }, { data: profilesData, error: profilesError }] =
        await Promise.all([
          supabase
            .from('bookings')
            .select('*')
            .order('booking_date', { ascending: false })
            .order('booking_time', { ascending: false }),
          supabase.from('profiles').select('id, full_name, phone')
        ])

      if (bookingsError) throw bookingsError
      if (profilesError) throw profilesError

      const profileMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.id] = profile
        return acc
      }, {})

      const withProfiles = (bookingsData || []).map((booking) => ({
        ...booking,
        profile: profileMap[booking.user_id] || null
      }))

      setBookings(withProfiles)
    } catch (error) {
      console.error('Error fetching bookings:', error?.message || error, error?.code || '')
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      toast.success(`Booking ${status}!`)
      fetchBookings()
    } catch (error) {
      console.error('Error updating booking:', error?.message || error, error?.code || '')
      toast.error('Failed to update booking')
    }
  }

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter)

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
  }

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="booking-management">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1>Booking Management</h1>
          <p className="page-subtitle">Review, confirm, and manage table reservations in real-time</p>
        </div>
        <div className="filter-buttons">
          {[
            { id: 'all', label: 'All Reservations' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
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

      <div className="table-container card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Date</th>
              <th>Time</th>
              <th>Guests</th>
              <th>Status</th>
              <th>Special Requests</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(booking => (
              <tr key={booking.id}>
                <td>
                  <span className="mobile-cell-label">Customer</span>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#1C1917' }}>{booking.profile?.full_name || 'Unknown'}</strong>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {booking.profile?.phone}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="mobile-cell-label">Booking Date</span>
                  <span>{format(new Date(booking.booking_date), 'MMM d, yyyy')}</span>
                </td>
                <td>
                  <span className="mobile-cell-label">Time</span>
                  <strong>{booking.booking_time?.substring(0, 5)}</strong>
                </td>
                <td>
                  <span className="mobile-cell-label">Guests</span>
                  <span>{booking.guests} Guests</span>
                </td>
                <td>
                  <span className="mobile-cell-label">Status</span>
                  <span className={`badge badge-${
                    booking.status === 'confirmed' ? 'success' :
                    booking.status === 'pending' ? 'warning' : 'error'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  <span className="mobile-cell-label">Requests</span>
                  <span>{booking.special_requests || 'None'}</span>
                </td>
                <td>
                  <span className="mobile-cell-label">Actions</span>
                  {booking.status === 'pending' ? (
                    <div className="action-buttons">
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')} 
                        className="icon-btn success" 
                        title="Confirm"
                        type="button"
                      >
                        <FiCheck />
                      </button>
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')} 
                        className="icon-btn danger" 
                        title="Cancel"
                        type="button"
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#78716C' }}>Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="empty-state">
            <p>No bookings found</p>
          </div>
        )}
      </div>
    </div>
  )
}
