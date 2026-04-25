import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import LogoIcon from './LogoIcon';
import { registerEmailStart, registerResendCode, registerStart, registerVerify } from './FakeUsers';

const CELL_COUNT = 6;
const EMAIL_OK = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function VerifyPhonePage({ addToast }) {
  const navigate = useNavigate();
  const location = useLocation();

  const registration = location.state?.registration || null;
  const [pendingId, setPendingId] = useState(location.state?.pendingId || '');
  const [phone, setPhone] = useState(location.state?.phone || '');
  const [email, setEmail] = useState(location.state?.email || registration?.email || '');
  const [verifyMethod, setVerifyMethod] = useState(location.state?.verifyMethod || '');
  const [stage, setStage] = useState(() => (location.state?.pendingId ? 'code' : 'choose'));

  const [digits, setDigits] = useState(() => Array(CELL_COUNT).fill(''));
  const inputsRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [resendSec, setResendSec] = useState(45);
  const [resending, setResending] = useState(false);
  const [devCodeBanner, setDevCodeBanner] = useState(location.state?.devVerificationCode || '');
  const [devNoticeBanner, setDevNoticeBanner] = useState(location.state?.devNotice || '');

  useEffect(() => {
    if (!pendingId && !registration) {
      navigate('/register', { replace: true });
    }
  }, [pendingId, registration, navigate]);

  useEffect(() => {
    if (stage !== 'code') return undefined;
    const t = setInterval(() => setResendSec((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [stage]);

  function setAt(i, ch) {
    const c = (ch || '').replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = c;
      return next;
    });
    if (c && i < CELL_COUNT - 1) inputsRef.current[i + 1]?.focus();
  }

  function onKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === 'Enter') handleSubmit();
  }

  function onPaste(e) {
    const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, CELL_COUNT);
    if (!t) return;
    e.preventDefault();
    const arr = t.split('');
    const next = Array(CELL_COUNT).fill('');
    arr.forEach((d, j) => {
      if (j < CELL_COUNT) next[j] = d;
    });
    setDigits(next);
    const last = Math.min(arr.length, CELL_COUNT) - 1;
    inputsRef.current[last >= 0 ? last : 0]?.focus();
  }

  async function handleSendCode() {
    if (!registration) {
      navigate('/register', { replace: true });
      return;
    }
    if (!verifyMethod) {
      addToast?.('error', 'Choose a method', 'Select email or phone verification to continue.');
      return;
    }
    if (verifyMethod === 'phone' && !/^\+?[0-9\s\-()]{8,20}$/.test(phone.trim())) {
      addToast?.('error', 'Invalid phone', 'Enter a valid phone number before continuing.');
      return;
    }
    if (verifyMethod === 'email') {
      const em = (registration.email || '').trim();
      if (!EMAIL_OK.test(em)) {
        addToast?.('error', 'Invalid email', 'Use a real email address (example: you@domain.com).');
        return;
      }
    }

    setLoading(true);
    try {
      const out = verifyMethod === 'email'
        ? await registerEmailStart({
            name: registration.name,
            email: registration.email,
            password: registration.password,
            role: registration.role,
            wilaya: registration.wilaya,
          })
        : await registerStart({
            name: registration.name,
            email: registration.email,
            phone: phone.trim(),
            password: registration.password,
            role: registration.role,
            wilaya: registration.wilaya,
          });

      setPendingId(out.pendingId);
      setEmail(registration.email);
      setDevCodeBanner(out.devVerificationCode || '');
      setDevNoticeBanner(out.devNotice || '');
      setDigits(Array(CELL_COUNT).fill(''));
      setResendSec(45);
      setStage('code');

      if (verifyMethod === 'phone') {
        if (out.devVerificationCode) {
          addToast?.('info', 'Phone code', `Your SMS code is ${out.devVerificationCode}.`);
        } else {
          addToast?.('info', 'Phone code', 'Phone mode uses in-app dev code. If none is shown, resend.');
        }
      } else if (out.devVerificationCode) {
        addToast?.('info', 'Verification code', `Your code is ${out.devVerificationCode}.`);
      } else {
        addToast?.('success', 'Code sent', 'Check your inbox for the 6-digit code.');
      }
      if (out.devNotice) addToast?.('info', 'Note', out.devNotice);
    } catch (err) {
      addToast?.('error', 'Could not send code', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    const code = digits.join('');
    if (code.length !== CELL_COUNT) {
      addToast?.('error', 'Incomplete code', 'Enter all 6 digits.');
      return;
    }
    setLoading(true);
    try {
      await registerVerify(pendingId, code);
      addToast?.('success', 'You’re verified', 'Your account is ready. Sign in to continue.');
      navigate('/login', { replace: true });
    } catch (err) {
      addToast?.('error', 'Verification failed', err.message || 'Wrong or expired code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendSec > 0 || resending) return;
    setResending(true);
    try {
      const out = await registerResendCode(pendingId);
      if (out.devVerificationCode) {
        setDevCodeBanner(out.devVerificationCode);
        setDevNoticeBanner(out.devNotice || '');
        addToast?.('info', 'New code', `Your new code is ${out.devVerificationCode}.`);
      } else {
        addToast?.('info', 'Code sent', 'Check your inbox for the new code.');
      }
      if (out.devNotice) addToast?.('info', 'Note', out.devNotice);
      setResendSec(45);
    } catch (err) {
      addToast?.('error', 'Could not resend', err.message || 'Try again later.');
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-animate" style={{ maxWidth: 420, margin: '0 auto' }}>
        <div className="auth-logo-row" style={{ justifyContent: 'center', marginBottom: 8 }}>
          <LogoIcon size={28} color="#3b82f6" />
          <span className="auth-logo-text">Wassali</span>
        </div>
        <h2 className="auth-title" style={{ textAlign: 'center' }}>Verify your account</h2>
        <p className="auth-subtitle" style={{ textAlign: 'center', marginBottom: 8 }}>
          {stage === 'choose'
            ? 'Choose how you want to receive your verification code.'
            : verifyMethod === 'phone'
            ? <>Enter the 6-digit code shown below (dev SMS mode for phone verification).</>
            : <>Enter the 6-digit code we sent to <strong>{email || 'your email'}</strong>.</>}
        </p>

        {stage === 'choose' && (
          <>
            <div style={{ marginBottom: 14 }}>
              <div className="verify-method-grid">
                <div
                  role="button"
                  tabIndex={0}
                  className={`verify-method-card ${verifyMethod === 'email' ? 'active' : ''}`}
                  onClick={() => setVerifyMethod('email')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setVerifyMethod('email'); }}
                >
                  <div className="verify-method-row">
                    <div className="verify-method-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      Email
                    </div>
                    {verifyMethod === 'email' && <span className="verify-method-pill">Selected</span>}
                  </div>
                  <div className="verify-method-sub">
                    Send a 6-digit code to {registration?.email || 'your email'}.
                  </div>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  className={`verify-method-card ${verifyMethod === 'phone' ? 'active' : ''}`}
                  onClick={() => setVerifyMethod('phone')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setVerifyMethod('phone'); }}
                >
                  <div className="verify-method-row">
                    <div className="verify-method-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6.27 6.27l1.28-1.29a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      Phone
                    </div>
                    {verifyMethod === 'phone' && <span className="verify-method-pill">Selected</span>}
                  </div>
                  <div className="verify-method-sub">
                    Enter your phone number and verify with a 6-digit code.
                  </div>
                </div>
              </div>
            </div>

            {verifyMethod === 'phone' && (
              <div className="auth-form-group">
                <label className="auth-label">PHONE NUMBER</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6.27 6.27l1.28-1.29a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <input
                    type="tel"
                    className="auth-input"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
              </div>
            )}

            <button type="button" className="auth-btn" onClick={handleSendCode} disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Send verification code'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 20 }}>
              <Link to="/register" className="auth-link-btn">← Back to registration</Link>
            </p>
          </>
        )}

        {stage === 'code' && (devCodeBanner || devNoticeBanner) && (
          <div
            role="status"
            style={{
              marginBottom: 16,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.45)',
              textAlign: 'center',
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {devNoticeBanner && <p style={{ margin: '0 0 8px', opacity: 0.95 }}>{devNoticeBanner}</p>}
            {devCodeBanner && (
              <p style={{ margin: 0, fontWeight: 800, letterSpacing: '0.2em', fontSize: 20 }}>
                {devCodeBanner}
              </p>
            )}
          </div>
        )}

        {stage === 'code' && (
          <>
            <div
              style={{
                display: 'flex',
                gap: 8,
                justifyContent: 'center',
                margin: '24px 0 8px',
              }}
              onPaste={onPaste}
            >
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputsRef.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={d}
                  onChange={(e) => setAt(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  className="auth-input"
                  style={{
                    width: 44,
                    height: 52,
                    textAlign: 'center',
                    fontSize: 22,
                    fontWeight: 800,
                    borderRadius: 12,
                    padding: 0,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                  }}
                />
              ))}
            </div>

            <button type="button" className="auth-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Continue'}
            </button>

            <p className="auth-switch" style={{ marginTop: 16, textAlign: 'center' }}>
              Didn&apos;t get it?{' '}
              <button
                type="button"
                className="auth-link-btn bold"
                disabled={resendSec > 0 || resending}
                onClick={handleResend}
              >
                {resendSec > 0 ? `Resend in ${resendSec}s` : resending ? 'Sending…' : 'Resend code'}
              </button>
            </p>

            <p style={{ textAlign: 'center', marginTop: 20 }}>
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setStage('choose');
                  setPendingId('');
                  setDigits(Array(CELL_COUNT).fill(''));
                  setDevCodeBanner('');
                  setDevNoticeBanner('');
                  setResendSec(45);
                }}
              >
                ← Change verification method
              </button>
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
