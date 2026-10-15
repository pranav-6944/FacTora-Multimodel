import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ExternalLink, ThumbsUp, ThumbsDown, Info, ShieldCheck, Cpu } from 'lucide-react';
import { submitFeedback } from '../api';

export default function VerdictDisplay({ result, onFeedbackSubmitted }) {
  if (!result) return null;

  const isReal = result.verdict === 'REAL';
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);

  const handleQuickFeedback = async (rating, suggestedVerdict) => {
    try {
      if (result.id) {
        await submitFeedback(result.id, rating, feedbackText || 'User verified verdict', suggestedVerdict);
        setFeedbackSent(true);
        if (onFeedbackSubmitted) onFeedbackSubmitted();
      }
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  const googleEvidence = result.google_crosscheck?.corroborating_evidence || [];
  const detailed = result.detailed_analysis || {};

  return (
    <div style={{ marginTop: '2.5rem', animation: 'fadeIn 0.3s ease' }}>
      {/* Primary Verdict Banner */}
      <div className={`verdict-banner ${isReal ? 'real' : 'fake'}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: 58, height: 58, borderRadius: '50%',
            background: isReal ? 'var(--color-real)' : 'var(--color-fake)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF'
          }}>
            {isReal ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <span className={`verdict-badge ${isReal ? 'real' : 'fake'}`}>
                {isReal ? 'VERIFIED REAL' : 'DETECTED FAKE / MANIPULATED'}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray)' }}>
                Modality: <strong style={{ color: 'var(--color-charcoal-dark)' }}>{result.modality}</strong>
              </span>
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--color-charcoal)' }}>
              Confidence Score:{' '}
              <strong style={{ fontSize: '1.15rem', color: isReal ? 'var(--color-real-dark)' : 'var(--color-fake-dark)' }}>
                {result.confidence_score}%
              </strong>{' '}
              <span style={{ fontSize: '0.8rem', color: 'var(--color-gray)' }}>(Pure neural softmax output)</span>
            </div>
          </div>
        </div>

        {/* Engine Badge */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: 'rgba(58, 56, 53, 0.06)', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>
            <Cpu size={14} color="var(--color-terracotta)" />
            <span>{detailed.model_name || 'Factora Core Neural Network'}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)', marginTop: '0.2rem' }}>
            Loaded on-demand & auto-ejected
          </div>
        </div>
      </div>

      {/* Structured "Why and What Is It" Reasoning */}
      <div className="editorial-card" style={{ marginBottom: '1.5rem', background: '#FFF' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={19} color="var(--color-terracotta)" />
          <span>Forensic Reasoning & Investigation Summary</span>
        </h3>
        <p style={{ fontSize: '1.02rem', lineHeight: '1.7', color: 'var(--color-charcoal)' }}>
          {result.reasoning}
        </p>

        {/* Modality-specific forensic pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-beige-light)' }}>
          {detailed.probabilities && (
            <div style={{ background: 'var(--color-ivory)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.82rem' }}>
              <strong>Probabilities:</strong> REAL: {detailed.probabilities.REAL}% | FAKE: {detailed.probabilities.FAKE}%
            </div>
          )}

          {detailed.error_level_analysis && (
            <div style={{ background: 'var(--color-ivory)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.82rem' }}>
              <strong>Error Level Analysis (ELA):</strong> {detailed.error_level_analysis.interpretation} (stddev: {detailed.error_level_analysis.stddev_error})
            </div>
          )}

          {detailed.exif_forensics && detailed.exif_forensics.editing_software_detected?.length > 0 && (
            <div style={{ background: 'var(--color-fake-soft)', color: 'var(--color-fake-dark)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.82rem' }}>
              <strong>Editing Signatures:</strong> {detailed.exif_forensics.editing_software_detected.join(', ')}
            </div>
          )}

          {detailed.temporal_forensics && (
            <div style={{ background: 'var(--color-ivory)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.82rem' }}>
              <strong>Frame Consistency:</strong> {detailed.temporal_forensics.consistency_profile} (Jitter: {detailed.temporal_forensics.bitstream_jitter_index})
            </div>
          )}

          {detailed.acoustic_forensics && (
            <div style={{ background: 'var(--color-ivory)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.82rem' }}>
              <strong>Acoustic Profile:</strong> {detailed.acoustic_forensics.ambient_profile}
            </div>
          )}
        </div>
      </div>

      {/* Google Fact-Check Citations Section (If Text Modality) */}
      {result.google_crosscheck && (
        <div className="editorial-card" style={{ marginBottom: '1.5rem', background: '#FAF7F0' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={19} color="var(--color-real-dark)" />
            <span>External Google Fact-Check Verification</span>
          </h3>
          <p style={{ color: 'var(--color-gray)', fontSize: '0.88rem', marginBottom: '1rem' }}>
            {result.google_crosscheck.summary_verdict}
          </p>

          {googleEvidence.length > 0 ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {googleEvidence.map((ev, idx) => (
                <div key={idx} style={{ padding: '0.9rem', background: '#FFF', borderRadius: '12px', border: '1px solid var(--color-beige-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-terracotta-dark)' }}>
                      {ev.source} {ev.claimant && `• Claimant: ${ev.claimant}`}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-charcoal)', marginTop: '0.2rem' }}>
                      "{ev.claim}"
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginTop: '0.25rem' }}>
                      Rating: <strong>{ev.verdict}</strong>
                    </div>
                  </div>
                  {ev.url && (
                    <a href={ev.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-pill" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                      <span>Source</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '0.8rem', background: '#FFF', borderRadius: '10px', fontSize: '0.88rem', color: 'var(--color-gray)' }}>
              Independent fact-check organizations have not cataloged an explicit claim matching this exact phrasing. Evaluated purely via neural network sequence representation.
            </div>
          )}
        </div>
      )}

      {/* User Feedback & Rating Box */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'rgba(223, 217, 202, 0.3)', borderRadius: '14px' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
          Was this verification accurate?
        </span>

        {feedbackSent ? (
          <span style={{ fontSize: '0.88rem', color: 'var(--color-real-dark)', fontWeight: 600 }}>
            ✓ Thank you! Feedback recorded to your account.
          </span>
        ) : (
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={() => handleQuickFeedback(5, isReal ? 'REAL' : 'FAKE')}
              className="btn btn-outline btn-pill"
            >
              <ThumbsUp size={14} />
              <span>Accurate</span>
            </button>
            <button
              onClick={() => handleQuickFeedback(1, isReal ? 'FAKE' : 'REAL')}
              className="btn btn-outline btn-pill"
            >
              <ThumbsDown size={14} />
              <span>Inaccurate</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
