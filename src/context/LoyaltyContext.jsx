import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const LoyaltyContext = createContext();

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within LoyaltyProvider');
  }
  return context;
};

export const LoyaltyProvider = ({ children }) => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [tierInfo, setTierInfo] = useState(null);
  const [referralCode, setReferralCode] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const TIER_THRESHOLDS = {
    bronze: { min: 0, max: 499, multiplier: 1, perks: ['5% discount on orders'] },
    silver: { min: 500, max: 1499, multiplier: 1.25, perks: ['10% discount', 'Free delivery once/month'] },
    gold: { min: 1500, max: 2999, multiplier: 1.5, perks: ['15% discount', 'Free delivery', 'Birthday special'] },
    platinum: { min: 3000, max: Infinity, multiplier: 2, perks: ['20% discount', 'Priority delivery', 'Exclusive menu access'] }
  };

  useEffect(() => {
    if (user) {
      fetchLoyaltyData();
      fetchPointsHistory();
    } else {
      // Reset state when user logs out
      setLoyaltyData(null);
      setTierInfo(null);
      setReferralCode(null);
      setPointsHistory([]);
    }
  }, [user]);

  const fetchLoyaltyData = async () => {
    try {
      // Fetch loyalty points
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setLoyaltyData(data);
        calculateTier(data.lifetime_points || 0);
      } else {
        // Create loyalty account for new user
        await createLoyaltyAccount();
      }

      // Fetch referral code from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();
      
      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    }
  };

  const createLoyaltyAccount = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_points')
        .insert({
          user_id: user.id,
          total_points: 0,
          lifetime_points: 0
        })
        .select()
        .single();

      if (error) throw error;

      setLoyaltyData(data);
      calculateTier(0);
    } catch (error) {
      console.error('Error creating loyalty account:', error);
    }
  };

  const _generateReferralCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const calculateTier = (totalPoints) => {
    let currentTier = 'bronze';
    for (const [tier, info] of Object.entries(TIER_THRESHOLDS)) {
      if (totalPoints >= info.min && totalPoints <= info.max) {
        currentTier = tier;
        setTierInfo({ tier, ...info });
        break;
      }
    }
    return currentTier;
  };

  const fetchPointsHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPointsHistory(data || []);
    } catch (error) {
      console.error('Error fetching points history:', error);
    }
  };

  const addPoints = async (points, description, orderId = null) => {
    setLoading(true);
    try {
      const multipliedPoints = Math.floor(points * (tierInfo?.multiplier || 1));

      // Add transaction
      await supabase
        .from('points_transactions')
        .insert({
          user_id: user.id,
          points: multipliedPoints,
          transaction_type: 'earned',
          description,
          reference_id: orderId
        });

      // Update total points
      const { error } = await supabase
        .from('loyalty_points')
        .update({
          total_points: (loyaltyData.total_points || 0) + multipliedPoints,
          lifetime_points: (loyaltyData.lifetime_points || 0) + multipliedPoints
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(`🎉 You earned ${multipliedPoints} points!`);
      await fetchLoyaltyData();
      await fetchPointsHistory();
    } catch (error) {
      console.error('Error adding points:', error);
      toast.error('Failed to add points');
    } finally {
      setLoading(false);
    }
  };

  const redeemPoints = async (points, description) => {
    setLoading(true);
    try {
      if (points > (loyaltyData.total_points || 0)) {
        toast.error('Insufficient points');
        return false;
      }

      // Add transaction
      await supabase
        .from('points_transactions')
        .insert({
          user_id: user.id,
          points: -points,
          transaction_type: 'redeemed',
          description
        });

      // Update current points
      const { error } = await supabase
        .from('loyalty_points')
        .update({
          total_points: (loyaltyData.total_points || 0) - points
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(`Redeemed ${points} points!`);
      await fetchLoyaltyData();
      await fetchPointsHistory();
      return true;
    } catch (error) {
      console.error('Error redeeming points:', error);
      toast.error('Failed to redeem points');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const applyReferralCode = async (code) => {
    if (!user) {
      toast.error('Please login to apply referral code');
      return false;
    }

    setLoading(true);
    try {
      // Find referrer by referral code in profiles table
      const { data: referrer, error: referrerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', code)
        .single();

      if (referrerError || !referrer) {
        toast.error('Invalid referral code');
        return false;
      }

      if (referrer.id === user.id) {
        toast.error('You cannot use your own referral code');
        return false;
      }

      // Get referrer's loyalty points
      const { data: referrerLoyalty, error: loyaltyError } = await supabase
        .from('loyalty_points')
        .select('total_points, lifetime_points')
        .eq('user_id', referrer.id)
        .single();

      if (loyaltyError) {
        console.error('Error fetching referrer loyalty:', loyaltyError);
      }

      // Check if already used
      const { data: existing, error: existingError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_user_id', user.id)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        toast.error('You have already used a referral code');
        return false;
      }

      // Bonus points
      const bonusPoints = 100;

      // Create referral record
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.id,
          referred_user_id: user.id,
          referral_code: code,
          status: 'pending',
          referrer_reward_points: bonusPoints,
          referred_reward_points: bonusPoints
        });

      if (referralError) throw referralError;

      // Referrer gets points
      const { error: transactionError } = await supabase
        .from('points_transactions')
        .insert({
          user_id: referrer.id,
          points: bonusPoints,
          transaction_type: 'earned',
          description: 'Referral bonus - Friend joined'
        });

      if (transactionError) {
        console.error('Error creating referrer transaction:', transactionError);
      }

      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({
          total_points: (referrerLoyalty?.total_points || 0) + bonusPoints,
          lifetime_points: (referrerLoyalty?.lifetime_points || 0) + bonusPoints
        })
        .eq('user_id', referrer.id);

      if (updateError) {
        console.error('Error updating referrer points:', updateError);
      }

      // Referred user gets points
      await addPoints(bonusPoints, 'Welcome bonus - Referral code applied');

      toast.success(`🎉 ${bonusPoints} welcome points added!`);
      return true;
    } catch (error) {
      console.error('Error applying referral code:', error);
      toast.error('Failed to apply referral code');
      return false;
    } finally {
      setLoading(false);
    }
  }

  const getPointsValue = (points) => {
    // 100 points = ₹10
    return points / 10;
  };

  const getNextTierInfo = () => {
    if (!tierInfo) return null;

    const tiers = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tiers.indexOf(tierInfo.tier);
    
    if (currentIndex === tiers.length - 1) {
      return null; // Already at max tier
    }

    const nextTier = tiers[currentIndex + 1];
    const nextTierInfo = TIER_THRESHOLDS[nextTier];
    const pointsNeeded = nextTierInfo.min - (loyaltyData?.lifetime_points || 0);

    return {
      tier: nextTier,
      pointsNeeded: Math.max(0, pointsNeeded),
      ...nextTierInfo
    };
  };

  const value = {
    loyaltyData,
    tierInfo,
    nextTierInfo: getNextTierInfo(),
    referralCode,
    pointsHistory,
    loading,
    addPoints,
    redeemPoints,
    applyReferralCode,
    getPointsValue,
    fetchLoyaltyData,
    TIER_THRESHOLDS
  };

  return (
    <LoyaltyContext.Provider value={value}>
      {children}
    </LoyaltyContext.Provider>
  );
};
