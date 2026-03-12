import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FiEdit, FiTrash2, FiPlus, FiCopy } from 'react-icons/fi';
import Modal from '../../components/Modal';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './PromotionManager.css';

const PromotionManager = () => {
  const [promotions, setPromotions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_discount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
    tier_required: null
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error?.message || error, error?.code || '');
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const promoData = {
        ...formData,
        code: formData.code.toUpperCase(),
        discount_value: parseFloat(formData.discount_value),
        min_order_amount: parseFloat(formData.min_order_amount) || 0,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null
      };

      if (editingPromo) {
        const { error } = await supabase
          .from('promo_codes')
          .update(promoData)
          .eq('id', editingPromo.id);

        if (error) throw error;
        toast.success('Promotion updated!');
      } else {
        const { error } = await supabase
          .from('promo_codes')
          .insert(promoData);

        if (error) throw error;
        toast.success('Promotion created!');
      }

      setShowModal(false);
      setEditingPromo(null);
      resetForm();
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error?.message || error, error?.code || '');
      toast.error('Failed to save promotion');
    }
  };

  const handleEdit = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      description: promo.description,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      min_order_amount: promo.min_order_amount || '',
      max_discount: promo.max_discount || '',
      usage_limit: promo.usage_limit || '',
      valid_from: promo.valid_from?.split('T')[0] || '',
      valid_until: promo.valid_until?.split('T')[0] || '',
      is_active: promo.is_active,
      tier_required: promo.tier_required
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Promotion deleted!');
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error?.message || error, error?.code || '');
      toast.error('Failed to delete promotion');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '',
      max_discount: '',
      usage_limit: '',
      valid_from: '',
      valid_until: '',
      is_active: true,
      tier_required: null
    });
  };

  return (
    <div className="promotion-manager">
      <div className="manager-header">
        <h1>Promotion Manager</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingPromo(null);
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <FiPlus /> Create Promotion
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading promotions...</div>
      ) : (
        <div className="promotions-grid">
          {promotions.map(promo => (
            <div key={promo.id} className={`promo-card ${!promo.is_active ? 'inactive' : ''}`}>
              <div className="promo-header">
                <div className="promo-code-display">
                  <h3>{promo.code}</h3>
                  <button
                    onClick={() => copyCode(promo.code)}
                    className="copy-btn"
                    title="Copy code"
                  >
                    <FiCopy />
                  </button>
                </div>
                <div className="promo-status">
                  {promo.is_active ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-secondary">Inactive</span>
                  )}
                </div>
              </div>

              <p className="promo-description">{promo.description}</p>

              <div className="promo-details">
                <div className="detail-item">
                  <span className="label">Discount:</span>
                  <span className="value">
                    {promo.discount_type === 'percentage'
                      ? `${promo.discount_value}%`
                      : formatCurrency(promo.discount_value)}
                  </span>
                </div>

                {promo.min_order_amount > 0 && (
                  <div className="detail-item">
                    <span className="label">Min Order:</span>
                    <span className="value">{formatCurrency(promo.min_order_amount)}</span>
                  </div>
                )}

                {promo.max_discount && (
                  <div className="detail-item">
                    <span className="label">Max Discount:</span>
                    <span className="value">{formatCurrency(promo.max_discount)}</span>
                  </div>
                )}

                {promo.usage_limit && (
                  <div className="detail-item">
                    <span className="label">Usage Left:</span>
                    <span className="value">
                      {promo.usage_limit - (promo.times_used || 0)}
                    </span>
                  </div>
                )}

                <div className="detail-item">
                  <span className="label">Valid Until:</span>
                  <span className="value">
                    {new Date(promo.valid_until).toLocaleDateString()}
                  </span>
                </div>

                {promo.tier_required && (
                  <div className="detail-item">
                    <span className="label">Tier:</span>
                    <span className={`tier-badge tier-${promo.tier_required}`}>
                      {promo.tier_required}
                    </span>
                  </div>
                )}
              </div>

              <div className="promo-actions">
                <button onClick={() => handleEdit(promo)} className="btn-edit">
                  <FiEdit /> Edit
                </button>
                <button onClick={() => handleDelete(promo.id)} className="btn-delete">
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPromo(null);
          resetForm();
        }}
        title={editingPromo ? 'Edit Promotion' : 'Create New Promotion'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="promo-form">
          <div className="form-row">
            <div className="form-group">
              <label>Promo Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., SAVE20"
                required
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label>Discount Type *</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                required
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Get 20% off on your order"
              required
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Discount Value *</label>
              <input
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                placeholder={formData.discount_type === 'percentage' ? '20' : '100'}
                required
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Min Order Amount</label>
              <input
                type="number"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                placeholder="0"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Max Discount</label>
              <input
                type="number"
                value={formData.max_discount}
                onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                placeholder="Optional"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Valid From *</label>
              <input
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Valid Until *</label>
              <input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Usage Limit</label>
              <input
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                placeholder="Unlimited"
                min="1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tier Required</label>
              <select
                value={formData.tier_required || ''}
                onChange={(e) => setFormData({ ...formData, tier_required: e.target.value || null })}
              >
                <option value="">All Tiers</option>
                <option value="silver">Silver+</option>
                <option value="gold">Gold+</option>
                <option value="platinum">Platinum Only</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                Active
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingPromo(null);
                resetForm();
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingPromo ? 'Update Promotion' : 'Create Promotion'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PromotionManager;
