import React, { useState } from 'react';
import { X, Key, User, Shield, Check, Save } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, user, onLogout }) {
  if (!isOpen) return null;

  const [hfToken, setHfToken] = useState(localStorage.getItem('factora_user_hf_token') || '');
  const [googleKey, setGoogleKey] = useState(localStorage.getItem('factora_user_google_key') || '');
  const [newsKey, setNewsKey] = useState(localStorage.getItem('factora_user_news_key') || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (hfToken) localStorage.setItem('factora_user_hf_token', hfToken);
    else localStorage.removeItem('factora_user_hf_token');

    if (googleKey) localStorage.setItem('factora_user_google_key', googleKey);
    else localStorage.removeItem('factora_user_google_key');

    if (newsKey) localStorage.setItem('factora_user_news_key', newsKey);
    else localStorage.removeItem('factora_user_news_key');

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(58, 56, 53, 0.45)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div className="editorial-card" style={{ maxWidth: '520px', width: '100%', background: '#FFF', position: 'relative' }}>
        <button
          type="button"
          onClick={onClose}
          style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <User size={22} color="var(--color-terracotta)" />
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Account & API Settings</h2>
        </div>

        {/* Profile Info */}
        <div style={{ padding: '1rem', background: 'var(--color-ivory)', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
          <div><strong>Username:</strong> {user?.username || 'Guest'}</div>
          <div style={{ marginTop: '0.25rem' }}><strong>Email:</strong> {user?.email || 'N/A'}</div>
          <div style={{ marginTop: '0.25rem' }}><strong>Account Status:</strong> <span style={{ color: 'var(--color-real-dark)', fontWeight: 600 }}>Active Verified Session</span></div>
        </div>

        {/* API Keys Configuration Form */}
        <form onSubmit={handleSave}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Key size={15} color="var(--color-terracotta)" />
            <span>Custom Inference API Keys (Optional)</span>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Hugging Face User Token</label>
            <input
              type="password"
              className="form-input"
              placeholder="hf_..."
              value={hfToken}
              onChange={(e) => setHfToken(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Google Fact-Check API Key</label>
            <input
              type="password"
              className="form-input"
              placeholder="AIza..."
              value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>NewsAPI.org Key</label>
            <input
              type="password"
              className="form-input"
              placeholder="NewsAPI key..."
              value={newsKey}
              onChange={(e) => setNewsKey(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ color: 'var(--color-fake-dark)' }}
              onClick={() => { onLogout(); onClose(); }}
            >
              Sign Out
            </button>

            <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              {saved ? <Check size={16} /> : <Save size={16} />}
              <span>{saved ? 'Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
