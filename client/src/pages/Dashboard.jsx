import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [urls, setUrls]       = useState([]);
  const [form, setForm]       = useState({ url: '', alias: '', expires_in_days: '' });
  const [msg, setMsg]         = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState('');
  const navigate  = useNavigate();
  const username  = localStorage.getItem('username') || 'User';

  const loadUrls = async () => {
    try {
      const res = await api.get('/urls/mine');
      setUrls(res.data);
    } catch (err) {
      showMsg(err.response?.data?.error || 'Failed to load URLs', 'error');
    }
  };

  useEffect(() => { loadUrls();}, []);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3500);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/shorten', form);
      showMsg(`Created: ${res.data.short_url}`, 'success');
      setForm({ url: '', alias: '', expires_in_days: '' });
      loadUrls();
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error creating URL', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete /${code}?`)) return;

    try {
      const res = await api.delete(`/urls/${code}`);
      console.log("DELETE SUCCESS:", res.data);
      showMsg('Link deleted', 'success');
      loadUrls();
    } catch (err) {
      console.log("DELETE ERROR:", err.response);
      showMsg(err.response?.data?.error || 'Failed to delete', 'error');
    }
  };

  const handleCopy = (code) => {
    const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';
    const text = `${baseUrl}/${code}`;

    const textarea = document.createElement('textarea');
    textarea.value = text;

    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand('copy');
      setCopied(code);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      alert('Copy failed');
      console.error(err);
    }

    document.body.removeChild(textarea);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isExpired = (exp) => exp && new Date() > new Date(exp);

  const totalClicks = urls.reduce((acc, u) => acc + parseInt(u.total_clicks || 0), 0);
  const activeCount = urls.filter(u => !isExpired(u.expires_at)).length;

  return (
    <div className="page-wrapper">

      <nav className="navbar">
        <span className="navbar-brand">Shortly</span>
        <div className="navbar-right">
          <span className="navbar-user">{username}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="content-area">

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{urls.length}</div>
            <div className="stat-label">Total Links</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalClicks}</div>
            <div className="stat-label">Total Clicks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Active Links</div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Shorten a URL</div>
          <form onSubmit={handleShorten}>
            <div className="form-row">
              <input
                name="url"
                className="input"
                placeholder="https://example.com"
                value={form.url}
                onChange={handleChange}
                required
              />
              <input
                name="alias"
                className="input"
                placeholder="Custom alias (optional)"
                value={form.alias}
                onChange={handleChange}
              />
              <input
                name="expires_in_days"
                type="number"
                className="input"
                placeholder="Expires in days"
                value={form.expires_in_days}
                onChange={handleChange}
                min="1"
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Shorten'}
              </button>
            </div>
          </form>

          {msg.text && (
            <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>
              {msg.text}
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title">Your Links</div>

          {urls.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No links yet</div>
              <div className="empty-state-sub">Create your first short link above</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Short Code</th>
                    <th>Original URL</th>
                    <th>Clicks</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map(u => (
                    <tr key={u.shortened_url}>
                      <td>
                        <span className="code-pill">/{u.shortened_url}</span>
                        <button
                          className="copy-btn"
                          onClick={() => handleCopy(u.shortened_url)}
                          title="Copy short URL"
                        >
                          {copied === u.shortened_url ? 'Copied' : 'Copy'}
                        </button>
                      </td>

                      <td>
                        <a
                          href={u.original_url}
                          target="_blank"
                          rel="noreferrer"
                          className="url-link"
                          title={u.original_url}
                        >
                          {u.original_url}
                        </a>
                      </td>

                      <td>{u.total_clicks}</td>

                      <td>
                        <span className={`badge ${isExpired(u.expires_at) ? 'badge-expired' : 'badge-active'}`}>
                          {isExpired(u.expires_at) ? 'Expired' : 'Active'}
                        </span>
                      </td>

                      <td>
                        {u.expires_at
                          ? new Date(u.expires_at).toLocaleDateString()
                          : '—'}
                      </td>

                      <td>
                        <div className="action-group">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => navigate(`/analytics/${u.shortened_url}`)}
                          >
                            Stats
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(u.shortened_url)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}