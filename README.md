Tech stack used :-

Frontend: React (Create React App), Axios
Backend: Node.js + Express
Data storage: Local JSON file (backend/data/roles.json)
Public API: HackerNews Firebase API (newstories.json, item/<id>.json)
Dev tools: npm, optional nodemon for backend auto-reload

How to run the frontend (local) :-

Open a new terminal → go to frontend folder:
cd skill-roadmap-project/frontend
Install dependencies:
npm install
Start React dev server:
npm start

Open the app in browser:

http://localhost:3000

How to run the backend (local) :-

Open terminal → go to backend folder:
cd skill-roadmap-project/backend
Install dependencies (if needed):
npm install

Start server:
node server.js
# or (recommended during development)
npx nodemon server.js
Server will run on http://localhost:5000 (unless PORT env var is set). Health-check:

GET http://localhost:5000/
# returns: "Skill Gap API running"


Note: Frontend reads backend base URL from frontend/src/config.js, which uses process.env.REACT_APP_API_URL if set, otherwise falls back to http://localhost:5000. This lets you point the frontend to a deployed backend later without changing code.

API endpoints (backend) :-

All endpoints accept/return JSON.

GET /
Purpose: Health check
Response: Skill Gap API running

POST /api/skill-gap
Purpose: Analyze the user’s current skills against a role.

Request body:

{
  "role": "Frontend Developer",
  "currentSkills": "javascript, html, css"
}


(currentSkills can be a comma string; backend trims & normalizes)

Example response:

{
  "role": "Frontend Developer",
  "matchedSkills": ["HTML", "CSS", "JavaScript"],
  "missingSkills": ["React", "State Management", "Testing"],
  "recommendations": [
    "Learn and practice React (courses, projects, and exercises).",
    "Learn and practice State Management (courses, projects, and exercises)."
  ],
  "learningOrder": [
    { "phase": 1, "topics": ["HTML","CSS","JavaScript"], "etaWeeks": 4 },
    { "phase": 2, "topics": ["React","State Management"], "etaWeeks": 6 },
    { "phase": 3, "topics": ["Testing","Build Tools"], "etaWeeks": 9 }
  ]
}

POST /api/roadmap
Purpose: Return a deterministic 3-phase roadmap for a role.

Request body:
{ "role": "Frontend Developer" }

Example response:

{
  "role":"Frontend Developer",
  "roadmap": [
    { "phase": 1, "name":"Foundations", "topics":["HTML","CSS","JavaScript"], "etaWeeks": 4 },
    { "phase": 2, "name":"Core Skills", "topics":["React","State Management"], "etaWeeks": 6 },
    { "phase": 3, "name":"Advanced", "topics":["Testing","Build Tools"], "etaWeeks": 9 }
  ]
}

Assumptions

• Skill matching is case-insensitive exact match.
• Roadmap is based on a fixed rule-based logic (not AI or ML).
• No database is used — only roles.json for role → skills mapping.
• HackerNews stories are fetched from public API (newstories.json).
• Frontend uses REACT_APP_API_URL when deployed.
