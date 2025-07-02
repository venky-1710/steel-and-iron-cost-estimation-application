import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calculator, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  User
} from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout = ({ children, navigationItems, userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActiveRoute = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            <Calculator className="brand-icon" />
            <span className="brand-text">BuildEstimate</span>
          </Link>
          <button 
            className="sidebar-close"
            onClick={toggleSidebar}
          >
            <X />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path, item.exact);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <User />
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{userRole}</span>
            </div>
          </div>
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button 
              className="menu-toggle"
              onClick={toggleSidebar}
            >
              <Menu />
            </button>
            <div className="breadcrumb">
              <span className="breadcrumb-item">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
              </span>
            </div>
          </div>

          <div className="header-right">
            <button className="notification-btn" title="Notifications">
              <Bell />
              <span className="notification-badge">3</span>
            </button>

            <div className="profile-dropdown">
              <button 
                className="profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="profile-avatar">
                  <User />
                </div>
                <span className="profile-name">{user?.name}</span>
              </button>
              
              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-header">
                    <div className="profile-info">
                      <span className="profile-name">{user?.name}</span>
                      <span className="profile-email">{user?.email}</span>
                    </div>
                  </div>
                  <div className="profile-actions">
                    <button className="profile-action">
                      <User className="action-icon" />
                      Profile Settings
                    </button>
                    <button 
                      className="profile-action logout"
                      onClick={handleLogout}
                    >
                      <LogOut className="action-icon" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;