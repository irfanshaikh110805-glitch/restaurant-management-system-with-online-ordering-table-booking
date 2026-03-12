import { FiSearch, FiX } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = ({ 
  value, 
  onChange, 
  onClear,
  placeholder = 'Search...',
  autoFocus = false 
}) => {
  return (
    <div className="search-bar">
      <FiSearch className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        autoFocus={autoFocus}
      />
      {value && (
        <button 
          onClick={onClear}
          className="search-clear"
          aria-label="Clear search"
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
