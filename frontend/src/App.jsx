import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Image as ImageIcon, Film, Mic, Upload,
  Sparkles, Shield, AlertCircle, RefreshCw, CheckCircle, Search,
  Radio, Globe, Activity, Zap, BookOpen, ExternalLink
} from 'lucide-react';

import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import VerdictDisplay from './components/VerdictDisplay';
import HistoryDrawer from './components/HistoryDrawer';
import LiveNews from './components/LiveNews';
import SourceCheck from './components/SourceCheck';
import Dashboard from './components/Dashboard';
import ExtensionHub from './components/ExtensionHub';
import Documentation from './components/Documentation';
import SettingsModal from './components/SettingsModal';
import LegalModal from './components/LegalModal';
import HomeEditorialSections from './components/HomeEditorialSections';
import AdminModelMonitor from './components/AdminModelMonitor';
import AdminPanel from './components/AdminPanel';

import {
  getStoredUser, setStoredUser, setStoredToken,
  getMe, detectText, detectImage, detectVideo, detectAudio
} from './api';

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [activePage, setActivePage] = useState('hub'); // 'hub' | 'live_news' | 'source_check' | 'dashboard' | 'extension' | 'docs' | 'admin'

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState('privacy');

  // Active Modality (Strictly one at a time)
  const [modality, setModality] = useState('TEXT');

  // Input states per modality
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);

  // Analysis status & results
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const hubTopRef = useRef(null);

  // Validate session on mount
  useEffect(() => {
    getMe()
      .then((data) => setUser(data))
      .catch(() => {
        setUser(null);
        setStoredToken('');
        setStoredUser(null);
      });
  }, []);

  const handleLogout = () => {
    setUser(null);
    setStoredToken('');
    setStoredUser(null);
    setResult(null);
  };

  // Bridge from Live News: "Verify Claim in Hub"
  const handleVerifyFromNews = (title, body) => {
    setModality('TEXT');
    setTextTitle(title || '');
    setTextContent(body || title || '');
    setActivePage('hub');
    setError('');
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToHub = () => {
    setActivePage('hub');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLegalModal = (tab) => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  // Sample claims for quick testing
  const sampleClaims = [
    {
      title: 'NASA James Webb Telescope',
      text: 'NASA announces detection of organic carbon molecules in deep subsurface samples collected by the Perseverance rover on Mars, confirmed across spectrometer instruments.'
    },
    {
      title: 'Miracle Conspiracy Claim',
      text: 'SHOCKING SECRET EXPOSED: Doctors completely banned this miracle natural herb that cures all diseases instantly! Mainstream media is desperate to hide the truth from the public!'
    }
  ];

  const handleAnalyze = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setError('');
    setIsAnalyzing(true);
    setResult(null);

    try {
      let data;
      if (modality === 'TEXT') {
        if (!textContent.trim()) {
          throw new Error('Please enter news article text or claim to analyze.');
        }
        data = await detectText(textContent, textTitle);
      } else if (modality === 'IMAGE') {
        if (!imageFile) {
          throw new Error('Please select an image file to analyze.');
        }
        data = await detectImage(imageFile);
      } else if (modality === 'VIDEO') {
        if (!videoFile) {
          throw new Error('Please select a video file to analyze.');
        }
        data = await detectVideo(videoFile);
      } else if (modality === 'AUDIO') {
        if (!audioFile) {
          throw new Error('Please select an audio file to analyze.');
        }
        data = await detectAudio(audioFile);
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please check network or model availability.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        onNavigate={(p) => setActivePage(p)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenHistory={() => setHistoryDrawerOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Body Switcher */}
      <main className="container" style={{ flex: 1, padding: '3rem 1.5rem 5rem 1.5rem' }}>
        {/* PAGE 1: VERIFICATION HUB (HOME) */}
        {activePage === 'hub' && (
          <div ref={hubTopRef}>
            {/* Editorial Hero Header */}
            <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 2.75rem auto' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 1.1rem', background: 'rgba(182, 124, 98, 0.1)',
                border: '1px solid rgba(182, 124, 98, 0.25)', borderRadius: '9999px',
                fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-terracotta)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.25rem'
              }}>
                <Sparkles size={14} />
                <span>AI Multimodal Truth & Verification Hub</span>
              </div>

              <h1 style={{ fontSize: '2.9rem', lineHeight: '1.15', marginBottom: '1rem' }}>
                Investigate Disinformation Across Any Medium
              </h1>

              <p style={{ fontSize: '1.1rem', color: 'var(--color-gray)', lineHeight: '1.6' }}>
                Direct neural verification powered by fine-tuned sequence models, computer vision forensics,
                and Google Fact-Check citations. Strictly isolated to your private account.
              </p>
            </div>

            {/* Modality Segmented Selector (Strictly One at a Time) */}
            <div className="modality-tabs">
              <button
                type="button"
                className={`modality-tab ${modality === 'TEXT' ? 'active' : ''}`}
                onClick={() => { setModality('TEXT'); setError(''); setResult(null); }}
              >
                <FileText size={17} />
                <span>News Text</span>
              </button>
              <button
                type="button"
                className={`modality-tab ${modality === 'IMAGE' ? 'active' : ''}`}
                onClick={() => { setModality('IMAGE'); setError(''); setResult(null); }}
              >
                <ImageIcon size={17} />
                <span>Image Forensics</span>
              </button>
              <button
                type="button"
                className={`modality-tab ${modality === 'VIDEO' ? 'active' : ''}`}
                onClick={() => { setModality('VIDEO'); setError(''); setResult(null); }}
              >
                <Film size={17} />
                <span>Video Deepfake</span>
              </button>
              <button
                type="button"
                className={`modality-tab ${modality === 'AUDIO' ? 'active' : ''}`}
                onClick={() => { setModality('AUDIO'); setError(''); setResult(null); }}
              >
                <Mic size={17} />
                <span>Voice Clone</span>
              </button>
            </div>

            {/* Verification Hub Ingest Card */}
            <div className="editorial-card" style={{ maxWidth: '840px', margin: '0 auto' }}>
              {/* TAB 1: NEWS TEXT MODALITY */}
              {modality === 'TEXT' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <span className="form-label" style={{ marginBottom: 0 }}>Analyze Written Claim</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {sampleClaims.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="btn btn-outline btn-pill"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
                          onClick={() => {
                            setTextTitle(sample.title);
                            setTextContent(sample.text);
                          }}
                        >
                          Sample #{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Article Headline / Claim Topic (Optional)"
                      value={textTitle}
                      onChange={(e) => setTextTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <textarea
                      className="form-textarea"
                      placeholder="Paste complete news body, press release, or viral social claim text here..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-gray)', marginTop: '0.4rem' }}>
                      <span>Pure inference on factora_roberta_model</span>
                      <span>{textContent.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                  </div>

                  {/* ADMIN ONLY REAL-TIME MODEL LIFECYCLE & RAM PURGE TELEMETRY */}
                  {user?.role === 'admin' && (
                    <AdminModelMonitor
                      analysisResult={result}
                      isAnalyzing={isAnalyzing}
                    />
                  )}
                </div>
              )}

              {/* TAB 2: IMAGE FORENSICS MODALITY */}
              {modality === 'IMAGE' && (
                <div>
                  <div className="form-label" style={{ marginBottom: '1rem' }}>
                    Upload Image for Error Level Analysis & EXIF Forensics
                  </div>

                  <label className="dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <div className="dropzone-icon">
                      <Upload size={24} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--color-charcoal-dark)' }}>
                        {imageFile ? imageFile.name : 'Click or Drag & Drop Image Here'}
                      </strong>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-gray)', marginTop: '0.2rem' }}>
                        Supports PNG, JPG, JPEG, WEBP (Max 25MB)
                      </div>
                    </div>
                  </label>

                  {imagePreview && (
                    <div style={{ marginTop: '1.25rem', textAlign: 'center', padding: '1rem', background: '#FFF', borderRadius: '14px', border: '1px solid var(--color-beige-light)' }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ maxHeight: '280px', maxWidth: '100%', borderRadius: '10px', objectFit: 'contain' }}
                      />
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginTop: '0.5rem' }}>
                        {imageFile?.name} ({(imageFile?.size / 1024).toFixed(1)} KB)
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: VIDEO DEEPFAKE MODALITY */}
              {modality === 'VIDEO' && (
                <div>
                  <div className="form-label" style={{ marginBottom: '1rem' }}>
                    Upload Video for Deepfake & Frame Jitter Analysis
                  </div>

                  <label className="dropzone">
                    <input
                      type="file"
                      accept="video/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setVideoFile(file);
                          setVideoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <div className="dropzone-icon">
                      <Film size={24} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--color-charcoal-dark)' }}>
                        {videoFile ? videoFile.name : 'Click or Drag & Drop Video File'}
                      </strong>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-gray)', marginTop: '0.2rem' }}>
                        Supports MP4, MOV, WEBM, AVI (Max 50MB)
                      </div>
                    </div>
                  </label>

                  {videoPreview && (
                    <div style={{ marginTop: '1.25rem', textAlign: 'center', padding: '1rem', background: '#FFF', borderRadius: '14px', border: '1px solid var(--color-beige-light)' }}>
                      <video
                        src={videoPreview}
                        controls
                        style={{ maxHeight: '280px', maxWidth: '100%', borderRadius: '10px' }}
                      />
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginTop: '0.5rem' }}>
                        {videoFile?.name} ({(videoFile?.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: AUDIO VOICE CLONE MODALITY */}
              {modality === 'AUDIO' && (
                <div>
                  <div className="form-label" style={{ marginBottom: '1rem' }}>
                    Upload Audio for Synthetic Voice & Neural TTS Forensics
                  </div>

                  <label className="dropzone">
                    <input
                      type="file"
                      accept="audio/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setAudioFile(file);
                          setAudioPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <div className="dropzone-icon">
                      <Mic size={24} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--color-charcoal-dark)' }}>
                        {audioFile ? audioFile.name : 'Click or Drag & Drop Audio Recording'}
                      </strong>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-gray)', marginTop: '0.2rem' }}>
                        Supports MP3, WAV, M4A, OGG, FLAC (Max 25MB)
                      </div>
                    </div>
                  </label>

                  {audioPreview && (
                    <div style={{ marginTop: '1.25rem', textAlign: 'center', padding: '1.25rem', background: '#FFF', borderRadius: '14px', border: '1px solid var(--color-beige-light)' }}>
                      <audio
                        src={audioPreview}
                        controls
                        style={{ width: '100%', maxWidth: '400px' }}
                      />
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginTop: '0.5rem' }}>
                        {audioFile?.name} ({(audioFile?.size / 1024).toFixed(1)} KB)
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div style={{ marginTop: '1.25rem', padding: '0.85rem 1.15rem', background: 'var(--color-fake-soft)', border: '1px solid var(--color-fake)', borderRadius: '12px', color: 'var(--color-fake-dark)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Trigger Button */}
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '0.9rem 2.5rem', fontSize: '1.05rem', minWidth: '240px' }}
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw size={18} className="spinner" />
                      <span>Loading & Scanning Model...</span>
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      <span>Execute {modality} Verification</span>
                    </>
                  )}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '0.9rem', fontSize: '0.78rem', color: 'var(--color-gray)' }}>
                Eager memory lifecycle: Model loads on-demand and auto-ejects immediately to protect system RAM.
              </div>
            </div>

            {/* Structured Results Display */}
            {result && (
              <div style={{ maxWidth: '840px', margin: '2rem auto 0 auto' }}>
                <VerdictDisplay result={result} />
              </div>
            )}

            {/* Rich Editorial Landing Sections (Stats, Flow, Tool Grid, CTA) */}
            <HomeEditorialSections
              onNavigate={(page) => {
                setActivePage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onScrollToHub={handleScrollToHub}
            />
          </div>
        )}

        {/* PAGE 2: LIVE NEWS RADAR */}
        {activePage === 'live_news' && (
          <LiveNews onVerifyClaim={handleVerifyFromNews} />
        )}

        {/* PAGE 3: SOURCE CREDIBILITY CHECKER */}
        {activePage === 'source_check' && (
          <SourceCheck />
        )}

        {/* PAGE 4: USER ANALYTICS DASHBOARD */}
        {activePage === 'dashboard' && (
          <Dashboard
            user={user}
            onSelectRecord={(audit) => {
              setResult(audit);
              setModality(audit.modality || 'TEXT');
              setActivePage('hub');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectAudit={(audit) => {
              setResult(audit);
              setModality(audit.modality || 'TEXT');
              setActivePage('hub');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {/* PAGE 5: BROWSER EXTENSION HUB */}
        {activePage === 'extension' && (
          <ExtensionHub />
        )}

        {/* PAGE 6: METHODOLOGY & WHITEPAPER DOCS */}
        {activePage === 'docs' && (
          <Documentation />
        )}

        {/* PAGE 7: ADMINISTRATIVE DATA MANAGEMENT PANEL */}
        {activePage === 'admin' && (
          <AdminPanel onNavigateToHub={handleScrollToHub} />
        )}
      </main>

      {/* Warm Luxury Editorial Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-beige-light)',
        padding: '3.5rem 0 2rem 0',
        background: 'rgba(244, 239, 228, 0.75)',
        fontSize: '0.88rem',
        color: 'var(--color-gray)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem'
          }}>
            {/* Column 1: Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <img
                  src="/Logo.png"
                  alt="FacTora Logo"
                  style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain' }}
                />
                <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--color-charcoal-dark)' }}>
                  FacTora Multimodal
                </strong>
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--color-gray)' }}>
                Multimodal AI Verification System engineered with PyTorch RoBERTa transformers, Error Level Analysis (ELA), and ClaimReview cross-citations.
              </p>
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-charcoal)' }}>
                Developer: <strong>Pranav Lamkhade</strong> (MITAOE, Pune)
              </div>
            </div>

            {/* Column 2: Verification Tools */}
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-charcoal-dark)', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.06em' }}>
                Verification Tools
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <li>
                  <button onClick={() => { setActivePage('hub'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, textAlign: 'left', font: 'inherit' }}>
                    Multimodal Verification Hub
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActivePage('live_news'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, textAlign: 'left', font: 'inherit' }}>
                    Live News Radar
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActivePage('source_check'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, textAlign: 'left', font: 'inherit' }}>
                    Source Credibility Checker
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActivePage('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, textAlign: 'left', font: 'inherit' }}>
                    Audit Dashboard & CSV
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform & Integrations */}
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-charcoal-dark)', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.06em' }}>
                Integrations & Docs
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <li>
                  <button onClick={() => { setActivePage('extension'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, textAlign: 'left', font: 'inherit' }}>
                    Browser Extension Bridge
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActivePage('docs'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, textAlign: 'left', font: 'inherit' }}>
                    Architecture Whitepaper
                  </button>
                </li>
                <li>
                  <button onClick={() => setSettingsModalOpen(true)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, textAlign: 'left', font: 'inherit' }}>
                    API Keys & Configuration
                  </button>
                </li>
                <li>
                  <a href="/api/v1/detect/export-csv" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Export Personal CSV
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Compliance & Legal */}
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-charcoal-dark)', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.06em' }}>
                Legal & Privacy
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <li>
                  <button onClick={() => openLegalModal('privacy')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, textAlign: 'left', font: 'inherit' }}>
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalModal('terms')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, textAlign: 'left', font: 'inherit' }}>
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalModal('cookies')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, textAlign: 'left', font: 'inherit' }}>
                    Cookie Compliance
                  </button>
                </li>
                <li>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-real)' }}>
                    Strict Isolation: No Data Shared
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-beige-light)', paddingTop: '1.75rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.8rem' }}>
            <div>
              © 2026 <strong>FacTora Multimodal</strong>. Engineered for uncompromising media verification.
            </div>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <button onClick={() => openLegalModal('privacy')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit' }}>Privacy</button>
              <button onClick={() => openLegalModal('terms')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit' }}>Terms</button>
              <button onClick={() => openLegalModal('cookies')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit' }}>Cookies</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />

      <HistoryDrawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        onSelectRecord={(rec) => {
          setResult(rec);
          setModality(rec.modality);
          setActivePage('hub');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        user={user}
      />

      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
}
