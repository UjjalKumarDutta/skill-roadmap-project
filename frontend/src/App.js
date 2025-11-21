import React, { useState, useEffect } from 'react';
import InputPage from './components/InputPage';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [role, setRole] = useState('');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // read saved preference
    const saved = localStorage.getItem('site-theme');
    if (saved) setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved || theme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('site-theme', theme);
  }, [theme]);

  return (
    <div className="App">
      <h1>Skill Gap & Career Roadmap</h1>
      <div className="theme-toggle">
        <label style={{ fontSize: 14, marginRight: 8 }}>
          <input
            type="checkbox"
            checked={theme === 'dark'}
            onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
            style={{ marginRight: 6 }}
          />
          Dark
        </label>
      </div>

      <div className="card input-card">
        <InputPage setAnalysis={setAnalysis} setRoadmap={setRoadmap} setRole={setRole} />
      </div>

      {analysis && (
        <div className="top-row" style={{ marginTop: 12 }}>
          <div className="left-col">
            <Dashboard analysis={analysis} roadmap={roadmap} role={role} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;


