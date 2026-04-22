// Phone verification after sign-up — code sent by email (SMS line in server logs until provider is wired).
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import LogoIcon from './LogoIcon';
import { registerVerify, registerResendCode } from './FakeUsers';

const CELL_COUNT = 6;

export default function VerifyPhonePage({ addToast }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pendingId = location.state?.pendingId;
  const phone = location.state?.phone || '';
  const email = location.state?.email || '';
  const initialDevCode = location.state?.devVerificationCode || '';
  const initialDevNotice = location.state?.devNotice || '';

  const [digits, setDigits] = useState(() => Array(CELL_COUNT).fill(''));
  const inputsRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [resendSec, setResendSec] = useState(45);
  const [resending, setResending] = useState(false);
  const [devCodeBanner, setDevCodeBanner] = useState(initialDevCode);
  const [devNoticeBanner, setDevNoticeBanner] = useState(initialDevNotice);

  useEffect(() => {
    if (!pendingId) {
      navigate('/register', { replace: true });
      return;
    }
    const t = setInterval(() => setResendSec((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [pendingId, navigate]);

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
        addToast?.(
          'info',
          'New code (dev)',
          `Your new code is ${out.devVerificationCode}.`,
        );
      } else {
        addToast?.('info', 'Code sent', 'Check your email for the new code.');
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
          {phone
            ? <>Enter the 6-digit code we sent to <strong>{email || 'your email'}</strong>. SMS is printed in the server console as <strong>SMS → {phone}</strong>.</>
            : <>Enter the 6-digit code we sent to <strong>{email || 'your email'}</strong>.</>
          }
        </p>

        {(devCodeBanner || devNoticeBanner) && (
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
          <Link to="/register" className="auth-link-btn">← Different number or email</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
