import './Badge.css';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'medium',
  dot = false,
  count
}) => {
  const badgeClass = `badge badge-${variant} badge-${size}`;

  if (dot) {
    return <span className="badge-dot badge-dot-${variant}"></span>;
  }

  if (count !== undefined) {
    return (
      <span className={badgeClass}>
        {count > 99 ? '99+' : count}
      </span>
    );
  }

  return (
    <span className={badgeClass}>
      {children}
    </span>
  );
};

export default Badge;
