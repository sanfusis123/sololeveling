import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from './ThemeProvider';
import './Layout.css';

// Simple icon components
const LayoutDashboard = () => <span>📊</span>;
const Calendar = () => <span>📅</span>;
const Target = () => <span>🎯</span>;
const Brain = () => <span>🧠</span>;
const BookOpen = () => <span>📚</span>;
const PenTool = () => <span>✍️</span>;
const Sparkles = () => <span>✨</span>;
const BarChart = () => <span>📈</span>;
const User = () => <span>👤</span>;
const LogOut = () => <span>🚪</span>;
const Menu = () => <span>☰</span>;
const X = () => <span>✕</span>;
const Shield = () => <span>🛡️</span>;
const Palette = () => <span>🎨</span>;

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { currentTheme, setTheme, themes } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/calendar', icon: Calendar, label: 'Smart Calendar' },
    { path: '/improvement-log', icon: Target, label: 'Progress Tracker' },
    { path: '/flashcards', icon: Brain, label: 'Flashcards' },
    { path: '/learning-materials', icon: BookOpen, label: 'Learning Materials' },
    { path: '/diary', icon: PenTool, label: 'Diary' },
    { path: '/fun-zone', icon: Sparkles, label: 'Fun Zone' },
    { path: '/analytics', icon: BarChart, label: 'Analytics' },
    ...(user?.is_superuser ? [{ path: '/admin', icon: Shield, label: 'Admin Panel' }] : []),
  ];

  return (
    <div className="layout">
      {/* Mobile menu button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Solo Leveling</h2>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-menu-container" ref={userMenuRef}>
            <div 
              className="user-info-compact"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="user-avatar-small">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details-compact">
                <p className="user-name-compact">{user?.username}</p>
                <p className="user-email-compact">{user?.email}</p>
              </div>
              <div className={`menu-chevron ${userMenuOpen ? 'open' : ''}`}>
                ▼
              </div>
            </div>
            
            {userMenuOpen && (
              <div className="user-dropdown-menu">
                <NavLink
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => {
                    setSidebarOpen(false);
                    setUserMenuOpen(false);
                  }}
                >
                  <User />
                  <span>View Profile</span>
                </NavLink>
                
                <button 
                  className="dropdown-item" 
                  onClick={() => {
                    setThemeMenuOpen(!themeMenuOpen);
                  }}
                >
                  <Palette />
                  <span>Change Theme</span>
                </button>
                
                {themeMenuOpen && (
                  <div className="theme-submenu">
                    {Object.entries(themes).map(([key, theme]) => (
                      <button
                        key={key}
                        className={`dropdown-item theme-option ${currentTheme === key ? 'active' : ''}`}
                        onClick={() => {
                          setTheme(key);
                          setThemeMenuOpen(false);
                          setUserMenuOpen(false);
                        }}
                      >
                        <span className="theme-indicator"></span>
                        <span>{theme.name}</span>
                        {currentTheme === key && <span className="checkmark">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
                
                <button 
                  className="dropdown-item logout-item" 
                  onClick={() => {
                    handleLogout();
                    setUserMenuOpen(false);
                  }}
                >
                  <LogOut />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;