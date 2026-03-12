import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { useCart } from '../context/CartContext';
import { applyPromoCode as applyPromoCodeHelper } from '../utils/backendHelpers';
import { supabase } from '../lib/supabase';
import { FiTag, FiClock, FiGift, FiCopy, FiPercent } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Promotions.css';

const PromotionsPage = () => {
  const { user } = useAuth();
  const { tierInfo } = useLoyalty();
  // Bug fix: CartContext exports `items` and `total` directly, not `applyPromoCode` or `cart`
  const { items: cartItems, total: cartTotal, addItem } = useCart();
  const [promotions, setPromotions] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, codes, sales, exclusive
  const [, setTick] = useState(0); // forces re-render for countdown timers

  useEffect(() => {
    // Bug fix: load promotions for ALL visitors; only applying a code requires login
    fetchPromotions();
    fetchFlashSales();
  }, [activeTab, user]);

  // Live countdown ticker for flash sale timers
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const query = supabase
        .from('promo_codes')
        .select('*')
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString());

      if (activeTab === 'exclusive' && user && tierInfo?.tier) {
        // In the current schema, promotions are not tier-scoped,
        // so we simply reuse the active promotions list.
        // This branch is kept for future extension.
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (_error) {
      console.error('Error fetching promotions:', _error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlashSales = async () => {
    try {
      const { data, error } = await supabase
        .from('flash_sales')
        .select(`
          *,
          item:menu_items(id, name, price, image_url, description)
        `)
        .eq('is_active', true)
        .gte('end_time', new Date().toISOString())
        .lte('start_time', new Date().toISOString())
        .order('end_time', { ascending: true });

      if (error) throw error;
      setFlashSales(data || []);
    } catch (_error) {
      console.error('Error fetching flash sales:', _error);
    }
  };

  const copyPromoCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Promo code copied!');
  };

  const handleApplyPromo = async (code) => {
    if (!user) {
      toast.error('Please login to use promo codes');
      return;
    }

    // Bug fix: use `cartItems` (from useCart) instead of the nonexistent `cart.items`
    if (cartItems.length === 0) {
      toast.error('Add items to cart first');
      return;
    }

    if (!code || !code.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    try {
      // Bug fix: call applyPromoCodeHelper from backendHelpers with correct args
      const result = await applyPromoCodeHelper(code.trim().toUpperCase(), user.id, cartTotal);
      if (result.success) {
        toast.success(`Promo applied! You saved ₹${result.discount.toFixed(2)}`);
      } else {
        toast.error('Invalid or expired promo code');
      }
    } catch (_error) {
      toast.error('Failed to apply promo code');
    }
  };

  const getTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} left`;
    }

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const getDiscountText = (promo) => {
    if (promo.discount_type === 'percentage') {
      return `${promo.discount_value}% OFF`;
    } else {
      return `₹${promo.discount_value} OFF`;
    }
  };

  return (
    <div className="promotions-page">
      <div className="container">
        <div className="promotions-header">
          <h1><FiGift /> Offers &amp; Promotions</h1>
          <p>Save more on your favorite dishes!</p>
        </div>

        {/* Promo Code Input */}
        <div className="promo-code-section">
          <h2>Have a Promo Code?</h2>
          <div className="promo-input-group">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              className="promo-input"
            />
            <button
              onClick={() => handleApplyPromo(promoCode)}
              className="btn-primary"
              disabled={!promoCode}
              type="button"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Flash Sales */}
        {flashSales.length > 0 && (
          <section className="flash-sales-section">
            <div className="section-header">
              <h2><FiClock /> Flash Sales</h2>
              <span className="flash-badge">⚡ Limited Time</span>
            </div>

            <div className="flash-sales-grid">
              {flashSales.map(sale => (
                <div key={sale.id} className="flash-sale-card">
                  <div className="flash-timer">
                    <FiClock />
                    <span>{getTimeRemaining(sale.end_time)}</span>
                  </div>

                  <div className="flash-item-image">
                    <img src={sale.item.image_url} alt={sale.item.name} />
                    <div className="flash-discount-badge">
                      {sale.discount_percentage}% OFF
                    </div>
                  </div>

                  <div className="flash-item-info">
                    <h3>{sale.item.name}</h3>
                    <p className="flash-description">{sale.item.description}</p>

                    <div className="flash-pricing">
                      <div className="original-price">₹{sale.item.price}</div>
                      <div className="sale-price">
                        ₹{(sale.item.price * (1 - sale.discount_percentage / 100)).toFixed(2)}
                      </div>
                    </div>

                    <div className="flash-stock">
                      <div className="stock-bar">
                        <div
                          className="stock-fill"
                          style={{
                            width: `${(sale.items_sold / sale.max_quantity) * 100}%`
                          }}
                        />
                      </div>
                      <span className="stock-text">
                        {sale.max_quantity - sale.items_sold} left
                      </span>
                    </div>

                    <button
                      className="btn-primary btn-block"
                      onClick={() => {
                        const salePrice = parseFloat(
                          (sale.item.price * (1 - sale.discount_percentage / 100)).toFixed(2)
                        );
                        addItem({
                          id: sale.item.id,
                          name: `${sale.item.name} (Flash Sale)`,
                          price: salePrice,
                          image_url: sale.item.image_url,
                          description: sale.item.description
                        });
                        import('react-hot-toast').then(m =>
                          m.default.success(`${sale.item.name} added to cart!`)
                        );
                      }}
                      type="button"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="promotions-tabs">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
            type="button"
          >
            All Offers
          </button>
          <button
            className={`tab-btn ${activeTab === 'codes' ? 'active' : ''}`}
            onClick={() => setActiveTab('codes')}
            type="button"
          >
            Promo Codes
          </button>
          {user && (
            <button
              className={`tab-btn ${activeTab === 'exclusive' ? 'active' : ''}`}
              onClick={() => setActiveTab('exclusive')}
              type="button"
            >
              Exclusive for You
            </button>
          )}
        </div>

        {/* Promotions Grid */}
        <div className="promotions-grid">
          {loading ? (
            <div className="loading">Loading promotions...</div>
          ) : promotions.length === 0 ? (
            <div className="empty-state">
              <FiTag className="empty-icon" />
              <h3>No active promotions</h3>
              <p>Check back soon for exciting offers!</p>
            </div>
          ) : (
            promotions.map(promo => (
              <div key={promo.id} className="promo-card">
                <div className="promo-badge">
                  <FiPercent />
                  {getDiscountText(promo)}
                </div>

                <div className="promo-content">
                  <h3>{promo.code}</h3>
                  <p className="promo-description">{promo.description}</p>

                  <div className="promo-details">
                    {promo.min_order_value && (
                      <div className="promo-detail">
                        <span className="detail-label">Min Order:</span>
                        <span className="detail-value">₹{promo.min_order_value}</span>
                      </div>
                    )}

                    {promo.max_discount_amount && promo.discount_type === 'percentage' && (
                      <div className="promo-detail">
                        <span className="detail-label">Max Discount:</span>
                        <span className="detail-value">₹{promo.max_discount_amount}</span>
                      </div>
                    )}

                    <div className="promo-detail">
                      <span className="detail-label">Valid Until:</span>
                      <span className="detail-value">
                        {new Date(promo.valid_until).toLocaleDateString()}
                      </span>
                    </div>

                    {promo.usage_limit && (
                      <div className="promo-detail">
                        <span className="detail-label">Uses Left:</span>
                        <span className="detail-value">
                          {promo.usage_limit - (promo.times_used || 0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {promo.eligible_tiers && promo.eligible_tiers.length > 0 && (
                    <div className="promo-tiers">
                      <span className="tier-label">Exclusive for:</span>
                      {promo.eligible_tiers.map(tier => (
                        <span key={tier} className={`tier-badge tier-${tier}`}>
                          {tier.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="promo-actions">
                  <button
                    onClick={() => copyPromoCode(promo.code)}
                    className="btn-secondary"
                    type="button"
                  >
                    <FiCopy /> Copy Code
                  </button>
                  <button
                    onClick={() => handleApplyPromo(promo.code)}
                    className="btn-primary"
                    type="button"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tips Section */}
        <div className="promo-tips">
          <h3>💡 How to Save More</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">🎁</div>
              <h4>Join Loyalty Program</h4>
              <p>Earn points on every order and get exclusive discounts</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">👥</div>
              <h4>Refer Friends</h4>
              <p>Get ₹100 off when your friend places their first order</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">⚡</div>
              <h4>Catch Flash Sales</h4>
              <p>Limited-time deals with up to 50% off on select items</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">📅</div>
              <h4>Check Daily</h4>
              <p>New offers added every week - don't miss out!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionsPage;
