import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, Sparkles } from 'lucide-react';
import { loginUser, signupUser } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (mode === 'signup') {
        data = await signupUser(username, email, password);
      } else {
        data = await loginUser(username || email, password);
      }
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await loginUser('investigator_alice', 'PasswordAlice123!');
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError('Demo login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray)' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img
            src="/Logo.png"
            alt="FacTora"
            style={{ width: '56px', height: '56px', objectFit: 'contain', margin: '0 auto 0.75rem auto', display: 'block' }}
          />
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>
            {mode === 'login' ? 'Sign In to FacTora' : 'Create Verified Account'}
          </h2>
          <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem' }}>
            {mode === 'login'
              ? 'Access your isolated investigation records and forensic reports.'
              : 'Join with private data isolation: only you can view your scans.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', background: 'rgba(223, 217, 202, 0.4)', borderRadius: '9999px', padding: '0.25rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            style={{
              flex: 1, padding: '0.45rem', border: 'none', borderRadius: '9999px',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              background: mode === 'login' ? '#FFF' : 'transparent',
              color: mode === 'login' ? 'var(--color-charcoal-dark)' : 'var(--color-gray)'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            style={{
              flex: 1, padding: '0.45rem', border: 'none', borderRadius: '9999px',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              background: mode === 'signup' ? '#FFF' : 'transparent',
              color: mode === 'signup' ? 'var(--color-charcoal-dark)' : 'var(--color-gray)'
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'var(--color-fake-soft)', border: '1px solid var(--color-fake)', borderRadius: '10px', color: 'var(--color-fake-dark)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. news_analyst"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">{mode === 'signup' ? 'Email Address' : 'Username or Email'}</label>
            <input
              type={mode === 'signup' ? 'email' : 'text'}
              required
              className="form-input"
              placeholder={mode === 'signup' ? 'you@organization.com' : 'username or email'}
              value={mode === 'signup' ? email : (username || email)}
              onChange={(e) => {
                if (mode === 'signup') setEmail(e.target.value);
                else setUsername(e.target.value);
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-beige-light)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="btn btn-outline"
            style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem' }}
            disabled={loading}
          >
            <Sparkles size={15} color="var(--color-terracotta)" />
            <span>Quick 1-Click Demo Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
