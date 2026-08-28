import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    image_url_2: '',
    is_available: true,
    is_featured: false
  })
  const [imageFiles, setImageFiles] = useState([])
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    display_order: ''
  })
  const [isSubmittingItem, setIsSubmittingItem] = useState(false)
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false)
  const [categoryError, setCategoryError] = useState('')
  const [itemError, setItemError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        supabase.from('menu_items').select('*, menu_categories(name)').order('created_at', { ascending: false }),
        supabase.from('menu_categories').select('*').order('display_order')
      ])

      if (itemsRes.data) setMenuItems(itemsRes.data)
      if (categoriesRes.data) setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Error fetching menu:', error?.message || error, error?.code || '')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setItemError('')

    const trimmedName = formData.name.trim()
    if (!trimmedName) {
      setItemError('Item name is required')
      toast.error('Item name is required')
      return
    }

    if (!formData.category_id) {
      setItemError('Please select a category')
      toast.error('Please select a category')
      return
    }

    setIsSubmittingItem(true)
    try {
      let imageUrl = formData.image_url
      let imageUrl2 = formData.image_url_2

      if (imageFiles.length > 0) {
        const filesToUpload = imageFiles.slice(0, 2)
        const uploadedUrls = []

        for (let i = 0; i < filesToUpload.length; i += 1) {
          const file = filesToUpload[i]
          const ext = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${i}.${ext}`

          try {
            const { data, error: uploadError } = await supabase.storage
              .from('menu-images')
              .upload(fileName, file)

            if (uploadError) {
              console.warn('Storage upload failed:', uploadError.message)
              toast.error('Image upload failed. Please use image URLs instead.')
              continue
            }

            const { data: publicData } = supabase.storage
              .from('menu-images')
              .getPublicUrl(data.path)

            if (publicData?.publicUrl) {
              uploadedUrls.push(publicData.publicUrl)
            }
          } catch (storageError) {
            console.warn('Storage not configured:', storageError)
            toast.error('Image upload not available. Please use image URLs.')
          }
        }

        imageUrl = uploadedUrls[0] || imageUrl
        imageUrl2 = uploadedUrls[1] || imageUrl2
      }

      const payload = {
        name: trimmedName,
        description: formData.description?.trim() || '',
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        image_url: imageUrl,
        image_url_2: imageUrl2,
        is_available: formData.is_available,
        is_featured: formData.is_featured
      }

      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(payload)
          .eq('id', editingItem.id)

        if (error) throw error
        toast.success('Menu item updated!')
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert([payload])

        if (error) throw error
        toast.success('Menu item added!')
      }

      setShowModal(false)
      setEditingItem(null)
      setItemError('')
      resetForm()
      await fetchData()
    } catch (error) {
      console.error('Error saving menu item:', error?.message || error, error?.code || '')
      if (
        error?.code === '23505' ||
        error?.status === 409 ||
        error?.message?.includes('unique constraint') ||
        error?.message?.includes('duplicate key')
      ) {
        const msg = `A menu item named "${trimmedName}" already exists.`
        setItemError(msg)
        toast.error(msg)
      } else {
        toast.error(error?.message || 'Failed to save menu item')
      }
    } finally {
      setIsSubmittingItem(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category_id: item.category_id,
      image_url: item.image_url || '',
      image_url_2: item.image_url_2 || '',
      is_available: item.is_available,
      is_featured: item.is_featured
    })
    setItemError('')
    setImageFiles([])
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      // First check if item is used in any orders
      const { data: orderItems, error: checkError } = await supabase
        .from('order_items')
        .select('id')
        .eq('menu_item_id', id)
        .limit(1)

      if (checkError) throw checkError

      if (orderItems && orderItems.length > 0) {
        toast.error('Cannot delete: This item is used in existing orders. Consider marking it as unavailable instead.')
        return
      }

      // If not used, proceed with deletion
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Menu item deleted!')
      fetchData()
    } catch (error) {
      console.error('Error deleting item:', error?.message || error, error?.code || '')
      if (error.code === '23503') {
        toast.error('Cannot delete: This item is referenced in existing orders')
      } else if (error.code === '409') {
        toast.error('Cannot delete: This item is currently in use')
      } else {
        toast.error('Failed to delete item: ' + (error.message || 'Unknown error'))
      }
    }
  }

  const toggleAvailability = async (item) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !item.is_available })
        .eq('id', item.id)

      if (error) throw error
      toast.success('Availability updated!')
      fetchData()
    } catch (error) {
      console.error('Error updating availability:', error?.message || error, error?.code || '')
      toast.error('Failed to update availability')
    }
  }

  const openNewCategoryModal = () => {
    setEditingCategory(null)
    setCategoryForm({
      name: '',
      display_order: ''
    })
    setCategoryError('')
    setShowCategoryModal(true)
  }

  const handleCategoryEdit = (category) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      display_order: category.display_order ?? ''
    })
    setCategoryError('')
    setShowCategoryModal(true)
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    setCategoryError('')

    const trimmedName = categoryForm.name.trim()
    if (!trimmedName) {
      setCategoryError('Category name is required')
      toast.error('Category name is required')
      return
    }

    // Pre-validation: check for duplicate category name (case-insensitive)
    const isDuplicate = categories.some(
      (cat) =>
        cat.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
        (!editingCategory || cat.id !== editingCategory.id)
    )

    if (isDuplicate) {
      const errMsg = `A category named "${trimmedName}" already exists.`
      setCategoryError(errMsg)
      toast.error(errMsg)
      return
    }

    const payload = {
      name: trimmedName,
      display_order:
        categoryForm.display_order === '' || categoryForm.display_order === null
          ? null
          : Number(categoryForm.display_order)
    }

    setIsSubmittingCategory(true)
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('menu_categories')
          .update(payload)
          .eq('id', editingCategory.id)
        if (error) throw error
        toast.success('Category updated!')
      } else {
        const { error } = await supabase
          .from('menu_categories')
          .insert([payload])
        if (error) throw error
        toast.success('Category added!')
      }

      setShowCategoryModal(false)
      setEditingCategory(null)
      setCategoryError('')
      await fetchData()
    } catch (error) {
      console.error('Error saving category:', error?.message || error, error?.code || '')
      if (
        error?.code === '23505' ||
        error?.status === 409 ||
        error?.message?.includes('unique constraint') ||
        error?.message?.includes('duplicate key')
      ) {
        const errMsg = `A category named "${trimmedName}" already exists.`
        setCategoryError(errMsg)
        toast.error(errMsg)
      } else if (error?.code === '23503') {
        toast.error('Cannot save: Foreign key constraint violation.')
      } else {
        toast.error(error?.message || 'Failed to save category')
      }
    } finally {
      setIsSubmittingCategory(false)
    }
  }

  const handleCategoryDelete = async (id) => {
    const affectedItems = menuItems.filter((item) => item.category_id === id)
    if (affectedItems.length > 0) {
      if (
        !confirm(
          `Warning: ${affectedItems.length} menu item(s) belong to this category. Deleting this category will affect those items. Do you want to proceed?`
        )
      ) {
        return
      }
    } else {
      if (!confirm('Are you sure you want to delete this category?')) return
    }

    try {
      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Category deleted!')
      await fetchData()
    } catch (error) {
      console.error('Error deleting category:', error?.message || error, error?.code || '')
      if (error.code === '23503') {
        toast.error('Cannot delete: This category is currently in use.')
      } else {
        toast.error(error?.message || 'Failed to delete category')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      image_url_2: '',
      is_available: true,
      is_featured: false
    })
    setImageFiles([])
  }

  const [activeTab, setActiveTab] = useState('items')

  if (loading) {
    return <div className="spinner"></div>
  }

  return (
    <div className="menu-management">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1>Menu Management</h1>
          <p className="page-subtitle">Organize culinary categories, dish pricing, photos, and live availability</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => { setShowModal(true); setEditingItem(null); resetForm(); }}
            type="button"
          >
            <FiPlus /> <span>Add Dish</span>
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={openNewCategoryModal}
            type="button"
          >
            <FiPlus /> <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher for Menu Items and Categories */}
      <div className="filter-buttons" style={{ marginBottom: '1.5rem' }}>
        <button 
          className={`filter-tab-btn ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
          type="button"
        >
          <span>Menu Items</span>
          <span className="filter-count-badge">{menuItems.length}</span>
        </button>
        <button 
          className={`filter-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
          type="button"
        >
          <span>Categories</span>
          <span className="filter-count-badge">{categories.length}</span>
        </button>
      </div>

      {activeTab === 'items' && (
        <div className="table-container card">
          <table className="data-table menu-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Available</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.id} className="menu-item-row">
                  <td className="cell-main">
                    <div className="item-identity">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="item-thumb" />
                      )}
                      <div className="item-meta">
                        <span className="item-name-text">{item.name}</span>
                        <span className="item-cat-badge">{item.menu_categories?.name || 'General'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="cell-category desktop-only">
                    {item.menu_categories?.name || 'General'}
                  </td>
                  <td className="cell-price">
                    <span className="item-price-val">₹{item.price}</span>
                  </td>
                  <td className="cell-available">
                    <div className="avail-wrap">
                      <button 
                        onClick={() => toggleAvailability(item)} 
                        className="toggle-btn"
                        type="button"
                        aria-label={item.is_available ? 'Mark as unavailable' : 'Mark as available'}
                      >
                        {item.is_available ? <FiToggleRight size={22} color="#16A34A" /> : <FiToggleLeft size={22} color="#78716C" />}
                      </button>
                      <span className="avail-text">{item.is_available ? 'Available' : 'Out'}</span>
                      {item.is_featured && <span className="featured-star" title="Featured Item">⭐</span>}
                    </div>
                  </td>
                  <td className="cell-featured desktop-only">
                    {item.is_featured ? '⭐ Featured' : '-'}
                  </td>
                  <td className="cell-actions">
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEdit(item)} 
                        className="icon-btn compact-btn" 
                        title="Edit item"
                        type="button"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="icon-btn danger compact-btn" 
                        title={item.is_available ? "Delete item (or mark unavailable if used in orders)" : "Delete item"}
                        type="button"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="table-container card">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>All Categories</h2>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={openNewCategoryModal}
              type="button"
            >
              <FiPlus /> <span>Add Category</span>
            </button>
          </div>
          <table className="data-table category-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Display Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="category-item-row">
                  <td className="cell-cat-name">
                    <strong className="item-name-text">{category.name}</strong>
                  </td>
                  <td className="cell-cat-order">
                    <span className="cat-order-pill">Order #{category.display_order}</span>
                  </td>
                  <td className="cell-cat-actions">
                    <div className="action-buttons">
                      <button
                        onClick={() => handleCategoryEdit(category)}
                        className="icon-btn compact-btn"
                        title="Edit category"
                        type="button"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleCategoryDelete(category.id)}
                        className="icon-btn danger compact-btn"
                        title="Delete category"
                        type="button"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}





      {showModal && (
        <div className="modal-overlay" onClick={() => !isSubmittingItem && setShowModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto' }}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
              <button 
                type="button" 
                className="icon-btn" 
                onClick={() => setShowModal(false)}
                disabled={isSubmittingItem}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {itemError && (
              <div 
                className="badge badge-error" 
                style={{ 
                  width: '100%', 
                  padding: '0.65rem 1rem', 
                  marginBottom: '1rem', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem'
                }}
              >
                ⚠️ {itemError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ pointerEvents: 'auto' }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({...formData, name: e.target.value})
                    if (itemError) setItemError('')
                  }}
                  disabled={isSubmittingItem}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  disabled={isSubmittingItem}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    disabled={isSubmittingItem}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-control"
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    disabled={isSubmittingItem}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL (Primary)</label>
                <input
                  type="url"
                  className="form-control"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  disabled={isSubmittingItem}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image_url && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      style={{ width: 100, height: 100, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Image URL (Secondary - Optional)</label>
                <input
                  type="url"
                  className="form-control"
                  value={formData.image_url_2}
                  onChange={(e) => setFormData({...formData, image_url_2: e.target.value})}
                  disabled={isSubmittingItem}
                  placeholder="https://example.com/image2.jpg"
                />
                {formData.image_url_2 && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <img
                      src={formData.image_url_2}
                      alt="Preview 2"
                      style={{ width: 100, height: 100, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Upload Images (max 2)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  multiple
                  disabled={isSubmittingItem}
                  onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                />
                <p className="text-secondary" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  You can upload up to 2 images or use the URLs above.
                </p>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    disabled={isSubmittingItem}
                    onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                  />
                  <span>Available</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    disabled={isSubmittingItem}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  />
                  <span>Featured</span>
                </label>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  disabled={isSubmittingItem}
                >
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingItem}>
                  <span>{isSubmittingItem ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => !isSubmittingCategory && setShowCategoryModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto' }}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button 
                type="button" 
                className="icon-btn" 
                onClick={() => setShowCategoryModal(false)}
                disabled={isSubmittingCategory}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {categoryError && (
              <div 
                className="badge badge-error" 
                style={{ 
                  width: '100%', 
                  padding: '0.65rem 1rem', 
                  marginBottom: '1rem', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem'
                }}
              >
                ⚠️ {categoryError}
              </div>
            )}

            <form onSubmit={handleCategorySubmit} className="modal-form" onClick={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto' }}>
              <div className="form-group" style={{ pointerEvents: 'auto' }}>
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={categoryForm.name}
                  onChange={(e) => {
                    setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                    if (categoryError) setCategoryError('')
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="e.g. Starters, Main Course, Desserts"
                  required
                  disabled={isSubmittingCategory}
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ pointerEvents: 'auto' }}>
                <label className="form-label">Display Order</label>
                <input
                  type="number"
                  className="form-control"
                  value={categoryForm.display_order}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, display_order: e.target.value }))}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="0"
                  disabled={isSubmittingCategory}
                  min="0"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCategoryModal(false)}
                  disabled={isSubmittingCategory}
                >
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingCategory}>
                  <span>{isSubmittingCategory ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
