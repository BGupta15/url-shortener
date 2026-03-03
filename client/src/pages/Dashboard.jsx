// client/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [form, setForm] = useState({ url: '', alias: '', expires_in_days: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const loadUrls = async () => {
    const res = await api.get('/urls/mine');
    setUrls(res.data);
  };

  useEffect(() => { loadUrls(); }, []);

  const handleShorten = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/shorten', form);
      setMessage(`Created: ${res.data.short_url}`);
      loadUrls();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error');
    }
  };

  const handleDelete = async (code) => {
    await api.delete(`/urls/${code}`);
    loadUrls();
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Your URLs</h2>

      <form onSubmit={handleShorten} style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
        <input placeholder="https://example.com" value={form.url}
          onChange={e => setForm({ ...form, url: e.target.value })}
          style={{ flex: 2, padding: 8 }} />
        <input placeholder="custom-alias (optional)" value={form.alias}
          onChange={e => setForm({ ...form, alias: e.target.value })}
          style={{ flex: 1, padding: 8 }} />
        <input type="number" placeholder="Expires in days" value={form.expires_in_days}
          onChange={e => setForm({ ...form, expires_in_days: e.target.value })}
          style={{ flex: 1, padding: 8 }} />
        <button type="submit" style={{ padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 4 }}>
          Shorten
        </button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: 10, textAlign: 'left' }}>Short Code</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Original URL</th>
            <th style={{ padding: 10 }}>Clicks</th>
            <th style={{ padding: 10 }}>Expires</th>
            <th style={{ padding: 10 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {urls.map(u => (
            <tr key={u.short_code} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: 10 }}><a href={`/${u.short_code}`}>{u.short_code}</a></td>
              <td style={{ padding: 10 }}>{u.original_url.substring(0, 50)}...</td>
              <td style={{ padding: 10, textAlign: 'center' }}>{u.total_clicks}</td>
              <td style={{ padding: 10 }}>{u.expires_at ? new Date(u.expires_at).toLocaleDateString() : '—'}</td>
              <td style={{ padding: 10 }}>
                <button onClick={() => navigate(`/analytics/${u.short_code}`)}
                  style={{ marginRight: 8, padding: '4px 10px' }}>Analytics</button>
                <button onClick={() => handleDelete(u.short_code)}
                  style={{ padding: '4px 10px', color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}