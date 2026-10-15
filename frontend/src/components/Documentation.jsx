import React, { useState } from 'react';
import { BookOpen, FileText, Image, Film, Mic, Cpu, ShieldCheck, ChevronDown, ChevronUp, Sparkles, HelpCircle } from 'lucide-react';

export default function Documentation() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'Why can I only submit one modality at a time in this version?',
      a: 'To guarantee scientific precision and zero-crash RAM safety, each medium (Text, Image, Video, Audio) is verified through an isolated, specialized neural model pipeline. Single-modality submission ensures genuine tensor calculations without cross-modal noise or artificial weighting heuristics.'
    },
    {
      q: 'How does FacTora prevent my laptop or machine from running out of RAM?',
      a: 'Through our exclusive ModelManager (app/core/model_manager.py). Models are loaded dynamically into memory only when an analysis is requested, perform the inference pass, and are IMMEDIATELY ejected from RAM using garbage collection (gc.collect() and CUDA cache release). Only ONE model is ever active in RAM at any given moment.'
    },
    {
      q: 'Where do the confidence percentages come from?',
      a: 'Unlike apps that use arbitrary scoring scripts or custom weights, FacTora outputs pure tensor softmax probabilities directly from our trained models. When the RoBERTa model predicts P(REAL) = 0.88, the displayed confidence is exactly 88.0%.'
    },
    {
      q: 'How does Google Fact-Check cross-checking work?',
      a: 'For text claims, FacTora extracts semantic keywords and queries Google\'s ClaimReview database. If reputable fact-checking publishers (such as PolitiFact, Snopes, or Reuters) have previously audited the claim, their corroborating rating and direct source URLs are displayed alongside the neural score.'
    },
    {
      q: 'Is my submitted data private?',
      a: 'Yes. FacTora Multimodal uses strict SQLite user isolation with foreign key constraints. Your analysis history, uploaded media hashes, and feedback records are strictly filtered by your user ID. Other users cannot query or access your audit logs.'
    }
  ];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.4rem 1.1rem', background: 'rgba(182, 124, 98, 0.1)',
          border: '1px solid rgba(182, 124, 98, 0.25)', borderRadius: '9999px',
          fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-terracotta)',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem'
        }}>
          <BookOpen size={14} />
          <span>Technical Whitepaper & Guide</span>
        </div>

        <h1 style={{ fontSize: '2.6rem', marginBottom: '0.75rem' }}>
          Methodology & Forensic Architecture
        </h1>
        <p style={{ color: 'var(--color-gray)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
          Explore the neural network architectures, forensic computer vision pipelines,
          and acoustic analysis algorithms powering FacTora Multimodal.
        </p>
      </div>

      {/* 4 Modalities Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="editorial-card" style={{ background: '#FFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-terracotta)', marginBottom: '0.75rem' }}>
            <FileText size={20} />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>1. News Text Analysis</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-gray)', lineHeight: '1.6' }}>
            Fine-tuned RoBERTa transformer trained on Kaggle benchmark datasets. Evaluates semantic coherence, clickbait linguistic patterns, and queries the Google Fact-Check ClaimReview API for external journalistic consensus.
          </p>
        </div>

        <div className="editorial-card" style={{ background: '#FFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-terracotta)', marginBottom: '0.75rem' }}>
            <Image size={20} />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>2. Image Forensics</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-gray)', lineHeight: '1.6' }}>
            Combines Error Level Analysis (ELA) with EXIF metadata parsing. Detects Photoshop/GIMP editing signatures, resave compression anomalies, and AI diffusion artifacts.
          </p>
        </div>

        <div className="editorial-card" style={{ background: '#FFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-terracotta)', marginBottom: '0.75rem' }}>
            <Film size={20} />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>3. Video Deepfakes</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-gray)', lineHeight: '1.6' }}>
            Analyzes container bitstream headers, known deepfake generator fingerprints (DeepFaceLab, FaceForensics), and inter-frame temporal compression jitter across consecutive frames.
          </p>
        </div>

        <div className="editorial-card" style={{ background: '#FFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-terracotta)', marginBottom: '0.75rem' }}>
            <Mic size={20} />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>4. Audio Voice Clones</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-gray)', lineHeight: '1.6' }}>
            Acoustic waveform analysis measuring ambient room-tone presence, zero-crossing regularity, and spectral noise floors characteristic of neural Text-To-Speech (TTS) models.
          </p>
        </div>
      </div>

      {/* Dynamic Memory Protection Architecture Card */}
      <div className="editorial-card" style={{ background: '#FAF7F0', border: '1px solid var(--color-beige-light)', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <Cpu size={22} color="var(--color-terracotta)" />
          <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Zero-Crash RAM Lifecycle Management</h2>
        </div>
        <p style={{ fontSize: '0.92rem', color: 'var(--color-charcoal)', lineHeight: '1.7' }}>
          Multimodal deep learning models require substantial GPU and system memory. To ensure smooth operation on standard developer laptops without system freezing or Out-Of-Memory (OOM) crashes, FacTora enforces an <strong>exclusive on-demand lifecycle</strong>:
        </p>
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#FFF', borderRadius: '12px', border: '1px solid var(--color-beige-light)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
          [INCOMING REQUEST] ➔ [ACQUIRE ASYNC LOCK] ➔ [LOAD MODEL] ➔ [INFERENCE SOFTMAX] ➔ [EJECT MODEL & GC.COLLECT] ➔ [RETURN RESULT]
        </div>
      </div>

      {/* FAQ Accordion */}
      <div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem', textAlign: 'center' }}>
          Frequently Asked Questions
        </h2>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="editorial-card"
              style={{ padding: '1.25rem', cursor: 'pointer', background: '#FFF' }}
              onClick={() => toggleFaq(idx)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '1.02rem', color: 'var(--color-charcoal-dark)' }}>
                  {faq.q}
                </strong>
                {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              {openFaq === idx && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-beige-light)', fontSize: '0.92rem', color: 'var(--color-gray)', lineHeight: '1.65' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
