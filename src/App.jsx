import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Map3D from './components/Map3D';
import DataChart from './components/DataChart';
import AnimatedCounter from './components/AnimatedCounter';
import SplashScreen from './components/SplashScreen';
import { mdaNodes, authorityVessels, alerts as initialAlerts, threatHistory, analyticsData } from './mdaData';
import { translations } from './translations';
import './index.css';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('en');
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [showDispatchPanel, setShowDispatchPanel] = useState(false);
  const [selectedAuthorityVessel, setSelectedAuthorityVessel] = useState(null);
  const [missions, setMissions] = useState([]);
  const [interceptedVesselIds, setInterceptedVesselIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [toast, setToast] = useState(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [localAlerts, setLocalAlerts] = useState(
    initialAlerts.map(a => ({ ...a, acknowledged: false }))
  );

  const isDark = theme === 'dark';
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const t = (key) => translations[lang][key] || translations.en[key] || key;

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const handleDispatch = useCallback((mission) => {
    setMissions(prev => [...prev, mission]);
    setShowDispatchPanel(false);
    setSelectedAuthorityVessel(null);
    setToast({
      message: lang === 'id'
        ? `🚨 ${mission.authorityVessel} dikirim untuk mencegat ${mission.targetName}`
        : `🚨 ${mission.authorityVessel} dispatched to intercept ${mission.targetName}`,
      type: 'success'
    });
    setTimeout(() => setToast(null), 4000);

    setTimeout(() => {
      setInterceptedVesselIds(prev => [...prev, mission.targetId]);
      setMissions(prev => prev.filter(m => m.id !== mission.id));
      setToast({
        message: lang === 'id'
          ? `✅ ${mission.targetName} berhasil dicegah`
          : `✅ ${mission.targetName} intercepted successfully`,
        type: 'success'
      });
      setTimeout(() => setToast(null), 4000);
    }, 5500);
  }, [lang]);

  const acknowledgeAlert = (alertId) => {
    setLocalAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  const openDispatchPanel = (vessel) => {
    setSelectedVessel(vessel);
    setSelectedAuthorityVessel(null);
    setShowDispatchPanel(true);
  };

  const filteredVessels = mdaNodes.filter(node => {
    const matchSearch = !searchQuery ||
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (node.mmsi && node.mmsi.includes(searchQuery)) ||
      (node.type && node.type.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = filterStatus === 'all' || node.status === filterStatus;
    const matchType = filterType === 'all' || node.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    total: mdaNodes.length,
    normal: mdaNodes.filter(n => n.status === 'normal').length,
    dark: mdaNodes.filter(n => n.status === 'dark').length,
    spoof: mdaNodes.filter(n => n.status === 'spoof').length,
    intercepted: interceptedVesselIds.length,
    activeAlerts: localAlerts.filter(a => !a.acknowledged).length,
  };

  const statusConfig = {
    normal: { label: t('status.normal'), color: '#5B9BD5', bg: 'rgba(91,155,213,0.1)' },
    dark:   { label: t('status.dark'),   color: '#E0605D', bg: 'rgba(224,96,93,0.1)' },
    spoof:  { label: t('status.spoof'),  color: '#F0B848', bg: 'rgba(240,184,72,0.1)' },
  };

  const severityConfig = {
    high:   { label: 'HIGH',   color: '#E0605D', bg: 'rgba(224,96,93,0.12)' },
    medium: { label: 'MEDIUM', color: '#F0B848', bg: 'rgba(240,184,72,0.12)' },
    low:    { label: 'LOW',    color: '#5B9BD5', bg: 'rgba(91,155,213,0.12)' },
  };

  const histStatusMap = {
    'Resolved': t('hist.resolved'),
    'Investigating': t('hist.investigating'),
    'Escalated': t('hist.escalated'),
  };

  const dayLabels = lang === 'id'
    ? ['Sen','Sel','Rab','Kam','Jum','Sab','Min']
    : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const getVesselById = (id) => mdaNodes.find(n => n.id === id);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} lang={lang} />}

      <div className="app">
        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
          theme={theme}
          toggleTheme={toggleTheme}
          lang={lang}
          setLang={setLang}
          t={t}
        />

        <main className="main-content">
          {/* ======================= DASHBOARD ======================= */}
          {activePage === 'dashboard' && (
            <div className="page-container">
              <div className="page-header">
                <h1 className="page-title">{t('dash.title')}</h1>
                <p className="page-subtitle">{t('dash.subtitle')}</p>
              </div>

              <div className="stats-bar">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(91,174,208,0.12)' }}>🚢</div>
                  <div className="stat-info">
                    <div className="stat-value"><AnimatedCounter value={stats.total} /></div>
                    <div className="stat-label">{t('dash.total')}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(91,155,213,0.12)' }}>✅</div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: '#5B9BD5' }}><AnimatedCounter value={stats.normal} /></div>
                    <div className="stat-label">{t('dash.normal')}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(224,96,93,0.12)' }}>⚠️</div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: '#E0605D' }}><AnimatedCounter value={stats.dark} /></div>
                    <div className="stat-label">{t('dash.dark')}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(240,184,72,0.12)' }}>🔀</div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: '#F0B848' }}><AnimatedCounter value={stats.spoof} /></div>
                    <div className="stat-label">{t('dash.spoof')}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(107,158,90,0.12)' }}>🎯</div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: '#6B9E5A' }}><AnimatedCounter value={stats.intercepted} /></div>
                    <div className="stat-label">{t('dash.intercepted')}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(224,96,93,0.12)' }}>🚨</div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: '#E0605D' }}><AnimatedCounter value={stats.activeAlerts} /></div>
                    <div className="stat-label">{t('dash.alerts')}</div>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="chart-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <span className="panel-icon">📊</span>
                      {t('dash.speedAnalysis')}
                    </div>
                  </div>
                  <div className="chart-container">
                    <DataChart isDark={isDark} />
                  </div>
                </div>

                <div className="alerts-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <span className="panel-icon">🚨</span>
                      {t('dash.recentAlerts')}
                    </div>
                    <span className="alert-count-badge">{stats.activeAlerts}</span>
                  </div>
                  <div className="alerts-list">
                    {localAlerts.filter(a => !a.acknowledged).map(alert => {
                      const vessel = getVesselById(alert.vesselId);
                      const sev = severityConfig[alert.severity] || severityConfig.medium;
                      return (
                        <div key={alert.id} className="alert-card" style={{ borderLeftColor: sev.color, background: sev.bg }}>
                          <div className="alert-header">
                            <span className="alert-severity" style={{ color: sev.color }}>{sev.label}</span>
                            <span className="alert-time">{alert.time}</span>
                          </div>
                          <div className="alert-title">{alert.title}</div>
                          <div className="alert-vessel">{vessel?.name || (lang === 'id' ? 'Tidak diketahui' : 'Unknown')}</div>
                          <div className="alert-message">{alert.message}</div>
                          <button className="ack-btn" onClick={() => acknowledgeAlert(alert.id)}>{t('dash.acknowledge')}</button>
                        </div>
                      );
                    })}
                    {localAlerts.filter(a => !a.acknowledged).length === 0 && (
                      <div className="empty-state">{t('dash.noAlerts')}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================= TRACKING ======================= */}
          {activePage === 'tracking' && (
            <div className="page-container">
              <div className="page-header">
                <h1 className="page-title">{t('track.title')}</h1>
                <p className="page-subtitle">{t('track.subtitle')}</p>
              </div>

              <div className={`tracking-grid ${mapFullscreen ? 'map-fullscreen' : ''}`}>
                <div className="map-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <span className="panel-icon">🗺️</span>
                      {t('track.mapTitle')}
                    </div>
                    <div className="panel-actions">
                      <button className="panel-btn" onClick={() => setSelectedVessel(null)}>{t('track.clear')}</button>
                      <button className="panel-btn fullscreen-btn" onClick={() => setMapFullscreen(prev => !prev)}>
                        {mapFullscreen ? `⊖ ${t('track.exitFullscreen')}` : `⛶ ${t('track.fullscreen')}`}
                      </button>
                    </div>
                  </div>
                  <div className="map-container">
                    <Map3D
                      onSelectVessel={setSelectedVessel}
                      selectedVessel={selectedVessel}
                      missions={missions}
                      isDark={isDark}
                      interceptedVesselIds={interceptedVesselIds}
                      lang={lang}
                    />
                    {selectedVessel && (
                      <div className="vessel-detail-overlay">
                        <div className="vessel-detail-header">
                          <span className="vessel-detail-name">{selectedVessel.name}</span>
                          <button className="close-btn" onClick={() => setSelectedVessel(null)}>✕</button>
                        </div>
                        <div className="vessel-detail-body">
                          <div className="detail-row"><span className="detail-label">{t('track.type')}</span><span className="detail-value">{selectedVessel.type || (lang === 'id' ? 'Tidak diketahui' : 'Unknown')}</span></div>
                          <div className="detail-row"><span className="detail-label">{t('track.mmsi')}</span><span className="detail-value">{selectedVessel.mmsi || 'N/A'}</span></div>
                          <div className="detail-row"><span className="detail-label">{t('track.flag')}</span><span className="detail-value">{selectedVessel.flag || 'N/A'}</span></div>
                          <div className="detail-row">
                            <span className="detail-label">{t('track.status')}</span>
                            <span className="detail-value">
                              <span className="status-dot" style={{ background: (statusConfig[selectedVessel.status] || statusConfig.normal).color }} />
                              {(statusConfig[selectedVessel.status] || statusConfig.normal).label}
                            </span>
                          </div>
                          <div className="detail-row"><span className="detail-label">{t('track.speed')}</span><span className="detail-value">{selectedVessel.speed} kn</span></div>
                          <div className="detail-row"><span className="detail-label">{t('track.destination')}</span><span className="detail-value">{selectedVessel.destination || 'N/A'}</span></div>
                          <div className="detail-row"><span className="detail-label">{t('track.lastSeen')}</span><span className="detail-value">{selectedVessel.lastSeen || 'N/A'}</span></div>
                        </div>
                        {selectedVessel.status === 'dark' && !interceptedVesselIds.includes(selectedVessel.id) && (
                          <button className="dispatch-btn" onClick={() => openDispatchPanel(selectedVessel)}>
                            {t('track.dispatch')}
                          </button>
                        )}
                        {interceptedVesselIds.includes(selectedVessel.id) && (
                          <div className="intercepted-badge">{t('track.intercepted')}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!mapFullscreen && (
                  <div className="side-panel">
                    <div className="filter-bar">
                      <input
                        type="text"
                        className="search-input"
                        placeholder={t('track.search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">{t('track.allStatus')}</option>
                        <option value="normal">{t('status.normal')}</option>
                        <option value="dark">{t('status.dark')}</option>
                        <option value="spoof">{t('status.spoof')}</option>
                      </select>
                      <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="all">{t('track.allTypes')}</option>
                        <option value="Cargo">{lang === 'id' ? 'Kargo' : 'Cargo'}</option>
                        <option value="Tanker">{lang === 'id' ? 'Tanker' : 'Tanker'}</option>
                        <option value="Navy">{lang === 'id' ? 'Angkatan Laut' : 'Navy'}</option>
                        <option value="Sail">{lang === 'id' ? 'Layar' : 'Sail'}</option>
                        <option value="Unknown">{lang === 'id' ? 'Tidak Diketahui' : 'Unknown'}</option>
                      </select>
                    </div>

                    <div className="vessel-list">
                      {filteredVessels.map(node => {
                        const sc = statusConfig[node.status] || statusConfig.normal;
                        return (
                          <div
                            key={node.id}
                            className={`vessel-card ${selectedVessel?.id === node.id ? 'selected' : ''} ${interceptedVesselIds.includes(node.id) ? 'intercepted' : ''}`}
                            onClick={() => setSelectedVessel(node)}
                          >
                            <div className="vessel-card-icon" style={{ background: sc.bg, color: sc.color }}>
                              {node.type === 'Tanker' ? '🛢️' : node.type === 'Navy' ? '🚢' : node.type === 'Sail' ? '⛵' : '🚢'}
                            </div>
                            <div className="vessel-card-info">
                              <div className="vessel-card-name">{node.name}</div>
                              <div className="vessel-card-meta">{node.type} · {node.speed} kn · {node.mmsi}</div>
                            </div>
                            <div className="vessel-card-right">
                              <span className="status-dot" style={{ background: sc.color }} />
                            </div>
                          </div>
                        );
                      })}
                      {filteredVessels.length === 0 && <div className="empty-state">{t('track.noVessels')}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================= THREATS ======================= */}
          {activePage === 'threats' && (
            <div className="page-container">
              <div className="page-header">
                <h1 className="page-title">{t('threat.title')}</h1>
                <p className="page-subtitle">{t('threat.subtitle')}</p>
              </div>

              <div className="threats-grid">
                <div className="threat-section">
                  <div className="section-header">
                    <span>{t('threat.active')}</span>
                    <span className="alert-count-badge">{stats.dark + stats.spoof}</span>
                  </div>
                  <div className="threat-cards">
                    {mdaNodes.filter(n => n.status === 'dark' || n.status === 'spoof').map(node => {
                      const sc = statusConfig[node.status];
                      return (
                        <div key={node.id} className="threat-card" style={{ borderLeftColor: sc.color }}>
                          <div className="threat-card-header">
                            <span className="threat-type" style={{ color: sc.color }}>{sc.label}</span>
                            <span className="threat-time">{node.lastSeen}</span>
                          </div>
                          <div className="threat-vessel-name">{node.name}</div>
                          <div className="threat-details">
                            <span>📍 {node.lat} {node.lon}</span>
                            <span>🚢 {node.type}</span>
                            <span>⚡ {node.speed} kn</span>
                            <span>🏴 {node.flag}</span>
                          </div>
                          <div className="threat-cargo">{t('threat.cargo')}: {node.cargo}</div>
                          {node.status === 'dark' && !interceptedVesselIds.includes(node.id) && (
                            <button className="dispatch-btn-small" onClick={() => openDispatchPanel(node)}>
                              {t('threat.dispatch')}
                            </button>
                          )}
                          {interceptedVesselIds.includes(node.id) && (
                            <div className="intercepted-badge-small">{t('track.intercepted')}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="threat-section">
                  <div className="section-header"><span>{t('threat.history')}</span></div>
                  <div className="threat-history-list">
                    {threatHistory.map((item, i) => (
                      <div key={i} className="history-card">
                        <div className="history-header">
                          <span className="history-type">{item.type}</span>
                          <span className="history-date">{item.date}</span>
                        </div>
                        <div className="history-desc">{item.desc}</div>
                        <div className="history-footer">
                          <span className="history-count">{item.count} {item.count > 1 ? t('threat.vessels') : t('threat.vessel')}</span>
                          <span className={`history-status ${item.status.toLowerCase()}`}>{histStatusMap[item.status] || item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================= DISPATCH ======================= */}
          {activePage === 'dispatch' && (
            <div className="page-container">
              <div className="page-header">
                <h1 className="page-title">{t('dispatch.title')}</h1>
                <p className="page-subtitle">{t('dispatch.subtitle')}</p>
              </div>

              <div className="dispatch-page-grid">
                <div className="authority-section">
                  <div className="section-header">
                    <span>{t('dispatch.available')}</span>
                    <span className="alert-count-badge">{authorityVessels.length}</span>
                  </div>
                  <div className="authority-cards">
                    {authorityVessels.map(av => (
                      <div key={av.id} className="authority-card">
                        <div className="authority-card-header">
                          <span className="authority-name">{av.name}</span>
                          <span className="authority-status">{av.status}</span>
                        </div>
                        <div className="authority-details">
                          <div className="authority-row"><span>{t('dispatch.type')}</span><span>{av.type}</span></div>
                          <div className="authority-row"><span>{t('dispatch.speed')}</span><span>{av.speed} kn</span></div>
                          <div className="authority-row"><span>{t('dispatch.crew')}</span><span>{av.crew} {t('dispatch.personnel')}</span></div>
                          <div className="authority-row"><span>{t('dispatch.armament')}</span><span>{av.armament}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="authority-section">
                  <div className="section-header">
                    <span>{t('dispatch.missions')}</span>
                    <span className="alert-count-badge">{missions.length}</span>
                  </div>
                  <div className="missions-list">
                    {missions.map(m => (
                      <div key={m.id} className="mission-card">
                        <div className="mission-header">
                          <span className="mission-vessel">{m.authorityVessel}</span>
                          <span className="mission-status active">{t('dispatch.enRoute')}</span>
                        </div>
                        <div className="mission-target">{t('dispatch.target')}: {m.targetName}</div>
                        <div className="mission-progress-bar"><div className="mission-progress-fill" /></div>
                      </div>
                    ))}
                    {missions.length === 0 && <div className="empty-state">{t('dispatch.noMissions')}</div>}
                  </div>

                  <div className="section-header" style={{ marginTop: '24px' }}>
                    <span>{t('dispatch.intercepted')}</span>
                    <span className="alert-count-badge">{stats.intercepted}</span>
                  </div>
                  <div className="intercepted-list">
                    {interceptedVesselIds.map(id => {
                      const v = getVesselById(id);
                      return v ? (
                        <div key={id} className="intercepted-card">
                          <span className="intercepted-name">{v.name}</span>
                          <span className="intercepted-type">{v.type}</span>
                        </div>
                      ) : null;
                    })}
                    {interceptedVesselIds.length === 0 && <div className="empty-state">{t('dispatch.noIntercepted')}</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================= ANALYTICS ======================= */}
          {activePage === 'analytics' && (
            <div className="page-container">
              <div className="page-header">
                <h1 className="page-title">{t('analytics.title')}</h1>
                <p className="page-subtitle">{t('analytics.subtitle')}</p>
              </div>

              <div className="analytics-grid">
                <div className="chart-panel">
                  <div className="panel-header">
                    <div className="panel-title"><span className="panel-icon">📊</span> {t('analytics.speedDist')}</div>
                  </div>
                  <div className="chart-container"><DataChart isDark={isDark} /></div>
                </div>

                <div className="analytics-side">
                  <div className="analytics-card">
                    <div className="analytics-card-title">{t('analytics.weeklyTraffic')}</div>
                    <div className="weekly-bars">
                      {analyticsData.weeklyVessels.map((val, i) => (
                        <div key={i} className="weekly-bar-item">
                          <div className="weekly-bar" style={{ height: `${(val / Math.max(...analyticsData.weeklyVessels)) * 100}%` }}>
                            <span className="weekly-bar-value">{val}</span>
                          </div>
                          <span className="weekly-bar-label">{dayLabels[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-card-title">{t('analytics.weeklyThreats')}</div>
                    <div className="weekly-bars">
                      {analyticsData.weeklyThreats.map((val, i) => (
                        <div key={i} className="weekly-bar-item">
                          <div className="weekly-bar threat" style={{ height: `${(val / Math.max(...analyticsData.weeklyThreats)) * 100}%` }}>
                            <span className="weekly-bar-value">{val}</span>
                          </div>
                          <span className="weekly-bar-label">{dayLabels[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="analytics-grid" style={{ marginTop: '20px' }}>
                <div className="analytics-card">
                  <div className="analytics-card-title">{t('analytics.zoneDist')}</div>
                  <div className="zone-list">
                    {Object.entries(analyticsData.zoneDistribution).map(([zone, count]) => (
                      <div key={zone} className="zone-item">
                        <span className="zone-name">{zone}</span>
                        <div className="zone-bar-wrapper"><div className="zone-bar" style={{ width: `${(count / Math.max(...Object.values(analyticsData.zoneDistribution))) * 100}%` }} /></div>
                        <span className="zone-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-title">{t('analytics.vesselTypes')}</div>
                  <div className="vessel-type-list">
                    {Object.entries(analyticsData.vesselTypes).map(([type, count]) => (
                      <div key={type} className="vessel-type-item">
                        <span className="vessel-type-name">{type}</span>
                        <div className="vessel-type-bar-wrapper"><div className="vessel-type-bar" style={{ width: `${(count / Math.max(...Object.values(analyticsData.vesselTypes))) * 100}%` }} /></div>
                        <span className="vessel-type-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================= REPORTS ======================= */}
          {activePage === 'reports' && (
            <div className="page-container">
              <div className="page-header">
                <h1 className="page-title">{t('reports.title')}</h1>
                <p className="page-subtitle">{t('reports.subtitle')}</p>
              </div>
              <div className="reports-table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>{t('reports.date')}</th>
                      <th>{t('reports.type')}</th>
                      <th>{t('reports.count')}</th>
                      <th>{t('reports.desc')}</th>
                      <th>{t('reports.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {threatHistory.map((item, i) => (
                      <tr key={i}>
                        <td className="report-date">{item.date}</td>
                        <td><span className="report-type-badge">{item.type}</span></td>
                        <td className="report-count">{item.count}</td>
                        <td className="report-desc">{item.desc}</td>
                        <td><span className={`report-status ${item.status.toLowerCase()}`}>{histStatusMap[item.status] || item.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* ===== DISPATCH PANEL ===== */}
        {showDispatchPanel && selectedVessel && (
          <div className="dispatch-overlay" onClick={() => setShowDispatchPanel(false)}>
            <div className="dispatch-panel" onClick={(e) => e.stopPropagation()}>
              <div className="dispatch-header">
                <h3>{t('dispatch.modalTitle')}</h3>
                <button className="close-btn" onClick={() => setShowDispatchPanel(false)}>✕</button>
              </div>
              <div className="dispatch-body">
                <div className="dispatch-info">
                  <p><strong>{t('dispatch.targetLabel')}:</strong> {selectedVessel.name}</p>
                  <p><strong>{t('track.mmsi')}:</strong> {selectedVessel.mmsi || 'N/A'}</p>
                  <p><strong>{t('dispatch.position')}:</strong> {selectedVessel.x?.toFixed(2)}, {selectedVessel.z?.toFixed(2)}</p>
                  <p><strong>{t('dispatch.reason')}:</strong> {t('dispatch.reasonText')}</p>
                </div>
                <div className="dispatch-options">
                  <label>{t('dispatch.selectAuthority')}</label>
                  <div className="authority-options-list">
                    {authorityVessels.map(av => (
                      <div
                        key={av.id}
                        className={`authority-option-card ${selectedAuthorityVessel === av.name ? 'selected' : ''}`}
                        onClick={() => setSelectedAuthorityVessel(av.name)}
                      >
                        <div className="authority-option-name">{av.name}</div>
                        <div className="authority-option-meta">
                          <span>{av.type}</span>
                          <span>⚡ {av.speed} kn</span>
                          <span>👥 {av.crew} {t('dispatch.personnel')}</span>
                        </div>
                        <div className="authority-option-armament">🔫 {av.armament}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className="dispatch-confirm"
                  disabled={!selectedAuthorityVessel}
                  onClick={() => {
                    const av = authorityVessels.find(a => a.name === selectedAuthorityVessel);
                    const mission = {
                      id: Date.now(),
                      targetId: selectedVessel.id,
                      targetName: selectedVessel.name,
                      fromX: av?.baseX ?? 0,
                      fromZ: av?.baseZ ?? -12,
                      toX: selectedVessel.x,
                      toZ: selectedVessel.z,
                      authorityVessel: selectedAuthorityVessel,
                    };
                    handleDispatch(mission);
                  }}
                >
                  {t('dispatch.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
      </div>
    </>
  );
}