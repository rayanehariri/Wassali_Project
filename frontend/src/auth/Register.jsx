// Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import LogoIcon from './LogoIcon';
import { register } from './FakeUsers';

function RegisterPage({ addToast }) {
  const navigate = useNavigate();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('client');
  const [confirm, setConfirm]   = useState('');
  const [agreed, setAgreed]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  function getPasswordStrength() {
    let score = 0;
    if (password.length >= 6)           score++;
    if (password.length >= 10)          score++;
    if (/[0-9]/.test(password))         score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  }

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#16a34a'];
  const strength = getPasswordStrength();

  function validate() {
    const newErrors = {};
    if (!name.trim())  newErrors.name     = 'Full name is required';
    if (!email)        newErrors.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
    if (!password)     newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!confirm)      newErrors.confirm  = 'Please confirm your password';
    else if (password !== confirm) newErrors.confirm = 'Passwords do not match';
    if (!agreed)       newErrors.agreed   = 'You must agree to the terms';
    return newErrors;
  }

  function handleRegister() {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);

    // ✅ Pass the actual role selected by the user (client or deliverer)
    register({ name, email, password, role })
      .then(() => {
        setLoading(false);
        addToast(
          'success',
          'Account created!',
          role === 'deliverer'
            ? 'Log in to complete your deliverer registration.'
            : 'You can now log in.'
        );
        navigate('/login');
      })
      .catch((err) => {
        setLoading(false);
        setErrors({ general: err.message });
        addToast('error', 'Registration failed', err.message);
      });
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-animate">
        <div className="auth-logo-row">
          <LogoIcon size={26} color="#3b82f6" />
          <span className="auth-logo-text">Wassali</span>
        </div>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Join Wassali and start delivering smarter.</p>

        {/* Role Selector */}
        <div className="role-selector">

          {/* Client card */}
          <div
            className={`role-card ${role === 'client' ? 'active' : ''}`}
            onClick={() => setRole('client')}
          >
            <div className="role-card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <span className="role-card-label">Send Parcels</span>
          </div>

          {/* Deliverer card */}
          <div
            className={`role-card ${role === 'deliverer' ? 'active' : ''}`}
            onClick={() => setRole('deliverer')}
          >
            <div className="role-card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span className="role-card-label">Deliver Parcels</span>
          </div>

        </div>

        {/* Deliverer hint */}
        {role === 'deliverer' && (
          <div className="auth-hint-box" style={{ marginBottom: 12 }}>
            <span>After registering, log in to complete your vehicle info & documents.</span>
          </div>
        )}

        {errors.general && <div className="auth-error-banner">{errors.general}</div>}

        <div className="auth-form-group">
          <label className="auth-label">USERNAME</label>
          <div className={`auth-input-wrap ${errors.name ? 'input-error' : ''}`}>
            <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <input
              type="text"
              className="auth-input"
              placeholder="Enter your username"
              value={name}
              onChange={e => { setName(e.target.value); setErrors({}); }}
              autoComplete="name"
            />
          </div>
          {errors.name && <span className="auth-field-error">{errors.name}</span>}
        </div>

        <div className="auth-form-group">
          <label className="auth-label">EMAIL</label>
          <div className={`auth-input-wrap ${errors.email ? 'input-error' : ''}`}>
            <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              type="email"
              className="auth-input"
              placeholder="Enter your email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors({}); }}
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
              type="password"
              className="auth-input"
              placeholder="Create a password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors({}); }}
              autoComplete="new-password"
            />
          </div>
          {password && (
            <div className="pw-strength">
              <div className="pw-strength-bars">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="pw-strength-bar"
                    style={{ background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.15)' }} />
                ))}
              </div>
              <span style={{ color: strengthColors[strength], fontSize: 11 }}>{strengthLabels[strength]}</span>
            </div>
          )}
          {errors.password && <span className="auth-field-error">{errors.password}</span>}
        </div>

        <div className="auth-form-group">
          <label className="auth-label">CONFIRM PASSWORD</label>
          <div className={`auth-input-wrap ${errors.confirm ? 'input-error' : ''}`}>
            <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type="password"
              className="auth-input"
              placeholder="Confirm your password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setErrors({}); }}
              autoComplete="new-password"
            />
            {confirm && password === confirm && (
              <svg className="auth-check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          {errors.confirm && <span className="auth-field-error">{errors.confirm}</span>}
        </div>

        <div className="auth-checkbox-row">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={e => { setAgreed(e.target.checked); setErrors({}); }}
          />
          <label htmlFor="agree">
            I agree to the <button className="auth-link-btn">Terms & Conditions</button> and <button className="auth-link-btn">Privacy Policy</button>
          </label>
        </div>
        {errors.agreed && (
          <span className="auth-field-error" style={{ marginTop: -12, marginBottom: 8, display: 'block' }}>
            {errors.agreed}
          </span>
        )}

        <button className="auth-btn" onClick={handleRegister} disabled={loading}>
          {loading ? <span className="auth-spinner"></span> : 'Create Account'}
        </button>
        <div className="auth-divider"><span>or</span></div>
        <p className="auth-switch">
          Already have an account?{' '}
          <button className="auth-link-btn bold" onClick={() => navigate('/login')}>Log in</button>
        </p>
      </div>
    </AuthLayout>
  );
}

export default RegisterPage;