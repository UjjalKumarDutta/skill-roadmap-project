import React, { useState } from 'react';
import axios from 'axios';
import API_BASE from '../config';


const roles = [
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Engineer"
];

export default function InputPage({ setAnalysis, setRoadmap, setRole }) {
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [skillsText, setSkillsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
  setError('');
  setAnalysis(null);
  setRoadmap(null);
  setLoading(true);

  try {
    const sg = await axios.post(`${API_BASE}/api/skill-gap`, {
      role: selectedRole,
      currentSkills: skillsText
    });
    setAnalysis(sg.data);

    const rm = await axios.post(`${API_BASE}/api/roadmap`, {
      role: selectedRole
    });
    setRoadmap(rm.data.roadmap);

  } catch (err) {
    console.error(err);
    setError('Failed to fetch data from server.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div>
      <h2 style={{ marginBottom: 12 }}>Enter Career Goal</h2>

      <div style={{ marginBottom: 12 }}>
        <label>Target Role:</label>
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={{ marginTop: 6 }}>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Your current skills (comma separated):</label>
        <input type="text" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="e.g. javascript, node.js, sql" />
      </div>

      <div>
        <button className="btn" onClick={submit} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze My Career Path'}
          {loading && <span className={document.documentElement.getAttribute('data-theme') === 'dark' ? 'spinner' : 'spinner-dark'}></span>}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}


