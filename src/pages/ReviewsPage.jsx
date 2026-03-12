import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { FiStar, FiCamera, FiThumbsUp, FiThumbsDown, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Reviews.css';

const ReviewsPage = () => {
  const { itemId } = useParams();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [menuItem, setMenuItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, verified, with-photos
  const [sortBy, setSortBy] = useState('recent'); // recent, helpful, rating-high, rating-low

  // Review form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (itemId) {
      fetchMenuItem();
      fetchReviews();
    }
  }, [itemId, filter, sortBy]);

  const fetchMenuItem = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;
      setMenuItem(data);
    } catch (error) {
      console.error('Error fetching menu item:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('reviews')
        .select(`
          *,
          user:profiles(full_name, avatar_url),
          votes:review_votes(vote_type)
        `)
        .eq('item_id', itemId);

      // Apply filters
      if (filter === 'verified') {
        query = query.eq('is_verified_purchase', true);
      } else if (filter === 'with-photos') {
        query = query.not('images', 'is', null);
      }

      // Apply sorting
      switch (sortBy) {
        case 'helpful':
          query = query.order('helpful_count', { ascending: false });
          break;
        case 'rating-high':
          query = query.order('rating', { ascending: false });
          break;
        case 'rating-low':
          query = query.order('rating', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + reviewImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const uploadedUrls = [];
    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `reviews/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('review-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('review-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      }
    }

    setReviewImages([...reviewImages, ...uploadedUrls]);
  };

  const removeImage = (index) => {
    setReviewImages(reviewImages.filter((_, i) => i !== index));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (reviewText.trim().length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      // Check if user has ordered this item
      const { data: orderData } = await supabase
        .from('order_items')
        .select('id, orders(user_id)')
        .eq('item_id', itemId)
        .eq('orders.user_id', user.id)
        .limit(1)
        .single();

      const isVerifiedPurchase = !!orderData;

      const { data: _review, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          item_id: itemId,
          rating,
          review_text: reviewText,
          images: reviewImages.length > 0 ? reviewImages : null,
          is_verified_purchase: isVerifiedPurchase
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Review submitted successfully! 🎉');
      
      // Reset form
      setRating(0);
      setReviewText('');
      setReviewImages([]);
      setShowReviewForm(false);
      
      // Refresh reviews
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (reviewId, voteType) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    try {
      // Check existing vote
      const { data: existingVote } = await supabase
        .from('review_votes')
        .select('*')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote
          await supabase
            .from('review_votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Update vote
          await supabase
            .from('review_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Add new vote
        await supabase
          .from('review_votes')
          .insert({
            review_id: reviewId,
            user_id: user.id,
            vote_type: voteType
          });
      }

      fetchReviews();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 
      : 0
  }));

  return (
    <div className="reviews-page">
      <div className="container">
        {/* Header */}
        <div className="reviews-header">
          <div className="item-info">
            {menuItem && (
              <>
                <img src={menuItem.image_url} alt={menuItem.name} className="item-image" />
                <div>
                  <h1>{menuItem.name}</h1>
                  <p className="item-description">{menuItem.description}</p>
                </div>
              </>
            )}
          </div>
          
          {user && (
            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn-primary"
              type="button"
            >
              <FiMessageSquare /> Write a Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="review-form-card">
            <h3>Share Your Experience</h3>
            <form onSubmit={submitReview}>
              {/* Star Rating */}
              <div className="rating-input">
                <label>Your Rating *</label>
                <div className="stars-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <FiStar
                      key={star}
                      className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    />
                  ))}
                  <span className="rating-text">
                    {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div className="form-group">
                <label>Your Review *</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us about your experience with this dish..."
                  rows={5}
                  required
                  minLength={10}
                />
                <span className="char-count">{reviewText.length} characters</span>
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label>
                  <FiCamera /> Add Photos (Earn 50 points!) 
                  <span className="optional">- Optional but recommended</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="file-input"
                />
                
                {reviewImages.length > 0 && (
                  <div className="image-previews">
                    {reviewImages.map((url, index) => (
                      <div key={index} className="image-preview">
                        <img src={url} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="remove-image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rating Overview */}
        <div className="rating-overview">
          <div className="average-rating">
            <div className="rating-number">{averageRating}</div>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <FiStar
                  key={star}
                  className={star <= Math.round(averageRating) ? 'filled' : ''}
                />
              ))}
            </div>
            <div className="review-count">{reviews.length} reviews</div>
          </div>

          <div className="rating-distribution">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="distribution-row">
                <span className="star-label">{star} ★</span>
                <div className="distribution-bar">
                  <div 
                    className="distribution-fill" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="distribution-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="reviews-controls">
          <div className="filter-group">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              type="button"
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
              onClick={() => setFilter('verified')}
              type="button"
            >
              Verified Purchase
            </button>
            <button
              className={`filter-btn ${filter === 'with-photos' ? 'active' : ''}`}
              onClick={() => setFilter('with-photos')}
              type="button"
            >
              With Photos
            </button>
          </div>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </select>
        </div>

        {/* Reviews List */}
        <div className="reviews-list">
          {loading ? (
            <div className="loading">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="empty-state">
              <FiMessageSquare className="empty-icon" />
              <h3>No reviews yet</h3>
              <p>Be the first to review this item!</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.user?.avatar_url ? (
                        <img src={review.user.avatar_url} alt={review.user.full_name} />
                      ) : (
                        review.user?.full_name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <div className="reviewer-name">
                        {review.user?.full_name || 'Anonymous'}
                        {review.is_verified_purchase && (
                          <span className="verified-badge">✓ Verified Purchase</span>
                        )}
                      </div>
                      <div className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="review-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <FiStar
                        key={star}
                        className={star <= review.rating ? 'filled' : ''}
                      />
                    ))}
                  </div>
                </div>

                <div className="review-content">
                  <p>{review.review_text}</p>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="review-images">
                      {review.images.map((img, idx) => (
                        <img key={idx} src={img} alt={`Review image ${idx + 1}`} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="review-actions">
                  <button
                    onClick={() => handleVote(review.id, 'helpful')}
                    className="vote-btn"
                    type="button"
                  >
                    <FiThumbsUp /> Helpful ({review.helpful_count || 0})
                  </button>
                  <button
                    onClick={() => handleVote(review.id, 'not_helpful')}
                    className="vote-btn"
                    type="button"
                  >
                    <FiThumbsDown /> Not Helpful
                  </button>
                </div>

                {/* Admin response section — will be re-enabled once review_responses table is added */}

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
