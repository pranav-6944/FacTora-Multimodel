import React, { useState, useEffect } from 'react';
import { X, Clock, FileText, Image as ImageIcon, Film, Mic, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { getHistory } from '../api';

export default function HistoryDrawer({ isOpen, onClose, onSelectRecord }) {
  if (!isOpen) return null;

  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = async (mod = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await getHistory(mod || null);
      setRecords(data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(filter);
  }, [filter]);

  const getModalityIcon = (mod) => {
    switch (mod) {
      case 'TEXT': return <FileText size={16} />;
      case 'IMAGE': return <ImageIcon size={16} />;
      case 'VIDEO': return <Film size={16} />;
      case 'AUDIO': return <Mic size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        style={{
          background: 'var(--color-ivory-light)',
          width: '100%',
          maxWidth: '520px',
          height: '100vh',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.25s ease',
          borderLeft: '1px solid var(--color-beige)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{ padding: '1.75rem', borderBottom: '1px solid var(--color-beige-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--color-terracotta)" />
              <span>Your Investigation History</span>
            </h2>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              Private data isolation: Only your personal analyses are visible.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modality Filter Pills */}
        <div style={{ padding: '1rem 1.75rem', display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--color-beige-light)', overflowX: 'auto' }}>
          {[
            { label: 'All', value: '' },
            { label: 'Text', value: 'TEXT' },
            { label: 'Image', value: 'IMAGE' },
            { label: 'Video', value: 'VIDEO' },
            { label: 'Audio', value: 'AUDIO' }
          ].map((pill) => (
            <button
              key={pill.value}
              onClick={() => setFilter(pill.value)}
              className="btn btn-pill"
              style={{
                background: filter === pill.value ? 'var(--color-terracotta)' : 'rgba(223, 217, 202, 0.4)',
                color: filter === pill.value ? '#FFF' : 'var(--color-charcoal)',
                border: 'none', fontSize: '0.78rem'
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Record List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-gray)' }}>
              Loading your records...
            </div>
          ) : error ? (
            <div style={{ padding: '1rem', background: 'var(--color-fake-soft)', color: 'var(--color-fake-dark)', borderRadius: '10px' }}>
              {error}
            </div>
          ) : records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-gray)' }}>
              <Clock size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontWeight: 600 }}>No investigations found in this category.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>Submit a claim or media file to begin.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {records.map((rec) => {
                const isReal = rec.verdict === 'REAL';
                return (
                  <div
                    key={rec.id}
                    onClick={() => { onSelectRecord(rec); onClose(); }}
                    style={{
                      padding: '1.1rem',
                      background: '#FFF',
                      borderRadius: '14px',
                      border: '1px solid var(--color-beige-light)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-terracotta)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-beige-light)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-gray)', textTransform: 'uppercase' }}>
                        {getModalityIcon(rec.modality)}
                        <span>{rec.modality}</span>
                      </span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                        background: isReal ? 'var(--color-real-soft)' : 'var(--color-fake-soft)',
                        color: isReal ? 'var(--color-real-dark)' : 'var(--color-fake-dark)'
                      }}>
                        {isReal ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        <span>{rec.verdict} ({rec.confidence_score}%)</span>
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-charcoal-dark)', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rec.title || rec.content_preview || 'Untitled Analysis'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-gray)' }}>
                      <span>{new Date(rec.created_at).toLocaleString()}</span>
                      <span style={{ color: 'var(--color-terracotta)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                        <span>View</span>
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
