import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const DeliveryContext = createContext();

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within DeliveryProvider');
  }
  return context;
};

export const DeliveryProvider = ({ children }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [tipAmount, setTipAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      // Reset state when user logs out
      setAddresses([]);
      setDefaultAddress(null);
      setDeliveryFee(0);
      setSelectedTimeSlot(null);
      setDeliveryInstructions('');
      setTipAmount(0);
    }
  }, [user]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;

      setAddresses(data || []);
      const def = data?.find(addr => addr.is_default);
      if (def) {
        setDefaultAddress(def);
        await calculateDeliveryFee(def);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load delivery addresses');
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryFee = async (address) => {
    setLoading(true);
    try {
      // Check delivery zone based on pincode
      const { data: zone, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .contains('pincodes', [address.pincode])
        .single();

      if (error || !zone) {
        setDeliveryFee(50); // Default fee if zone not found
        toast.error('Unable to calculate delivery fee for this area. Using default fee.');
        return;
      }

      // Check for available delivery fee in zone
      const baseFee = zone.delivery_fee || 50;
      
      // Add time-based surge pricing if applicable
      const hour = new Date().getHours();
      const isSurge = (hour >= 19 && hour <= 21); // 7 PM - 9 PM surge
      const surgeFee = isSurge ? 20 : 0;

      setDeliveryFee(baseFee + surgeFee);
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      setDeliveryFee(50);
      toast.error('Failed to calculate delivery fee. Using default fee.');
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (addressData) => {
    setLoading(true);
    try {
      // If this is set as default, unset others first
      if (addressData.is_default) {
        await supabase
          .from('delivery_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('delivery_addresses')
        .insert({
          user_id: user.id,
          ...addressData
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Address added successfully!');
      await fetchAddresses();
      return data;
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id, addressData) => {
    setLoading(true);
    try {
      if (addressData.is_default) {
        await supabase
          .from('delivery_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { error } = await supabase
        .from('delivery_addresses')
        .update(addressData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Address updated successfully!');
      await fetchAddresses();
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('delivery_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Address deleted successfully!');
      await fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setAddressAsDefault = async (id) => {
    setLoading(true);
    try {
      await supabase
        .from('delivery_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('delivery_addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast.success('Default address updated!');
      await fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address');
    } finally {
      setLoading(false);
    }
  };

  const selectAddress = async (address) => {
    setDefaultAddress(address);
    // Calculate delivery fee asynchronously
    try {
      await calculateDeliveryFee(address);
    } catch (err) {
      console.error('Error calculating delivery fee:', err);
    }
  };

  const value = {
    addresses,
    defaultAddress,
    deliveryFee,
    selectedTimeSlot,
    setSelectedTimeSlot,
    deliveryInstructions,
    setDeliveryInstructions,
    tipAmount,
    setTipAmount,
    loading,
    addAddress,
    updateAddress,
    deleteAddress,
    setAddressAsDefault,
    selectAddress,
    calculateDeliveryFee,
    fetchAddresses
  };

  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  );
};
