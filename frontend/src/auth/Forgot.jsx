// Forgot.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { forgotPassword } from './FakeUsers';

function ForgotPage({ addToast }) {
  const navigate = useNavigate();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function handleSend() {
    if (!email) { setError('Please enter your email address.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address.'); return; }
    setError('');
    setLoading(true);

    forgotPassword(email)
      .then(() => {
        setLoading(false);
        addToast('info', 'Recovery email sent!', 'We sent a reset link to ' + email);
        navigate('/check-email');
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message);
        addToast('error', 'Error', err.message);
      });
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-animate">
        <div className="auth-forgot-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="auth-title">Forgot password?</h2>
        <p className="auth-subtitle">No worries! Enter your email and we'll send you a reset link.</p>

        <div className="auth-form-group">
          <label className="auth-label">EMAIL</label>
          <div className={`auth-input-wrap ${error ? 'input-error' : ''}`}>
            <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              type="email"
              className="auth-input"
              placeholder="Enter your email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              autoComplete="email"
            />
          </div>
          {error && <span className="auth-field-error">{error}</span>}
        </div>

        <button className="auth-btn" onClick={handleSend} disabled={loading}>
          {loading ? <span className="auth-spinner"></span> : 'Send Reset Link'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button className="auth-link-btn" onClick={() => navigate('/login')}>← Back to login</button>
        </div>
      </div>
    </AuthLayout>
  );
}

function CheckEmailPage({ addToast }) {
  const navigate = useNavigate();
  const [resent, setResent]   = useState(false);
  const [loading, setLoading] = useState(false);

  function handleResend() {
    setLoading(true);

    // Re-use forgotPassword with a placeholder — in real backend
    // this would be a dedicated /api/auth/resend-verification endpoint:
    // return axios.post("/api/auth/resend-verification")
    setTimeout(() => {
      setLoading(false);
      setResent(true);
      addToast('success', 'Email resent!', 'Check your inbox again.');
      setTimeout(() => setResent(false), 5000);
    }, 1000);
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-animate" style={{ textAlign: 'center' }}>
        <div className="check-email-icon-wrap">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <div className="check-email-dot" />
        </div>

        <h2 className="auth-title">Check your email</h2>
        <p className="auth-subtitle">We sent a password reset link to your email.</p>

        <p className="auth-switch" style={{ marginBottom: 20 }}>
          Didn't receive the email?{' '}
          <button
            className="auth-link-btn bold"
            onClick={handleResend}
            disabled={resent || loading}
          >
            {loading ? 'Sending...' : resent ? 'Sent ✓' : 'Resend email'}
          </button>
        </p>

        <button className="auth-btn" onClick={() => navigate('/login')}>
          ← Back to login
        </button>
      </div>
    </AuthLayout>
  );
}

export { ForgotPage, CheckEmailPage };