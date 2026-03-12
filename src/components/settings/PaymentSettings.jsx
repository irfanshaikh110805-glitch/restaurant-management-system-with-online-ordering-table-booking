import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { FiCreditCard, FiTrash2, FiCheckCircle } from 'react-icons/fi';

const PaymentSettings = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    payment_type: 'upi',
    upi_id: '',
    card_last_four: '',
    card_brand: '',
    wallet_provider: '',
    is_default: false
  });

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (_error) {
      // Error fetching payment methods
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.is_default) {
        await supabase
          .from('saved_payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { error } = await supabase
        .from('saved_payment_methods')
        .insert({
          user_id: user.id,
          ...formData
        });

      if (error) throw error;

      toast.success('Payment method added successfully!');
      fetchPaymentMethods();
      resetForm();
    } catch (_error) {
      // Error saving payment method
      toast.error('Failed to save payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('saved_payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Payment method removed!');
      fetchPaymentMethods();
    } catch (_error) {
      // Error deleting payment method
      toast.error('Failed to remove payment method');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await supabase
        .from('saved_payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('saved_payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast.success('Default payment method updated!');
      fetchPaymentMethods();
    } catch (_error) {
      // Error setting default payment method
      toast.error('Failed to update default payment method');
    }
  };

  const resetForm = () => {
    setFormData({
      payment_type: 'upi',
      upi_id: '',
      card_last_four: '',
      card_brand: '',
      wallet_provider: '',
      is_default: false
    });
    setShowForm(false);
  };

  const getPaymentIcon = (method) => {
    return <FiCreditCard />;
  };

  const getPaymentDisplay = (method) => {
    switch (method.payment_type) {
      case 'upi':
        return `UPI: ${method.upi_id}`;
      case 'card':
        return `${method.card_brand} •••• ${method.card_last_four}`;
      case 'wallet':
        return `${method.wallet_provider} Wallet`;
      default:
        return 'Payment Method';
    }
  };

  return (
    <div className="payment-settings">
      <div className="settings-header-row">
        <div>
          <h2>Payment Methods</h2>
          <p>Manage your saved payment methods</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          Add Payment Method
        </button>
      </div>

      {/* Add Payment Method Form */}
      {showForm && (
        <section className="settings-section payment-form">
          <h3>Add Payment Method</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Payment Type *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="payment_type"
                    value="upi"
                    checked={formData.payment_type === 'upi'}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                  />
                  <span>UPI</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="payment_type"
                    value="wallet"
                    checked={formData.payment_type === 'wallet'}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                  />
                  <span>Wallet</span>
                </label>
              </div>
            </div>

            {formData.payment_type === 'upi' && (
              <div className="form-group">
                <label htmlFor="upi_id">UPI ID *</label>
                <input
                  type="text"
                  id="upi_id"
                  value={formData.upi_id}
                  onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                  placeholder="yourname@paytm"
                  required
                />
                <small>Enter your UPI ID (e.g., mobile@paytm, mobile@oksbi)</small>
              </div>
            )}

            {formData.payment_type === 'wallet' && (
              <div className="form-group">
                <label htmlFor="wallet_provider">Wallet Provider *</label>
                <select
                  id="wallet_provider"
                  value={formData.wallet_provider}
                  onChange={(e) => setFormData({ ...formData, wallet_provider: e.target.value })}
                  required
                >
                  <option value="">Select Wallet</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="GPay">Google Pay</option>
                  <option value="Paytm">Paytm</option>
                  <option value="PayZapp">PayZapp</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                />
                <span>Set as default payment method</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Payment Method'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Payment Methods List */}
      <section className="settings-section">
        <h3>Saved Payment Methods</h3>
        
        {paymentMethods.length === 0 ? (
          <div className="empty-state">
            <FiCreditCard className="empty-icon" />
            <p>No saved payment methods</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Add your first payment method
            </button>
          </div>
        ) : (
          <div className="payment-list">
            {paymentMethods.map(method => (
              <div key={method.id} className={`payment-card ${method.is_default ? 'default' : ''}`}>
                <div className="payment-header">
                  <div className="payment-info">
                    {getPaymentIcon(method)}
                    <div>
                      <strong>{getPaymentDisplay(method)}</strong>
                      {method.is_default && (
                        <span className="default-badge">
                          <FiCheckCircle /> Default
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(method.id)}
                    className="icon-btn delete-btn"
                    title="Remove"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                {!method.is_default && (
                  <button 
                    onClick={() => handleSetDefault(method.id)}
                    className="set-default-btn"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Security Note */}
      <section className="settings-section info-section">
        <h4>🔒 Security Information</h4>
        <ul>
          <li>Your payment information is encrypted and securely stored</li>
          <li>We never store your card CVV or PIN</li>
          <li>UPI payments are processed through secure gateways</li>
          <li>You can remove payment methods anytime</li>
        </ul>
      </section>
    </div>
  );
};

export default PaymentSettings;
