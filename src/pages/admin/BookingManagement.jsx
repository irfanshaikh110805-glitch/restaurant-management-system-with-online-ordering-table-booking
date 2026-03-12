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

  if (loading) {
    return <div className="spinner"></div>
  }

  return (
    <div className="booking-management">
      <div className="page-header">
        <h1>Booking Management</h1>
        <div className="filter-buttons">
          <button 
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            <span>All</span>
          </button>
          <button 
            className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('pending')}
          >
            <span>Pending</span>
          </button>
          <button 
            className={`btn btn-sm ${filter === 'confirmed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('confirmed')}
          >
            <span>Confirmed</span>
          </button>
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
                  <div>
                    <div>{booking.profile?.full_name || 'Unknown'}</div>
                    <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                      {booking.profile?.phone}
                    </div>
                  </div>
                </td>
                <td>{format(new Date(booking.booking_date), 'MMM d, yyyy')}</td>
                <td>{booking.booking_time.substring(0, 5)}</td>
                <td>{booking.guests}</td>
                <td>
                  <span className={`badge badge-${
                    booking.status === 'confirmed' ? 'success' :
                    booking.status === 'pending' ? 'warning' : 'error'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td>{booking.special_requests || '-'}</td>
                <td>
                  {booking.status === 'pending' && (
                    <div className="action-buttons">
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        className="icon-btn success"
                        title="Confirm"
                      >
                        <FiCheck />
                      </button>
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="icon-btn danger"
                        title="Cancel"
                      >
                        <FiX />
                      </button>
                    </div>
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
