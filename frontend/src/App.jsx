import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './index.css';

import { ToastContainer, useToast } from './Home/Toast';
import Nav from './common/NavBar';
import Home from './Home/HomePage';
import DashPage from './AdminDash/DashPage';
import DoP from './AdminDash/Dashover/DashOverPage';
import LoginPage from './auth/Login';
import RegisterPage from './auth/Register';
import { ForgotPage, CheckEmailPage } from './auth/Forgot';
import OrderPage from './AdminDash/OrdersPage';
import OrderDetail from './AdminDash/OrderDetailPage';
import UserPage from './AdminDash/UserPage';
import VerificationPage from './AdminDash/VerificationPage';
import UserDetailPage from './AdminDash/UserDetailPage';
import FinancePage from './AdminDash/Finances/finances';
import VehicleInfoPage, { UnderReviewPage, VerifiedPage } from './auth/VehicleInfoPage';

// ── Route guards ─────────────────────────────────────────
function PrivateRoute({ currentUser, children }) {
  return currentUser ? children : <Navigate to="/login" replace />;
}

function AuthRoute({ currentUser, children }) {
  return !currentUser ? children : <Navigate to="/dashboard" replace />;
}

// ── Deliverer flow guard ──────────────────────────────────
// Decides where a deliverer goes after login based on their status
function DelivererRoute({ currentUser, children }) {
  if (!currentUser) return <Navigate to="/login" replace />;

  // not a deliverer → go to normal dashboard
  if (currentUser.role !== 'deliverer') return <Navigate to="/dashboard" replace />;

  return children;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Load currentUser from localStorage on startup ──────
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const { toasts, addToast, removeToast } = useToast();

  // ── Load darkMode ──────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('darkMode') === 'true'; }
    catch { return false; }
  });

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    try { localStorage.setItem('darkMode', darkMode); } catch {}
  }, [darkMode]);

  // ── Scroll to top on route change ──────────────────────
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  // ── Save user to localStorage + redirect based on role ─
  function handleLogin(user, token) {
    setCurrentUser(user);
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', token ?? "");
    } catch {}

    // ── Deliverer flow ────────────────────────────────────
    if (user.role === 'deliverer') {
      if (!user.onboardingDone) {
        // first time → fill vehicle info
        navigate('/onboarding');
      } else if (user.status === 'pending') {
        // submitted but not approved yet
        navigate('/under-review');
      } else if (user.status === 'verified_welcome') {
        // just approved → show welcome
        navigate('/verified');
      } else if (user.status === 'active') {
        // approved + already seen welcome → deliverer dashboard
        navigate('/deliverer-dashboard');
      } else {
        navigate('/onboarding');
      }
      return;
    }

    // ── Admin / Client flow ───────────────────────────────
    navigate('/dashboard');
  }

  // ── Sync currentUser to localStorage whenever it changes
  // (needed when setCurrentUser is called inside VehicleInfoPage)
  useEffect(() => {
    if (currentUser) {
      try { localStorage.setItem('currentUser', JSON.stringify(currentUser)); } catch {}

      // redirect deliverer automatically when status changes
      if (currentUser.role === 'deliverer') {
        if (currentUser.status === 'pending' && currentUser.onboardingDone) {
          // only redirect if currently on onboarding page
          if (location.pathname === '/onboarding') {
            navigate('/under-review');
          }
        }
      }
    }
  }, [currentUser]);

  // ── Logout ─────────────────────────────────────────────
  function handleLogout() {
    setCurrentUser(null);
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    } catch {}
    navigate('/');
  }

  // ── Helper — update user and persist ──────────────────
  function updateCurrentUser(updater) {
    setCurrentUser(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      try { localStorage.setItem('currentUser', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }

  const authPaths = ['/login', '/register', '/forgot', '/check-email'];
  const delivererPaths = ['/onboarding', '/under-review', '/verified', '/deliverer-dashboard'];
  const hideNav =
    authPaths.includes(location.pathname) ||
    location.pathname.startsWith('/dashboard') ||
    delivererPaths.some(p => location.pathname.startsWith(p));

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {!hideNav && (
        <Nav
          darkMode={darkMode}
          toggleDark={() => setDarkMode(prev => !prev)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      <Routes>

        {/* ── Public ────────────────────────────────────── */}
        <Route path="/" element={<Home currentUser={currentUser} />} />

        {/* ── Auth ──────────────────────────────────────── */}
        <Route path="/login" element={
          <AuthRoute currentUser={currentUser}>
            <LoginPage onLogin={handleLogin} addToast={addToast} />
          </AuthRoute>
        }/>
        <Route path="/register" element={
          <AuthRoute currentUser={currentUser}>
            <RegisterPage addToast={addToast} />
          </AuthRoute>
        }/>
        <Route path="/forgot" element={
          <AuthRoute currentUser={currentUser}>
            <ForgotPage addToast={addToast} />
          </AuthRoute>
        }/>
        <Route path="/check-email" element={
          <AuthRoute currentUser={currentUser}>
            <CheckEmailPage addToast={addToast} />
          </AuthRoute>
        }/>

        {/* ── Deliverer onboarding flow ──────────────────── */}

        {/* Step 1 — Vehicle info form */}
        <Route path="/onboarding" element={
          <DelivererRoute currentUser={currentUser}>
            <VehicleInfoPage
              currentUser={currentUser}
              setCurrentUser={updateCurrentUser}
              addToast={addToast}
              // after submit → go to under-review
              onSubmitSuccess={() => navigate('/under-review')}
            />
          </DelivererRoute>
        }/>

        {/* Step 2 — Waiting for admin approval */}
        <Route path="/under-review" element={
          <DelivererRoute currentUser={currentUser}>
            <UnderReviewPage
              currentUser={currentUser}
              // if admin approves and status changes, go to verified
              onApproved={() => navigate('/verified')}
            />
          </DelivererRoute>
        }/>

        {/* Step 3 — Approved welcome screen */}
        <Route path="/verified" element={
          <DelivererRoute currentUser={currentUser}>
            <VerifiedPage
              currentUser={currentUser}
              // Get Started → deliverer dashboard
              onGetStarted={() => {
                updateCurrentUser({ status: 'active' });
                navigate('/deliverer-dashboard');
              }}
            />
          </DelivererRoute>
        }/>

        {/* Step 4 — Deliverer dashboard (placeholder for now) */}
        <Route path="/deliverer-dashboard" element={
          <DelivererRoute currentUser={currentUser}>
            {/* Replace with your real DelivererDashboard component */}
            <div style={{
              background: "#0b1929", minHeight: "100vh",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: "20px",
            }}>
              🛵 Deliverer Dashboard — Coming Soon
            </div>
          </DelivererRoute>
        }/>

        {/* ── Admin dashboard ────────────────────────────── */}
        <Route path="/dashboard" element={
          <PrivateRoute currentUser={currentUser}>
            <DashPage
              currentUser={currentUser}
              onLogout={handleLogout}
              addToast={addToast}
            />
          </PrivateRoute>
        }>
          <Route index element={<DoP />} />
          <Route path="order" element={<OrderPage />} />
          <Route path="order/:orderId" element={<OrderDetail currentUser={currentUser} />} />
          <Route path="users" element={
            <UserPage currentUser={currentUser} onLogout={handleLogout} />
          }/>
          <Route path="users/:userId" element={
            <UserDetailPage currentUser={currentUser} onLogout={handleLogout} />
          }/>
          <Route path="verification" element={
            <VerificationPage currentUser={currentUser} onLogout={handleLogout} />
          }/>
          <Route path="finances" element={<FinancePage addToast={addToast} />} />
        </Route>

        {/* ── Catch all ──────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  );
}