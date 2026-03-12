import { useState, useRef, useEffect } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import './MenuFilters.css';

const MenuFilters = ({ onFilterChange, categories, activeFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const [filters, setFilters] = useState({
    category: activeFilters.category || 'all',
    dietary: activeFilters.dietary || 'all',
    priceRange: activeFilters.priceRange || 'all',
    sortBy: activeFilters.sortBy || 'popular',
    ...activeFilters
  });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isOpen]);

  const dietaryOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'veg', label: '🟢 Vegetarian' },
    { value: 'non-veg', label: '🔴 Non-Vegetarian' },
    { value: 'vegan', label: '🌱 Vegan' },
    { value: 'gluten-free', label: '🌾 Gluten-Free' }
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-200', label: '₹0 - ₹200' },
    { value: '200-400', label: '₹200 - ₹400' },
    { value: '400-600', label: '₹400 - ₹600' },
    { value: '600+', label: '₹600+' }
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name', label: 'Name: A-Z' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const defaultFilters = {
      category: 'all',
      dietary: 'all',
      priceRange: 'all',
      sortBy: 'popular'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== 'all' && v !== 'popular').length;

  return (
    <div className="menu-filters">
      <button 
        ref={buttonRef}
        className="filter-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiFilter />
        Filters
        {activeFilterCount > 0 && (
          <span className="filter-count">{activeFilterCount}</span>
        )}
      </button>

      <div 
        className={`filters-panel ${isOpen ? 'open' : ''}`}
        style={{
          top: `${panelPosition.top}px`,
          right: `${panelPosition.right}px`
        }}
      >
        <div className="filters-header">
          <h3>Filters</h3>
          <div className="filters-header-actions">
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="clear-filters">
                Clear All
              </button>
            )}
            <button onClick={() => setIsOpen(false)} className="close-filters">
              <FiX />
            </button>
          </div>
        </div>

        <div className="filters-content">
          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <div className="filter-options">
              <button
                className={`filter-option ${filters.category === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('category', 'all')}
              >
                All Categories
              </button>
              {categories?.map(cat => (
                <button
                  key={cat.id}
                  className={`filter-option ${filters.category === cat.id ? 'active' : ''}`}
                  onClick={() => handleFilterChange('category', cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Filter */}
          <div className="filter-group">
            <label className="filter-label">Dietary Preferences</label>
            <div className="filter-options">
              {dietaryOptions.map(option => (
                <button
                  key={option.value}
                  className={`filter-option ${filters.dietary === option.value ? 'active' : ''}`}
                  onClick={() => handleFilterChange('dietary', option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <label className="filter-label">Price Range</label>
            <div className="filter-options">
              {priceRanges.map(range => (
                <button
                  key={range.value}
                  className={`filter-option ${filters.priceRange === range.value ? 'active' : ''}`}
                  onClick={() => handleFilterChange('priceRange', range.value)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="filter-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isOpen && <div className="filters-overlay" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default MenuFilters;
