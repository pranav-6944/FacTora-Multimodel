import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Globe, AlertTriangle, CheckCircle, Info, ExternalLink, RefreshCw, Award, BookOpen } from 'lucide-react';
import { verifySource, fetchPopularSources } from '../api';

export default function SourceCheck() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [popularSources, setPopularSources] = useState([]);

  useEffect(() => {
    fetchPopularSources()
      .then((data) => setPopularSources(data))
      .catch(() => {});
  }, []);

  const handleVerify = async (domainToTest) => {
    const target = domainToTest || query;
    if (!target.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await verifySource(target);
      setResult(data);
      if (domainToTest) setQuery(domainToTest);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--color-real)';
    if (score >= 50) return 'var(--color-uncertain)';
    return 'var(--color-fake)';
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '960px' }}>
      {/* Editorial Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.4rem 1.1rem', background: 'rgba(182, 124, 98, 0.1)',
          border: '1px solid rgba(182, 124, 98, 0.25)', borderRadius: '9999px',
          fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-terracotta)',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem'
        }}>
          <ShieldCheck size={14} />
          <span>Domain Trust & Media Forensics</span>
        </div>

        <h1 style={{ fontSize: '2.6rem', marginBottom: '0.75rem' }}>
          Source Credibility Checker
        </h1>
        <p style={{ color: 'var(--color-gray)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
          Cross-reference digital publications, news domains, and websites against global
          editorial registries, Wikipedia profiles, and satirical catalogs.
        </p>
      </div>

      {/* Domain Input Form */}
      <div className="editorial-card" style={{ marginBottom: '2rem', background: '#FFF' }}>
        <form
          onSubmit={(e) => { e.preventDefault(); handleVerify(); }}
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
        >
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem', fontSize: '1rem' }}
              placeholder="Enter domain or article URL (e.g. bbc.com, theonion.com, nytimes.com)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Globe size={18} color="var(--color-gray)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.8rem 1.8rem', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? <RefreshCw size={18} className="spinner" /> : <Search size={18} />}
            <span>Analyze Domain</span>
          </button>
        </form>

        {/* Popular Quick Outlets */}
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-gray)', fontWeight: 600 }}>Try analyzing:</span>
          {popularSources.slice(0, 5).map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-outline btn-pill"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
              onClick={() => handleVerify(p.domain)}
            >
              {p.domain}
            </button>
          ))}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1.25rem', background: 'var(--color-fake-soft)', border: '1px solid var(--color-fake)', borderRadius: '12px', color: 'var(--color-fake-dark)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Verification Result Breakdown Card */}
      {result && (
        <div className="editorial-card" style={{ animation: 'fadeIn 0.3s ease', background: '#FFF' }}>
          {/* Header Banner */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-beige-light)',
            flexWrap: 'wrap', gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <h2 style={{ fontSize: '1.75rem' }}>{result.domain}</h2>
                <span className={`verdict-badge ${result.category === 'TRUSTED' ? 'real' : (result.category === 'SATIRE' ? 'uncertain' : 'fake')}`}>
                  {result.verdict}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-gray)' }}>
                Classification Category: <strong>{result.category}</strong>
              </div>
            </div>

            {/* Score Ring / Indicator */}
            <div style={{ textAlign: 'center', padding: '0.75rem 1.5rem', background: 'var(--color-ivory)', borderRadius: '14px', border: '1px solid var(--color-beige-light)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(result.trust_score), lineHeight: '1' }}>
                {result.trust_score}
                <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-gray)' }}>/100</span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray)', marginTop: '0.2rem' }}>
                Trust Score
              </div>
            </div>
          </div>

          {/* Metric Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1.5rem 0' }}>
            <div style={{ padding: '1rem', background: '#FAF7F0', borderRadius: '12px', border: '1px solid var(--color-beige-light)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-gray)', textTransform: 'uppercase', fontWeight: 700 }}>
                Editorial Transparency
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-charcoal-dark)', marginTop: '0.25rem' }}>
                {result.metrics.editorial_transparency}
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#FAF7F0', borderRadius: '12px', border: '1px solid var(--color-beige-light)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-gray)', textTransform: 'uppercase', fontWeight: 700 }}>
                Fact-Check Risk
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-charcoal-dark)', marginTop: '0.25rem' }}>
                {result.metrics.fact_check_risk}
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#FAF7F0', borderRadius: '12px', border: '1px solid var(--color-beige-light)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-gray)', textTransform: 'uppercase', fontWeight: 700 }}>
                Bias Profile
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-charcoal-dark)', marginTop: '0.25rem' }}>
                {result.metrics.bias_profile}
              </div>
            </div>
          </div>

          {/* Disinformation Flags */}
          {result.flags.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--color-charcoal)' }}>
                Forensic Registry Flags:
              </h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.92rem', color: 'var(--color-charcoal)' }}>
                {result.flags.map((flag, idx) => (
                  <li key={idx} style={{ marginBottom: '0.3rem' }}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Wikipedia Profile Section */}
          {result.wikipedia && (
            <div style={{ padding: '1.25rem', background: '#FFF', borderRadius: '14px', border: '1px solid var(--color-beige-light)', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
                  <BookOpen size={18} color="var(--color-terracotta)" />
                  <span>Wikipedia Encyclopedia Entity Profile</span>
                </div>
                {result.wikipedia.url && (
                  <a
                    href={result.wikipedia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-pill"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                  >
                    <span>Wikipedia Entry</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                {result.wikipedia.thumbnail && (
                  <img
                    src={result.wikipedia.thumbnail}
                    alt={result.wikipedia.title}
                    style={{ width: 68, height: 68, borderRadius: '8px', objectFit: 'contain', background: 'var(--color-ivory)', border: '1px solid var(--color-beige-light)' }}
                  />
                )}
                <p style={{ fontSize: '0.92rem', lineHeight: '1.65', color: 'var(--color-charcoal)' }}>
                  {result.wikipedia.extract}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
