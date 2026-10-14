'use client';
import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setApiKey('');

    try {
      const res = await fetch('/api/get-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setApiKey(data.apiKey);
      } else {
        setError(data.error || 'Failed to generate API key');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '32px', backgroundColor: '#1f2937', borderRadius: '12px', border: '1px solid #374151' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>AI Gateway Access Portal</h1>
        <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '24px', textAlign: 'center' }}>Enter your email to receive your dedicated OmniRoute API key.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '6px' }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              style={{ width: '100%', padding: '10px 14px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '10px', backgroundColor: '#4f46e5', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'Generating...' : 'Get My API Key'}
          </button>
        </form>
        {error && <p style={{ marginTop: '16px', fontSize: '13px', color: '#f87171', textAlign: 'center' }}>{error}</p>}
        {apiKey && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#111827', border: '1px solid #6366f1', borderRadius: '8px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#818cf8', marginBottom: '6px' }}>Your OmniRoute API Key</p>
            <code style={{ display: 'block', padding: '8px', backgroundColor: '#000', borderRadius: '4px', fontSize: '12px', wordBreak: 'break-all', color: '#4ade80' }}>{apiKey}</code>
          </div>
        )}
      </div>
    </main>
  );
}
