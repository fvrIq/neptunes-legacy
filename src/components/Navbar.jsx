import { useState, useEffect } from 'react';
import UTCClock from './UTCClock';

function Navbar({ activePage, setActivePage, theme, toggleTheme, lang, setLang, t }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'dashboard', icon: '🏠', label: t('nav.dashboard') },
    { id: 'tracking',  icon: '🗺️', label: t('nav.tracking') },
    { id: 'threats',   icon: '🚨', label: t('nav.threats') },
    { id: 'dispatch',  icon: '⚓', label: t('nav.dispatch') },
    { id: 'analytics', icon: '📊', label: t('nav.analytics') },
    { id: 'reports',   icon: '📋', label: t('nav.reports') },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Logo */}
      <div className="navbar-logo">
        <div className="navbar-logo-icon">⚓</div>
        <span className="navbar-logo-text">Neptune's Legacy</span>
      </div>

      {/* Desktop Nav Links */}
      <div className="navbar-links">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-link ${activePage === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            <span className="nav-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Right Section — Always Visible */}
      <div className="navbar-right">
        <div className="navbar-clock-desktop">
          <UTCClock />
        </div>
        <button
          className="lang-toggle"
          onClick={() => setLang(prev => prev === 'en' ? 'id' : 'en')}
          title={lang === 'en' ? 'Ganti ke Bahasa Indonesia' : 'Switch to English'}
        >
          <span className="lang-icon">🌐</span>
          <span className="lang-text">{lang === 'en' ? 'EN' : 'ID'}</span>
        </button>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Hamburger Button — Mobile Only */}
        <button
          className={`hamburger ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label="Menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-link ${activePage === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <div className="mobile-clock">
            <UTCClock />
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;