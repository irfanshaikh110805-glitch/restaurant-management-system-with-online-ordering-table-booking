import { FiStar } from 'react-icons/fi';
import './RatingStars.css';

const RatingStars = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'medium',
  interactive = false,
  onChange,
  showCount = false,
  count = 0
}) => {
  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleKeyDown = (e, value) => {
    if (interactive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick(value);
    }
  };

  return (
    <div className={`rating-stars rating-${size} ${interactive ? 'interactive' : ''}`}>
      <div className="stars-container">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= rating;
          const isPartial = !isFilled && starValue - 0.5 <= rating;

          return (
            <span
              key={index}
              className={`star ${isFilled ? 'filled' : ''} ${isPartial ? 'partial' : ''}`}
              onClick={() => handleClick(starValue)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            >
              <FiStar />
              {isPartial && (
                <span className="star-half">
                  <FiStar />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showCount && count > 0 && (
        <span className="rating-count">({count})</span>
      )}
    </div>
  );
};

export default RatingStars;
