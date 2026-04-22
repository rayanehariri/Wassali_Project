import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import LogoIcon from './LogoIcon';
import { http } from '../api/http';

export default function ResetPasswordPage({ addToast }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => (params.get('token') || '').trim(), [params]);

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      addToast?.('error', 'Invalid link', 'Open the reset link from your email.');
      return;
    }
    if (pw.length < 5) {
      addToast?.('error', 'Password too short', 'Use at least 5 characters with a digit and a symbol.');
      return;
    }
    if (pw !== pw2) {
      addToast?.('error', 'Mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await http.post('/auth/reset-password/', { token, new_password: pw });
      addToast?.('success', 'Password updated', 'You can sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      addToast?.('error', 'Reset failed', err.response?.data?.message || err.message || 'Link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-animate" style={{ maxWidth: 420, margin: '0 auto' }}>
        <div className="auth-logo-row" style={{ justifyContent: 'center' }}>
          <LogoIcon size={26} color="#3b82f6" />
          <span className="auth-logo-text">Wassali</span>
        </div>
        <h2 className="auth-title" style={{ textAlign: 'center' }}>New password</h2>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>
          Choose a strong password (include a number and a special character).
        </p>

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">NEW PASSWORD</label>
            <input
              type="password"
              className="auth-input"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">CONFIRM</label>
            <input
              type="password"
              className="auth-input"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Update password'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login" className="auth-link-btn">Back to login</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
