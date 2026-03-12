import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiCheckCircle } from 'react-icons/fi';

const DeliverySettings = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: 'Home',
    address_line1: '',
    address_line2: '',
    landmark: '',
    city: 'Vijayapura',
    state: 'Karnataka',
    pincode: '',
    is_default: false
  });

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (_error) {
      // Error fetching delivery addresses
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // If setting as default, unset other defaults first
      if (formData.is_default) {
        await supabase
          .from('delivery_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      if (editingId) {
        // Update existing address
        const { error } = await supabase
          .from('delivery_addresses')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Address updated successfully!');
      } else {
        // Add new address
        const { error } = await supabase
          .from('delivery_addresses')
          .insert({
            user_id: user.id,
            ...formData
          });

        if (error) throw error;
        toast.success('Address added successfully!');
      }

      fetchAddresses();
      resetForm();
    } catch (_error) {
      // Error saving delivery address
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setFormData({
      label: address.label,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      is_default: address.is_default
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('delivery_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Address deleted successfully!');
      fetchAddresses();
    } catch (_error) {
      // Error deleting delivery address
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      // Unset all defaults
      await supabase
        .from('delivery_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      const { error } = await supabase
        .from('delivery_addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast.success('Default address updated!');
      fetchAddresses();
    } catch (_error) {
      // Error setting default delivery address
      toast.error('Failed to update default address');
    }
  };

  const resetForm = () => {
    setFormData({
      label: 'Home',
      address_line1: '',
      address_line2: '',
      landmark: '',
      city: 'Vijayapura',
      state: 'Karnataka',
      pincode: '',
      is_default: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="delivery-settings">
      <div className="settings-header-row">
        <div>
          <h2>Delivery Addresses</h2>
          <p>Manage your saved delivery addresses</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <FiPlus /> Add Address
        </button>
      </div>

      {/* Add/Edit Address Form */}
      {showForm && (
        <section className="settings-section address-form">
          <h3>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Address Label *</label>
              <div className="radio-group">
                {['Home', 'Work', 'Other'].map(label => (
                  <label key={label} className="radio-label">
                    <input
                      type="radio"
                      name="label"
                      value={label}
                      checked={formData.label === label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address_line1">Address Line 1 *</label>
              <input
                type="text"
                id="address_line1"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                placeholder="House/Flat No., Building Name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address_line2">Address Line 2</label>
              <input
                type="text"
                id="address_line2"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                placeholder="Area, Street, Sector, Village"
              />
            </div>

            <div className="form-group">
              <label htmlFor="landmark">Landmark</label>
              <input
                type="text"
                id="landmark"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="Nearby landmark for easy delivery"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State *</label>
                <input
                  type="text"
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="pincode">Pincode *</label>
                <input
                  type="text"
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  pattern="[0-9]{6}"
                  maxLength="6"
                  placeholder="586101"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                />
                <span>Set as Default</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Address List */}
      <section className="settings-section">
        <h3>Saved Addresses</h3>
        {addresses.length === 0 ? (
          <div className="empty-state">
            <FiMapPin className="empty-icon" />
            <p>No saved addresses yet</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FiPlus /> Add your first address
            </button>
          </div>
        ) : (
          <div className="address-list">
            {addresses.map(address => (
              <div key={address.id} className={`address-card ${address.is_default ? 'default' : ''}`}>
                <div className="address-header">
                  <div className="address-label">
                    <FiMapPin />
                    <strong>{address.label}</strong>
                    {address.is_default && (
                      <span className="default-badge">
                        <FiCheckCircle /> Default
                      </span>
                    )}
                  </div>
                  <div className="address-actions">
                    <button 
                      onClick={() => handleEdit(address)}
                      className="icon-btn"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      onClick={() => handleDelete(address.id)}
                      className="icon-btn delete-btn"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <div className="address-content">
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  {address.landmark && <p className="landmark">Landmark: {address.landmark}</p>}
                  <p>{address.city}, {address.state} - {address.pincode}</p>
                </div>
                {!address.is_default && (
                  <button 
                    onClick={() => handleSetDefault(address.id)}
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
    </div>
  );
};

export default DeliverySettings;
