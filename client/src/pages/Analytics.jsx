import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import api from '../api';

export default function Analytics() {
  const { code }              = useParams();
  const [data, setData]       = useState(null);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();

  useEffect(() => {
    api.get(`/analytics/${code}`)
      .then(res => setData(res.data))
      .catch(() => setError('Could not load analytics for this link'));
  }, [code]);

  if (error) return (
    <div className="page-wrapper">
      <nav className="navbar">
        <span className="navbar-brand">Shortly</span>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </nav>
      <div className="loading-screen">{error}</div>
    </div>
  );

  if (!data) return (
    <div className="loading-screen">Loading analytics...</div>
  );

  return (
    <div className="page-wrapper">

      <nav className="navbar">
        <span className="navbar-brand">Shortly</span>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </nav>

      <div className="content-area">

        <div className="card">
          <div className="analytics-header">
            <div>
              <h1 className="section-title" style={{ marginBottom: 4 }}>
                Analytics for <span className="code-pill">/{code}</span>
              </h1>
              <a
                href={data.original_url}
                target="_blank"
                rel="noreferrer"
                className="url-link analytics-meta"
              > {data.original_url}
              </a>
            </div>
            <div className="analytics-meta">
              Created {new Date(data.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="analytics-stats">
            <div className="analytics-stat">
              <div className="analytics-stat-value" style={{ color: 'var(--brand)' }}>
                {data.total_clicks}
              </div>
              <div className="analytics-stat-label">Total Clicks</div>
            </div>
            <div className="analytics-stat">
              <div className="analytics-stat-value" style={{ color: 'var(--success)' }}>
                {data.top_referrers?.length || 0}
              </div>
              <div className="analytics-stat-label">Unique Referrers</div>
            </div>
            <div className="analytics-stat">
              <div className="analytics-stat-value" style={{ color: 'var(--warn)' }}>
                {data.clicks_over_time?.length || 0}
              </div>
              <div className="analytics-stat-label">Days Tracked</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="chart-title">Clicks Over Time — Last 30 Days</div>
          {data.clicks_over_time?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.clicks_over_time}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#4f46e5' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No click data yet</div>
          )}
        </div>

        <div className="card">
          <div className="chart-title">Top Referrers</div>
          {data.top_referrers?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.top_referrers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="referrer" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              No referrer data yet. Share your link to start tracking.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
