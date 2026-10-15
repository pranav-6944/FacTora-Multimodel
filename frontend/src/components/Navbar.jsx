import React, { useState } from 'react';
import {
  Shield, User, LogOut, Clock, Key, Radio, Globe,
  Activity, Zap, BookOpen, Settings, Menu, X, ChevronDown,
  ShieldCheck, Sparkles
} from 'lucide-react';

export default function Navbar({
  activePage,
  onNavigate,
  user,
  onOpenAuth,
  onOpenHistory,
  onOpenSettings,
  onLogout
}) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'hub', label: 'Verify Hub', icon: Shield },
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'live_news', label: 'Live News', icon: Radio },
    { id: 'source_check', label: 'Source Check', icon: Globe },
    { id: 'extension', label: 'Extension', icon: Zap },
    { id: 'docs', label: 'Methodology', icon: BookOpen }
  ];

  const handleNavClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Desktop Brand Logo (Left) */}
        <button
          onClick={() => handleNavClick('hub')}
          className="brand-logo navbar-brand-desktop"
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          aria-label="FacTora Home"
        >
          <img
            src="/Horizontal_stacked_logo.png"
            alt="FacTora Multimodal AI Truth"
            style={{ height: '44px', width: 'auto', objectFit: 'contain', display: 'block' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fb = document.getElementById('navbar-brand-fallback');
              if (fb) fb.style.display = 'flex';
            }}
          />
          <div id="navbar-brand-fallback" style={{ display: 'none', alignItems: 'center', gap: '0.65rem' }}>
            <img
              src="/Logo.png"
              alt="FacTora"
              style={{ height: '38px', width: '38px', borderRadius: '8px', objectFit: 'contain' }}
            />
            <div>
              <div className="brand-title">FacTora</div>
              <div className="brand-tag">Multimodal AI Truth</div>
            </div>
          </div>
        </button>

        {/* Mobile Centered Vertical Stacked Logo */}
        <button
          onClick={() => handleNavClick('hub')}
          className="navbar-brand-mobile-center"
          aria-label="FacTora Home"
        >
          <img
            src="/Vertical_stacked_logo.png"
            alt="FacTora Multimodal AI"
            style={{ height: '54px', width: 'auto', maxHeight: '56px', objectFit: 'contain', display: 'block' }}
            onError={(e) => {
              e.currentTarget.src = '/Logo.png';
            }}
          />
        </button>

        {/* Center Navigation Links (Desktop) */}
        <nav className="nav-links" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-link-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="nav-actions">
          {user ? (
            <div className="nav-user-dropdown desktop-only">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="btn btn-outline btn-pill"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.85rem',
                  background: 'rgba(223, 217, 202, 0.45)'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: user.role === 'admin' ? '#3A3835' : 'var(--color-terracotta)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.username}</span>
                {user.role === 'admin' && (
                  <span style={{
                    fontSize: '0.62rem',
                    background: 'var(--color-terracotta)',
                    color: '#FFF',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    fontWeight: 800
                  }}>ADMIN</span>
                )}
                <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: userDropdownOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {userDropdownOpen && (
                <div className="dropdown-menu-box">
                  <div style={{ padding: '0.5rem 0.85rem', borderBottom: '1px solid var(--color-beige-light)', marginBottom: '0.4rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-charcoal-dark)' }}>{user.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)' }}>{user.email}</div>
                  </div>

                  <button
                    onClick={() => { setUserDropdownOpen(false); onOpenHistory(); }}
                    className="dropdown-item-btn"
                  >
                    <Clock size={16} />
                    <span>My History</span>
                  </button>

                  <button
                    onClick={() => { setUserDropdownOpen(false); handleNavClick('dashboard'); }}
                    className="dropdown-item-btn"
                  >
                    <Activity size={16} />
                    <span>Personal Dashboard</span>
                  </button>

                  <button
                    onClick={() => { setUserDropdownOpen(false); onOpenSettings(); }}
                    className="dropdown-item-btn"
                  >
                    <Settings size={16} />
                    <span>Settings & Keys</span>
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => { setUserDropdownOpen(false); handleNavClick('admin'); }}
                      className="dropdown-item-btn"
                      style={{ color: 'var(--color-terracotta-dark)', fontWeight: 700 }}
                    >
                      <ShieldCheck size={16} color="var(--color-terracotta)" />
                      <span>Admin Console</span>
                    </button>
                  )}

                  <div style={{ borderTop: '1px solid var(--color-beige-light)', margin: '0.4rem 0' }} />

                  <button
                    onClick={() => { setUserDropdownOpen(false); onLogout(); }}
                    className="dropdown-item-btn danger"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn btn-primary btn-pill desktop-only">
              <Key size={16} />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-nav-toggle"
            id="mobile-nav-toggle"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" style={{
          position: 'fixed',
          top: '76px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(58, 56, 53, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 998
        }} onClick={() => setMobileMenuOpen(false)}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: 'var(--color-cream-base, #F4EFE4)',
            borderBottom: '2px solid var(--color-beige)',
            padding: '1.25rem 1.25rem 2rem 1.25rem',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: 'calc(100vh - 76px)',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* User Profile Summary Card in Drawer */}
            {user ? (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '1rem',
                border: '1px solid var(--color-beige-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: user.role === 'admin' ? '#3A3835' : 'var(--color-terracotta)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 700
                }}>
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-charcoal-dark)' }}>{user.username}</span>
                    {user.role === 'admin' && (
                      <span style={{
                        fontSize: '0.62rem',
                        background: 'var(--color-terracotta)',
                        color: '#FFF',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        fontWeight: 800
                      }}>ADMIN</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-gray)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', justifyContent: 'center' }}
                >
                  <Key size={18} />
                  <span>Sign In / Register</span>
                </button>
              </div>
            )}

            {/* Navigation Pages Links */}
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-gray)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
              Platform Navigation
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`nav-link-btn ${isActive ? 'active' : ''}`}
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: '0.75rem 1rem',
                      background: isActive ? 'var(--color-terracotta-soft)' : 'transparent',
                      borderRadius: '12px',
                      color: isActive ? 'var(--color-terracotta-dark)' : 'var(--color-charcoal)'
                    }}
                  >
                    <Icon size={18} />
                    <span style={{ fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Account Specific Items Moved into Hamburger */}
            {user && (
              <>
                <div style={{
                  borderTop: '1px solid var(--color-beige-light)',
                  paddingTop: '1rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-gray)',
                  marginBottom: '0.5rem',
                  paddingLeft: '0.5rem'
                }}>
                  Account & Investigation Tools
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); onOpenHistory(); }}
                    className="nav-link-btn"
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem', borderRadius: '12px' }}
                  >
                    <Clock size={18} />
                    <span>My History</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); handleNavClick('dashboard'); }}
                    className="nav-link-btn"
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem', borderRadius: '12px' }}
                  >
                    <Activity size={18} />
                    <span>A Personal Dashboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); onOpenSettings(); }}
                    className="nav-link-btn"
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem', borderRadius: '12px' }}
                  >
                    <Settings size={18} />
                    <span>Settings & Keys</span>
                  </button>

                  {user.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); handleNavClick('admin'); }}
                      className="nav-link-btn"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        background: activePage === 'admin' ? 'var(--color-terracotta-soft)' : 'rgba(182, 124, 98, 0.08)',
                        color: 'var(--color-terracotta-dark)',
                        fontWeight: 700
                      }}
                    >
                      <ShieldCheck size={18} color="var(--color-terracotta)" />
                      <span>Admin Console</span>
                    </button>
                  )}

                  <div style={{ borderTop: '1px solid var(--color-beige-light)', margin: '0.5rem 0' }} />

                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                    className="nav-link-btn"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      color: 'var(--color-fake-dark)',
                      background: 'rgba(198, 107, 107, 0.08)'
                    }}
                  >
                    <LogOut size={18} />
                    <span style={{ fontWeight: 600 }}>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
