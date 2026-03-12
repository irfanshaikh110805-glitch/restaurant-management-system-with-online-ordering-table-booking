import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary', fullScreen = false }) => {
  const spinnerClass = `spinner spinner-${size} spinner-${color}`;

  if (fullScreen) {
    return (
      <div className="spinner-overlay">
        <div className={spinnerClass}>
          <div className="spinner-circle"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={spinnerClass}>
      <div className="spinner-circle"></div>
    </div>
  );
};

export default LoadingSpinner;
