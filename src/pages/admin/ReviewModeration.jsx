import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FiCheck, FiX, FiEye } from 'react-icons/fi';
import { formatRelativeTime } from '../../utils/helpers';
import RatingStars from '../../components/RatingStars';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import './ReviewModeration.css';

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (full_name),
          menu_items:item_id (name)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error?.message || error, error?.code || '');
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('Review approved!');
      fetchReviews();
    } catch (error) {
      console.error('Error approving review:', error?.message || error, error?.code || '');
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (reviewId) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'rejected' })
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('Review rejected');
      fetchReviews();
    } catch (error) {
      console.error('Error rejecting review:', error?.message || error, error?.code || '');
      toast.error('Failed to reject review');
    }
  };

  const handleRespond = async (reviewId, response) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ admin_response: response })
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('Response added!');
      setSelectedReview(null);
      fetchReviews();
    } catch (error) {
      console.error('Error adding response:', error?.message || error, error?.code || '');
      toast.error('Failed to add response');
    }
  };

  return (
    <div className="review-moderation">
      <div className="moderation-header">
        <h1>Review Moderation</h1>
        <div className="filter-tabs">
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <p>No {filter !== 'all' ? filter : ''} reviews found</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review.id} className={`review-card status-${review.status}`}>
              <div className="review-header">
                <div className="review-user">
                  <div className="user-avatar">
                    {review.profiles?.full_name?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="user-name">{review.profiles?.full_name || 'Anonymous'}</div>
                    <div className="review-time">{formatRelativeTime(review.created_at)}</div>
                  </div>
                </div>
                <div className="review-status">
                  <span className={`status-badge status-${review.status}`}>
                    {review.status}
                  </span>
                </div>
              </div>

              <div className="review-item">
                <strong>Item:</strong> {review.menu_items?.name || 'Unknown Item'}
              </div>

              <div className="review-rating">
                <RatingStars rating={review.rating} size="medium" />
              </div>

              <div className="review-content">
                <p>{review.review_text}</p>
              </div>

              {review.photos && review.photos.length > 0 && (
                <div className="review-photos">
                  {review.photos.map((photo, index) => (
                    <img key={index} src={photo} alt={`Review ${index + 1}`} />
                  ))}
                </div>
              )}

              {review.admin_response && (
                <div className="admin-response-display">
                  <strong>Your Response:</strong>
                  <p>{review.admin_response}</p>
                </div>
              )}

              <div className="review-actions">
                {review.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="btn-approve"
                    >
                      <FiCheck /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(review.id)}
                      className="btn-reject"
                    >
                      <FiX /> Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedReview(review)}
                  className="btn-respond"
                >
                  <FiEye /> {review.admin_response ? 'Edit Response' : 'Respond'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {selectedReview && (
        <Modal
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          title="Respond to Review"
          size="medium"
        >
          <div className="response-form">
            <div className="review-summary">
              <RatingStars rating={selectedReview.rating} size="small" />
              <p>{selectedReview.review_text}</p>
            </div>
            <textarea
              defaultValue={selectedReview.admin_response || ''}
              placeholder="Type your response here..."
              rows={5}
              id="response-text"
              className="response-textarea"
            />
            <div className="modal-actions">
              <button
                onClick={() => setSelectedReview(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const response = document.getElementById('response-text').value;
                  if (response.trim()) {
                    handleRespond(selectedReview.id, response);
                  }
                }}
                className="btn-primary"
              >
                Submit Response
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReviewModeration;
