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
        name: formData.name,
        description: formData.description,
        price: formData.price,
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
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error saving menu item:', error?.message || error, error?.code || '')
      toast.error('Failed to save menu item')
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
    setShowCategoryModal(true)
  }

  const handleCategoryEdit = (category) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      display_order: category.display_order ?? ''
    })
    setShowCategoryModal(true)
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    const payload = {
      name: categoryForm.name,
      display_order:
        categoryForm.display_order === '' ? null : Number(categoryForm.display_order)
    }

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
      await fetchData()
    } catch (error) {
      console.error('Error saving category:', error?.message || error, error?.code || '')
      toast.error('Failed to save category')
    }
  }

  const handleCategoryDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return

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
      toast.error('Failed to delete category')
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

  if (loading) {
    return <div className="spinner"></div>
  }

  return (
    <div className="menu-management">
      <div className="page-header">
        <h1>Menu Management</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => { setShowModal(true); setEditingItem(null); resetForm(); }}
          type="button"
        >
          <FiPlus /> <span>Add Item</span>
        </button>
      </div>

      <div className="table-container card">
        <table className="data-table">
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
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    {item.image_url && <img src={item.image_url} alt={item.name} style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />}
                    {item.name}
                  </div>
                </td>
                <td>{item.menu_categories?.name}</td>
                <td>₹{item.price}</td>
                <td>
                  <button 
                    onClick={() => toggleAvailability(item)} 
                    className="toggle-btn"
                    type="button"
                    aria-label={item.is_available ? 'Mark as unavailable' : 'Mark as available'}
                  >
                    {item.is_available ? <FiToggleRight size={24} color="var(--success)" /> : <FiToggleLeft size={24} color="var(--text-muted)" />}
                  </button>
                </td>
                <td>{item.is_featured ? '⭐' : '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="icon-btn" 
                      title="Edit item"
                      type="button"
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="icon-btn danger"
                      title={item.is_available ? "Delete item (or mark unavailable if used in orders)" : "Delete item"}
                      type="button"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-container card" style={{ marginTop: '2rem' }}>
        <div className="page-header">
          <h2>Categories</h2>
          <button 
            className="btn btn-secondary" 
            onClick={openNewCategoryModal}
            type="button"
          >
            <FiPlus /> <span>Add Category</span>
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Display Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.display_order}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleCategoryEdit(category)}
                      className="icon-btn"
                      type="button"
                      aria-label="Edit category"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleCategoryDelete(category.id)}
                      className="icon-btn danger"
                      type="button"
                      aria-label="Delete category"
                    >
                      <FiTrash2 />
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  />
                  <span>Featured</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>{editingItem ? 'Update' : 'Add'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleCategorySubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Display Order</label>
                <input
                  type="number"
                  className="form-control"
                  value={categoryForm.display_order}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({
                      ...prev,
                      display_order: e.target.value
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCategoryModal(false)}
                >
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>{editingCategory ? 'Update' : 'Add'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
