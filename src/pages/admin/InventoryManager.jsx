import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FiPackage, FiAlertTriangle, FiTrendingUp, FiEdit } from 'react-icons/fi';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import './InventoryManager.css';

const InventoryManager = () => {
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stockUpdate, setStockUpdate] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, price, is_available, stock_quantity, low_stock_threshold')
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

  const handleStockUpdate = async () => {
    if (!selectedItem || !stockUpdate) return;

    try {
      const newQuantity = parseInt(stockUpdate);
      if (isNaN(newQuantity) || newQuantity < 0) {
        toast.error('Please enter a valid quantity');
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

      toast.success('Stock updated successfully!');
      setShowModal(false);
      setSelectedItem(null);
      setStockUpdate('');
      fetchInventory();
    } catch (error) {
      console.error('Error updating stock:', error?.message || error, error?.code || '');
      toast.error('Failed to update stock');
    }
  };

  const getStockStatus = (item) => {
    if (!item.stock_quantity || item.stock_quantity === 0) {
      return { status: 'out', label: 'Out of Stock', color: '#F44336' };
    }
    if (item.stock_quantity <= (item.low_stock_threshold || 10)) {
      return { status: 'low', label: 'Low Stock', color: '#FF9800' };
    }
    return { status: 'good', label: 'In Stock', color: '#4CAF50' };
  };

  const lowStockItems = inventory.filter(item => {
    const threshold = item.low_stock_threshold || 10;
    return item.stock_quantity <= threshold && item.stock_quantity > 0;
  });

  const outOfStockItems = inventory.filter(item => 
    !item.stock_quantity || item.stock_quantity === 0
  );

  return (
    <div className="inventory-manager">
      <div className="inventory-header">
        <h1>Inventory Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="inventory-summary">
        <div className="summary-card total">
          <FiPackage className="summary-icon" />
          <div className="summary-content">
            <div className="summary-label">Total Items</div>
            <div className="summary-value">{inventory.length}</div>
          </div>
        </div>

        <div className="summary-card low-stock">
          <FiAlertTriangle className="summary-icon" />
          <div className="summary-content">
            <div className="summary-label">Low Stock</div>
            <div className="summary-value">{lowStockItems.length}</div>
          </div>
        </div>

        <div className="summary-card out-stock">
          <FiAlertTriangle className="summary-icon" />
          <div className="summary-content">
            <div className="summary-label">Out of Stock</div>
            <div className="summary-value">{outOfStockItems.length}</div>
          </div>
        </div>

        <div className="summary-card in-stock">
          <FiTrendingUp className="summary-icon" />
          <div className="summary-content">
            <div className="summary-label">In Stock</div>
            <div className="summary-value">
              {inventory.length - lowStockItems.length - outOfStockItems.length}
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="loading">Loading inventory...</div>
      ) : (
        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Price</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const stock = getStockStatus(item);
                return (
                  <tr key={item.id} className={`stock-${stock.status}`}>
                    <td className="item-name">{item.name}</td>
                    <td className="item-price">₹{item.price.toFixed(2)}</td>
                    <td className="stock-quantity">
                      <div className="quantity-display">
                        <span className="quantity">{item.stock_quantity || 0}</span>
                        <span className="threshold">/ {item.low_stock_threshold || 10}</span>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="stock-badge" 
                        style={{ backgroundColor: stock.color }}
                      >
                        {stock.label}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setStockUpdate(item.stock_quantity?.toString() || '0');
                          setShowModal(true);
                        }}
                        className="btn-update"
                      >
                        <FiEdit /> Update
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
          <div className="stock-update-form">
            <div className="item-info">
              <h3>{selectedItem.name}</h3>
              <p>Current Stock: {selectedItem.stock_quantity || 0}</p>
              <p>Low Stock Threshold: {selectedItem.low_stock_threshold || 10}</p>
            </div>

            <div className="form-group">
              <label>New Stock Quantity</label>
              <input
                type="number"
                value={stockUpdate}
                onChange={(e) => setStockUpdate(e.target.value)}
                min="0"
                placeholder="Enter quantity"
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedItem(null);
                  setStockUpdate('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleStockUpdate} className="btn-primary">
                Update Stock
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InventoryManager;
