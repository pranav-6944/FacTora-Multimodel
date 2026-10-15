import React, { useState, useEffect } from 'react';
import { Globe, Download, CheckCircle, RefreshCw, AlertCircle, Sparkles, Layers, ArrowRight, ShieldCheck, Terminal, ExternalLink } from 'lucide-react';
import { pingExtension, getExtensionDownloadUrl } from '../api';

export default function ExtensionHub() {
  const [pingStatus, setPingStatus] = useState(null);
  const [pingLoading, setPingLoading] = useState(true);

  const checkPing = async () => {
    setPingLoading(true);
    try {
      const data = await pingExtension();
      setPingStatus(data);
    } catch {
      setPingStatus(null);
    } finally {
      setPingLoading(false);
    }
  };

  useEffect(() => {
    checkPing();
  }, []);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      {/* Editorial Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.4rem 1.1rem', background: 'rgba(182, 124, 98, 0.1)',
          border: '1px solid rgba(182, 124, 98, 0.25)', borderRadius: '9999px',
          fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-terracotta)',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem'
        }}>
          <Globe size={14} />
          <span>Browser Integration Suite</span>
        </div>

        <h1 style={{ fontSize: '2.6rem', marginBottom: '0.75rem' }}>
          FacTora Chrome & Edge Extension
        </h1>
        <p style={{ color: 'var(--color-gray)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
          Verify claims, viral news headlines, and social media posts directly in your web browser
          with zero tab-switching. Powered by the local FacTora Multimodal inference server.
        </p>
      </div>

      {/* Live Status & Download Card */}
      <div className="editorial-card" style={{ background: '#FFF', marginBottom: '2.5rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: 12, height: 12, borderRadius: '50%',
                background: pingStatus?.status === 'online' ? 'var(--color-real)' : 'var(--color-fake)',
                boxShadow: pingStatus?.status === 'online' ? '0 0 10px rgba(127, 166, 134, 0.6)' : 'none'
              }} />
              <strong style={{ fontSize: '1.15rem', color: 'var(--color-charcoal-dark)' }}>
                {pingLoading ? 'Testing Extension Bridge...' : (pingStatus?.status === 'online' ? 'Local Bridge Active & Listening' : 'Bridge Offline (Server Offline)')}
              </strong>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--color-gray)' }}>
              Bound to <strong>http://127.0.0.1:8000</strong> • Multi-modality compatibility enabled
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={checkPing}
              style={{ fontSize: '0.88rem' }}
            >
              <RefreshCw size={14} className={pingLoading ? 'spinner' : ''} />
              <span>Ping Bridge</span>
            </button>

            <a
              href={getExtensionDownloadUrl()}
              className="btn btn-primary"
              style={{ fontSize: '0.95rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Download size={18} />
              <span>Download Extension (.ZIP)</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3-Step Setup Instructions */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem', textAlign: 'center' }}>
          3-Step Installation Guide (Manifest V3)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="editorial-card" style={{ background: '#FFF' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-terracotta-soft)', color: 'var(--color-terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1rem' }}>
              1
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Download & Unpack</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-gray)', lineHeight: '1.6' }}>
              Click the download button above to get <code>factora-multimodal-extension.zip</code>.
              Extract the contents into a folder on your computer.
            </p>
          </div>

          <div className="editorial-card" style={{ background: '#FFF' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-terracotta-soft)', color: 'var(--color-terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1rem' }}>
              2
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Enable Developer Mode</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-gray)', lineHeight: '1.6' }}>
              In Chrome, Brave, or Edge, visit <code>chrome://extensions</code> in your address bar.
              Toggle <strong>Developer Mode</strong> in the top-right corner.
            </p>
          </div>

          <div className="editorial-card" style={{ background: '#FFF' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-terracotta-soft)', color: 'var(--color-terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1rem' }}>
              3
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Click "Load Unpacked"</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-gray)', lineHeight: '1.6' }}>
              Click the <strong>Load Unpacked</strong> button and select the extracted folder.
              The FacTora icon will immediately appear in your browser toolbar!
            </p>
          </div>
        </div>
      </div>

      {/* Extension Feature Capabilities */}
      <div className="editorial-card" style={{ background: '#FAF7F0', border: '1px solid var(--color-beige-light)' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
          What the Browser Extension Does:
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div>
            <strong>1-Click Active Tab Headline Grab</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-gray)', marginTop: '0.25rem' }}>
              Automatically extracts the main <code>&lt;h1&gt;</code> claim from whatever webpage you are browsing.
            </p>
          </div>
          <div>
            <strong>Color-Coded Veracity Badge</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-gray)', marginTop: '0.25rem' }}>
              Displays instant Real vs. Fake verdicts with letter grades (A, B, D, F) and percentage scores.
            </p>
          </div>
          <div>
            <strong>Automated Domain Reliability Check</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-gray)', marginTop: '0.25rem' }}>
              Verifies the active website URL against our cataloged registry of trusted, satirical, and unreliable sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
