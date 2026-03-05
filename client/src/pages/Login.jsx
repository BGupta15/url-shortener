import { useState } from "react";
import api from '../api.js';
import {useNavigate} from 'react-router-dom';

export default function Login(){
    const [form, setForm] = useState({username: '', password: ''});
    const [error, setError] = useState('');
    const navigate = useNavigate(); //lets you redirect to other pages
    const [isReg, setIsReg]     = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) =>{
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isReg) {
                await api.post('/auth/register', form);
                setIsReg(false);
                setForm({ username: form.username, password: '' });
                setError('');
            } else {
                const res = await api.post('/auth/login', form);
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('username', form.username);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return(<div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          <div className="login-logo-mark">
            <svg viewBox="0 0 24 24">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div className="login-title">Shortly</div>
          <div className="login-subtitle">
            {isReg ? 'Create your account' : 'Sign in to your account'}
          </div>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              className="input"
              placeholder="Enter username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              autoComplete={isReg ? 'new-password' : 'current-password'}
              required
            />
          </div>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isReg ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p className="login-toggle">
          {isReg ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            className="login-toggle-link"
            onClick={() => { setIsReg(!isReg); setError(''); }}
          >
            {isReg ? 'Sign in' : 'Register'}
          </button>
        </p>
      </div>
    </div>
    );
}