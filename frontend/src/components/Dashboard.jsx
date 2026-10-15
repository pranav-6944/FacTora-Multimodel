import React, { useState, useEffect } from 'react';
import {
  BarChart3, Download, Search, Filter, ShieldCheck, AlertTriangle,
  Eye, RefreshCw, Layers, FileText, Image, Film, Mic, X, ExternalLink,
  CheckCircle2, Clock
} from 'lucide-react';
import { fetchUserAnalytics, getHistory, getExportCsvUrl, getStoredToken } from '../api';

export default function Dashboard({ onSelectRecord, onSelectAudit, onOpenAuth, user }) {
  const [analytics, setAnalytics] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModality, setSelectedModality] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [inspectingRecord, setInspectingRecord] = useState(null);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [stats, hist] = await Promise.all([
        fetchUserAnalytics(),
        getHistory(selectedModality === 'ALL' ? null : selectedModality)
      ]);
      setAnalytics(stats);
      setHistoryItems(hist.items || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedModality, user]);

  const handleDownloadCsv = () => {
    const token = getStoredToken();
    const url = getExportCsvUrl();
    // Fetch with Authorization header and trigger download
    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `factora-verification-audit-${user?.username || 'user'}.csv`;
        link.click();
      })
      .catch(err => alert('CSV download failed: ' + err.message));
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: '600px' }}>
        <div className="editorial-card" style={{ background: '#FFF' }}>
          <ShieldCheck size={48} color="var(--color-terracotta)" style={{ margin: '0 auto 1.25rem auto' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Private Audit Dashboard</h2>
          <p style={{ color: 'var(--color-gray)', marginBottom: '1.75rem' }}>
            Verification history and deep forensic telemetry are isolated to each user.
            Please sign in or create an account to view your analytics.
          </p>
          <button type="button" className="btn btn-primary" onClick={onOpenAuth}>
            Sign In to Account
          </button>
        </div>
      </div>
    );
  }

  const filteredHistory = historyItems.filter(item => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.verdict && item.verdict.toLowerCase().includes(q)) ||
      (item.modality && item.modality.toLowerCase().includes(q))
    );
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1100px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.35rem 0.9rem', background: 'rgba(182, 124, 98, 0.1)',
            borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700,
            color: 'var(--color-terracotta)', textTransform: 'uppercase', marginBottom: '0.75rem'
          }}>
            <BarChart3 size={13} />
            <span>Investigative Analytics</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', lineHeight: '1.2' }}>
            Verification Audit & Telemetry
          </h1>
          <p style={{ color: 'var(--color-gray)', fontSize: '0.95rem' }}>
            Account: <strong>{user.username}</strong> ({user.email})
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline"
          onClick={handleDownloadCsv}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Download size={16} />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="editorial-card" style={{ background: '#FFF' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gray)', textTransform: 'uppercase' }}>
              Total Claims Analyzed
            </div>
            <div style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--color-charcoal-dark)', marginTop: '0.25rem' }}>
              {analytics.total_verifications}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-gray)', marginTop: '0.3rem' }}>
              Isolated in your private ledger
            </div>
          </div>

          <div className="editorial-card" style={{ background: '#FFF' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gray)', textTransform: 'uppercase' }}>
              Verified Real
            </div>
            <div style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--color-real-dark)', marginTop: '0.25rem' }}>
              {analytics.real_percentage}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-gray)', marginTop: '0.3rem' }}>
              {analytics.real_count} authentic claims
            </div>
          </div>

          <div className="editorial-card" style={{ background: '#FFF' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gray)', textTransform: 'uppercase' }}>
              Detected Fake / Tampered
            </div>
            <div style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--color-fake-dark)', marginTop: '0.25rem' }}>
              {analytics.fake_percentage}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-gray)', marginTop: '0.3rem' }}>
              {analytics.fake_count} manipulated claims
            </div>
          </div>

          <div className="editorial-card" style={{ background: '#FFF' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gray)', textTransform: 'uppercase' }}>
              Avg. Neural Confidence
            </div>
            <div style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--color-terracotta-dark)', marginTop: '0.25rem' }}>
              {analytics.average_confidence}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-gray)', marginTop: '0.3rem' }}>
              Pure tensor softmax calibration
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics Charts Grid */}
      {analytics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Chart 1: Veracity Distribution Donut */}
          <div className="editorial-card" style={{ background: '#FFF', padding: '1.6rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Veracity Distribution</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray)', textTransform: 'uppercase' }}>
                  {analytics.total_verifications} Total
                </span>
              </div>

              {/* SVG Donut Ring */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.75rem', padding: '0.75rem 0' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="18" cy="18" r="15.915"
                      fill="none"
                      stroke="var(--color-beige-light)"
                      strokeWidth="3.6"
                    />
                    <circle
                      cx="18" cy="18" r="15.915"
                      fill="none"
                      stroke="var(--color-real)"
                      strokeWidth="3.8"
                      strokeDasharray={`${analytics.real_percentage} ${100 - analytics.real_percentage}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="18" cy="18" r="15.915"
                      fill="none"
                      stroke="var(--color-fake)"
                      strokeWidth="3.8"
                      strokeDasharray={`${analytics.fake_percentage} ${100 - analytics.fake_percentage}`}
                      strokeDashoffset={`${-analytics.real_percentage}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
                  }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-charcoal-dark)' }}>
                      {analytics.real_percentage}%
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-gray)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Real
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-real)' }} />
                      <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Authentic (Real)</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gray)', paddingLeft: '1.1rem' }}>
                      {analytics.real_count} audits ({analytics.real_percentage}%)
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-fake)' }} />
                      <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Manipulated (Fake)</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gray)', paddingLeft: '1.1rem' }}>
                      {analytics.fake_count} audits ({analytics.fake_percentage}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)', borderTop: '1px solid var(--color-beige-light)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              Tensor softmax cross-modality classification
            </div>
          </div>

          {/* Chart 2: Modality Distribution Bars */}
          <div className="editorial-card" style={{ background: '#FFF', padding: '1.6rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Modality Distribution</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray)', textTransform: 'uppercase' }}>
                  4 Pipelines
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { id: 'TEXT', label: 'News Text (RoBERTa)', icon: FileText, count: analytics.modalities?.TEXT || 0, color: 'var(--color-terracotta)' },
                  { id: 'IMAGE', label: 'Image Forensics (ELA)', icon: Image, count: analytics.modalities?.IMAGE || 0, color: 'var(--color-real)' },
                  { id: 'VIDEO', label: 'Video Deepfake (Temporal)', icon: Film, count: analytics.modalities?.VIDEO || 0, color: '#C66B6B' },
                  { id: 'AUDIO', label: 'Voice Clone (Acoustic)', icon: Mic, count: analytics.modalities?.AUDIO || 0, color: '#6B7CC6' }
                ].map((m) => {
                  const Icon = m.icon;
                  const pct = analytics.total_verifications > 0 ? Math.round((m.count / analytics.total_verifications) * 100) : 0;
                  return (
                    <div key={m.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                          <Icon size={14} color={m.color} />
                          <span>{m.label}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--color-charcoal-dark)' }}>
                          {m.count} ({pct}%)
                        </span>
                      </div>
                      <div style={{ height: '7px', background: 'var(--color-beige-light)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: m.color, borderRadius: '9999px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)', borderTop: '1px solid var(--color-beige-light)', paddingTop: '0.75rem', marginTop: '0.85rem' }}>
              Single-modality isolated memory execution
            </div>
          </div>

          {/* Chart 3: Neural Confidence Calibration Spectrum */}
          <div className="editorial-card" style={{ background: '#FFF', padding: '1.6rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Confidence Calibration</h3>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-terracotta)' }}>
                  {analytics.average_confidence}% Avg
                </span>
              </div>

              {/* Confidence Tier Stack */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-charcoal-dark)' }}>High Confidence (≥ 80%)</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-real-dark)' }}>
                      {historyItems.filter(h => h.confidence_score >= 80).length} audits
                    </span>
                  </div>
                  <div style={{ height: '7px', background: 'var(--color-beige-light)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${analytics.total_verifications > 0 ? (historyItems.filter(h => h.confidence_score >= 80).length / analytics.total_verifications) * 100 : 0}%`,
                      height: '100%', background: 'var(--color-real)', borderRadius: '9999px'
                    }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-charcoal-dark)' }}>Moderate (60% – 79%)</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-terracotta)' }}>
                      {historyItems.filter(h => h.confidence_score >= 60 && h.confidence_score < 80).length} audits
                    </span>
                  </div>
                  <div style={{ height: '7px', background: 'var(--color-beige-light)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${analytics.total_verifications > 0 ? (historyItems.filter(h => h.confidence_score >= 60 && h.confidence_score < 80).length / analytics.total_verifications) * 100 : 0}%`,
                      height: '100%', background: 'var(--color-terracotta)', borderRadius: '9999px'
                    }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-charcoal-dark)' }}>Borderline (&lt; 60%)</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-fake)' }}>
                      {historyItems.filter(h => h.confidence_score < 60).length} audits
                    </span>
                  </div>
                  <div style={{ height: '7px', background: 'var(--color-beige-light)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${analytics.total_verifications > 0 ? (historyItems.filter(h => h.confidence_score < 60).length / analytics.total_verifications) * 100 : 0}%`,
                      height: '100%', background: 'var(--color-fake)', borderRadius: '9999px'
                    }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-beige-light)', paddingTop: '0.75rem', marginTop: '0.85rem', fontSize: '0.75rem', color: 'var(--color-gray)' }}>
              <span>Confidence calibration</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>P(c) ∈ [0.0, 1.0]</span>
            </div>
          </div>
        </div>
      )}

      {/* History Table Container */}
      <div className="editorial-card" style={{ background: '#FFF', padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Modality Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {['ALL', 'TEXT', 'IMAGE', 'VIDEO', 'AUDIO'].map((mod) => (
              <button
                key={mod}
                type="button"
                className={`btn btn-pill ${selectedModality === mod ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}
                onClick={() => setSelectedModality(mod)}
              >
                {mod}
              </button>
            ))}
          </div>

          {/* Table Search */}
          <div style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.2rem', paddingRight: '0.8rem', fontSize: '0.85rem' }}
              placeholder="Search in audit log..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            <Search size={15} color="var(--color-gray)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-gray)' }}>
            <RefreshCw size={24} className="spinner" style={{ margin: '0 auto 0.75rem auto' }} />
            <div>Loading verification records...</div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-gray)' }}>
            <p>No verification records found in your account for this filter.</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-beige-light)', color: 'var(--color-charcoal-dark)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Modality</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Headline / Claim</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Verdict</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Confidence</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((rec) => {
                  const isReal = rec.verdict === 'REAL';
                  return (
                    <tr key={rec.id} style={{ borderBottom: '1px solid var(--color-ivory)', transition: 'background 0.15s ease' }}>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.82rem', color: 'var(--color-charcoal)' }}>
                          {rec.modality === 'TEXT' && <FileText size={14} />}
                          {rec.modality === 'IMAGE' && <Image size={14} />}
                          {rec.modality === 'VIDEO' && <Film size={14} />}
                          {rec.modality === 'AUDIO' && <Mic size={14} />}
                          <span>{rec.modality}</span>
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 0.5rem', maxWidth: '340px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-charcoal-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rec.title || 'Untitled Claim'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-gray)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rec.content_preview}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <span className={`verdict-badge ${isReal ? 'real' : 'fake'}`} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
                          {rec.verdict}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700, color: isReal ? 'var(--color-real-dark)' : 'var(--color-fake-dark)' }}>
                        {rec.confidence_score}%
                      </td>

                      <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.82rem', color: 'var(--color-gray)' }}>
                        {new Date(rec.created_at).toLocaleDateString()}
                      </td>

                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-pill"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
                          onClick={() => setInspectingRecord(rec)}
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Forensic Inspection Modal */}
      {inspectingRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(58, 56, 53, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-beige-light)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span className="verdict-badge" style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.65rem',
                    background: 'var(--color-ivory)',
                    color: 'var(--color-charcoal-dark)',
                    border: '1px solid var(--color-beige)'
                  }}>
                    {inspectingRecord.modality} AUDIT
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-gray)' }}>
                    Record #{inspectingRecord.id}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--color-charcoal-dark)' }}>
                  {inspectingRecord.title || 'Forensic Audit Details'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setInspectingRecord(null)}
                className="btn btn-outline"
                style={{ padding: '0.4rem', borderRadius: '50%', border: 'none', background: 'var(--color-ivory)' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Verdict Summary Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem',
              borderRadius: '16px',
              background: inspectingRecord.verdict === 'REAL' ? 'var(--color-real-soft)' : 'var(--color-fake-soft)',
              border: `1.5px solid ${inspectingRecord.verdict === 'REAL' ? 'var(--color-real)' : 'var(--color-fake)'}`,
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`verdict-badge ${inspectingRecord.verdict === 'REAL' ? 'real' : 'fake'}`} style={{ fontSize: '1.1rem', padding: '0.4rem 1.1rem' }}>
                  {inspectingRecord.verdict}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-charcoal-dark)' }}>
                    {inspectingRecord.verdict === 'REAL' ? 'Authentic / Verified Information' : 'Fabricated / Manipulated Content'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-gray)' }}>
                    Timestamp: {new Date(inspectingRecord.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: inspectingRecord.verdict === 'REAL' ? 'var(--color-real-dark)' : 'var(--color-fake-dark)' }}>
                  {inspectingRecord.confidence_score}%
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-gray)', textTransform: 'uppercase' }}>
                  Confidence
                </div>
              </div>
            </div>

            {/* Full Claim / Content Preview */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Submitted Content / Claim Text
              </div>
              <div style={{
                background: 'var(--color-ivory)',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid var(--color-beige-light)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: 'var(--color-charcoal)',
                maxHeight: '220px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {inspectingRecord.content_preview || 'No text snippet provided for this record.'}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem', borderTop: '1px solid var(--color-beige-light)', paddingTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-pill"
                onClick={() => setInspectingRecord(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="btn btn-primary btn-pill"
                onClick={() => {
                  const cb = onSelectRecord || onSelectAudit;
                  if (cb) {
                    cb(inspectingRecord);
                  }
                  setInspectingRecord(null);
                }}
              >
                <ExternalLink size={16} />
                <span>Open in Verification Hub</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
