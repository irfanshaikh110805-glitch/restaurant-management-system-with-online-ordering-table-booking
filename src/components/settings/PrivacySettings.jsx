import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { FiDownload, FiShield, FiFileText } from 'react-icons/fi';

const PrivacySettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cookieConsent, setCookieConsent] = useState({
    essential: true, // Always required
    analytics: true,
    marketing: false,
    personalization: true
  });

  const handleDownloadData = async () => {
    setLoading(true);
    try {
      // Fetch all user data
      const [profile, orders, bookings, reviews, addresses, loyaltyPoints] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id),
        supabase.from('bookings').select('*').eq('user_id', user.id),
        supabase.from('item_reviews').select('*').eq('user_id', user.id),
        supabase.from('delivery_addresses').select('*').eq('user_id', user.id),
        supabase.from('loyalty_points').select('*').eq('user_id', user.id).single()
      ]);

      const userData = {
        profile: profile.data,
        orders: orders.data,
        bookings: bookings.data,
        reviews: reviews.data,
        addresses: addresses.data,
        loyalty: loyaltyPoints.data,
        exportedAt: new Date().toISOString()
      };

      // Create downloadable JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hotel-everest-data-${user.id}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Your data has been downloaded!');
    } catch (_error) {
      // Error downloading data
      toast.error('Failed to download data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to request account deletion? This action cannot be undone. ' +
      'All your data including orders, bookings, and loyalty points will be permanently deleted.'
    );

    if (!confirmed) return;

    const confirmText = prompt('Type "DELETE MY ACCOUNT" to confirm:');
    if (confirmText !== 'DELETE MY ACCOUNT') {
      toast.error('Deletion request cancelled');
      return;
    }

    setLoading(true);
    try {
      // Create deletion request (in real app, this would notify admins)
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Account Deletion Request',
        message: `User ${user.email} has requested account deletion`,
        notification_type: 'account'
      });

      toast.success('Deletion request submitted. Our team will process it within 48 hours.');
      
      // In a real implementation, you'd send an email to admins
      // and schedule the account for deletion after a grace period
    } catch (_error) {
      // Error requesting deletion
      toast.error('Failed to submit deletion request');
    } finally {
      setLoading(false);
    }
  };

  const saveCookiePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(cookieConsent));
    toast.success('Cookie preferences saved!');
  };

  return (
    <div className="privacy-settings">
      <h2>Privacy & Security</h2>
      <p className="settings-description">
        Manage your data privacy and security preferences
      </p>

      {/* Download Data */}
      <section className="settings-section">
        <h3><FiDownload /> Download My Data</h3>
        <p>
          Download a copy of all your data stored in our system. This includes your profile, 
          orders, bookings, reviews, addresses, and loyalty points.
        </p>
        <button 
          onClick={handleDownloadData} 
          className="btn-primary"
          disabled={loading}
        >
          <FiDownload /> Download My Data (JSON)
        </button>
        <div className="privacy-info">
          ℹ️ Your data will be downloaded as a JSON file that you can view with any text editor
        </div>
      </section>

      {/* Cookie Preferences */}
      <section className="settings-section">
        <h3>Cookie Preferences</h3>
        <p>
          Manage how we use cookies to improve your experience
        </p>

        <div className="cookie-options">
          <div className="cookie-option">
            <div className="cookie-info">
              <h4>Essential Cookies</h4>
              <p>Required for the website to function properly. Cannot be disabled.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked disabled />
              <span className="toggle-slider"></span>
            </label>
        </div>

          <div className="cookie-option">
            <div className="cookie-info">
              <h4>Analytics Cookies</h4>
              <p>Help us understand how visitors interact with our website</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={cookieConsent.analytics}
                onChange={(e) => setCookieConsent({...cookieConsent, analytics: e.target.checked})}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="cookie-option">
            <div className="cookie-info">
              <h4>Marketing Cookies</h4>
              <p>Used to deliver personalized advertisements</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={cookieConsent.marketing}
                onChange={(e) => setCookieConsent({...cookieConsent, marketing: e.target.checked})}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="cookie-option">
            <div className="cookie-info">
              <h4>Personalization Cookies</h4>
              <p>Remember your preferences and settings</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={cookieConsent.personalization}
                onChange={(e) => setCookieConsent({...cookieConsent, personalization: e.target.checked})}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <button onClick={saveCookiePreferences} className="btn-primary">
          Save Cookie Preferences
        </button>
      </section>

      {/* Privacy Policy & Terms */}
      <section className="settings-section">
        <h3><FiFileText /> Legal Documents</h3>
        <div className="document-links">
          <a href="/privacy-policy" className="document-link" target="_blank">
            <FiShield />
            <div>
              <h4>Privacy Policy</h4>
              <p>Last updated: January 2026</p>
            </div>
          </a>
          <a href="/terms-of-service" className="document-link" target="_blank">
            <FiFileText />
            <div>
              <h4>Terms of Service</h4>
              <p>Last updated: January 2026</p>
            </div>
          </a>
          <a href="/data-protection" className="document-link" target="_blank">
            <FiShield />
            <div>
              <h4>Data Protection Policy</h4>
              <p>GDPR Compliant</p>
            </div>
          </a>
        </div>
      </section>

      {/* Account Deletion */}
      <section className="settings-section danger-zone">
        <h3>Data Deletion Request</h3>
        <p className="warning-text">
          Request permanent deletion of your account and all associated data. This action cannot be undone.
        </p>
        <p>
          After submitting a deletion request:
        </p>
        <ul>
          <li>Your account will be marked for deletion</li>
          <li>You'll have 7 days to cancel the request</li>
          <li>After 7 days, all data will be permanently deleted</li>
          <li>This includes orders, bookings, loyalty points, and reviews</li>
        </ul>
        <button 
          onClick={handleRequestDeletion} 
          className="btn-danger"
          disabled={loading}
        >
          Request Account Deletion
        </button>
      </section>

      {/* Privacy Commitment */}
      <section className="settings-section info-section">
        <h4>🔒 Our Privacy Commitment</h4>
        <ul>
          <li>✅ We never sell your personal data to third parties</li>
          <li>✅ Your payment information is encrypted and secure</li>
          <li>✅ You have full control over your data</li>
          <li>✅ We comply with GDPR and Indian data protection laws</li>
          <li>✅ Data is stored securely in encrypted databases</li>
          <li>✅ You can request your data or deletion anytime</li>
        </ul>
      </section>
    </div>
  );
};

export default PrivacySettings;
