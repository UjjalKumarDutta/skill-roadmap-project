const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load roles mapping
const rolesPath = path.join(__dirname, 'data', 'roles.json');
let roles = {};
try {
  roles = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
} catch (err) {
  console.error('Failed to load roles.json', err);
  roles = {};
}

// Helper: normalize skill strings
function normalizeSkill(s) {
  if (!s) return '';
  return s.toString().trim().toLowerCase();
}

// POST /api/skill-gap
app.post('/api/skill-gap', (req, res) => {
  const { role, currentSkills } = req.body || {};
  if (!role) return res.status(400).json({ error: 'Missing "role" in body' });

  const roleData = roles[role];
  if (!roleData) {
    return res.status(400).json({ error: 'Unknown role. Available roles: ' + Object.keys(roles).join(', ') });
  }

  // Prepare user skills array (accept string or array)
  let userSkillsArray = [];
  if (Array.isArray(currentSkills)) userSkillsArray = currentSkills;
  else if (typeof currentSkills === 'string') {
    // comma separated string
    userSkillsArray = currentSkills.split(',').map(s => s.trim()).filter(Boolean);
  } else {
    userSkillsArray = [];
  }

  const userSkillsNorm = userSkillsArray.map(s => normalizeSkill(s)).filter(Boolean);

  const requiredSkills = roleData.skills || [];
  const matched = [];
  const missing = [];

  requiredSkills.forEach(reqSkill => {
    if (userSkillsNorm.includes(normalizeSkill(reqSkill))) matched.push(reqSkill);
    else missing.push(reqSkill);
  });

  const recommendations = missing.map(s => `Learn and practice ${s} (courses, projects, and exercises).`);

  // Simple learning order heuristic: group missing skills into 3 phases
  const phase1 = [];
  const phase2 = [];
  const phase3 = [];
  missing.forEach(s => {
    const low = s.toLowerCase();
    if (low.includes('javascript') || low.includes('html') || low.includes('css') || low.includes('linux') || low.includes('python')) {
      phase1.push(s);
    } else if (low.includes('node') || low.includes('react') || low.includes('rest') || low.includes('sql') || low.includes('etl')) {
      phase2.push(s);
    } else {
      phase3.push(s);
    }
  });

  const learningOrder = [
    { phase: 1, topics: phase1.length ? phase1 : ['Foundations review'], etaWeeks: Math.max(1, Math.ceil(phase1.length * 1)) },
    { phase: 2, topics: phase2.length ? phase2 : ['Core practical topics'], etaWeeks: Math.max(1, Math.ceil(phase2.length * 2)) },
    { phase: 3, topics: phase3.length ? phase3 : ['Advanced topics & project work'], etaWeeks: Math.max(2, Math.ceil(phase3.length * 3)) }
  ];

  res.json({
    role,
    matchedSkills: matched,
    missingSkills: missing,
    recommendations,
    learningOrder
  });
});

// POST /api/roadmap
app.post('/api/roadmap', (req, res) => {
  const { role } = req.body || {};
  if (!role) return res.status(400).json({ error: 'Missing "role" in body' });
  const roleData = roles[role];
  if (!roleData) {
    return res.status(400).json({ error: 'Unknown role. Available roles: ' + Object.keys(roles).join(', ') });
  }

  const skills = roleData.skills || [];
  const total = skills.length;
  const p1 = skills.slice(0, Math.ceil(total / 3));
  const p2 = skills.slice(Math.ceil(total / 3), Math.ceil((2 * total) / 3));
  const p3 = skills.slice(Math.ceil((2 * total) / 3));

  const roadmap = [
    { phase: 1, name: 'Foundations', topics: p1, etaWeeks: Math.max(1, Math.ceil(p1.length * 1)) },
    { phase: 2, name: 'Core Skills', topics: p2, etaWeeks: Math.max(1, Math.ceil(p2.length * 2)) },
    { phase: 3, name: 'Advanced & Projects', topics: p3, etaWeeks: Math.max(2, Math.ceil(p3.length * 3)) }
  ];

  res.json({ role, roadmap });
});

// Health check
app.get('/', (req, res) => res.send('Skill Gap API running'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
