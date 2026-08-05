import { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete, lang = 'en' }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [logoGlow, setLogoGlow] = useState(false);

  useEffect(() => {
    const glowTimer = setTimeout(() => setLogoGlow(true), 100);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setExiting(true), 300);
          setTimeout(() => onComplete && onComplete(), 1100);
          return 100;
        }
        const remaining = 100 - prev;
        const speed = remaining > 80 ? 1.5 : remaining > 40 ? 3 : remaining > 15 ? 2 : 0.8;
        return Math.min(prev + speed, 100);
      });
    }, 30);
    return () => { clearInterval(interval); clearTimeout(glowTimer); };
  }, [onComplete]);

  const loadingTexts = lang === 'id' ? [
    'MENGINSIALISASI SISTEM MARITIM',
    'MENGHUBUNGKAN KE SATELIT AIS',
    'MEMUAT DATABASE KAPAL',
    'MENGKALIBRASI SINYAL RADAR',
    'MEMBANGUN KANAL AMAN',
  ] : [
    'INITIALIZING MARITIME SYSTEMS',
    'CONNECTING TO AIS SATELLITES',
    'LOADING VESSEL DATABASE',
    'CALIBRATING RADAR SIGNALS',
    'ESTABLISHING SECURE CHANNEL',
  ];
  const textIndex = Math.min(Math.floor(progress / 20), loadingTexts.length - 1);

  return (
    <div className={`splash-screen ${exiting ? 'splash-exit' : ''}`}>
      <div className="splash-radar-bg">
        <div className="splash-ring splash-ring-1" />
        <div className="splash-ring splash-ring-2" />
        <div className="splash-ring splash-ring-3" />
      </div>
      <div className="splash-content">
        <div className={`splash-logo ${logoGlow ? 'glow-active' : ''}`}>
          <div className="splash-logo-icon">⚓</div>
          <div className="splash-logo-pulse" />
        </div>
        <h1 className="splash-title">
          <span style={{ '--delay': '0ms' }}>N</span>
          <span style={{ '--delay': '60ms' }}>E</span>
          <span style={{ '--delay': '120ms' }}>P</span>
          <span style={{ '--delay': '180ms' }}>T</span>
          <span style={{ '--delay': '240ms' }}>U</span>
          <span style={{ '--delay': '300ms' }}>N</span>
          <span style={{ '--delay': '360ms' }}>E</span>
          <span style={{ '--delay': '420ms' }}>'</span>
          <span style={{ '--delay': '480ms' }}>S</span>
          <span className="splash-title-space" />
          <span style={{ '--delay': '600ms' }}>L</span>
          <span style={{ '--delay': '660ms' }}>E</span>
          <span style={{ '--delay': '720ms' }}>G</span>
          <span style={{ '--delay': '780ms' }}>A</span>
          <span style={{ '--delay': '840ms' }}>C</span>
          <span style={{ '--delay': '900ms' }}>Y</span>
        </h1>
        <p className="splash-subtitle">
          {lang === 'id' ? 'KESADARAN DOMAIN MARITIM · LAUT NATUNA' : 'MARITIME DOMAIN AWARENESS · NATUNA SEA'}
        </p>
        <div className="splash-progress-wrapper">
          <div className="splash-progress-track">
            <div className="splash-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="splash-progress-info">
            <span className="splash-loading-text">{loadingTexts[textIndex]}</span>
            <span className="splash-progress-percent">{Math.floor(progress)}%</span>
          </div>
        </div>
        <div className="splash-footer">
          <span className="splash-footer-dot" />
          {lang === 'id' ? 'PUSAT OPERASI MARITIM AMAN' : 'SECURE MARITIME OPERATIONS CENTER'}
        </div>
      </div>
    </div>
  );
}