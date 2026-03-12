import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true,
    whatsapp_notifications: false,
    marketing_emails: true,
    order_updates: true,
    booking_reminders: true,
    promotional_offers: true
  });

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setPreferences(data[0]);
      }
    } catch (_error) {
      // Error fetching notification preferences
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Notification preferences updated!');
    } catch (_error) {
      // Error updating notification preferences
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="notification-settings">
      <h2>Notification Settings</h2>
      <p className="settings-description">
        Choose how you want to receive notifications and updates from Hotel Everest
      </p>

      <form onSubmit={handleSave}>
        {/* Communication Channels */}
        <section className="settings-section">
          <h3>Communication Channels</h3>
          
          <div className="toggle-group">
            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Email Notifications</h4>
                <p>Receive notifications via email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.email_notifications}
                  onChange={() => togglePreference('email_notifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>SMS Notifications</h4>
                <p>Get SMS alerts for important updates</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.sms_notifications}
                  onChange={() => togglePreference('sms_notifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Push Notifications</h4>
                <p>Browser push notifications</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.push_notifications}
                  onChange={() => togglePreference('push_notifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>WhatsApp Notifications</h4>
                <p>Receive updates via WhatsApp Business</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.whatsapp_notifications}
                  onChange={() => togglePreference('whatsapp_notifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* Notification Types */}
        <section className="settings-section">
          <h3>Notification Types</h3>
          
          <div className="toggle-group">
            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Order Updates</h4>
                <p>Order confirmation, preparation, and delivery status</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.order_updates}
                  onChange={() => togglePreference('order_updates')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Booking Reminders</h4>
                <p>Table reservation confirmations and reminders</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.booking_reminders}
                  onChange={() => togglePreference('booking_reminders')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Promotional Offers</h4>
                <p>Special deals, flash sales, and exclusive offers</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.promotional_offers}
                  onChange={() => togglePreference('promotional_offers')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Marketing Emails</h4>
                <p>Newsletter, new menu items, and event announcements</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.marketing_emails}
                  onChange={() => togglePreference('marketing_emails')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button
            type="button"
            onClick={() => setPreferences(prev => ({
              ...prev,
              email_notifications: true,
              sms_notifications: true,
              push_notifications: true,
              whatsapp_notifications: true,
              order_updates: true,
              booking_reminders: true,
              promotional_offers: true,
              marketing_emails: true
            }))}
            className="btn-secondary"
          >
            Enable All
          </button>

          <button
            type="button"
            onClick={() => setPreferences(prev => ({
              ...prev,
              promotional_offers: false,
              marketing_emails: false
            }))}
            className="btn-secondary"
          >
            Disable Marketing
          </button>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default NotificationSettings;
