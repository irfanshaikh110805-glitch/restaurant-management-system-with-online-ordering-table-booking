import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  FiPackage, 
  FiAlertTriangle, 
  FiTrendingUp, 
  FiEdit3, 
  FiSearch, 
  FiCheckCircle, 
  FiXCircle, 
  FiMinus, 
  FiPlus,
  FiRefreshCw
} from 'react-icons/fi';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import './InventoryManager.css';

const InventoryManager = () => {
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [stockUpdate, setStockUpdate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, price, is_available, stock_quantity, low_stock_threshold, image_url')
        .order('name');

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error?.message || error, error?.code || '');
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (e) => {
    if (e) e.preventDefault();
    if (!selectedItem || stockUpdate === '') return;

    try {
      setUpdating(true);
      const newQuantity = parseInt(stockUpdate, 10);
      if (isNaN(newQuantity) || newQuantity < 0) {
        toast.error('Please enter a valid quantity (0 or greater)');
        return;
      }

      const { error } = await supabase
        .from('menu_items')
        .update({ 
          stock_quantity: newQuantity,
          is_available: newQuantity > 0
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast.success(`Stock updated for ${selectedItem.name}!`, {
        icon: '📦',
        style: {
          borderRadius: '16px',
          background: '#1C1917',
          color: '#FAF7F2',
          border: '1px solid rgba(223, 191, 119, 0.4)'
        }
      });
      setShowModal(false);
      setSelectedItem(null);
      setStockUpdate('');
      fetchInventory();
    } catch (error) {
      console.error('Error updating stock:', error?.message || error, error?.code || '');
      toast.error('Failed to update stock');
    } finally {
      setUpdating(false);
    }
  };

  const getStockStatus = (item) => {
    const qty = Number(item.stock_quantity ?? 0);
    const threshold = Number(item.low_stock_threshold || 10);
    
    if (qty === 0) {
      return { 
        status: 'out', 
        label: 'Out of Stock', 
        badgeClass: 'stock-badge-out',
        icon: FiXCircle 
      };
    }
    if (qty <= threshold) {
      return { 
        status: 'low', 
        label: 'Low Stock', 
        badgeClass: 'stock-badge-low',
        icon: FiAlertTriangle 
      };
    }
    return { 
      status: 'good', 
      label: 'In Stock', 
      badgeClass: 'stock-badge-good',
      icon: FiCheckCircle 
    };
  };

  const lowStockCount = useMemo(() => {
    return inventory.filter(item => {
      const qty = Number(item.stock_quantity ?? 0);
      const threshold = Number(item.low_stock_threshold || 10);
      return qty > 0 && qty <= threshold;
    }).length;
  }, [inventory]);

  const outOfStockCount = useMemo(() => {
    return inventory.filter(item => {
      const qty = Number(item.stock_quantity ?? 0);
      return qty === 0;
    }).length;
  }, [inventory]);

  const inStockCount = useMemo(() => {
    return inventory.length - lowStockCount - outOfStockCount;
  }, [inventory, lowStockCount, outOfStockCount]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      const status = getStockStatus(item).status;
      if (statusFilter === 'low') return status === 'low';
      if (statusFilter === 'out') return status === 'out';
      if (statusFilter === 'in') return status === 'good';
      return true;
    });
  }, [inventory, searchTerm, statusFilter]);

  const adjustStockInput = (delta) => {
    const current = parseInt(stockUpdate || '0', 10);
    const nextVal = Math.max(0, current + delta);
    setStockUpdate(nextVal.toString());
  };

  return (
    <div className="inventory-manager">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1>Inventory Management</h1>
          <p className="page-subtitle">Track kitchen stock, threshold alerts, and dish availability levels</p>
        </div>
        <button 
          onClick={fetchInventory} 
          className="btn-refresh-inventory"
          title="Refresh Stock Data"
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'spinning' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="inventory-summary">
        <div 
          className={`summary-card total ${statusFilter === 'all' ? 'active-filter' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <div className="summary-icon total-icon">
            <FiPackage size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Total Items</div>
            <div className="summary-value">{inventory.length}</div>
          </div>
        </div>

        <div 
          className={`summary-card low-stock ${statusFilter === 'low' ? 'active-filter' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
        >
          <div className="summary-icon low-icon">
            <FiAlertTriangle size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Low Stock</div>
            <div className="summary-value">{lowStockCount}</div>
          </div>
        </div>

        <div 
          className={`summary-card out-stock ${statusFilter === 'out' ? 'active-filter' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'out' ? 'all' : 'out')}
        >
          <div className="summary-icon out-icon">
            <FiXCircle size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Out of Stock</div>
            <div className="summary-value">{outOfStockCount}</div>
          </div>
        </div>

        <div 
          className={`summary-card in-stock ${statusFilter === 'in' ? 'active-filter' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'in' ? 'all' : 'in')}
        >
          <div className="summary-icon in-icon">
            <FiTrendingUp size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">In Stock</div>
            <div className="summary-value">{inStockCount}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="inventory-toolbar">
        <div className="inventory-search-wrap">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="inventory-search-input"
            placeholder="Search menu items by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="inventory-filter-pills">
          <button
            className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({inventory.length})
          </button>
          <button
            className={`filter-pill ${statusFilter === 'in' ? 'active' : ''}`}
            onClick={() => setStatusFilter('in')}
          >
            In Stock ({inStockCount})
          </button>
          <button
            className={`filter-pill pill-low ${statusFilter === 'low' ? 'active' : ''}`}
            onClick={() => setStatusFilter('low')}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            className={`filter-pill pill-out ${statusFilter === 'out' ? 'active' : ''}`}
            onClick={() => setStatusFilter('out')}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Table Container */}
      {loading ? (
        <div className="inventory-loading-state">
          <div className="spinner"></div>
          <p>Loading inventory items...</p>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="inventory-empty-state">
          <FiPackage size={48} className="empty-icon" />
          <h3>No Items Found</h3>
          <p>No inventory items match your current filter or search criteria.</p>
          {(searchTerm || statusFilter !== 'all') && (
            <button 
              className="btn-clear-filters"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Price</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => {
                const stock = getStockStatus(item);
                const StatusIcon = stock.icon;
                const qty = Number(item.stock_quantity ?? 0);
                const threshold = Number(item.low_stock_threshold || 10);
                const pct = Math.min(100, Math.round((qty / Math.max(threshold * 2, 20)) * 100));

                return (
                  <tr key={item.id} className={`stock-row-${stock.status}`}>
                    <td className="item-name-cell">
                      <span className="mobile-cell-label">Item</span>
                      <div className="item-title-wrap">
                        {item.image_url && (
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            className="item-thumbnail" 
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div className="item-text-info">
                          <strong className="item-name-text">{item.name}</strong>
                          <span className="item-id-sub">Min: {threshold} units</span>
                        </div>
                      </div>
                    </td>

                    <td className="item-price-cell">
                      <span className="mobile-cell-label">Price</span>
                      <span className="price-tag">₹{Number(item.price).toFixed(2)}</span>
                    </td>

                    <td className="stock-quantity-cell">
                      <span className="mobile-cell-label">Current Stock</span>
                      <div className="quantity-bar-wrap">
                        <div className="quantity-display">
                          <span className="quantity-val">{qty}</span>
                          <span className="quantity-threshold">/ {threshold} min</span>
                        </div>
                        <div className="stock-progress-track">
                          <div 
                            className={`stock-progress-bar bar-${stock.status}`}
                            style={{ width: `${Math.max(8, pct)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="status-cell">
                      <span className="mobile-cell-label">Status</span>
                      <span className={`stock-status-pill ${stock.badgeClass}`}>
                        <StatusIcon size={13} className="status-pill-icon" />
                        <span>{stock.label}</span>
                      </span>
                    </td>

                    <td className="actions-cell" style={{ textAlign: 'right' }}>
                      <span className="mobile-cell-label">Actions</span>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setStockUpdate(String(item.stock_quantity ?? 0));
                          setShowModal(true);
                        }}
                        className="btn-update-stock"
                        type="button"
                      >
                        <FiEdit3 size={14} />
                        <span>Update Stock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Stock Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedItem(null);
          setStockUpdate('');
        }}
        title="Update Stock"
        size="small"
      >
        {selectedItem && (
          <form onSubmit={handleStockUpdate} className="stock-update-form">
            <div className="item-info-banner">
              <div className="item-banner-header">
                <h3>{selectedItem.name}</h3>
                <span className="item-banner-price">₹{Number(selectedItem.price).toFixed(2)}</span>
              </div>
              <div className="item-banner-stats">
                <div className="stat-pill">
                  <span className="stat-label">Current Stock</span>
                  <span className="stat-value">{selectedItem.stock_quantity ?? 0} units</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-label">Low Threshold</span>
                  <span className="stat-value">{selectedItem.low_stock_threshold || 10} units</span>
                </div>
              </div>
            </div>

            <div className="form-group-stock">
              <label className="form-label-stock">New Stock Quantity</label>
              <div className="quantity-input-stepper">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => adjustStockInput(-1)}
                  aria-label="Decrease by 1"
                >
                  <FiMinus size={16} />
                </button>
                <input
                  type="number"
                  className="stock-number-input"
                  value={stockUpdate}
                  onChange={(e) => setStockUpdate(e.target.value)}
                  min="0"
                  max="99999"
                  placeholder="0"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => adjustStockInput(1)}
                  aria-label="Increase by 1"
                >
                  <FiPlus size={16} />
                </button>
              </div>

              {/* Quick Adjustment Shortcuts */}
              <div className="quick-adjust-chips">
                <span className="chips-label">Quick Add:</span>
                <button type="button" className="chip-btn" onClick={() => adjustStockInput(5)}>+5</button>
                <button type="button" className="chip-btn" onClick={() => adjustStockInput(10)}>+10</button>
                <button type="button" className="chip-btn" onClick={() => adjustStockInput(25)}>+25</button>
                <button type="button" className="chip-btn" onClick={() => adjustStockInput(50)}>+50</button>
                <button type="button" className="chip-btn chip-danger" onClick={() => setStockUpdate('0')}>Set 0</button>
              </div>
            </div>

            <div className="modal-actions-bar">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSelectedItem(null);
                  setStockUpdate('');
                }}
                className="btn-modal-cancel"
                disabled={updating}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-modal-submit"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Update Stock'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default InventoryManager;

