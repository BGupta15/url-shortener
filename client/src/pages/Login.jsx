import { useState } from "react";
import api from '../api.js';
import {useNavigate} from 'react-router-dom';

export default function Login(){
    const [form, setForm] = useState({username: '', password: ''});
    const [error, setError] = useState('');
    const navigate = useNavigate(); //lets you redirect to other pages

    const handleSubmit = async (e) =>{
        e.preventDefault();
        try{
            const res = await api.post('/auth/login', form);
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard');
        } catch {
            setError('Invalid Credentials')
        }
    };

    return(
        <div style={{ maxWidth: 400, margin: '100px auto', fontFamily: 'sans-serif' }}>
            <h2>URL Shortener Login</h2>
            <form onSubmit={handleSubmit}>
                <input placeholder="Username" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />

                <input type="password" placeholder="Password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />

                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ padding: '8px 20px' }}>Login</button>
            </form>
        </div>
    )
}