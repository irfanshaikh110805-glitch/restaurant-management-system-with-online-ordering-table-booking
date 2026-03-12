import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { supabase } from '../lib/supabase';
import QRCode from 'react-qr-code';
import { 
  FiAward, 
  FiGift, 
  FiTrendingUp, 
  FiUsers, 
  FiCopy, 
  FiShare2,
  FiStar
} from 'react-icons/fi';
import { RiMedalFill, RiVipCrownFill } from 'react-icons/ri';
import toast from 'react-hot-toast';
import './Loyalty.css';

const LoyaltyProgram = () => {
  const { user } = useAuth();
  const { 
    loyaltyData, 
    tierInfo, 
    nextTierInfo,
    referralCode, 
    pointsHistory,
    getPointsValue,
    TIER_THRESHOLDS 
  } = useLoyalty();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [referrals, setReferrals] = useState([]);
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    if (user) {
      fetchReferrals();
      fetchRewards();
    }
  }, [user]);

  const fetchReferrals = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const fetchRewards = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true });
      // Silently fall back to [] if table doesn't exist yet
      if (!error) setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied!');
  };

  const shareReferral = async () => {
    const shareData = {
      title: 'Join Hotel Everest!',
      text: `Use my referral code ${referralCode} and get 100 bonus points when you sign up!`,
      url: `${window.location.origin}/signup?ref=${referralCode}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copyReferralCode();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return <RiVipCrownFill color="#E5E4E2" />;
      default: return '🥉';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#CD7F32';
    }
  };

  const progressToNextTier = nextTierInfo 
    ? ((loyaltyData?.lifetime_points || 0) / nextTierInfo.min) * 100 
    : 100;

  // Show login prompt if user is not logged in
  if (!user) {
    return (
      <div className="loyalty-page">
        <div className="container">
          <div className="loyalty-header">
            <h1>
              <FiAward /> Loyalty Rewards
            </h1>
            <p>Join our loyalty program to earn points and unlock exclusive rewards</p>
          </div>
          <div className="empty-state">
            <FiAward className="empty-icon" />
            <h3>Login Required</h3>
            <p>Please login to access your loyalty rewards</p>
            <a href="/login" className="btn-primary">Login Now</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="loyalty-page">
      <div className="container">
        <div className="loyalty-header">
          <h1>
            <FiAward /> Loyalty Rewards
          </h1>
          <p>Earn points, unlock rewards, and enjoy exclusive perks</p>
        </div>

        {/* Tier Status Card */}
        <div className="tier-status-card" style={{ borderColor: getTierColor(tierInfo?.tier) }}>
          <div className="tier-header">
            <div className="tier-badge" style={{ background: getTierColor(tierInfo?.tier) }}>
              <span className="tier-icon">{getTierIcon(tierInfo?.tier)}</span>
              <span className="tier-name">{tierInfo?.tier?.toUpperCase()} MEMBER</span>
            </div>
            <div className="points-display">
              <div className="points-value">{loyaltyData?.total_points || 0}</div>
              <div className="points-label">Available Points</div>
              <div className="points-value-rupees">≈ ₹{getPointsValue(loyaltyData?.total_points || 0)}</div>
            </div>
          </div>

          {nextTierInfo && (
            <div className="tier-progress">
              <div className="progress-info">
                <span>Progress to {nextTierInfo.tier.toUpperCase()}</span>
                <span>{nextTierInfo.pointsNeeded} points needed</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${Math.min(progressToNextTier, 100)}%`,
                    background: getTierColor(nextTierInfo.tier)
                  }}
                />
              </div>
            </div>
          )}

          <div className="tier-perks">
            <h4>Your Perks:</h4>
            <ul>
              {tierInfo?.perks.map((perk, index) => (
                <li key={index}>
                  <FiStar /> {perk}
                </li>
              ))}
              <li><FiTrendingUp /> {tierInfo?.multiplier}x points multiplier</li>
            </ul>
          </div>
        </div>

        {/* Tabs */}
        <div className="loyalty-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Points History
          </button>
          <button
            className={`tab-btn ${activeTab === 'referrals' ? 'active' : ''}`}
            onClick={() => setActiveTab('referrals')}
          >
            Referrals
          </button>
          <button
            className={`tab-btn ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            Rewards
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <FiAward className="stat-icon" />
                  <div className="stat-value">{loyaltyData?.lifetime_points || 0}</div>
                  <div className="stat-label">Total Earned</div>
                </div>
                <div className="stat-card">
                  <FiGift className="stat-icon" />
                  <div className="stat-value">
                    {Math.max(
                      0,
                      (loyaltyData?.lifetime_points || 0) -
                        (loyaltyData?.total_points || 0)
                    )}
                  </div>
                  <div className="stat-label">Total Redeemed</div>
                </div>
                <div className="stat-card">
                  <FiUsers className="stat-icon" />
                  <div className="stat-value">{referrals.filter(r => r.status === 'completed').length}</div>
                  <div className="stat-label">Successful Referrals</div>
                </div>
                <div className="stat-card">
                  <RiMedalFill className="stat-icon" />
                  <div className="stat-value">{tierInfo?.tier.toUpperCase()}</div>
                  <div className="stat-label">Current Tier</div>
                 </div>
              </div>

              {/* How to Earn Points */}
              <div className="info-section">
                <h3>How to Earn Points</h3>
                <div className="earn-methods">
                  <div className="earn-method">
                    <div className="method-icon">🛒</div>
                    <div className="method-info">
                      <h4>Place Orders</h4>
                      <p>Earn 1 point for every ₹10 spent (multiplied by your tier)</p>
                    </div>
                  </div>
                  <div className="earn-method">
                    <div className="method-icon">⭐</div>
                    <div className="method-info">
                      <h4>Write Reviews</h4>
                      <p>Get 50 points for each review with photo</p>
                    </div>
                  </div>
                  <div className="earn-method">
                    <div className="method-icon">👥</div>
                    <div className="method-info">
                      <h4>Refer Friends</h4>
                      <p>Earn 100 points when your friend makes first order</p>
                    </div>
                  </div>
                  <div className="earn-method">
                    <div className="method-icon">🎂</div>
                    <div className="method-info">
                      <h4>Birthday Bonus</h4>
                      <p>Get 200 bonus points on your birthday</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tier Comparison */}
              <div className="info-section">
                <h3>Tier Benefits</h3>
                <div className="tier-comparison">
                  {Object.entries(TIER_THRESHOLDS).map(([tier, info]) => (
                    <div 
                      key={tier} 
                      className={`tier-card ${tierInfo?.tier === tier ? 'current' : ''}`}
                      style={{ borderColor: getTierColor(tier) }}
                    >
                      <div className="tier-card-header" style={{ background: getTierColor(tier) }}>
                        <span className="tier-card-icon">{getTierIcon(tier)}</span>
                        <span className="tier-card-name">{tier.toUpperCase()}</span>
                      </div>
                      <div className="tier-card-body">
                        <div className="tier-requirement">
                          {info.min} - {info.max === Infinity ? '∞' : info.max} points
                        </div>
                        <div className="tier-multiplier">{info.multiplier}x Points</div>
                        <ul className="tier-benefits">
                          {info.perks.map((perk, idx) => (
                            <li key={idx}>{perk}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-tab">
              <h3>Points History</h3>
              {pointsHistory.length === 0 ? (
                <div className="empty-state">
                  <FiAward className="empty-icon" />
                  <p>No points history yet</p>
                  <p className="text-secondary">Start ordering to earn points!</p>
                </div>
              ) : (
                <div className="points-history">
                  {pointsHistory.map(transaction => (
                    <div key={transaction.id} className="history-item">
                      <div className="history-icon">
                        {(transaction.transaction_type === 'earned' || transaction.transaction_type === 'earn') ? '➕' : '➖'}
                      </div>
                      <div className="history-info">
                        <div className="history-description">{transaction.description}</div>
                        <div className="history-date">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`history-points ${transaction.transaction_type}`}>
                        {(transaction.transaction_type === 'earned' || transaction.transaction_type === 'earn') ? '+' : ''}{transaction.points}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'referrals' && (
            <div className="referrals-tab">
              <div className="referral-card">
                <h3>Share Your Referral Code</h3>
                <p>Invite friends and earn 100 points when they make their first order!</p>
                
                <div className="referral-code-section">
                  <div className="qr-code">
                    <QRCode value={`${window.location.origin}/signup?ref=${referralCode}`} size={150} />
                  </div>
                  
                  <div className="referral-actions">
                    <div className="code-display">
                      <span className="code">{referralCode}</span>
                    </div>
                    <div className="action-buttons">
                      <button onClick={copyReferralCode} className="btn-secondary">
                        <FiCopy /> Copy Code
                      </button>
                      <button onClick={shareReferral} className="btn-primary">
                        <FiShare2 /> Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="referral-list">
                <h3>Your Referrals ({referrals.length})</h3>
                {referrals.length === 0 ? (
                  <div className="empty-state">
                    <FiUsers className="empty-icon" />
                    <p>No referrals yet</p>
                    <p className="text-secondary">Start sharing your code!</p>
                  </div>
                ) : (
                  <div className="referral-items">
                    {referrals.map(ref => (
                      <div key={ref.id} className="referral-item">
                        <div className="referral-info">
                          <div className="referral-name">
                            {ref.referred_user?.full_name || 'User'}
                          </div>
                          <div className="referral-date">
                            Joined {new Date(ref.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`referral-status ${ref.status}`}>
                          {ref.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="rewards-tab">
              <h3>Available Rewards</h3>
              <p className="text-secondary">Redeem your points for exclusive rewards</p>
              
              {rewards.length === 0 ? (
                <div className="empty-state">
                  <FiGift className="empty-icon" />
                  <p>No rewards available yet</p>
                  <p className="text-secondary">Earn more points to unlock rewards!</p>
                </div>
              ) : (
                <div className="rewards-grid">
                  {rewards.map(reward => (
                    <div key={reward.id} className="reward-card">
                      <div className="reward-image">
                        <FiGift />
                      </div>
                      <div className="reward-info">
                        <h4>{reward.reward_name}</h4>
                        <p>{reward.description}</p>
                        <div className="reward-points">{reward.points_required} points</div>
                      </div>
                      <button 
                        className="btn-primary"
                        disabled={(loyaltyData?.total_points || 0) < reward.points_required}
                        type="button"
                      >
                        {(loyaltyData?.total_points || 0) < reward.points_required ? 'Not Enough Points' : 'Redeem'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgram;
