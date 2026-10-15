import React, { useState } from 'react';
import { X, Shield, FileText, Cookie } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(58, 56, 53, 0.5)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1.5rem'
    }}>
      <div className="editorial-card" style={{ maxWidth: '780px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: '#FFF', position: 'relative', padding: 0 }}>
        {/* Header & Tabs */}
        <div style={{ padding: '1.5rem 1.75rem 0.75rem 1.75rem', borderBottom: '1px solid var(--color-beige-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Legal, Compliance & Transparency</h2>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray)' }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={`btn btn-pill ${activeTab === 'privacy' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
              onClick={() => setActiveTab('privacy')}
            >
              <Shield size={13} />
              <span>Privacy Policy</span>
            </button>
            <button
              type="button"
              className={`btn btn-pill ${activeTab === 'terms' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
              onClick={() => setActiveTab('terms')}
            >
              <FileText size={13} />
              <span>Terms of Service</span>
            </button>
            <button
              type="button"
              className={`btn btn-pill ${activeTab === 'cookies' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
              onClick={() => setActiveTab('cookies')}
            >
              <Cookie size={13} />
              <span>Cookies & Telemetry</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', fontSize: '0.92rem', lineHeight: '1.7', color: 'var(--color-charcoal)' }}>
          {activeTab === 'privacy' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>FacTora Privacy Policy</h3>
              <p style={{ marginBottom: '1rem' }}>
                Your privacy is paramount. FacTora Multimodal operates under strict architectural data isolation principles. All verification inquiries, uploaded audio/video files, and model inferences are tied exclusively to your authenticated user identifier.
              </p>
              <h4 style={{ fontSize: '1.05rem', margin: '1.25rem 0 0.5rem 0' }}>Data Retention & Media Handling</h4>
              <p style={{ marginBottom: '1rem' }}>
                Uploaded image, video, and audio artifacts are processed in transient upload buffers. Deepfake and acoustic forensic checks compute cryptographic hashes (SHA-256) and extract metadata without selling or distributing your content to third-party ad networks.
              </p>
              <h4 style={{ fontSize: '1.05rem', margin: '1.25rem 0 0.5rem 0' }}>Security Architecture</h4>
              <p>
                Passwords are encrypted using adaptive salt bcrypt hashing. Sessions utilize JSON Web Tokens (JWT) with standard expiration lifetimes.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Terms of Service</h3>
              <p style={{ marginBottom: '1rem' }}>
                By accessing FacTora Multimodal, you agree to utilize the platform for journalistic inquiry, academic fact-checking, and media literacy purposes.
              </p>
              <h4 style={{ fontSize: '1.05rem', margin: '1.25rem 0 0.5rem 0' }}>Probabilistic Neural Outputs</h4>
              <p style={{ marginBottom: '1rem' }}>
                FacTora provides deep learning and forensic probability estimations. While our fine-tuned transformers and forensic algorithms achieve state-of-the-art benchmark accuracy, neural outputs are probabilistic tools designed to assist human judgment, not legal verdicts.
              </p>
              <h4 style={{ fontSize: '1.05rem', margin: '1.25rem 0 0.5rem 0' }}>Fair Use & API Limits</h4>
              <p>
                Automated mass scraping of the multimodal detection endpoints without authorization is prohibited to maintain optimal response times for all users.
              </p>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Cookies & Telemetry Policy</h3>
              <p style={{ marginBottom: '1rem' }}>
                FacTora utilizes essential local storage tokens to preserve your active authentication session and personal preference selections (such as custom API keys).
              </p>
              <h4 style={{ fontSize: '1.05rem', margin: '1.25rem 0 0.5rem 0' }}>Zero Third-Party Tracking</h4>
              <p>
                We do not deploy third-party advertising cookies, cross-site trackers, or invasive telemetry beacons. Your investigations remain confidential between your browser and the FacTora server.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
