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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoError, setPromoError] = useState('');

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
    setPromoError('');

    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode) {
      setPromoError('Promotion code is required');
      toast.error('Promotion code is required');
      return;
    }

    // Pre-validation duplicate check
    const isDuplicate = promotions.some(
      (p) => p.code.trim().toUpperCase() === cleanCode && (!editingPromo || p.id !== editingPromo.id)
    );

    if (isDuplicate) {
      const errMsg = `A promotion with code "${cleanCode}" already exists.`;
      setPromoError(errMsg);
      toast.error(errMsg);
      return;
    }

    setIsSubmitting(true);
    try {
      const promoData = {
        ...formData,
        code: cleanCode,
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
      setPromoError('');
      resetForm();
      await fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error?.message || error, error?.code || '');
      if (
        error?.code === '23505' ||
        error?.status === 409 ||
        error?.message?.includes('unique constraint') ||
        error?.message?.includes('duplicate key')
      ) {
        const errMsg = `A promotion with code "${cleanCode}" already exists.`;
        setPromoError(errMsg);
        toast.error(errMsg);
      } else {
        toast.error(error?.message || 'Failed to save promotion');
      }
    } finally {
      setIsSubmitting(false);
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
      <div className="page-header">
        <div className="page-title-wrap">
          <h1>Promotion Manager</h1>
          <p className="page-subtitle">Configure coupon codes, VIP tier perks, and promotional discounts</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingPromo(null);
            setShowModal(true);
          }}
          className="btn btn-primary"
          type="button"
        >
          <FiPlus /> <span>Create Promotion</span>
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
          if (!isSubmitting) {
            setShowModal(false);
            setEditingPromo(null);
            setPromoError('');
            resetForm();
          }
        }}
        title={editingPromo ? 'Edit Promotion' : 'Create New Promotion'}
        size="large"
      >
        {promoError && (
          <div 
            className="badge badge-error" 
            style={{ 
              width: '100%', 
              padding: '0.65rem 1rem', 
              marginBottom: '1rem', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}
          >
            ⚠️ {promoError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="promo-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Promo Code *</label>
              <input
                type="text"
                className="form-control"
                value={formData.code}
                onChange={(e) => {
                  setFormData({ ...formData, code: e.target.value });
                  if (promoError) setPromoError('');
                }}
                placeholder="e.g., SAVE20"
                required
                disabled={isSubmitting}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Discount Type *</label>
              <select
                className="form-control"
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                disabled={isSubmitting}
                required
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-control"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isSubmitting}
              placeholder="e.g., Get 20% off on your order"
              required
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Discount Value *</label>
              <input
                type="number"
                className="form-control"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                placeholder={formData.discount_type === 'percentage' ? '20' : '100'}
                disabled={isSubmitting}
                required
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Min Order Amount</label>
              <input
                type="number"
                className="form-control"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                placeholder="0"
                disabled={isSubmitting}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Max Discount Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.max_discount}
                onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                placeholder="No limit"
                disabled={isSubmitting}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Valid From *</label>
              <input
                type="date"
                className="form-control"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Valid Until *</label>
              <input
                type="date"
                className="form-control"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Usage Limit</label>
              <input
                type="number"
                className="form-control"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                placeholder="Unlimited"
                disabled={isSubmitting}
                min="1"
              />
            </div>
          </div>

          <div className="form-row" style={{ alignItems: 'center' }}>
            <div className="form-group">
              <label className="form-label">Tier Required</label>
              <select
                className="form-control"
                value={formData.tier_required || ''}
                onChange={(e) => setFormData({ ...formData, tier_required: e.target.value || null })}
                disabled={isSubmitting}
              >
                <option value="">All Tiers</option>
                <option value="silver">Silver+</option>
                <option value="gold">Gold+</option>
                <option value="platinum">Platinum Only</option>
              </select>
            </div>

            <div className="form-group">
              <label className="checkbox-label" style={{ marginTop: '1.75rem' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  disabled={isSubmitting}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <span>Active Status</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingPromo(null);
                setPromoError('');
                resetForm();
              }}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingPromo ? 'Update Promotion' : 'Create Promotion')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PromotionManager;
