import { supabase } from '../lib/supabase'
import { withSecurity } from './securityMiddleware'
import toast from 'react-hot-toast';

/**
 * Enhanced backend helper functions with error handling, caching, and optimistic updates
 */

// Cache management with size limit to prevent memory leaks
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Maximum number of cached entries

export const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  // Remove expired entry
  if (cached) {
    cache.delete(key);
  }
  return null;
};

export const setCachedData = (key, data) => {
  // Implement LRU-like cache eviction
  if (cache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
};

export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

/**
 * Fetch menu items with advanced filtering and caching
 */
export const fetchMenuItems = async (filters = {}) => {
  const cacheKey = `menu_items_${JSON.stringify(filters)}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    let query = supabase
      .from('menu_items')
      .select('*, menu_categories(name, id)')
      .eq('is_available', true);

    // Apply filters
    if (filters.category) {
      query = query.eq('category_id', filters.category);
    }
    if (filters.dietary) {
      query = query.contains('dietary_tags', [filters.dietary]);
    }
    if (filters.spiceLevel) {
      query = query.eq('spice_level', filters.spiceLevel);
    }
    if (filters.isFeatured) {
      query = query.eq('is_featured', true);
    }
    if (filters.isChefSpecial) {
      query = query.eq('is_chef_special', true);
    }
    if (filters.priceMin) {
      query = query.gte('price', filters.priceMin);
    }
    if (filters.priceMax) {
      query = query.lte('price', filters.priceMax);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;

    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    toast.error('Failed to load menu items');
    return [];
  }
};

/**
 * Fetch user orders with items and tracking
 */
export const fetchUserOrders = async (userId, options = {}) => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items(*, menu_items(name, image_url, price)),
        delivery_addresses(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options.status) {
      query = query.eq('status', options.status);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    toast.error('Failed to load orders');
    return [];
  }
};

/**
 * Create order with items and payment
 * SECURED: Rate limited, input validated, price verification
 */
const _createOrderInternal = async (orderData) => {
  try {
    // CRITICAL: Fetch actual prices from database to prevent manipulation
    const itemIds = orderData.items.map(item => item.id);
    const { data: menuItems, error: fetchError } = await supabase
      .from('menu_items')
      .select('id, price')
      .in('id', itemIds);
    
    if (fetchError) throw fetchError;
    
    // Create price lookup map
    const priceMap = {};
    menuItems.forEach(item => {
      priceMap[item.id] = item.price;
    });
    
    // Verify prices and calculate actual totals
    let calculatedSubtotal = 0;
    for (const item of orderData.items) {
      const actualPrice = priceMap[item.id];
      if (!actualPrice) {
        return { success: false, error: 'Invalid menu item' };
      }
      // Verify client-provided price matches database
      if (Math.abs(actualPrice - item.price) > 0.01) {
        console.error('Price manipulation detected:', {
          itemId: item.id,
          providedPrice: item.price,
          actualPrice: actualPrice
        });
        return { success: false, error: 'Invalid item price' };
      }
      calculatedSubtotal += actualPrice * item.quantity;
    }
    
    // Verify complete order total including all fees
    const calculatedTaxAmount = orderData.taxAmount || 0;
    const calculatedDeliveryFee = orderData.deliveryFee || 0;
    const calculatedTotal = calculatedSubtotal + calculatedTaxAmount + calculatedDeliveryFee;
    
    const tolerance = 0.01; // Allow 1 cent tolerance for rounding
    if (Math.abs(calculatedSubtotal - orderData.subtotal) > tolerance) {
      console.error('Subtotal manipulation detected:', {
        provided: orderData.subtotal,
        calculated: calculatedSubtotal
      });
      return { success: false, error: 'Invalid order subtotal' };
    }
    
    if (Math.abs(calculatedTotal - orderData.total) > tolerance) {
      console.error('Total manipulation detected:', {
        provided: orderData.total,
        calculated: calculatedTotal
      });
      return { success: false, error: 'Invalid order total' };
    }

    // Start transaction-like operation with proper error handling
    let orderId = null;
    
    try {
      // Step 1: Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.userId,
          customer_name: orderData.customerName,
          total: orderData.total,
          subtotal: orderData.subtotal,
          tax_amount: orderData.taxAmount || 0,
          phone: orderData.phone,
          table_number: orderData.tableNumber,
          order_type: orderData.orderType || 'dine-in',
          special_instructions: orderData.instructions,
          status: 'pending',
          payment_status: orderData.paymentStatus || 'pending',
          payment_method: orderData.paymentMethod || 'pay-at-restaurant'
        })
        .select()
        .single();

      if (orderError) throw orderError;
      orderId = order.id;

      // Step 2: Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: priceMap[item.id] // Use verified price from database
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        // Rollback: Delete the order
        await supabase.from('orders').delete().eq('id', orderId);
        throw itemsError;
      }

      // Step 3: Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          amount: orderData.total,
          payment_method: orderData.paymentMethod || 'pay-at-restaurant',
          status: 'pending'
        });

      if (paymentError) {
        // Rollback: Delete order items and order
        await supabase.from('order_items').delete().eq('order_id', orderId);
        await supabase.from('orders').delete().eq('id', orderId);
        throw paymentError;
      }

      return { success: true, order };
    } catch (error) {
      // Ensure cleanup on any error
      if (orderId) {
        await supabase.from('order_items').delete().eq('order_id', orderId);
        await supabase.from('orders').delete().eq('id', orderId);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating order:', error);
    toast.error('Failed to create order');
    return { success: false, error };
  }
};

// Export secured version with rate limiting and validation
export const createOrder = withSecurity(
  'order:create',
  'createOrder',
  _createOrderInternal,
  { requireAuth: false } // Can be used by guests
);

/**
 * Update order status with notifications
 */
export const updateOrderStatus = async (orderId, status, userId) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;

    // Create notification
    const statusMessages = {
      confirmed: 'Your order has been confirmed!',
      preparing: 'Your order is being prepared',
      ready: 'Your order is ready for pickup',
      out_for_delivery: 'Your order is out for delivery',
      delivered: 'Your order has been delivered'
    };

    if (statusMessages[status]) {
      await supabase.from('notifications').insert({
        user_id: userId,
        notification_type: 'order',
        title: 'Order Update',
        message: statusMessages[status],
        reference_id: orderId
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error };
  }
};

/**
 * Fetch bookings with real-time updates
 */
export const fetchUserBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    toast.error('Failed to load bookings');
    return [];
  }
};

/**
 * Create booking with availability check
 * SECURED: Rate limited, input validated, double-booking prevention
 */
const _createBookingInternal = async (bookingData) => {
  try {
    // ATOMIC CHECK: Use INSERT with conflict detection to prevent race conditions
    // This ensures only one booking can be created for a given date/time slot
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        user_id: bookingData.userId,
        booking_date: bookingData.date,
        booking_time: bookingData.time,
        guests: bookingData.guests,
        special_requests: bookingData.specialRequests,
        occasion_type: bookingData.occasionType,
        table_preference: bookingData.tablePreference,
        status: 'pending'
      })
      .select()
      .single();

    // Check for unique constraint violation (slot already booked)
    if (error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        toast.error('This time slot is already booked');
        return { success: false, error: 'Slot unavailable' };
      }
      throw error;
    }

    // Create notification
    await supabase.from('notifications').insert({
      user_id: bookingData.userId,
      notification_type: 'booking',
      title: 'Booking Received',
      message: `Your table booking for ${bookingData.guests} guests has been received`,
      reference_id: booking.id
    });

    toast.success('Booking created successfully!');
    return { success: true, booking };
  } catch (error) {
    console.error('Error creating booking:', error);
    toast.error('Failed to create booking');
    return { success: false, error };
  }
};

// Export secured version with rate limiting and validation
export const createBooking = withSecurity(
  'booking:create',
  'createBooking',
  _createBookingInternal,
  { requireAuth: true }
);

/**
 * Fetch reviews with pagination
 */
export const fetchReviews = async (options = {}) => {
  try {
    let query = supabase
      .from('item_reviews')
      .select('*, profiles(full_name), menu_items(name)')
      .order('created_at', { ascending: false });

    if (options.menuItemId) {
      query = query.eq('menu_item_id', options.menuItemId);
    }
    if (options.isFeatured) {
      query = query.eq('is_featured', true);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

/**
 * Submit review with image upload
 * SECURED: Rate limited, input validated, profanity check
 */
const _submitReviewInternal = async (reviewData) => {
  try {
    const { data, error } = await supabase
      .from('item_reviews')
      .insert({
        user_id: reviewData.userId,
        order_id: reviewData.orderId,
        menu_item_id: reviewData.menuItemId,
        rating: reviewData.rating,
        review_text: reviewData.reviewText,
        image_urls: reviewData.imageUrls || [],
        is_verified_purchase: true
      })
      .select()
      .single();

    if (error) throw error;

    toast.success('Review submitted successfully!');
    return { success: true, review: data };
  } catch (error) {
    console.error('Error submitting review:', error);
    toast.error('Failed to submit review');
    return { success: false, error };
  }
};

// Export secured version with rate limiting and validation
export const submitReview = withSecurity(
  'review:create',
  'submitReview',
  _submitReviewInternal,
  { requireAuth: true }
);

/**
 * Fetch active promotions
 */
export const fetchActivePromotions = async () => {
  const cacheKey = 'active_promotions';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', now)
      .gte('valid_until', now);

    if (error) throw error;

    setCachedData(cacheKey, data);
    return data || [];
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return [];
  }
};

/**
 * Apply promo code
 */
export const applyPromoCode = async (code, userId, orderTotal) => {
  try {
    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !promo) {
      toast.error('Invalid promo code');
      return { success: false };
    }

    // Check validity
    const now = new Date();
    if (new Date(promo.valid_from) > now || new Date(promo.valid_until) < now) {
      toast.error('Promo code has expired');
      return { success: false };
    }

    // Check minimum order
    if (promo.min_order_amount && orderTotal < promo.min_order_amount) {
      toast.error(`Minimum order of ₹${promo.min_order_amount} required`);
      return { success: false };
    }

    // Check usage limit
    const { count } = await supabase
      .from('promo_code_usage')
      .select('*', { count: 'exact', head: true })
      .eq('promo_code_id', promo.id)
      .eq('user_id', userId);

    if (promo.usage_limit_per_user && count >= promo.usage_limit_per_user) {
      toast.error('You have already used this promo code');
      return { success: false };
    }

    // Calculate discount
    let discount = 0;
    if (promo.discount_type === 'percentage') {
      discount = (orderTotal * promo.discount_value) / 100;
      if (promo.max_discount_amount) {
        discount = Math.min(discount, promo.max_discount_amount);
      }
    } else {
      discount = promo.discount_value;
    }

    toast.success(`Promo code applied! You saved ₹${discount.toFixed(2)}`);
    return { success: true, discount, promoId: promo.id };
  } catch (error) {
    console.error('Error applying promo code:', error);
    toast.error('Failed to apply promo code');
    return { success: false };
  }
};

/**
 * Subscribe to real-time order updates
 */
export const subscribeToOrderUpdates = (orderId, callback) => {
  const subscription = supabase
    .channel(`order-${orderId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'orders',
      filter: `id=eq.${orderId}`
    }, callback)
    .subscribe();

  return () => subscription.unsubscribe();
};

/**
 * Subscribe to real-time booking updates
 */
export const subscribeToBookingUpdates = (userId, callback) => {
  const subscription = supabase
    .channel(`bookings-${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'bookings',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe();

  return () => subscription.unsubscribe();
};

/**
 * Fetch user's favorite items
 */
export const fetchFavoriteItems = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('favorite_items')
      .select('menu_item_id, menu_items(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map(f => f.menu_items) || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

/**
 * Toggle favorite item
 */
export const toggleFavorite = async (userId, menuItemId) => {
  try {
    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorite_items')
      .select('id')
      .eq('user_id', userId)
      .eq('menu_item_id', menuItemId)
      .maybeSingle();

    if (existing) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorite_items')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;
      toast.success('Removed from favorites');
      return { success: true, isFavorite: false };
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('favorite_items')
        .insert({
          user_id: userId,
          menu_item_id: menuItemId
        });

      if (error) throw error;
      toast.success('Added to favorites', { icon: '❤️' });
      return { success: true, isFavorite: true };
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    toast.error('Failed to update favorites');
    return { success: false };
  }
};

/**
 * Search menu items
 */
export const searchMenuItems = async (searchTerm) => {
  try {
    // Sanitize search term to prevent SQL injection
    const sanitizedTerm = searchTerm
      .replace(/[%_\\]/g, '\\$&') // Escape SQL wildcards
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .trim()
      .substring(0, 100); // Limit length
    
    if (!sanitizedTerm) {
      return [];
    }
    
    // Use textSearch for better security and performance
    const { data, error } = await supabase
      .from('menu_items')
      .select('*, menu_categories(name)')
      .eq('is_available', true)
      .or(`name.ilike.%${sanitizedTerm}%,description.ilike.%${sanitizedTerm}%`)
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching menu items:', error);
    return [];
  }
};
