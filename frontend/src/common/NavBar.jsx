import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoIcon from '../auth/LogoIcon';
import { getAccountPath } from './navPaths';

function Nav({ darkMode, toggleDark, currentUser, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function goTo(path) {
    navigate(path);
    setMenuOpen(false);
  }

  function scrollToSection(id) {
    setMenuOpen(false);
    if (location.pathname === '/') {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }

  const accountPath = currentUser ? getAccountPath(currentUser) : '/login';

  return (
    <nav className="nav-main">
      <div className="nav-shell">
        <div className="nav-brand">
          <div className="logo" onClick={() => goTo('/')}>
            <LogoIcon />
            Wassali
          </div>
          <button type="button" className="mobile-menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>
            &#9776;
          </button>
        </div>

        <div className="nav-center-links">
          <a href="#" onClick={e => { e.preventDefault(); goTo('/'); }}>Home</a>
          <a href="#how" onClick={e => { e.preventDefault(); scrollToSection('how'); }}>How It Works</a>
          <a href="#faq" onClick={e => { e.preventDefault(); scrollToSection('faq'); }}>FAQ</a>
          <a href="#contact" onClick={e => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
        </div>

        <div className="nav-actions-desktop">
          {currentUser ? (
            <div className="nav-logged-in-cluster">
              <a href="#" className="notification-link nav-notify-btn" onClick={e => e.preventDefault()} aria-label="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="notification-badge">3</span>
              </a>
              <div className="nav-user nav-user--desktop">
                <div
                  className="nav-avatar"
                  onClick={() => { goTo(accountPath); }}
                  title={`${currentUser.name ?? ''} — open account`}
                >
                  {(currentUser.name ?? '?').charAt(0).toUpperCase()}
                </div>
                <button type="button" className="btn-outline btn-sm" onClick={() => { onLogout(); setMenuOpen(false); }}>
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="nav-auth-btns nav-auth-btns--inline">
              <button type="button" className="btn-ghost" onClick={() => goTo('/login')}>Log In</button>
              <button type="button" className="btn-primary" onClick={() => goTo('/register')}>Sign Up</button>
            </div>
          )}

          <svg className="filter-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" aria-hidden>
            <filter id="blurFilter">
              <feGaussianBlur stdDeviation="5" />
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" />
            </filter>
          </svg>

          <label className="dark-mode-label">
            <div className="switch">
              <input type="checkbox" checked={darkMode} onChange={toggleDark} />
              <div className="toggle-container">
                <div className="thumb"></div>
                <div className="toggle-icon-left"></div>
                <div className="toggle-icon-right"></div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className={`nav-links nav-mobile-drawer ${menuOpen ? 'active' : ''}`}>
        <a href="#" onClick={e => { e.preventDefault(); goTo('/'); }}>Home</a>
        <a href="#how" onClick={e => { e.preventDefault(); scrollToSection('how'); }}>How It Works</a>
        <a href="#faq" onClick={e => { e.preventDefault(); scrollToSection('faq'); }}>FAQ</a>
        <a href="#contact" onClick={e => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>

        <div className="nav-separator" />

        {currentUser ? (
          <>
            <a href="#" className="notification-link nav-notify-btn" onClick={e => e.preventDefault()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="notification-badge">3</span>
            </a>
            <div className="nav-user">
              <div
                className="nav-avatar"
                onClick={() => { goTo(accountPath); setMenuOpen(false); }}
                title={`${currentUser.name ?? ''} — open account`}
              >
                {(currentUser.name ?? '?').charAt(0).toUpperCase()}
              </div>
              <button type="button" className="btn-outline btn-sm" onClick={() => { onLogout(); setMenuOpen(false); }}>
                Log Out
              </button>
            </div>
          </>
        ) : (
          <div className="nav-auth-btns">
            <button type="button" className="btn-ghost" onClick={() => goTo('/login')}>Log In</button>
            <button type="button" className="btn-primary" onClick={() => goTo('/register')}>Sign Up</button>
          </div>
        )}

        <label className="dark-mode-label dark-mode-label--mobile">
          <div className="switch">
            <input type="checkbox" checked={darkMode} onChange={toggleDark} />
            <div className="toggle-container">
              <div className="thumb"></div>
              <div className="toggle-icon-left"></div>
              <div className="toggle-icon-right"></div>
            </div>
          </div>
        </label>
      </div>
    </nav>
  );
}

export default Nav;
