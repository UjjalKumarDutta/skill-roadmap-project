import React, { useEffect, useState } from 'react';
import axios from 'axios';

function formatUnixTime(ts) {
  if (!ts) return 'Unknown';
  return new Date(ts * 1000).toLocaleString();
}

export default function Dashboard({ analysis, roadmap, role }) {
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState('');

  useEffect(() => {
  const fetchHackerNews = async () => {
    setLoadingNews(true);
    setNewsError('');
    try {
      // 1) Try to get newest stories
      const idsResp = await axios.get('https://hacker-news.firebaseio.com/v0/newstories.json');
      const ids = idsResp.data || [];

      // take first 100 newest IDs
      const candidateIds = ids.slice(0, 100);

      const detailPromises = candidateIds.map(id =>
        axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .then(r => r.data)
          .catch(() => null)
      );

      const details = await Promise.all(detailPromises);

      // filter for recent stories (7 days)
      const now = Math.floor(Date.now() / 1000);
      const sevenDays = 7 * 24 * 3600;

      const recentStories = (details || [])
        .filter(Boolean)
        .filter(s => s.type === 'story')
        .filter(s => (now - (s.time || 0)) <= sevenDays) // last 7 days
        .sort((a, b) => (b.time || 0) - (a.time || 0))    // newest first
        .slice(0, 5);

      if (recentStories.length >= 5) {
        setNews(recentStories);
      } else {
        // fallback to top stories
        const topResp = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const topIds = (topResp.data || []).slice(0, 50);

        const topPromises = topIds.map(id =>
          axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            .then(r => r.data)
            .catch(() => null)
        );

        const topDetails = await Promise.all(topPromises);

        const topStories = (topDetails || [])
          .filter(Boolean)
          .filter(s => s.type === 'story')
          .sort((a, b) => (b.time || 0) - (a.time || 0))
          .slice(0, 5);

        setNews(topStories);
      }

    } catch (err) {
      console.error(err);
      setNewsError('Failed to fetch HackerNews. Maybe network issue.');
    } finally {
      setLoadingNews(false);
    }
  };

  // call the fetch function
  fetchHackerNews();
}, []);


  const spinnerClass = document.documentElement.getAttribute('data-theme') === 'dark' ? 'spinner' : 'spinner-dark';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 18 }}>
        <div className="left-col card">
          <h3>Skill Gap — {role}</h3>
          <p><strong>Matched skills:</strong> {analysis.matchedSkills.length ? analysis.matchedSkills.join(', ') : 'None'}</p>
          <p><strong>Missing skills:</strong> {analysis.missingSkills.length ? analysis.missingSkills.join(', ') : 'None'}</p>
          <h4>Recommendations</h4>
          <ul>
            {analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>

        <div className="right-col">
          <div className="card">
            <h3>Career Roadmap</h3>
            {roadmap ? (
              <>
                {roadmap.map((p) => (
                  <div key={p.phase} style={{ marginBottom: 10 }}>
                    <h4>Phase {p.phase} — {p.name || ''} (~{p.etaWeeks} weeks)</h4>
                    <ul>
                      {p.topics.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>
                ))}
              </>
            ) : <div>No roadmap available.</div>}
          </div>
        </div>
      </div>

      <div className="card news-card">
        <h3>
          HackerNews — Top 5 (Latest Tech Stories)
          {loadingNews && <span style={{ marginLeft: 10 }} className={spinnerClass}></span>}
        </h3>

        {loadingNews && (
          <div style={{ marginTop: 12 }}>
            <em style={{ color: 'var(--muted)' }}>Loading latest stories...</em>
          </div>
        )}

        {newsError && <div style={{ color: 'red' }}>{newsError}</div>}

        <ul className="news-list" style={{ marginTop: 8 }}>
          {news.map((n) => {
            const url = n.url ? n.url : `https://news.ycombinator.com/item?id=${n.id}`;
            return (
              <li key={n.id} className="news-item">
                <a href={url} target="_blank" rel="noreferrer">{n.title}</a>
                <div className="news-meta">
                  <span><strong>By:</strong> {n.by || 'unknown'}</span> ·{' '}
                  <span><strong>Score:</strong> {n.score ?? 'n/a'}</span> ·{' '}
                  <span><strong>Type:</strong> {n.type || 'n/a'}</span> ·{' '}
                  <span><strong>Time:</strong> {formatUnixTime(n.time)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}



