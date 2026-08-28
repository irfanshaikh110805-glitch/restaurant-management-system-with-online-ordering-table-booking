import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { FiHome, FiMenu, FiCalendar, FiShoppingBag, FiStar, FiTag, FiPackage, FiX } from 'react-icons/fi'
import './Admin.css'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-layout">
      {/* Mobile Compact Floating Button (No bulky top bar/bg) */}
      <button 
        className="admin-mobile-floating-btn"
        onClick={() => setSidebarOpen(true)}
        type="button"
        aria-label="Open Admin Menu"
      >
        <FiMenu size={18} />
        <span>Admin Menu</span>
      </button>

      {/* Backdrop for Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div 
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}


      {/* Admin Sidebar (Slide-out on mobile, fixed column on desktop) */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <button 
            className="admin-sidebar-close" 
            onClick={() => setSidebarOpen(false)}
            type="button"
            aria-label="Close Admin Menu"
          >
            <FiX size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin" end className="sidebar-link" onClick={() => setSidebarOpen(false)}>
            <FiHome size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/menu" className="sidebar-link" onClick={() => setSidebarOpen(false)}>
            <FiMenu size={20} />
            <span>Menu Management</span>
          </NavLink>
          <NavLink to="/admin/orders" className="sidebar-link" onClick={() => setSidebarOpen(false)}>
            <FiShoppingBag size={20} />
            <span>Orders</span>
          </NavLink>
          <NavLink to="/admin/bookings" className="sidebar-link" onClick={() => setSidebarOpen(false)}>
            <FiCalendar size={20} />
            <span>Bookings</span>
          </NavLink>
          <NavLink to="/admin/reviews" className="sidebar-link" onClick={() => setSidebarOpen(false)}>
            <FiStar size={20} />
            <span>Review Moderation</span>
          </NavLink>
          <NavLink to="/admin/promotions" className="sidebar-link" onClick={() => setSidebarOpen(false)}>
            <FiTag size={20} />
            <span>Promotions</span>
          </NavLink>
          <NavLink to="/admin/inventory" className="sidebar-link" onClick={() => setSidebarOpen(false)}>
            <FiPackage size={20} />
            <span>Inventory</span>
          </NavLink>
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

