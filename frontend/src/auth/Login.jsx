// Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import LogoIcon from './LogoIcon';
import { login } from './FakeUsers';

function LoginPage({ onLogin, addToast }) {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  function validate() {
    const newErrors = {};
    if (!email)    newErrors.email    = 'Email is required';
    /*else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';*/
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  }

  function handleLogin() {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setErrors({});
    setLoading(true);

    login(email, password)
      .then(({ user, token }) => {
        setLoading(false);
         onLogin(user, token);
        addToast('success', `Welcome back, ${user.name.split(' ')[0]}!`, 'You have logged in successfully.');
      })
      .catch((err) => {
        setLoading(false);
        setErrors({ general: err.message });
        addToast('error', 'Login failed', err.message);
      });
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-animate">
        <div className="auth-logo-row">
          <LogoIcon size={26} color="#3b82f6" />
          <span className="auth-logo-text">Wassali</span>
        </div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Log in to your account to continue.</p>

        {errors.general && <div className="auth-error-banner">{errors.general}</div>}

        <div className="auth-hint-box">
          <span>Test accounts:</span>
          <code>admin@wassali.com</code>
          <span>Password: <code>123456</code></span>
        </div>

        <div className="auth-form-group">
          <label className="auth-label">USERNAME</label>
          <div className={`auth-input-wrap ${errors.email ? 'input-error' : ''}`}>
            <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              type="email"
              className="auth-input"
              placeholder="Enter your username"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors({}); }}
              onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
              autoComplete="email"
            />
          </div>
          {errors.email && <span className="auth-field-error">{errors.email}</span>}
        </div>

        <div className="auth-form-group">
          <label className="auth-label">PASSWORD</label>
          <div className={`auth-input-wrap ${errors.password ? 'input-error' : ''}`}>
            <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type={showPass ? 'text' : 'password'}
              className="auth-input"
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors({}); }}
              onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
              autoComplete="current-password"
            />
            <button className="auth-eye-btn" onClick={() => setShowPass(!showPass)}>
              {showPass ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <span className="auth-field-error">{errors.password}</span>}
        </div>

        <div className="auth-forgot-row">
          <button className="auth-link-btn" onClick={() => navigate('/forgot')}>Forgot password?</button>
        </div>

        <button className="auth-btn" onClick={handleLogin} disabled={loading}>
          {loading ? <span className="auth-spinner"></span> : 'Log In'}
        </button>
        <div className="auth-divider"><span>or</span></div>
        <p className="auth-switch">
          Don't have an account?{' '}
          <button className="auth-link-btn bold" onClick={() => navigate('/register')}>Sign up for free</button>
        </p>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;