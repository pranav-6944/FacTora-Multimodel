import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Users, Database, FileText, Trash2, UserX,
  CheckCircle2, XCircle, Search, RefreshCw, Cpu, MessageSquare,
  AlertTriangle, Filter, Eye, X, ArrowUpDown, ChevronRight, Activity
} from 'lucide-react';
import {
  fetchAdminOverview, fetchAdminUsers, toggleUserRole, deleteUserAccount,
  fetchAdminRecords, deleteAdminRecord, purgeAllAdminRecords,
  fetchAdminFeedback, deleteAdminFeedback, fetchAdminModelLifecycle
} from '../api';

export default function AdminPanel({ onNavigateToHub }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'records' | 'feedback' | 'telemetry'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data states
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [telemetryData, setTelemetryData] = useState(null);

  // Filters & Selected Record for inspection
  const [filterModality, setFilterModality] = useState('');
  const [filterVerdict, setFilterVerdict] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectRecord, setInspectRecord] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'overview') {
        const ov = await fetchAdminOverview();
        setOverview(ov);
      } else if (activeTab === 'users') {
        const u = await fetchAdminUsers();
        setUsers(u.users || []);
      } else if (activeTab === 'records') {
        const r = await fetchAdminRecords({
          modality: filterModality,
          verdict: filterVerdict
        });
        setRecords(r.records || []);
      } else if (activeTab === 'feedback') {
        const fb = await fetchAdminFeedback();
        setFeedback(fb.feedback || []);
      } else if (activeTab === 'telemetry') {
        const tel = await fetchAdminModelLifecycle();
        setTelemetryData(tel);
      }
    } catch (err) {
      setError(err.message || 'Failed to load administrative data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, filterModality, filterVerdict]);

  const handleToggleRole = async (userId) => {
    try {
      await toggleUserRole(userId);
      setSuccessMsg(`User role updated successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${username}" and all their verification history?`)) return;
    try {
      await deleteUserAccount(userId);
      setSuccessMsg(`User "${username}" was deleted.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm(`Delete audit record #${recordId}?`)) return;
    try {
      await deleteAdminRecord(recordId);
      setSuccessMsg(`Record #${recordId} deleted.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      if (inspectRecord?.id === recordId) setInspectRecord(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePurgeAllRecords = async () => {
    if (!window.confirm('⚠️ DANGER: Are you sure you want to delete ALL verification audit records across all users? This action is permanent!')) return;
    try {
      await purgeAllAdminRecords();
      setSuccessMsg('All platform audit records have been purged.');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      await deleteAdminFeedback(feedbackId);
      setSuccessMsg('Feedback entry removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredRecords = records.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.username && r.username.toLowerCase().includes(q)) ||
      (r.content_preview && r.content_preview.toLowerCase().includes(q))
    );
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1rem', maxWidth: '1200px' }}>
      {/* Header Banner */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        border: '1px solid var(--color-beige-light)',
        boxShadow: 'var(--shadow-subtle)',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.9rem',
            background: 'rgba(182, 124, 98, 0.12)',
            borderRadius: '9999px',
            color: 'var(--color-terracotta)',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.75rem'
          }}>
            <ShieldCheck size={16} />
            <span>Master Administration Console</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-charcoal-dark)', margin: '0 0 0.5rem 0' }}>
            System Data & Model Operations
          </h1>
          <p style={{ color: 'var(--color-gray)', margin: 0, fontSize: '0.95rem' }}>
            Inspect all users, audit ledgers across modalities, user feedback, and genuine neural lifecycle telemetries.
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn btn-outline btn-pill"
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={15} className={loading ? 'spinner' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'var(--color-real-soft)', border: '1px solid var(--color-real)', borderRadius: '12px', color: 'var(--color-real-dark)', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'var(--color-fake-soft)', border: '1px solid var(--color-fake)', borderRadius: '12px', color: 'var(--color-fake-dark)', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        background: 'rgba(223, 217, 202, 0.45)',
        borderRadius: '16px',
        padding: '0.35rem',
        gap: '0.35rem',
        marginBottom: '2rem',
        overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: 'Overview & Health', icon: Activity },
          { id: 'users', label: 'User Accounts', icon: Users },
          { id: 'records', label: 'All Audit Records', icon: Database },
          { id: 'feedback', label: 'User Feedback', icon: MessageSquare },
          { id: 'telemetry', label: 'Neural Lifecycle Logs', icon: Cpu }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn btn-pill"
              style={{
                flex: '1 0 auto',
                padding: '0.65rem 1.1rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                background: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? 'var(--color-terracotta)' : 'var(--color-charcoal)',
                border: 'none',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && overview && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div className="editorial-card" style={{ background: '#FFF', padding: '1.75rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-gray)', textTransform: 'uppercase' }}>
                Total Registered Users
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-charcoal-dark)', marginTop: '0.4rem' }}>
                {overview.total_users}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-real)', marginTop: '0.2rem' }}>
                Isolated User Schemas
              </div>
            </div>

            <div className="editorial-card" style={{ background: '#FFF', padding: '1.75rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-gray)', textTransform: 'uppercase' }}>
                Total Verifications
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-terracotta)', marginTop: '0.4rem' }}>
                {overview.total_audits}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginTop: '0.2rem' }}>
                Across all 4 modalities
              </div>
            </div>

            <div className="editorial-card" style={{ background: '#FFF', padding: '1.75rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-gray)', textTransform: 'uppercase' }}>
                Database Storage Disk
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-charcoal-dark)', marginTop: '0.4rem' }}>
                {overview.database_size_kb} <span style={{ fontSize: '1rem', fontWeight: 600 }}>KB</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginTop: '0.2rem' }}>
                factora_multimodal.db
              </div>
            </div>

            <div className="editorial-card" style={{ background: '#FFF', padding: '1.75rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-gray)', textTransform: 'uppercase' }}>
                RAM Footprint (psutil)
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-real)', marginTop: '0.4rem' }}>
                {overview.model_telemetry?.current_process_ram_mb || 0} <span style={{ fontSize: '1rem', fontWeight: 600 }}>MB</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-real)', marginTop: '0.2rem' }}>
                Standby: 0 MB Lingering
              </div>
            </div>
          </div>

          {/* Breakdown Grids */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div className="editorial-card" style={{ background: '#FFF' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Modality Volume Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['TEXT', 'IMAGE', 'VIDEO', 'AUDIO'].map((mod) => {
                  const cnt = overview.modality_breakdown[mod] || 0;
                  const pct = overview.total_audits > 0 ? Math.round((cnt / overview.total_audits) * 100) : 0;
                  return (
                    <div key={mod}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{mod}</span>
                        <span style={{ fontWeight: 700 }}>{cnt} ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--color-beige-light)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-terracotta)', borderRadius: '9999px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="editorial-card" style={{ background: '#FFF' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Veracity Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['REAL', 'FAKE', 'UNCERTAIN'].map((ver) => {
                  const cnt = overview.veracity_breakdown[ver] || 0;
                  const pct = overview.total_audits > 0 ? Math.round((cnt / overview.total_audits) * 100) : 0;
                  const color = ver === 'REAL' ? 'var(--color-real)' : ver === 'FAKE' ? 'var(--color-fake)' : 'var(--color-uncertain)';
                  return (
                    <div key={ver}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{ver}</span>
                        <span style={{ fontWeight: 700 }}>{cnt} ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--color-beige-light)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '9999px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS */}
      {activeTab === 'users' && (
        <div className="editorial-card" style={{ background: '#FFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Registered User Accounts</h2>
              <p style={{ color: 'var(--color-gray)', fontSize: '0.85rem', margin: 0 }}>
                Manage permissions, role elevations, and user lifecycle.
              </p>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.3rem 0.8rem', background: 'var(--color-cream-base)', borderRadius: '9999px' }}>
              {users.length} Total Accounts
            </span>
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-beige-light)', color: 'var(--color-charcoal-dark)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>User ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Username</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Audits Run</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-beige-light)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#{u.id}</td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700, color: 'var(--color-charcoal-dark)' }}>{u.username}</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--color-gray)' }}>{u.email}</td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: u.role === 'admin' ? 'rgba(182, 124, 98, 0.15)' : 'rgba(0, 0, 0, 0.05)',
                        color: u.role === 'admin' ? 'var(--color-terracotta)' : 'var(--color-charcoal)'
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>{u.audit_count}</td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleToggleRole(u.id)}
                          className="btn btn-outline btn-pill"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                        >
                          Toggle {u.role === 'admin' ? 'User' : 'Admin'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          className="btn btn-outline btn-pill"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', color: 'var(--color-fake-dark)', borderColor: 'var(--color-fake)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALL AUDIT RECORDS (MANAGE DATA) */}
      {activeTab === 'records' && (
        <div className="editorial-card" style={{ background: '#FFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>System-Wide Verification Records</h2>
              <p style={{ color: 'var(--color-gray)', fontSize: '0.85rem', margin: 0 }}>
                Filter, inspect, or remove any verification claim in the database.
              </p>
            </div>

            <button
              onClick={handlePurgeAllRecords}
              className="btn btn-outline btn-pill"
              style={{ color: 'var(--color-fake-dark)', borderColor: 'var(--color-fake)', fontSize: '0.8rem' }}
            >
              <Trash2 size={14} />
              <span>Purge All Records</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by title, claim, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ padding: '0.5rem 0.85rem 0.5rem 2.2rem', fontSize: '0.85rem' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray)' }} />
            </div>

            <select
              value={filterModality}
              onChange={(e) => setFilterModality(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
            >
              <option value="">All Modalities</option>
              <option value="TEXT">Text</option>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="AUDIO">Audio</option>
            </select>

            <select
              value={filterVerdict}
              onChange={(e) => setFilterVerdict(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
            >
              <option value="">All Verdicts</option>
              <option value="REAL">Real</option>
              <option value="FAKE">Fake</option>
            </select>
          </div>

          {/* Records Table */}
          <div className="table-responsive">
            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-beige-light)', color: 'var(--color-charcoal-dark)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>User</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Modality</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Claim / Headline</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Verdict</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Confidence</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec) => {
                  const isReal = rec.verdict === 'REAL';
                  return (
                    <tr key={rec.id} style={{ borderBottom: '1px solid var(--color-beige-light)' }}>
                      <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#{rec.id}</td>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>{rec.username}</td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', background: 'var(--color-cream-base)', borderRadius: '6px' }}>
                          {rec.modality}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', maxWidth: '280px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-charcoal-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rec.title || 'Untitled Claim'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => setInspectRecord(rec)}
                            className="btn btn-outline btn-pill"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="btn btn-outline btn-pill"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', color: 'var(--color-fake-dark)', borderColor: 'var(--color-fake)' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USER FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="editorial-card" style={{ background: '#FFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>User Feedback & Corrections</h2>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.3rem 0.8rem', background: 'var(--color-cream-base)', borderRadius: '9999px' }}>
              {feedback.length} Submissions
            </span>
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-beige-light)', color: 'var(--color-charcoal-dark)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>User</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Record #</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Rating</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Comment</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((fb) => (
                  <tr key={fb.id} style={{ borderBottom: '1px solid var(--color-beige-light)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#{fb.id}</td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>{fb.username}</td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>Record #{fb.record_id}</td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700, color: 'var(--color-terracotta)' }}>{fb.rating} ★</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--color-gray)' }}>{fb.feedback_text || 'No comment provided.'}</td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteFeedback(fb.id)}
                        className="btn btn-outline btn-pill"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', color: 'var(--color-fake-dark)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: TELEMETRY LOGS */}
      {activeTab === 'telemetry' && telemetryData && (
        <div className="editorial-card" style={{ background: '#FFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Genuine Model Memory & RAM Purge Audit</h2>
              <p style={{ color: 'var(--color-gray)', fontSize: '0.85rem', margin: 0 }}>
                Trace exact memory allocation and de-allocation logs measured via psutil and gc.collect().
              </p>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, padding: '0.4rem 0.9rem', background: 'var(--color-cream-base)', borderRadius: '8px' }}>
              Current RSS: {telemetryData.telemetry?.current_process_ram_mb || 0} MB
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(telemetryData.recent_events || []).map((ev, idx) => (
              <div key={idx} style={{
                background: 'var(--color-cream-base)',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid var(--color-beige-light)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-terracotta)' }}>
                    {ev.model_name} ({ev.modality})
                  </span>
                  <span style={{ color: 'var(--color-real)', fontWeight: 700 }}>
                    {ev.status}
                  </span>
                </div>
                <div style={{ color: 'var(--color-charcoal)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                  <div>• Load: {ev.loaded_at}</div>
                  <div>• Eject: {ev.ejected_at}</div>
                  <div>• Latency: {ev.duration_ms} ms</div>
                  <div>• Peak RAM: {ev.ram_peak_loaded_mb} MB</div>
                  <div>• Post Purge: {ev.ram_after_purge_mb} MB</div>
                  <div style={{ color: 'var(--color-real-dark)', fontWeight: 700 }}>• Freed: {ev.ram_freed_mb} MB</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INSPECTION MODAL */}
      {inspectRecord && (
        <div className="modal-overlay" onClick={() => setInspectRecord(null)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-beige-light)', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className={`verdict-badge ${inspectRecord.verdict === 'REAL' ? 'real' : 'fake'}`} style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                  {inspectRecord.verdict} ({inspectRecord.confidence_score}%)
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gray)' }}>
                  Record #{inspectRecord.id} by @{inspectRecord.username}
                </span>
              </div>
              <button onClick={() => setInspectRecord(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gray)', marginBottom: '0.3rem' }}>
                Headline / Content
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-charcoal-dark)', marginBottom: '0.5rem' }}>
                {inspectRecord.title || 'Untitled Claim'}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)', lineHeight: '1.6', background: 'var(--color-cream-base)', padding: '0.85rem', borderRadius: '10px' }}>
                {inspectRecord.content_preview}
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gray)', marginBottom: '0.3rem' }}>
                Reasoning Summary
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-charcoal)', lineHeight: '1.6' }}>
                {inspectRecord.reasoning}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', borderTop: '1px solid var(--color-beige-light)', paddingTop: '1rem' }}>
              <button
                onClick={() => handleDeleteRecord(inspectRecord.id)}
                className="btn btn-outline"
                style={{ color: 'var(--color-fake-dark)', borderColor: 'var(--color-fake)', fontSize: '0.85rem' }}
              >
                Delete Record
              </button>
              <button
                onClick={() => setInspectRecord(null)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
