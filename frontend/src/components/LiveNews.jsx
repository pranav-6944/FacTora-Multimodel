import React, { useState, useEffect } from 'react';
import {
  Radio, Search, ExternalLink, ArrowRight, Sparkles,
  RefreshCw, AlertCircle, Newspaper, Flame, Clock, Image as ImageIcon
} from 'lucide-react';
import { fetchLiveNews, extractArticleContent } from '../api';

function formatTimeAgo(isoString) {
  if (!isoString) return '';
  try {
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (isNaN(diff)) return '';
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(isoString).toLocaleDateString();
  } catch {
    return '';
  }
}

export default function LiveNews({ onVerifyClaim }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyingIdx, setVerifyingIdx] = useState(null);

  const categories = [
    { id: 'general', label: 'All Stories' },
    { id: 'technology', label: 'Tech & AI' },
    { id: 'science', label: 'Science & Space' },
    { id: 'business', label: 'Economy & Markets' },
    { id: 'health', label: 'Health & Medicine' }
  ];

  const loadNews = async (cat, q) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLiveNews(cat, q);
      setArticles(data.articles || []);
    } catch (err) {
      setError('Unable to load live news feed. Displaying cached verified radar stories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews(category, searchQuery);
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadNews(category, searchQuery);
  };

  const handleVerify = async (item, idx) => {
    setVerifyingIdx(idx);
    let fullText = item.sample_body || item.description || item.title;
    if (item.url) {
      try {
        fullText = await extractArticleContent(item.url, fullText);
      } catch (err) {
        console.warn('Extraction fallback to snippet:', err);
      }
    }
    // Clean any lingering [+1234 chars] on the client as an extra safety guarantee
    if (fullText) {
      fullText = fullText.replace(/\s*(?:\.{3}|…)?\s*\[\+\d+\s*chars\]\s*$/, '').trim();
    }
    setVerifyingIdx(null);
    onVerifyClaim(item.title, fullText);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.4rem 1.1rem', background: 'rgba(182, 124, 98, 0.1)',
          border: '1px solid rgba(182, 124, 98, 0.25)', borderRadius: '9999px',
          fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-terracotta)',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem'
        }}>
          <Radio size={14} className="pulse" />
          <span>Real-Time Disinformation Radar</span>
        </div>

        <h1 style={{ fontSize: '2.6rem', marginBottom: '0.75rem' }}>
          Live Global News Stream
        </h1>
        <p style={{ color: 'var(--color-gray)', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto' }}>
          Monitor live breaking headlines as they emerge across international wire services.
          Select any claim to execute instant neural veracity verification in the Multimodal Hub.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
        alignItems: 'center', gap: '1rem', marginBottom: '2rem',
        padding: '1.25rem', background: '#FFF', borderRadius: '16px',
        border: '1px solid var(--color-beige-light)', boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`btn btn-pill ${category === cat.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}
              onClick={() => { setCategory(cat.id); setSearchQuery(''); }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 260px', maxWidth: '380px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem', fontSize: '0.88rem' }}
              placeholder="Search trending claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} color="var(--color-gray)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button type="submit" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Search
          </button>
        </form>
      </div>

      {/* Error alert if any */}
      {error && (
        <div style={{
          marginBottom: '1.5rem', padding: '0.85rem 1.25rem',
          background: 'var(--color-uncertain-soft)', borderRadius: '12px',
          fontSize: '0.9rem', color: 'var(--color-charcoal-dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="var(--color-terracotta)" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: '0.78rem', padding: '0.25rem 0.75rem' }}
            onClick={() => loadNews(category, searchQuery)}
          >
            Retry Feed
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-gray)' }}>
          <RefreshCw size={28} className="spinner" style={{ margin: '0 auto 1rem auto' }} />
          <div>Scanning live wire feeds...</div>
        </div>
      )}

      {/* Empty State when no stories match search */}
      {!loading && articles.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '3.5rem 1.5rem', background: '#FFF',
          borderRadius: '20px', border: '1px solid var(--color-beige-light)',
          boxShadow: 'var(--shadow-sm)', marginBottom: '2rem'
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(182, 124, 98, 0.1)', color: 'var(--color-terracotta)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto'
          }}>
            <AlertCircle size={28} />
          </div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem', color: 'var(--color-charcoal-dark)' }}>
            No Live Wire Stories Found
          </h3>
          <p style={{ color: 'var(--color-gray)', fontSize: '0.96rem', maxWidth: '520px', margin: '0 auto 1.75rem auto', lineHeight: '1.6' }}>
            {searchQuery
              ? `No live wire stories matched "${searchQuery}". Please check your spelling, search for a broader topic (e.g., "AI", "economy", "space"), or switch categories.`
              : 'There are currently no breaking wire reports available in this category.'}
          </p>
          <button
            type="button"
            className="btn btn-primary btn-pill"
            onClick={() => { setSearchQuery(''); setCategory('general'); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
          >
            <RefreshCw size={14} />
            <span>Reset Filters & Show All Wire News</span>
          </button>
        </div>
      )}

      {/* Articles Grid */}
      {!loading && articles.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {articles.map((item, idx) => (
            <div
              key={idx}
              className="editorial-card"
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                position: 'relative', background: '#FFF', padding: '1.4rem'
              }}
            >
              <div>
                {/* Media Preview Image above Headline */}
                {item.image_url ? (
                  <div style={{
                    position: 'relative', width: '100%', height: '180px',
                    borderRadius: '12px', overflow: 'hidden', marginBottom: '1.1rem',
                    background: 'var(--color-beige-light)'
                  }}>
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)'
                    }} />
                  </div>
                ) : (
                  <div style={{
                    position: 'relative', width: '100%', height: '100px',
                    borderRadius: '12px', marginBottom: '1.1rem',
                    background: 'linear-gradient(135deg, rgba(182, 124, 98, 0.08), rgba(223, 217, 202, 0.3))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-terracotta)'
                  }}>
                    <Newspaper size={34} opacity={0.65} />
                  </div>
                )}

                {/* Source, Timestamp & Trending Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-terracotta)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {item.source}
                  </span>
                  {item.published_at && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-gray)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} />
                      <span>{formatTimeAgo(item.published_at)}</span>
                    </span>
                  )}
                  {item.is_trending && (
                    <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', background: 'var(--color-terracotta-soft)', color: 'var(--color-terracotta-dark)', borderRadius: '9999px' }}>
                      <Flame size={12} />
                      <span>Trending</span>
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.18rem', lineHeight: '1.4', marginBottom: '0.75rem' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                  {item.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--color-beige-light)', flexWrap: 'wrap', gap: '0.5rem' }}>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.8rem', color: 'var(--color-gray)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
                  >
                    <span>Read Wire</span>
                    <ExternalLink size={12} />
                  </a>
                )}

                <button
                  type="button"
                  className="btn btn-primary btn-pill"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                  disabled={verifyingIdx === idx}
                  onClick={() => handleVerify(item, idx)}
                >
                  {verifyingIdx === idx ? (
                    <>
                      <RefreshCw size={13} className="spinner" />
                      <span>Extracting Full Wire...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span>Verify with FacTora</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
