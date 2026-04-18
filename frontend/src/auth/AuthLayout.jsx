import { useNavigate } from 'react-router-dom';

function AuthLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="auth-bg">

      <div className="auth-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="auth-top-bar">
        <div className="auth-back-home" onClick={() => navigate('/')}>  {/* ✅ */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Home
        </div>
      </div>

      <div className="auth-content">
        {children}
      </div>

      <p className="auth-footer-text">© 2026 Wassali. All rights reserved.</p>
    </div>
  );
}

export default AuthLayout;