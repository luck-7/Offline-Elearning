import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNetwork } from '../../hooks/useNetwork';
import { useNotification } from '../../contexts/NotificationContext';
import ConfirmDialog from '../UI/ConfirmDialog';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isOnline, getConnectionQuality } = useNetwork();
  const { showSuccess, showInfo } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutDialog(false);
    showSuccess('You have been successfully logged out. See you next time!', 'Logged Out');
    navigate('/');
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const connectionQuality = getConnectionQuality();

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light fixed-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <i className="bi bi-mortarboard-fill me-2 fs-4"></i>
            <span className="fw-bold">eLearning Portal</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleNavbar}
            aria-controls="navbarNav"
            aria-expanded={!isCollapsed}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/')}`} to="/">
                  <i className="bi bi-house me-1"></i>
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/courses')}`} to="/courses">
                  <i className="bi bi-book me-1"></i>
                  Courses
                </Link>
              </li>
              {isAuthenticated() && (
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i>
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>

            <ul className="navbar-nav align-items-center">
              {/* Network Status Indicator */}
              <li className="nav-item me-3">
                <span className={`badge ${isOnline ? 'bg-success' : 'bg-danger'}`}>
                  <i className={`bi ${isOnline ? 'bi-wifi' : 'bi-wifi-off'} me-1`}></i>
                  {isOnline ? connectionQuality.toUpperCase() : 'OFFLINE'}
                </span>
              </li>

              {isAuthenticated() ? (
                <>
                  {/* User Profile Dropdown */}
                  <li className="nav-item dropdown" ref={dropdownRef}>
                    <button
                      className="nav-link dropdown-toggle d-flex align-items-center btn btn-link border-0"
                      id="navbarDropdown"
                      role="button"
                      onClick={toggleDropdown}
                      aria-expanded={showDropdown}
                    >
                      <div className="avatar-circle me-2">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </div>
                      <span className="d-none d-md-inline">
                        {user?.firstName} {user?.lastName}
                      </span>
                    </button>
                    <ul className={`dropdown-menu dropdown-menu-end ${showDropdown ? 'show' : ''}`}>
                      <li>
                        <h6 className="dropdown-header">
                          <i className="bi bi-person-circle me-2"></i>
                          {user?.firstName} {user?.lastName}
                        </h6>
                      </li>
                      <li>
                        <span className="dropdown-item-text small text-muted">
                          <i className="bi bi-shield-check me-2"></i>
                          {user?.roles?.includes('ROLE_TEACHER') ? 'Teacher' : 'Student'}
                        </span>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <Link className="dropdown-item" to="/profile" onClick={closeDropdown}>
                          <i className="bi bi-person me-2"></i>
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/dashboard" onClick={closeDropdown}>
                          <i className="bi bi-speedometer2 me-2"></i>
                          Dashboard
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button
                          className="dropdown-item text-danger w-100 text-start border-0 bg-transparent"
                          onClick={() => {
                            setShowDropdown(false);
                            handleLogoutClick();
                          }}
                        >
                          <i className="bi bi-box-arrow-right me-2"></i>
                          Logout
                        </button>
                      </li>
                    </ul>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className={`nav-link ${isActive('/login')}`} to="/login">
                      <i className="bi bi-box-arrow-in-right me-1"></i>
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="btn btn-primary ms-2" to="/register">
                      <i className="bi bi-person-plus me-1"></i>
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .navbar {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .navbar-brand {
          font-size: 1.5rem;
          color: var(--primary-color) !important;
        }

        .nav-link {
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          color: var(--primary-color) !important;
          transform: translateY(-1px);
        }

        .nav-link.active {
          color: var(--primary-color) !important;
          font-weight: 600;
        }

        .dropdown-menu {
          border: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          border-radius: 10px;
          padding: 0.5rem 0;
        }

        .dropdown-item {
          padding: 0.5rem 1.5rem;
          transition: all 0.3s ease;
        }

        .dropdown-item:hover {
          background-color: rgba(102, 126, 234, 0.1);
          color: var(--primary-color);
        }

        .badge {
          font-size: 0.7rem;
          padding: 0.4rem 0.6rem;
        }

        @media (max-width: 768px) {
          .navbar-nav {
            text-align: center;
          }
          
          .dropdown-menu {
            position: static !important;
            transform: none !important;
            border: 1px solid #dee2e6;
            margin-top: 0.5rem;
          }
        }
      `}</style>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message={`Are you sure you want to logout, ${user?.firstName || 'User'}? You'll need to sign in again to access your account.`}
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="warning"
      />
    </>
  );
};

export default Navbar;
