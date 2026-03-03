// client/src/pages/Analytics.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../api';

export default function Analytics() {
  const { code } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/analytics/${code}`).then(res => setData(res.data));
  }, [code]);

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Analytics for /{code}</h2>
      <p>Original: <a href={data.original_url}>{data.original_url}</a></p>
      <p>Total Clicks: <strong>{data.total_clicks}</strong></p>
      <p>Created: {new Date(data.created_at).toLocaleString()}</p>

      <h3>Clicks Over Time (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data.clicks_over_time}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="clicks" stroke="#4f46e5" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <h3>Top Referrers</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data.top_referrers}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="referrer" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}