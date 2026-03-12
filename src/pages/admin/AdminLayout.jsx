import { Outlet, NavLink } from 'react-router-dom'
import { FiHome, FiMenu, FiCalendar, FiShoppingBag, FiStar, FiTag, FiPackage } from 'react-icons/fi'
import './Admin.css'

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin" end className="sidebar-link">
            <FiHome size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/menu" className="sidebar-link">
            <FiMenu size={20} />
            <span>Menu Management</span>
          </NavLink>
          <NavLink to="/admin/orders" className="sidebar-link">
            <FiShoppingBag size={20} />
            <span>Orders</span>
          </NavLink>
          <NavLink to="/admin/bookings" className="sidebar-link">
            <FiCalendar size={20} />
            <span>Bookings</span>
          </NavLink>
          <NavLink to="/admin/reviews" className="sidebar-link">
            <FiStar size={20} />
            <span>Review Moderation</span>
          </NavLink>
          <NavLink to="/admin/promotions" className="sidebar-link">
            <FiTag size={20} />
            <span>Promotions</span>
          </NavLink>
          <NavLink to="/admin/inventory" className="sidebar-link">
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
