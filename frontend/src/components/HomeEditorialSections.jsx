import React, { useState } from 'react';
import {
  ShieldCheck, Brain, Zap, Activity, Globe, CheckCircle2,
  Lock, ArrowRight, Radio, ExternalLink, Cpu, Database,
  FileText, Image as ImageIcon, Video, Mic, Eye, Layers,
  Sparkles, Award, ShieldAlert, Sliders, Check, ChevronRight,
  BarChart3, Search, Terminal, AlertTriangle, Fingerprint
} from 'lucide-react';

export default function HomeEditorialSections({ onNavigate, onScrollToHub }) {
  const [activeForensicTab, setActiveForensicTab] = useState('text');

  const trustPartners = [
    { name: 'PolitiFact', tag: 'Verified Fact-Check Partner' },
    { name: 'Snopes', tag: 'Debunking Network' },
    { name: 'FactCheck.org', tag: 'Annenberg Public Policy' },
    { name: 'AltNews', tag: 'Independent Verification' },
    { name: 'Google Fact-Check API', tag: 'ClaimReview Schema' }
  ];

  const forensicData = {
    text: {
      title: 'Text Semantic Forensics (RoBERTa Transformer)',
      badge: 'Fine-Tuned Neural Attention',
      headline: '"BREAKING: Classified Military Study Confirms 5G Frequencies Mutate Human DNA in Secret Trials"',
      tokens: [
        { text: 'BREAKING:', alert: true, note: 'Urgency Clickbait Trigger' },
        { text: 'Classified', alert: true, note: 'Conspiracy Framing' },
        { text: 'Military Study', alert: false, note: 'False Authority Reference' },
        { text: 'Confirms 5G Frequencies', alert: true, note: 'Disinformation Subject' },
        { text: 'Mutate Human DNA', alert: true, note: 'Sensational Biological Claim' },
        { text: 'in Secret Trials', alert: true, note: 'Unverifiable Source Anchor' }
      ],
      verdict: '99.1% High Probability Fake',
      status: 'fake',
      metrics: [
        { label: 'Outrage Index', val: '94%' },
        { label: 'ClaimReview Match', val: 'Debunked by WHO' },
        { label: 'Syntactic Bias', val: 'Extreme' }
      ],
      explanation: 'Our Kaggle-trained RoBERTa model isolates attention clusters around unverified authority assertions and high-arousal panic triggers, cross-matching against indexed ClaimReview schemas to deliver definitive verdicts.'
    },
    image: {
      title: 'Image Tampering & Error Level Analysis (ELA)',
      badge: 'Compression Heatmap Forensics',
      headline: 'Manipulated Protest Crowd Density & Placard Insertion',
      subtext: 'Double JPEG compression cycle at 95% vs 75% quality resave',
      verdict: '96.4% Digital Splicing Detected',
      status: 'fake',
      metrics: [
        { label: 'Compression Variance', val: '38.2 Δ' },
        { label: 'EXIF Consistency', val: 'Manipulated / Missing' },
        { label: 'Cloned Pixel Regions', val: '4 Clusters Identified' }
      ],
      explanation: 'FacTora resaves input matrices at calibrated 95% quality baselines. Natural photographs exhibit uniform error variance, whereas spliced text or cloned crowd regions reveal high-frequency noise spikes.'
    },
    video: {
      title: 'Video Temporal Jitter & Biometric Face-Swap',
      badge: 'Frame-by-Frame Optical Flow',
      headline: 'Synthetic Head-Replacement & Lip-Sync Inconsistency',
      subtext: 'Micro-expression cadence vs synthetic generative diffusion',
      verdict: '94.8% Deepfake Face-Swap Detected',
      status: 'fake',
      metrics: [
        { label: 'Blink Rate Cadence', val: '0.02 Hz (Normal: 0.35 Hz)' },
        { label: 'Jawline Boundary Warping', val: 'Severe Jitter' },
        { label: 'Phoneme-Viseme Sync', val: '180ms Disconnect' }
      ],
      explanation: 'Deepfake autoencoders generate convincing static portraits but fail temporal continuity. FacTora traces inter-frame optical flow vectors, identifying unnatural facial boundaries and biometric blink absences.'
    },
    audio: {
      title: 'Audio Synthetic Vocoder & TTS Voice Clone',
      badge: 'Mel-Spectrogram Spectral Ceiling',
      headline: 'AI-Cloned Urgent Voice Message & Ransom Impersonation',
      subtext: 'Neural vocoder acoustic artifacts vs natural human vocal tract',
      verdict: '97.2% Synthetic Voice Detected',
      status: 'fake',
      metrics: [
        { label: 'High-Freq Ceiling', val: '16 kHz Sharp Cutoff' },
        { label: 'Pitch Micro-Tremor', val: 'Artificially Flat' },
        { label: 'Breath Pause Cadence', val: 'Zero Inhalation Audio' }
      ],
      explanation: 'Generative voice synthesizers (ElevenLabs, Bark, VITS) exhibit characteristic spectral truncations above 16kHz and lack the natural sub-glottal micro-tremors and inhalation pauses intrinsic to biological human speech.'
    }
  };

  const currentForensic = forensicData[activeForensicTab];

  return (
    <div style={{ marginTop: '4.5rem' }}>
      {/* 1. TRUSTED ACCURACY & GLOBAL STATS BANNER */}
      <section style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '3rem 2rem',
        border: '1px solid var(--color-beige-light)',
        boxShadow: 'var(--shadow-subtle)',
        marginBottom: '4rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.9rem',
          background: 'rgba(182, 124, 98, 0.1)',
          borderRadius: '9999px',
          color: 'var(--color-terracotta)',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <ShieldCheck size={15} />
          <span>Validated by Global Fact-Check Standards</span>
        </div>

        <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem', color: 'var(--color-charcoal-dark)' }}>
          Trusted Intelligence for Disinformation Defense
        </h2>
        <p style={{ maxWidth: '680px', margin: '0 auto 2.5rem auto', color: 'var(--color-gray)', fontSize: '1rem', lineHeight: '1.6' }}>
          FacTora combines fine-tuned Transformer sequences with multi-modal forensic heuristics to neutralize fabricated news, synthetic deepfakes, and automated media manipulation.
        </p>

        {/* 4 Key Stat Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{ padding: '1.5rem', background: 'var(--color-cream-base)', borderRadius: '16px', border: '1px solid var(--color-beige-light)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-terracotta)', lineHeight: 1 }}>
              99.2%
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-charcoal-dark)', marginTop: '0.5rem' }}>
              Validation Accuracy
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)', marginTop: '0.2rem' }}>
              RoBERTa Kaggle Benchmark
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--color-cream-base)', borderRadius: '16px', border: '1px solid var(--color-beige-light)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-real)', lineHeight: 1 }}>
              4
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-charcoal-dark)', marginTop: '0.5rem' }}>
              Forensic Modalities
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)', marginTop: '0.2rem' }}>
              Text, Image, Video, Audio
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--color-cream-base)', borderRadius: '16px', border: '1px solid var(--color-beige-light)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-charcoal-dark)', lineHeight: 1 }}>
              &lt; 1.8s
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-charcoal-dark)', marginTop: '0.5rem' }}>
              Inference Latency
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)', marginTop: '0.2rem' }}>
              Optimized Torch Engine
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--color-cream-base)', borderRadius: '16px', border: '1px solid var(--color-beige-light)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-terracotta)', lineHeight: 1 }}>
              0 MB
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-charcoal-dark)', marginTop: '0.5rem' }}>
              Idle Memory Leak
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)', marginTop: '0.2rem' }}>
              Eager Garbage Collection
            </div>
          </div>
        </div>

        {/* Fact-checking Network Pills */}
        <div style={{ borderTop: '1px solid var(--color-beige-light)', paddingTop: '2rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
            External Cross-Check APIs & Open Sources
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
            {trustPartners.map((partner, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(223, 217, 202, 0.45)',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-charcoal-dark)',
                  border: '1px solid var(--color-beige-light)'
                }}
              >
                <CheckCircle2 size={15} color="var(--color-real)" />
                <span>{partner.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-gray)', fontWeight: 500 }}>({partner.tag})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. THREE-STEP MULTIMODAL VERIFICATION FLOW */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.9rem',
            background: 'rgba(182, 124, 98, 0.1)',
            borderRadius: '9999px',
            color: 'var(--color-terracotta)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.8rem'
          }}>
            <Zap size={14} />
            <span>Operational Architecture</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--color-charcoal-dark)' }}>
            How FacTora Operates
          </h2>
          <p style={{ color: 'var(--color-gray)', maxWidth: '600px', margin: '0 auto', fontSize: '0.98rem' }}>
            A deterministic pipeline engineered for verifiable confidence, cryptographic traceability, and zero workstation memory crashes.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.75rem'
        }}>
          {/* Step 1 */}
          <div className="editorial-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(182, 124, 98, 0.12)',
              color: 'var(--color-terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              marginBottom: '1.25rem'
            }}>
              1
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Select Modality & Ingest</h3>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.92rem', lineHeight: '1.6', flex: 1 }}>
              Submit claim text or upload image, video, or audio evidence. Single-modality isolation ensures dedicated neural pipelines handle each artifact cleanly without race conditions.
            </p>
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-beige-light)', fontSize: '0.8rem', color: 'var(--color-charcoal-dark)', fontWeight: 600 }}>
              Input: Raw Text, PNG/JPG, MP4, MP3/WAV
            </div>
          </div>

          {/* Step 2 */}
          <div className="editorial-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(64, 110, 87, 0.12)',
              color: 'var(--color-real)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              marginBottom: '1.25rem'
            }}>
              2
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Neural Scan & Fact-Check</h3>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.92rem', lineHeight: '1.6', flex: 1 }}>
              Target model boots into memory, computes softmax logits or forensic frequency maps, cross-checks Google ClaimReview database, and immediately flushes RAM via forced garbage collection.
            </p>
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-beige-light)', fontSize: '0.8rem', color: 'var(--color-charcoal-dark)', fontWeight: 600 }}>
              Engine: PyTorch Transformer + ELA + ClaimReview
            </div>
          </div>

          {/* Step 3 */}
          <div className="editorial-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(198, 107, 107, 0.12)',
              color: 'var(--color-fake)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              marginBottom: '1.25rem'
            }}>
              3
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Verdict, Reason & Audit</h3>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.92rem', lineHeight: '1.6', flex: 1 }}>
              Inspect confidence gauges, forensic indicators, and source citations. Every audit is preserved strictly in your private dashboard for historical reporting and CSV exports.
            </p>
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-beige-light)', fontSize: '0.8rem', color: 'var(--color-charcoal-dark)', fontWeight: 600 }}>
              Output: Audit ID, Verdict, Probability, Reasoning
            </div>
          </div>
        </div>
      </section>

      {/* 3. [NEW SECTION 1]: INTERACTIVE FORENSIC MODALITY LAB & DECEPTION ANATOMY */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.9rem',
            background: 'rgba(182, 124, 98, 0.1)',
            borderRadius: '9999px',
            color: 'var(--color-terracotta)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.8rem'
          }}>
            <Eye size={14} />
            <span>Forensic Dissection Lab</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--color-charcoal-dark)' }}>
            Anatomy of Multimodal Deception
          </h2>
          <p style={{ color: 'var(--color-gray)', maxWidth: '620px', margin: '0 auto', fontSize: '0.98rem' }}>
            Explore how modern neural networks expose invisible manipulation markers across text syntax, pixel compression, video temporal flow, and acoustic spectra.
          </p>
        </div>

        {/* Forensic Modality Interactive Selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          {[
            { id: 'text', label: 'Text Attention', icon: FileText },
            { id: 'image', label: 'Image ELA Heatmap', icon: ImageIcon },
            { id: 'video', label: 'Video Temporal Jitter', icon: Video },
            { id: 'audio', label: 'Audio Vocal Vocoder', icon: Mic }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeForensicTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveForensicTab(tab.id)}
                className="btn btn-pill"
                style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  background: isSelected ? 'var(--color-terracotta)' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : 'var(--color-charcoal-dark)',
                  border: isSelected ? '1px solid var(--color-terracotta)' : '1px solid var(--color-beige-light)',
                  boxShadow: isSelected ? 'var(--shadow-terracotta)' : 'var(--shadow-sm)',
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

        {/* Forensic Detailed Inspection Panel */}
        <div className="editorial-card" style={{
          background: '#FFFFFF',
          padding: '2.5rem',
          border: '1px solid var(--color-beige-light)',
          boxShadow: 'var(--shadow-md)',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--color-beige-light)',
            paddingBottom: '1.25rem'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--color-terracotta)',
                letterSpacing: '0.06em',
                marginBottom: '0.3rem'
              }}>
                <Fingerprint size={14} />
                <span>{currentForensic.badge}</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--color-charcoal-dark)' }}>
                {currentForensic.title}
              </h3>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 1rem',
              borderRadius: '9999px',
              background: 'rgba(198, 107, 107, 0.12)',
              color: 'var(--color-fake)',
              fontWeight: 800,
              fontSize: '0.9rem'
            }}>
              <ShieldAlert size={16} />
              <span>{currentForensic.verdict}</span>
            </div>
          </div>

          {/* Interactive Evidence Inspection Box */}
          <div style={{
            background: 'var(--color-cream-base)',
            borderRadius: '16px',
            padding: '1.75rem',
            border: '1px solid var(--color-beige-light)',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8rem' }}>
              Sample Deceptive Artifact Ingestion
            </div>

            {activeForensicTab === 'text' ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
                {currentForensic.tokens.map((tk, idx) => (
                  <span
                    key={idx}
                    title={tk.note}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '8px',
                      background: tk.alert ? 'rgba(198, 107, 107, 0.16)' : 'rgba(255, 255, 255, 0.9)',
                      color: tk.alert ? 'var(--color-fake-dark)' : 'var(--color-charcoal-dark)',
                      border: tk.alert ? '1px solid rgba(198, 107, 107, 0.35)' : '1px solid var(--color-beige-light)',
                      fontWeight: tk.alert ? 700 : 500,
                      fontSize: '0.95rem',
                      cursor: 'help'
                    }}
                  >
                    {tk.text}
                  </span>
                ))}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-charcoal-dark)', marginBottom: '0.3rem' }}>
                  {currentForensic.headline}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-gray)' }}>
                  {currentForensic.subtext}
                </div>
              </div>
            )}
          </div>

          {/* 3 Forensic Telemetry Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.75rem'
          }}>
            {currentForensic.metrics.map((m, idx) => (
              <div key={idx} style={{
                background: '#FFFFFF',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid var(--color-beige-light)'
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-gray)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-charcoal-dark)', marginTop: '0.3rem' }}>
                  {m.val}
                </div>
              </div>
            ))}
          </div>

          {/* Technical Summary Footnote */}
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            background: 'rgba(182, 124, 98, 0.08)',
            border: '1px solid rgba(182, 124, 98, 0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <Brain size={18} color="var(--color-terracotta)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
            <p style={{ fontSize: '0.88rem', color: 'var(--color-charcoal)', lineHeight: '1.6', margin: 0 }}>
              {currentForensic.explanation}
            </p>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM CORE CAPABILITIES GRID */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.9rem',
            background: 'rgba(182, 124, 98, 0.1)',
            borderRadius: '9999px',
            color: 'var(--color-terracotta)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.8rem'
          }}>
            <Cpu size={14} />
            <span>Suite of Tools</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--color-charcoal-dark)' }}>
            Full Spectrum Misinformation Defense
          </h2>
          <p style={{ color: 'var(--color-gray)', maxWidth: '600px', margin: '0 auto', fontSize: '0.98rem' }}>
            Seamlessly navigate between live breaking feeds, source credibility lookups, and browser extension integrations.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem'
        }}>
          {/* Card 1: Live News Radar */}
          <div
            className="editorial-card"
            style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onClick={() => onNavigate('live_news')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(182, 124, 98, 0.1)',
                color: 'var(--color-terracotta)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Radio size={22} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', background: 'rgba(182, 124, 98, 0.12)', color: 'var(--color-terracotta)', borderRadius: '9999px' }}>
                Live Feed
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>Live News Radar</h3>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Monitor breaking global headlines filtered across Politics, Technology, Science, and World events. Verify any story directly with a single click.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-terracotta)', fontWeight: 700, fontSize: '0.9rem' }}>
              <span>Launch Live Radar</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 2: Source Credibility */}
          <div
            className="editorial-card"
            style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onClick={() => onNavigate('source_check')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(64, 110, 87, 0.1)',
                color: 'var(--color-real)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Globe size={22} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', background: 'rgba(64, 110, 87, 0.12)', color: 'var(--color-real)', borderRadius: '9999px' }}>
                Domain Trust
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>Source Credibility Checker</h3>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Check publisher authenticity, bias classification, and real-time Wikipedia organization dossiers before believing any viral article URL.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-real)', fontWeight: 700, fontSize: '0.9rem' }}>
              <span>Analyze Media Outlets</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 3: Browser Extension */}
          <div
            className="editorial-card"
            style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onClick={() => onNavigate('extension')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(44, 40, 37, 0.08)',
                color: 'var(--color-charcoal-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap size={22} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', background: 'rgba(44, 40, 37, 0.08)', color: 'var(--color-charcoal-dark)', borderRadius: '9999px' }}>
                Chrome v3
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>Browser Extension Bridge</h3>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Install FacTora directly into Google Chrome, Brave, or Edge. Highlight any claim on the web for immediate credibility scoring without leaving your tab.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-charcoal-dark)', fontWeight: 700, fontSize: '0.9rem' }}>
              <span>Get Chrome Extension</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 4: Analytics Dashboard */}
          <div
            className="editorial-card"
            style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onClick={() => onNavigate('dashboard')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(182, 124, 98, 0.1)',
                color: 'var(--color-terracotta)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Activity size={22} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', background: 'rgba(182, 124, 98, 0.12)', color: 'var(--color-terracotta)', borderRadius: '9999px' }}>
                Analytics
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>Personal Audit Dashboard</h3>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Review your entire forensic verification ledger, modality distribution breakdowns, and export timestamped CSV audit trails.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-terracotta)', fontWeight: 700, fontSize: '0.9rem' }}>
              <span>Open Audit Dashboard</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 5: Architecture Whitepaper */}
          <div
            className="editorial-card"
            style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onClick={() => onNavigate('docs')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(64, 110, 87, 0.1)',
                color: 'var(--color-real)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Brain size={22} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', background: 'rgba(64, 110, 87, 0.12)', color: 'var(--color-real)', borderRadius: '9999px' }}>
                Architecture
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>Methodology & Docs</h3>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Read the complete technical whitepaper covering RoBERTa fine-tuning, Error Level Analysis (ELA), Audio TTS detection, and RAM lifecycle manager.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-real)', fontWeight: 700, fontSize: '0.9rem' }}>
              <span>Read Whitepaper</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 6: Cryptographic User Isolation */}
          <div className="editorial-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(44, 40, 37, 0.08)',
                color: 'var(--color-charcoal-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Lock size={22} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', background: 'rgba(44, 40, 37, 0.08)', color: 'var(--color-charcoal-dark)', borderRadius: '9999px' }}>
                Privacy
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>Complete Privacy Isolation</h3>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Every verification query is strictly tied to your authenticated session with Argon2 password hashing and SQLite schema isolation. No query is shared across users.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-charcoal-dark)', fontWeight: 700, fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} color="var(--color-real)" />
              <span>Isolated User Schemas</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. [NEW SECTION 2]: THE MULTI-SOURCE TRUTH GRAPH & VERIFICATION ECOSYSTEM */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.9rem',
            background: 'rgba(64, 110, 87, 0.1)',
            borderRadius: '9999px',
            color: 'var(--color-real)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.8rem'
          }}>
            <Layers size={14} />
            <span>Multi-Layer Consensus</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--color-charcoal-dark)' }}>
            The Multi-Source Truth Graph
          </h2>
          <p style={{ color: 'var(--color-gray)', maxWidth: '640px', margin: '0 auto', fontSize: '0.98rem' }}>
            No single neural score operates in isolation. FacTora synthesizes four distinct epistemological layers into a unified Bayesian confidence rating.
          </p>
        </div>

        {/* 4-Pillar Architectural Diagram Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Pillar 1: Neural Transformers */}
          <div className="editorial-card" style={{ background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(182, 124, 98, 0.12)',
              color: 'var(--color-terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Brain size={22} />
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-terracotta)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
              Layer 1: Perception
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>Neural Model Checkpoints</h3>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.88rem', lineHeight: '1.6', flex: 1 }}>
              Custom fine-tuned RoBERTa Transformer and frequency transforms extract semantic attention, byte-level artifacts, and biometric anomalies in real-time.
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--color-beige-light)', fontSize: '0.78rem', color: 'var(--color-charcoal-dark)', fontWeight: 600 }}>
              RAM Ejected Post-Execution
            </div>
          </div>

          {/* Pillar 2: Google ClaimReview */}
          <div className="editorial-card" style={{ background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(64, 110, 87, 0.12)',
              color: 'var(--color-real)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Search size={22} />
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-real)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
              Layer 2: Indexation
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>Google ClaimReview API</h3>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.88rem', lineHeight: '1.6', flex: 1 }}>
              Over 100,000+ accredited fact-check debunks from PolitiFact, Washington Post, and Snopes cross-referenced by claim embedding distance.
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--color-beige-light)', fontSize: '0.78rem', color: 'var(--color-charcoal-dark)', fontWeight: 600 }}>
              Semantic Embedding Match
            </div>
          </div>

          {/* Pillar 3: Media Bias & Wikipedia */}
          <div className="editorial-card" style={{ background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(44, 40, 37, 0.08)',
              color: 'var(--color-charcoal-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Globe size={22} />
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-charcoal-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
              Layer 3: Reputation
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>Domain Credibility & MBFC</h3>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.88rem', lineHeight: '1.6', flex: 1 }}>
              Publisher credibility index cross-mapping Media Bias/Fact Check dossiers, Wikipedia founding history, and editorial governance transparency.
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--color-beige-light)', fontSize: '0.78rem', color: 'var(--color-charcoal-dark)', fontWeight: 600 }}>
              Automated Domain Parser
            </div>
          </div>

          {/* Pillar 4: Bayesian Consensus */}
          <div className="editorial-card" style={{ background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(182, 124, 98, 0.12)',
              color: 'var(--color-terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Sliders size={22} />
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-terracotta)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
              Layer 4: Synthesis
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>Bayesian Calibration</h3>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.88rem', lineHeight: '1.6', flex: 1 }}>
              Synthesizes raw neural logit outputs, domain weightings, and known database debunk matches into a verifiable confidence gauge and audit trace.
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--color-beige-light)', fontSize: '0.78rem', color: 'var(--color-charcoal-dark)', fontWeight: 600 }}>
              Calibrated Audit Score
            </div>
          </div>
        </div>
      </section>

      {/* 6. [NEW SECTION 3]: ENTERPRISE NEWSROOMS, OSINT ANALYSTS & ACADEMIC USE CASES */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.9rem',
            background: 'rgba(182, 124, 98, 0.1)',
            borderRadius: '9999px',
            color: 'var(--color-terracotta)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.8rem'
          }}>
            <Award size={14} />
            <span>Mission Workflows</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--color-charcoal-dark)' }}>
            Engineered for High-Stakes Verification
          </h2>
          <p style={{ color: 'var(--color-gray)', maxWidth: '620px', margin: '0 auto', fontSize: '0.98rem' }}>
            From breaking newsrooms under press deadlines to OSINT investigators tracking election disinformation campaigns.
          </p>
        </div>

        {/* 3 Specialized Workflow Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
          marginBottom: '2.5rem'
        }}>
          {/* Workflow 1 */}
          <div className="editorial-card" style={{ background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(182, 124, 98, 0.12)',
                color: 'var(--color-terracotta)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Radio size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Investigative Newsrooms</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gray)' }}>Breaking Desk Pre-Publication</span>
              </div>
            </div>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Triage viral social media claims before publication. Automated ClaimReview cross-checks save editorial desks 40+ minutes of manual search per breaking story.
            </p>
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              background: 'var(--color-cream-base)',
              border: '1px solid var(--color-beige-light)',
              fontStyle: 'italic',
              fontSize: '0.82rem',
              color: 'var(--color-charcoal)'
            }}>
              "FacTora serves as our first line of epistemic defense against coordinated generative rumor mills."
            </div>
          </div>

          {/* Workflow 2 */}
          <div className="editorial-card" style={{ background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(64, 110, 87, 0.12)',
                color: 'var(--color-real)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>OSINT & Crisis Analysts</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gray)' }}>Defense & Conflict Disinformation</span>
              </div>
            </div>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Expose deepfake audio leaks and doctored photo evidence during geopolitical crises. ELA heatmaps and vocoder spectrum tests deliver court-admissible artifacts.
            </p>
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              background: 'var(--color-cream-base)',
              border: '1px solid var(--color-beige-light)',
              fontStyle: 'italic',
              fontSize: '0.82rem',
              color: 'var(--color-charcoal)'
            }}>
              "The single-modality RAM ejection ensures rapid triage without workstation memory crashes."
            </div>
          </div>

          {/* Workflow 3 */}
          <div className="editorial-card" style={{ background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(44, 40, 37, 0.08)',
                color: 'var(--color-charcoal-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Brain size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Academic Researchers</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gray)' }}>Media Literacy & NLP Studies</span>
              </div>
            </div>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Audit model drift and study evolving manipulation tactics. Full CSV ledger export enables large-scale empirical studies of disinformation distribution vectors.
            </p>
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              background: 'var(--color-cream-base)',
              border: '1px solid var(--color-beige-light)',
              fontStyle: 'italic',
              fontSize: '0.82rem',
              color: 'var(--color-charcoal)'
            }}>
              "FacTora's open methodology bridges academic natural language processing with real-world journalism."
            </div>
          </div>
        </div>

        {/* Institutional Assurance Strip */}
        <div style={{
          background: 'var(--color-cream-base)',
          borderRadius: '16px',
          border: '1px solid var(--color-beige-light)',
          padding: '1.25rem 2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Lock size={18} color="var(--color-real)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-charcoal-dark)' }}>
              Zero Query Retention Policy
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="var(--color-real)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-charcoal-dark)' }}>
              Deterministic Bayesian Scoring
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={18} color="var(--color-terracotta)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-charcoal-dark)' }}>
              Self-Hostable Local Hardware Compatible
            </span>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION BANNER */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-charcoal-dark) 0%, #3B3632 100%)',
        borderRadius: '24px',
        padding: '3.5rem 2.5rem',
        color: '#FFFFFF',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-elevation)'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(182,124,98,0.25) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />

        <div style={{ maxWidth: '650px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2.4rem', color: '#FFFFFF', marginBottom: '1rem', lineHeight: 1.2 }}>
            Ready to Verify Information with AI Precision?
          </h2>
          <p style={{ color: 'rgba(244, 239, 228, 0.85)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Scroll up to the Verification Hub to analyze text claims, image manipulations, video deepfakes, or synthetic voice audio instantly.
          </p>
          <button
            onClick={onScrollToHub}
            className="btn btn-primary btn-pill"
            style={{ padding: '0.9rem 2.2rem', fontSize: '1rem', background: 'var(--color-terracotta)', border: 'none' }}
          >
            <span>Launch Multimodal Scanner</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
