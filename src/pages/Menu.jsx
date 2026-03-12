import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiPlus, FiHeart, FiInfo, FiStar } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { pageTransition, staggerContainer, fadeInUp } from '../utils/animations'

import Modal from '../components/Modal'
import './Menu.css'

export default function Menu() {
  const [categories, setCategories] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [filters] = useState({
    category: 'all',
    dietary: 'all',
    priceRange: 'all',
    sortBy: 'popular'
  })
  const [selectedItem, setSelectedItem] = useState(null)
  const [favorites, setFavorites] = useState(new Set())
  const { addItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
    // Subscribe to real-time menu updates
    const subscription = supabase
      .channel('menu-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'menu_items'
      }, handleMenuUpdate)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Memoize filterItems to prevent unnecessary recalculations
  const filterItems = useCallback(() => {
    let items = [...menuItems]

    // Category filter
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.menu_categories?.name === selectedCategory)
    }

    // Advanced filters
    if (filters.category !== 'all') {
      items = items.filter(item => item.category_id === filters.category)
    }

    if (filters.dietary !== 'all') {
      items = items.filter(item => {
        const dietary = item.dietary_info?.toLowerCase() || ''
        return dietary.includes(filters.dietary)
      })
    }

    if (filters.priceRange !== 'all') {
      items = items.filter(item => {
        const price = parseFloat(item.price)
        if (filters.priceRange === '0-200') return price <= 200
        if (filters.priceRange === '200-400') return price > 200 && price <= 400
        if (filters.priceRange === '400-600') return price > 400 && price <= 600
        if (filters.priceRange === '600+') return price > 600
        return true
      })
    }

    // Search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      items = items.filter(item =>
        item.name.toLowerCase().includes(lowerSearchTerm) ||
        item.description?.toLowerCase().includes(lowerSearchTerm) ||
        item.menu_categories?.name.toLowerCase().includes(lowerSearchTerm)
      )
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price-low':
        items.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        break
      case 'price-high':
        items.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
        break
      case 'rating':
        items.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'popular':
      default:
        items.sort((a, b) => (b.order_count || 0) - (a.order_count || 0))
        break
    }

    return items;
  }, [menuItems, selectedCategory, searchTerm, filters.category, filters.dietary, filters.priceRange, filters.sortBy]);

  useEffect(() => {
    const filtered = filterItems();
    setFilteredItems(filtered);
  }, [filterItems]);

  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        supabase.from('menu_categories').select('*').order('display_order'),
        supabase.from('menu_items').select('*, menu_categories(name)').eq('is_available', true)
      ])

      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (itemsRes.data) setMenuItems(itemsRes.data)
    } catch (error) {
      console.error('Error fetching menu:', error)
      toast.error('Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorite_items')
        .select('menu_item_id')
        .eq('user_id', user.id)

      if (error) throw error
      setFavorites(new Set(data?.map(f => f.menu_item_id) || []))
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const handleMenuUpdate = (payload) => {
    if (payload.eventType === 'INSERT') {
      setMenuItems(prev => [...prev, payload.new])
    } else if (payload.eventType === 'UPDATE') {
      setMenuItems(prev => prev.map(item => 
        item.id === payload.new.id ? payload.new : item
      ))
    } else if (payload.eventType === 'DELETE') {
      setMenuItems(prev => prev.filter(item => item.id !== payload.old.id))
    }
  }

  const handleAddToCart = (item, event) => {
    event?.stopPropagation()
    
    if (!user) {
      toast.error('Please login to add items to cart', {
        icon: '🔒',
        style: {
          borderRadius: '10px',
          background: '#374151',
          color: '#F9FAFB',
        },
      })
      navigate('/login')
      return
    }
    
    addItem(item)
    toast.success(`${item.name} added to cart!`, {
      icon: '🛒',
      style: {
        borderRadius: '10px',
        background: '#374151',
        color: '#F9FAFB',
      },
    })
  }

  const toggleFavorite = async (itemId, event) => {
    event?.stopPropagation()
    
    if (!user) {
      toast.error('Please login to save favorites')
      return
    }

    // Optimistic update
    const wasFavorite = favorites.has(itemId)
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (wasFavorite) {
        newFavorites.delete(itemId)
      } else {
        newFavorites.add(itemId)
      }
      return newFavorites
    })

    try {
      if (wasFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_items')
          .delete()
          .eq('user_id', user.id)
          .eq('menu_item_id', itemId)

        if (error) throw error
        toast.success('Removed from favorites')
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorite_items')
          .insert({
            user_id: user.id,
            menu_item_id: itemId
          })

        if (error) throw error
        toast.success('Added to favorites', { icon: '❤️' })
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
      // Revert optimistic update on error
      setFavorites(prev => {
        const newFavorites = new Set(prev)
        if (wasFavorite) {
          newFavorites.add(itemId)
        } else {
          newFavorites.delete(itemId)
        }
        return newFavorites
      })
    }
  }

  const getDietaryBadge = (dietaryInfo) => {
    if (!dietaryInfo) return null
    const info = dietaryInfo.toLowerCase()
    if (info.includes('vegan')) return { icon: '🌱', label: 'Vegan', color: '#10b981' }
    if (info.includes('veg')) return { icon: '🟢', label: 'Veg', color: '#22c55e' }
    if (info.includes('non-veg')) return { icon: '🔴', label: 'Non-Veg', color: '#ef4444' }
    if (info.includes('gluten-free')) return { icon: '🌾', label: 'Gluten-Free', color: '#f59e0b' }
    return null
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <motion.div 
      className="menu-page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <div className="menu-header">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Menu
          </motion.h1>
          <motion.p 
            className="text-secondary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Explore our delicious selection of authentic Indian cuisine
          </motion.p>
          
          {/* Search */}
          <motion.div 
            className="search-bar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search dishes, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </motion.div>
        </div>
      </div>

      <div className="menu-content container">
        {/* Toolbar with filters and view options */}
        <div className="menu-toolbar">
          {/* Category Filter */}
          <motion.div 
            className="category-filter"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.button
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              All
            </motion.button>
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.name)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.name}
              </motion.button>
            ))}
          </motion.div>


        </div>

        {/* Results count */}
        <motion.div 
          className="results-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="results-count">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
          </span>
        </motion.div>

        {/* Menu Items Grid */}
        <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            <motion.div 
              className="menu-grid"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              key={selectedCategory + searchTerm + JSON.stringify(filters)}
            >
              {filteredItems.map((item, index) => {
                const dietaryBadge = getDietaryBadge(item.dietary_info)
                const isFavorite = favorites.has(item.id)
                
                return (
                  <motion.div
                    key={item.id}
                    className="menu-card card"
                    variants={fadeInUp}
                    layout
                    onClick={() => setSelectedItem(item)}
                    whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)" }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.image_url && (
                      <div className="menu-image">
                        <motion.img
                          src={item.image_url}
                          alt={item.name}
                          loading={index < 6 ? 'eager' : 'lazy'}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                        <div className="menu-image-overlay">
                          <motion.button
                            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                            onClick={(e) => toggleFavorite(item.id, e)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FiHeart fill={isFavorite ? 'currentColor' : 'none'} />
                          </motion.button>
                          <motion.button
                            className="quick-view-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedItem(item)
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FiInfo />
                          </motion.button>
                        </div>
                        {item.is_featured && (
                          <motion.div 
                            className="featured-badge"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2 + index * 0.05, type: "spring" }}
                          >
                            ⭐ Featured
                          </motion.div>
                        )}
                        {dietaryBadge && (
                          <motion.div 
                            className="dietary-badge"
                            style={{ background: dietaryBadge.color }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                          >
                            <span>{dietaryBadge.icon}</span>
                            <span>{dietaryBadge.label}</span>
                          </motion.div>
                        )}
                      </div>
                    )}
                    <div className="menu-card-content">
                      <div className="menu-card-header">
                        <h3>{item.name}</h3>
                        <motion.span 
                          className="badge category-badge"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                        >
                          {item.menu_categories?.name}
                        </motion.span>
                      </div>
                      
                      {/* Rating */}
                      {item.rating && (
                        <div className="menu-rating">
                          <FiStar fill="#f59e0b" color="#f59e0b" size={14} />
                          <span>{item.rating.toFixed(1)}</span>
                          {item.review_count && (
                            <span className="review-count">({item.review_count})</span>
                          )}
                        </div>
                      )}
                      
                      {item.description && (
                        <p className="text-secondary menu-description">{item.description}</p>
                      )}
                      
                      {/* Nutritional info preview */}
                      {item.calories && (
                        <div className="nutrition-preview">
                          <span className="calories">{item.calories} cal</span>
                          {item.prep_time && (
                            <span className="prep-time">⏱️ {item.prep_time} min</span>
                          )}
                        </div>
                      )}
                      
                      <div className="menu-card-footer">
                        <motion.span 
                          className="price"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                        >
                          ₹{item.price}
                        </motion.span>
                        <motion.button
                          onClick={(e) => handleAddToCart(item, e)}
                          className="btn btn-primary btn-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiPlus size={16} />
                          <span>Add to Cart</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔍
              </motion.div>
              <h3>No items found</h3>
              <p>Try adjusting your filters or search terms</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)}>
          <div className="menu-detail-modal">
            {selectedItem.image_url && (
              <div className="modal-image">
                <img 
                  src={selectedItem.image_url} 
                  alt={selectedItem.name} 
                  onError={(e) => { e.target.style.display = 'none' }} 
                />
                {getDietaryBadge(selectedItem.dietary_info) && (
                  <div 
                    className="dietary-badge large"
                    style={{ background: getDietaryBadge(selectedItem.dietary_info).color }}
                  >
                    <span>{getDietaryBadge(selectedItem.dietary_info).icon}</span>
                    <span>{getDietaryBadge(selectedItem.dietary_info).label}</span>
                  </div>
                )}
              </div>
            )}
            <div className="modal-content-body">
              <div className="modal-header-section">
                <h2>{selectedItem.name}</h2>
                {selectedItem.rating && (
                  <div className="menu-rating large">
                    <FiStar fill="#f59e0b" color="#f59e0b" size={18} />
                    <span>{selectedItem.rating.toFixed(1)}</span>
                    {selectedItem.review_count && (
                      <span className="review-count">({selectedItem.review_count} reviews)</span>
                    )}
                  </div>
                )}
              </div>
              
              <p className="modal-description">{selectedItem.description}</p>
              
              {selectedItem.ingredients && (
                <div className="modal-section">
                  <h4>Ingredients</h4>
                  <p className="text-secondary">{selectedItem.ingredients}</p>
                </div>
              )}
              
              {(selectedItem.calories || selectedItem.protein || selectedItem.carbs || selectedItem.fat) && (
                <div className="modal-section">
                  <h4>Nutritional Information</h4>
                  <div className="nutrition-grid">
                    {selectedItem.calories && <div className="nutrition-item"><span>Calories</span><strong>{selectedItem.calories}</strong></div>}
                    {selectedItem.protein && <div className="nutrition-item"><span>Protein</span><strong>{selectedItem.protein}g</strong></div>}
                    {selectedItem.carbs && <div className="nutrition-item"><span>Carbs</span><strong>{selectedItem.carbs}g</strong></div>}
                    {selectedItem.fat && <div className="nutrition-item"><span>Fat</span><strong>{selectedItem.fat}g</strong></div>}
                  </div>
                </div>
              )}
              
              {selectedItem.allergens && (
                <div className="modal-section">
                  <h4>Allergen Information</h4>
                  <p className="text-secondary allergen-warning">⚠️ {selectedItem.allergens}</p>
                </div>
              )}
              
              <div className="modal-footer-section">
                <span className="price large">₹{selectedItem.price}</span>
                <button
                  onClick={() => {
                    handleAddToCart(selectedItem)
                    setSelectedItem(null)
                  }}
                  className="btn btn-primary"
                >
                  <FiPlus size={18} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  )
}
