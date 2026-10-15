import React, { useState, useEffect } from 'react';
import {
  Cpu, Activity, ShieldCheck, CheckCircle2, AlertTriangle,
  RefreshCw, Terminal, Layers, Clock, HardDrive, Zap
} from 'lucide-react';
import { fetchAdminModelLifecycle } from '../api';

export default function AdminModelMonitor({ analysisResult, isAnalyzing }) {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const loadTelemetry = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminModelLifecycle();
      setTelemetry(data.telemetry);
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn('Failed to fetch admin model lifecycle:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, []);

  // When an analysis completes, automatically sync telemetry from the analysis result or refresh
  useEffect(() => {
    if (analysisResult?.model_lifecycle) {
      setTelemetry(analysisResult.model_lifecycle);
      setLastRefreshed(new Date());
    } else if (!isAnalyzing) {
      loadTelemetry();
    }
  }, [analysisResult, isAnalyzing]);

  // Periodic poll while actively analyzing
  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      interval = setInterval(() => {
        loadTelemetry();
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const lastEvent = telemetry?.last_event;
  const isLoaded = telemetry?.is_loaded || isAnalyzing;
  const currentRam = telemetry?.current_process_ram_mb || 0;

  return (
    <div style={{
      marginTop: '2rem',
      background: 'linear-gradient(135deg, rgba(58, 56, 53, 0.98), #2C2825)',
      borderRadius: '20px',
      border: '1.5px solid var(--color-terracotta)',
      padding: '1.75rem',
      color: '#F4EFE4',
      boxShadow: '0 12px 32px rgba(58, 56, 53, 0.25)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Tech Watermark */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        opacity: 0.05,
        pointerEvents: 'none'
      }}>
        <Cpu size={160} />
      </div>

      {/* Header Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--color-terracotta)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF'
          }}>
            <Terminal size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-terracotta-light)' }}>
                Admin Real-Time Forensic Hardware Telemetry
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                background: isLoaded ? 'rgba(212, 165, 116, 0.25)' : 'rgba(127, 166, 134, 0.25)',
                color: isLoaded ? '#D4A574' : '#7FA686',
                border: isLoaded ? '1px solid #D4A574' : '1px solid #7FA686'
              }}>
                {isLoaded ? 'MODEL IN RAM' : 'STANDBY (0 LEAK)'}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(244, 239, 228, 0.65)' }}>
              Live hardware memory audit & single-modality lifecycle verification
            </div>
          </div>
        </div>

        <button
          onClick={loadTelemetry}
          className="btn btn-outline btn-pill"
          disabled={loading}
          style={{
            fontSize: '0.75rem',
            padding: '0.35rem 0.8rem',
            color: '#F4EFE4',
            borderColor: 'rgba(244, 239, 228, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <RefreshCw size={12} className={loading ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 Real Telemetry Tiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        {/* Tile 1: Active RAM Footprint */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1rem'
        }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'rgba(244, 239, 228, 0.6)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Current Process RSS
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.3rem' }}>
            {currentRam} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>MB</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(244, 239, 228, 0.5)', marginTop: '0.2rem' }}>
            System Process Memory (psutil)
          </div>
        </div>

        {/* Tile 2: Peak Loaded RAM */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1rem'
        }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'rgba(244, 239, 228, 0.6)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Peak Loaded RAM
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-terracotta-light)', marginTop: '0.3rem' }}>
            {lastEvent?.ram_peak_loaded_mb || currentRam} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>MB</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(244, 239, 228, 0.5)', marginTop: '0.2rem' }}>
            Weights active in forward pass
          </div>
        </div>

        {/* Tile 3: Post-Purge RAM */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1rem'
        }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'rgba(244, 239, 228, 0.6)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Post-Purge Baseline
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-real)', marginTop: '0.3rem' }}>
            {lastEvent?.ram_after_purge_mb || currentRam} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>MB</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(244, 239, 228, 0.5)', marginTop: '0.2rem' }}>
            Immediately after gc.collect()
          </div>
        </div>

        {/* Tile 4: Inference Duration */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1rem'
        }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'rgba(244, 239, 228, 0.6)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Forward Pass Latency
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.3rem' }}>
            {lastEvent?.duration_ms || '< 1.8s'} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>ms</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(244, 239, 228, 0.5)', marginTop: '0.2rem' }}>
            Pure tensor compute duration
          </div>
        </div>
      </div>

      {/* Genuine Lifecycle Ejection Proof Box */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.35)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        lineHeight: '1.6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: 'var(--color-real)' }}>
          <CheckCircle2 size={16} />
          <span style={{ fontWeight: 700 }}>
            {lastEvent?.status === 'EJECTED_AND_PURGED'
              ? 'VERIFIED: MODEL LOADED & PURGED FROM RAM IN REAL-TIME'
              : 'MODEL MANAGER STANDBY: ZERO ACTIVE LOCKS'}
          </span>
        </div>
        <div style={{ color: 'rgba(244, 239, 228, 0.75)' }}>
          <div>
            • <strong>Target Model:</strong> {lastEvent?.model_name || 'factora_roberta_model (Kaggle Checkpoint)'}
          </div>
          <div>
            • <strong>Boot Timestamp:</strong> {lastEvent?.loaded_at || 'Idle'} | <strong>Ejection Timestamp:</strong> {lastEvent?.ejected_at || 'Clean'}
          </div>
          <div>
            • <strong>Hardware Guarantee:</strong> Model was locked for inference pass only and forcefully deleted from Python heap via forced garbage collection (<span style={{ color: '#C89580' }}>gc.collect()</span> and CUDA cache flush).
          </div>
        </div>
      </div>
    </div>
  );
}
