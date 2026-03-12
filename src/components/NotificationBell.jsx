import { useState } from 'react';
import { FiBell, FiX, FiCheck } from 'react-icons/fi';
import { useNotifications } from '../context/NotificationContext';
import { formatRelativeTime } from '../utils/helpers';
import Badge from './Badge';
import './NotificationBell.css';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type) => {
    const icons = {
      order_confirmed: '✅',
      order_preparing: '👨‍🍳',
      order_delivered: '🎉',
      promotion: '🎁',
      loyalty_reward: '⭐',
      booking_confirmed: '📅',
      review_response: '💬'
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="notification-bell-container">
      <button 
        className="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <FiBell />
        {unreadCount > 0 && <Badge count={unreadCount} variant="danger" size="small" />}
      </button>

      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)} />
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="mark-all-read">
                  <FiCheck /> Mark all as read
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <FiBell className="no-notif-icon" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }
                      if (notification.action_url) {
                        window.location.href = notification.action_url;
                      }
                    }}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="notification-content">
                      {notification.title && (
                        <div className="notification-title">{notification.title}</div>
                      )}
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">
                        {formatRelativeTime(notification.created_at)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="notification-delete"
                      aria-label="Delete notification"
                    >
                      <FiX />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
