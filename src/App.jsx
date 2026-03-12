import { useState, useEffect, useCallback } from 'react';
import VoiceTerminal from './VoiceTerminal';
import ChecklistView from './ChecklistView';
import { getObservations, clearObservations } from './db';
import { downloadCSV } from './ebird';
import './App.css';

export default function App() {
  const [view, setView] = useState('record'); // 'record' | 'checklist'
  const [observations, setObservations] = useState([]);

  const refreshObservations = useCallback(async () => {
    const obs = await getObservations();
    setObservations(obs);
  }, []);

  // Initial load
  useEffect(() => {
    let active = true;
    getObservations().then((obs) => {
      if (active) setObservations(obs);
    });
    return () => { active = false; };
  }, []);

  const handleExport = () => {
    if (observations.length === 0) {
      alert('No observations to export.');
      return;
    }
    downloadCSV(observations);
  };

  const handleClear = async () => {
    if (window.confirm('Clear all observations?')) {
      await clearObservations();
      setObservations([]);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">
          <span className="app-title-icon" aria-hidden="true">🐦</span>
          vBird
        </h1>
        {observations.length > 0 && (
          <span className="obs-badge" aria-label={`${observations.length} observations`}>
            {observations.length}
          </span>
        )}
      </header>

      {/* Main content */}
      <main className="app-main">
        {view === 'record' ? (
          <VoiceTerminal onObservationAdded={refreshObservations} />
        ) : (
          <ChecklistView
            observations={observations}
            onChanged={refreshObservations}
          />
        )}
      </main>

      {/* Bottom action bar */}
      {view === 'checklist' && observations.length > 0 && (
        <div className="action-bar">
          <button className="btn-export" onClick={handleExport} aria-label="Export to eBird CSV">
            📤 Export CSV
          </button>
          <button className="btn-clear" onClick={handleClear} aria-label="Clear all observations">
            🗑 Clear All
          </button>
        </div>
      )}

      {/* Navigation tabs */}
      <nav className="app-nav" aria-label="Main navigation">
        <button
          className={`nav-btn${view === 'record' ? ' nav-btn--active' : ''}`}
          style={{ flex: '0 0 60%' }}
          onClick={() => setView('record')}
          aria-current={view === 'record' ? 'page' : undefined}
        >
          🎤 Record
        </button>
        <button
          className={`nav-btn${view === 'checklist' ? ' nav-btn--active' : ''}`}
          style={{ flex: '0 0 40%' }}
          onClick={() => { setView('checklist'); refreshObservations(); }}
          aria-current={view === 'checklist' ? 'page' : undefined}
        >
          📋 Review List
          {observations.length > 0 && ` (${observations.length})`}
        </button>
      </nav>
    </div>
  );
}
