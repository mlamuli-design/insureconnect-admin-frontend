'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'

export default function Header() {
  const pathname = usePathname()
  const initialized = useRef(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [user, setUser] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isActive = user?.status === "active"

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    const handleAuthChange = () => {
      const updatedUser = localStorage.getItem("user")
      setUser(updatedUser ? JSON.parse(updatedUser) : null)
    }

    window.addEventListener("authChanged", handleAuthChange)

    return () => {
      window.removeEventListener("authChanged", handleAuthChange)
    }
  }, [])

  // Setup mobile navigation on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("isLoggedIn")
    setUser(null)
    setMobileMenuOpen(false)
    window.dispatchEvent(new Event("authChanged"))
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header id="header" className="header d-flex align-items-center sticky-top">
        <div className="container-fluid container-xl position-relative d-flex align-items-center justify-content-between">
          <Link href="/dashboard" className="logo d-flex align-items-center me-auto" onClick={closeMobileMenu}>
    
            <h1 className="sitename">Insure<span>Connect</span></h1>
          </Link>

          {/* Desktop Navigation */}
          <nav id="navmenu" className="navmenu">
            <ul className="desktop-nav">
              <li>
                <Link href="/dashboard" className={pathname === 'dashboard' ? 'active' : ''}>
                  {/* <i className="bi bi-house-door"></i> */}
                  <span>Home</span>
                </Link>
              </li>

              <li>
                <Link href="/users" className={pathname === '/users' ? 'active' : ''}>
                  {/* <i className="bi bi-people"></i> */}
                  <span>Users</span>
                </Link>
              </li>

              <li>
                <Link href="/events" className={pathname === '/events' ? 'active' : ''}>
                  {/* <i className="bi bi-calendar-event"></i> */}
                  <span>Events</span>
                </Link>
              </li>

              <li>
                <Link href="/tests" className={pathname === '/tests' ? 'active' : ''}>
                  {/* <i className="bi bi-question-circle"></i> */}
                  <span>Tests</span>
                </Link>
              </li>


              {/* <li>
                <Link href="/certificates" className={pathname === '/certificates' ? 'active' : ''}>
                  <i className="bi bi-file-earmark-pdf"></i>
                  <span>Certificates</span>
                </Link>
              </li> */}
            </ul>

            {/* Desktop Auth Buttons */}
            <div className="auth-buttons desktop-only">
              {!user ? (
                <>
                  <button
                    className="btn-register-modal"
                    onClick={() => setShowRegisterModal(true)}
                  >
                    {/* <i className="bi bi-person-plus"></i> */}
                    <span>Register</span>
                  </button>
                  <button
                    className="btn-login-modal"
                    onClick={() => setShowLoginModal(true)}
                  >
                    {/* <i className="bi bi-box-arrow-in-right"></i> */}
                    <span>Login</span>
                  </button>
                </>
              ) : (
                <div className="user-box" onClick={handleLogout}>
                  <div className="user-avatar">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <span className="username">{user.username}</span>
                  <i className="bi bi-box-arrow-right logout-icon"></i>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button 
              className={`mobile-nav-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Sidebar Menu */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={closeMobileMenu}></div>
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-logo">
            <i className="bi bi-shield-check"></i>
            <span>Insure<span>Connect</span></span>
          </div>
          <button className="mobile-menu-close" onClick={closeMobileMenu}>
            {/* <i className="bi bi-x-lg"></i> */}
          </button>
        </div>
        <div className="mobile-menu-body">
          <ul className="mobile-nav-list">
            <li>
              <Link href="/dashboard" onClick={closeMobileMenu} className={pathname === 'dashboard' ? 'active' : ''}>
                {/* <i className="bi bi-house-door"></i> */}
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link href="/users" onClick={closeMobileMenu} className={pathname === '/users' ? 'active' : ''}>
                {/* <i className="bi bi-people"></i> */}
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link href="/events" onClick={closeMobileMenu} className={pathname === '/events' ? 'active' : ''}>
                {/* <i className="bi bi-calendar-event"></i> */}
                <span>Events</span>
              </Link>
            </li>
            {/* <li>
              <Link href="/certificates" onClick={closeMobileMenu} className={pathname === '/certificates' ? 'active' : ''}>
                <i className="bi bi-file-earmark-pdf"></i>
                <span>Certificates</span>
              </Link>
            </li> */}
            <li>
              <Link href="/tests" onClick={closeMobileMenu} className={pathname === '/tests' ? 'active' : ''}>
                {/* <i className="bi bi-question-circle"></i> */}
                <span>Tests</span>
              </Link>
            </li>
          </ul>
          
          <div className="mobile-auth-section">
            {!user ? (
              <>
                <button
                  className="mobile-register-btn"
                  onClick={() => {
                    setShowRegisterModal(true)
                    closeMobileMenu()
                  }}
                >
                  {/* <i className="bi bi-person-plus"></i> */}
                  <span>Register</span>
                </button>
                <button
                  className="mobile-login-btn"
                  onClick={() => {
                    setShowLoginModal(true)
                    closeMobileMenu()
                  }}
                >
                  {/* <i className="bi bi-box-arrow-in-right"></i> */}
                  <span>Login</span>
                </button>
              </>
            ) : (
              <>
                <div className="mobile-user-info">
                  <div className="mobile-user-avatar">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <div className="mobile-user-details">
                    <span className="mobile-username">{user.username}</span>
                    <span className="mobile-user-role">Logged In</span>
                  </div>
                </div>
                <button className="mobile-logout-btn" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)} 
      />

      <style jsx>{`
        /* Header Styles */
        .header {
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 0;
          transition: all 0.3s ease;
        }
        
        .container-fluid {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          padding: 0.75rem 1.5rem;
        }
        
        /* Logo Styles */
        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }
        
        .logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #1976d2 0%, #2563eb 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }
        
        .logo-icon i {
          font-size: 1.2rem;
          color: white;
        }
        
        .logo:hover .logo-icon {
          transform: scale(1.05);
        }
        
        .sitename {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.02em;
        }
        
        .sitename span {
          background: linear-gradient(135deg, #1976d2 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        /* Desktop Navigation */
        .navmenu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        
        .desktop-nav li a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          color: #4a5568;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          border-radius: 10px;
        }
        
        .desktop-nav li a i {
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }
        
        .desktop-nav li a:hover {
          color: #1976d2;
          background: rgba(25, 118, 210, 0.08);
        }
        
        .desktop-nav li a:hover i {
          transform: translateY(-2px);
        }
        
        .desktop-nav li a.active {
          color: #1976d2;
          background: linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%);
          font-weight: 600;
        }
        
        .desktop-nav li a.active i {
          color: #2563eb;
        }
        
        /* Desktop Auth Buttons */
        .auth-buttons {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        
        .btn-login-modal,
        .btn-register-modal {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          cursor: pointer;
          font-family: inherit;
        }
        
        .btn-login-modal {
          background: transparent;
          color: #2563eb;
          border: 1.5px solid #2563eb;
        }
        
        .btn-login-modal i {
          font-size: 1rem;
        }
        
        .btn-login-modal:hover {
          background: #2563eb;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }
        
        .btn-register-modal {
          background: linear-gradient(135deg, #1976d2 0%, #2563eb 100%);
          color: white;
          border: none;
          box-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);
        }
        
        .btn-register-modal i {
          font-size: 1rem;
        }
        
        .btn-register-modal:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(25, 118, 210, 0.3);
        }
        
        .user-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.4rem 1rem 0.4rem 0.6rem;
          background: linear-gradient(135deg, #1976d2 0%, #2563eb 100%);
          color: white;
          border-radius: 40px;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .user-avatar {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .user-avatar i {
          font-size: 1.1rem;
        }
        
        .username {
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .logout-icon {
          font-size: 1rem;
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }
        
        .user-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(25, 118, 210, 0.3);
        }
        
        .user-box:hover .logout-icon {
          opacity: 1;
        }
        
        /* Mobile Menu Toggle Button - Hamburger */
        .mobile-nav-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          width: 44px;
          height: 44px;
          position: relative;
          z-index: 1001;
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        .mobile-nav-toggle:hover {
          background: rgba(25, 118, 210, 0.08);
        }
        
        .hamburger-line {
          display: block;
          width: 24px;
          height: 2px;
          background: #1976d2;
          margin: 5px auto;
          transition: all 0.3s ease;
          border-radius: 2px;
        }
        
        .mobile-nav-toggle.active .hamburger-line:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-nav-toggle.active .hamburger-line:nth-child(2) {
          opacity: 0;
        }
        
        .mobile-nav-toggle.active .hamburger-line:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }
        
        /* Mobile Menu Overlay */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        
        .mobile-menu-overlay.active {
          opacity: 1;
          visibility: visible;
        }
        
        /* Mobile Menu Sidebar */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 85%;
          max-width: 360px;
          height: 100vh;
          background: #ffffff;
          z-index: 1001;
          transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 24px rgba(0, 0, 0, 0.12);
        }
        
        .mobile-menu.active {
          right: 0;
        }
        
        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
        }
        
        .mobile-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.3rem;
          font-weight: 700;
        }
        
        .mobile-logo i {
          font-size: 1.5rem;
          background: linear-gradient(135deg, #1976d2 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .mobile-logo span span {
          background: linear-gradient(135deg, #1976d2 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .mobile-menu-close {
          background: rgba(0, 0, 0, 0.05);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          font-size: 1.2rem;
          color: #4a5568;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .mobile-menu-close:hover {
          background: rgba(0, 0, 0, 0.1);
          transform: rotate(90deg);
        }
        
        .mobile-menu-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }
        
        .mobile-nav-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem 0;
        }
        
        .mobile-nav-list li {
          margin-bottom: 0.5rem;
        }
        
        .mobile-nav-list li a {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          color: #4a5568;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.3s ease;
          border-radius: 12px;
        }
        
        .mobile-nav-list li a i {
          font-size: 1.2rem;
          width: 24px;
          color: #1976d2;
        }
        
        .mobile-nav-list li a:hover,
        .mobile-nav-list li a.active {
          color: #1976d2;
          background: linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%);
        }
        
        .mobile-nav-list li a.active i {
          color: #2563eb;
        }
        
        .mobile-auth-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .mobile-register-btn,
        .mobile-login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.25rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s ease;
        }
        
        .mobile-register-btn {
          background: linear-gradient(135deg, #1976d2 0%, #2563eb 100%);
          color: white;
          border: none;
        }
        
        .mobile-register-btn i {
          font-size: 1.1rem;
        }
        
        .mobile-login-btn {
          background: transparent;
          color: #2563eb;
          border: 1.5px solid #2563eb;
        }
        
        .mobile-login-btn i {
          font-size: 1.1rem;
        }
        
        .mobile-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%);
          border-radius: 16px;
          margin-bottom: 0.5rem;
        }
        
        .mobile-user-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #1976d2 0%, #2563eb 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .mobile-user-avatar i {
          font-size: 1.5rem;
          color: white;
        }
        
        .mobile-user-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .mobile-username {
          font-weight: 700;
          color: #1a202c;
          font-size: 1rem;
        }
        
        .mobile-user-role {
          font-size: 0.75rem;
          color: #1976d2;
        }
        
        .mobile-logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.25rem;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s ease;
        }
        
        .mobile-logout-btn i {
          font-size: 1.1rem;
        }
        
        .mobile-logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
        }
        
        /* Responsive */
        @media (max-width: 992px) {
          .desktop-nav {
            display: none;
          }
          
          .desktop-only {
            display: none !important;
          }
          
          .mobile-nav-toggle {
            display: block;
          }
        }
        
        @media (min-width: 993px) {
          .mobile-menu,
          .mobile-menu-overlay {
            display: none;
          }
        }
        
        @media (max-width: 576px) {
          .container-fluid {
            padding: 0.5rem 1rem;
          }
          
          .logo-icon {
            width: 32px;
            height: 32px;
          }
          
          .sitename {
            font-size: 1.2rem;
          }
          
          .mobile-menu {
            width: 85%;
          }
        }
      `}</style>
    </>
  )
}