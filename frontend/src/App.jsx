import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './index.css';
 
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './Firebase.config';
 
import { ToastContainer, useToast } from './Home/Toast';
import Nav from './common/NavBar';
import Home from './Home/HomePage';
import LoginPage from './auth/Login';
import RegisterPage from './auth/Register';
import VerifyPhonePage from './auth/VerifyPhonePage';
import ResetPasswordPage from './auth/ResetPasswordPage';
import { ForgotPage, CheckEmailPage } from './auth/Forgot';
import DashPage from './AdminDash/DashPage';
import DoP from './AdminDash/Dashover/DashOverPage';
import OrderPage from './AdminDash/OrdersPage';
import OrderDetail from './AdminDash/OrderDetailPage';
import UserPage from './AdminDash/UserPage';
import VerificationPage from './AdminDash/VerificationPage';
import UserDetailPage from './AdminDash/UserDetailPage';
import FinancePage from './AdminDash/Finances/finances';
import ReportsPage from './AdminDash/Reports/ReportsPage';
import AdminSettingsPage from './AdminDash/Settings/SettingsPage';
import AdminProfilePage from './AdminDash/Profile/ProfilePage';
import VehicleInfoPage, { UnderReviewPage, VerifiedPage } from './auth/VehicleInfoPage';
import DelivererDashPage from './DelivererDash/DashPage';
import DelivererOverviewPage from './DelivererDash/DashOver/DashOver';
import EarningsPage from './DelivererDash/Earning/EarningPage';
import DelivererMapPage from './DelivererDash/Schedule/map';
import ActiveSchedulePage from './DelivererDash/Schedule/SchedulePage';
import ProfilePage from './DelivererDash/Profile/Profile';
import SettingsPage from './DelivererDash/Settings/SettingsPage';
import SupportPage from './DelivererDash/Support/SupportPage';
import SafetyGuidelinesPage from './DelivererDash/Support/Safety';
import EarningsPolicyPage from './DelivererDash/Support/Earning';
import DocViewerPage from './AdminDash/Docviewer';
import ClientDashboard from './client/ClientDashboard';
import { normalizeRole } from './auth/roles';
import { http } from './api/http';
 
// ── Chat pages — lazy loaded ──────────────────────────────────────────────────
const AdminCourierChat      = lazy(() => import('./AdminDash/Admincourierchat'));
const DelivererMessagesPage = lazy(() => import('./DelivererDash/Deliverermessagespage'));
 
function ChatLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#080d18' }}>
      <div style={{ width: 28, height: 28, border: '3px solid rgba(37,99,235,0.3)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'appSpin 0.8s linear infinite' }} />
      <style>{`@keyframes appSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
 
function enrichedUser(user) {
  if (!user) return null;
  return {
    ...user,
    uid: user.uid || user.id || null,
  };
}
 
// ── Route Guards ──────────────────────────────────────────────────────────────
 
/** Redirect logged-out users to /login */
function PrivateRoute({ currentUser, children }) {
  return currentUser ? children : <Navigate to="/login" replace />;
}
 
/** Redirect already-logged-in users away from auth pages */
function AuthRoute({ currentUser, children }) {
  if (!currentUser) return children;
  const r = clientRole(currentUser);
  if (r === 'deliverer') {
    return <Navigate to={resolveDelivererPath(currentUser)} replace />;
  }
  if (r === 'client') {
    return <Navigate to="/client-dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}
 
/**
 * Only deliverers can access the onboarding flow pages.
 * Clients and unauthenticated users are redirected away.
 */
function DelivererOnlyRoute({ currentUser, children }) {
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'deliverer') return <Navigate to="/" replace />;
  return children;
}
 
/**
 * /onboarding guard — only if the deliverer hasn't completed onboarding yet.
 * If they already finished, send them to the right place.
 */
function OnboardingRoute({ currentUser, children }) {
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'deliverer') return <Navigate to="/" replace />;
  // Already done onboarding → skip forward
  if (currentUser.onboardingDone) {
    return <Navigate to={resolveDelivererPath(currentUser)} replace />;
  }
  return children;
}
 
/**
 * /under-review guard — only for deliverers whose status is 'pending'.
 * If active/verified → skip to the right step. If not done onboarding → go back.
 */
function UnderReviewRoute({ currentUser, children }) {
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'deliverer') return <Navigate to="/" replace />;
  if (!currentUser.onboardingDone) return <Navigate to="/onboarding" replace />;
  // status is 'active' and they've already seen the welcome screen → go to dashboard
  if (currentUser.status === 'active') return <Navigate to="/deliverer-dashboard" replace />;
  // status is 'verified_welcome' → they should be on /verified
  if (currentUser.status === 'verified_welcome') return <Navigate to="/verified" replace />;
  // status is 'pending' → show this page ✓
  return children;
}
 
/**
 * /verified guard — only for deliverers whose status is 'verified_welcome' (one-time screen).
 * If they already clicked "Get Started" (status = 'active') → go to dashboard.
 * If still pending → back to under-review.
 */
function VerifiedRoute({ currentUser, children }) {
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'deliverer') return <Navigate to="/" replace />;
  if (!currentUser.onboardingDone) return <Navigate to="/onboarding" replace />;
  if (currentUser.status === 'pending') return <Navigate to="/under-review" replace />;
  // Already activated → go straight to dashboard (skip the welcome screen)
  if (currentUser.status === 'active') return <Navigate to="/deliverer-dashboard" replace />;
  // status is 'verified_welcome' → show this page ✓
  return children;
}
 
/**
 * Resolve where a deliverer should land based on their current status.
 *
 *  onboardingDone = false              → /onboarding   (fill vehicle info)
 *  onboardingDone = true
 *    status = 'pending'               → /under-review  (wait for admin)
 *    status = 'verified_welcome'      → /verified      (show welcome screen once)
 *    status = 'active'                → /deliverer-dashboard (normal flow)
 *  anything else                      → /onboarding   (safe fallback)
 */
function resolveDelivererPath(user) {
  if (!user.onboardingDone) return '/onboarding';
  if (user.status === 'pending')          return '/under-review';
  if (user.status === 'verified_welcome') return '/verified';
  if (user.status === 'active')           return '/deliverer-dashboard';
  return '/onboarding';
}

/** Clients only — /client-dashboard */
function clientRole(user) {
  const r = normalizeRole(user?.role) || normalizeRole(String(user?.role ?? ''));
  return r || (user?.role == null || user?.role === '' ? 'client' : String(user.role).toLowerCase());
}

function ClientOnlyRoute({ currentUser, children }) {
  if (!currentUser) return <Navigate to="/login" replace />;
  const r = clientRole(currentUser);
  if (r === 'deliverer') return <Navigate to={resolveDelivererPath(currentUser)} replace />;
  if (r === 'admin') return <Navigate to="/dashboard" replace />;
  if (r !== 'client') return <Navigate to="/" replace />;
  return children;
}

/** Admin shell — clients use /client-dashboard */
function AdminOnlyRoute({ currentUser, children }) {
  if (!currentUser) return <Navigate to="/login" replace />;
  const r = clientRole(currentUser);
  if (r === 'client') return <Navigate to="/client-dashboard" replace />;
  if (r === 'deliverer') return <Navigate to={resolveDelivererPath(currentUser)} replace />;
  return children;
}
 
// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
 
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('currentUser') ?? 'null'); }
    catch { return null; }
  });
 
  const { toasts, addToast, removeToast } = useToast();
  const [delivererOnline, setDelivererOnline] = useState(true);
 
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('darkMode') === 'true'; }
    catch { return false; }
  });
 
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    try { localStorage.setItem('darkMode', String(darkMode)); } catch {}
  }, [darkMode]);
 
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  // Validate persisted session against backend on app start/refresh.
  // This prevents stale localStorage/fallback sessions from opening dashboards
  // while API calls fail with 401 in background (showing empty tables).
  useEffect(() => {
    let cancelled = false;

    async function validateSession() {
      if (!currentUser) return;
      try {
        const res = await http.get('/auth/me/');
        const backendUser = res?.data?.user ?? res?.data?.data?.user;
        if (!backendUser || cancelled) return;

        const merged = {
          ...currentUser,
          id: backendUser._id ?? currentUser.id,
          role: normalizeRole(backendUser.role) || currentUser.role,
          status: backendUser.status ?? currentUser.status,
          onboardingDone: backendUser.onboardingDone ?? currentUser.onboardingDone,
        };
        setCurrentUser(merged);
        try { localStorage.setItem('currentUser', JSON.stringify(merged)); } catch {}
      } catch {
        if (cancelled) return;
        setCurrentUser(null);
        try {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('authToken');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        } catch {}
        if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/client-dashboard') || location.pathname.startsWith('/deliverer-dashboard')) {
          navigate('/login', { replace: true });
        }
      }
    }

    validateSession();
    return () => { cancelled = true; };
  }, []);
 
  // ── Firebase: restore uid after page refresh ────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && currentUser && !currentUser.uid) {
        const updated = { ...currentUser, uid: firebaseUser.uid };
        setCurrentUser(updated);
        try { localStorage.setItem('currentUser', JSON.stringify(updated)); } catch {}
      }
    });
    return () => unsub();
  }, []);
 
  // ── Persist currentUser to localStorage whenever it changes ────────────
  useEffect(() => {
    if (currentUser) {
      try { localStorage.setItem('currentUser', JSON.stringify(currentUser)); } catch {}
    }
  }, [currentUser]);
 
  /**
   * Called after a successful login.
   * For deliverers with status='active', show /verified (welcome screen) ONLY
   * on their very first login after approval. We track this with 'welcomeSeen'
   * persisted in localStorage — NOT from the API response (which never has it).
   * On subsequent logins, active deliverers go straight to the dashboard.
   */
  function handleLogin(user, token) {
    let role = normalizeRole(user.role);
    if (!role && user.role != null && user.role !== '') {
      role = normalizeRole(String(user.role));
    }
    if (!role) role = 'client';

    let finalUser = { ...user, role };
 
    if (role === 'deliverer') {
      // Read welcomeSeen from the previously saved user in localStorage,
      // because the API response is a fresh object and never carries this flag.
      let savedWelcomeSeen = false;
      try {
        const saved = JSON.parse(localStorage.getItem('currentUser') ?? 'null');
        // Match by any stable identifier to make sure it's the same account
        const sameAccount =
          saved &&
          (
            (saved.id    && user.id    && saved.id    === user.id)    ||
            (saved.uid   && user.uid   && saved.uid   === user.uid)   ||
            (saved.email && user.email && saved.email === user.email)
          );
        if (sameAccount) {
          savedWelcomeSeen = saved.welcomeSeen ?? false;
        }
      } catch {}
 
      // If backend says 'active' but this user hasn't seen the welcome screen yet,
      // temporarily use 'verified_welcome' so /verified renders once.
      if (user.status === 'active' && !savedWelcomeSeen) {
        finalUser = { ...finalUser, status: 'verified_welcome', welcomeSeen: false };
      } else if (user.status === 'active' && savedWelcomeSeen) {
        finalUser = { ...finalUser, welcomeSeen: true };
      }
      // If savedWelcomeSeen is true → keep status as 'active' → goes to dashboard directly.
    }
 
    setCurrentUser(finalUser);
    try {
      localStorage.setItem('currentUser', JSON.stringify(finalUser));
      localStorage.setItem('authToken', token ?? '');
    } catch {}
 
    if (finalUser.role === 'deliverer') {
      navigate(resolveDelivererPath(finalUser), { replace: true });
      return;
    }

    if (finalUser.role === 'client') {
      navigate('/client-dashboard', { replace: true });
      return;
    }

    navigate('/dashboard', { replace: true });
  }
 
  async function handleLogout() {
    try {
      const { logout } = await import('./auth/FakeUsers');
      await logout();
    } catch (err) { console.warn('Logout:', err.message); }
    setCurrentUser(null);
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    } catch {}
    navigate('/', { replace: true });
  }
 
  /**
   * Merges a partial update into currentUser and persists it.
   * Accepts either an object patch or an updater function (prev => next).
   */
  function updateCurrentUser(updater) {
    setCurrentUser(prev => {
      const updated = typeof updater === 'function'
        ? updater(prev)
        : { ...prev, ...updater };
      try { localStorage.setItem('currentUser', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }
 
  // ── Hide the public navbar inside dashboards & auth pages ──────────────
  const authPaths      = ['/login', '/register', '/verify-phone', '/forgot', '/check-email', '/reset-password'];
  const delivererPaths = ['/onboarding', '/under-review', '/verified', '/deliverer-dashboard'];
  const hideNav =
    authPaths.includes(location.pathname) ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/client-dashboard') ||
    delivererPaths.some(p => location.pathname.startsWith(p));
 
  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {!hideNav && (
        <Nav
          darkMode={darkMode}
          toggleDark={() => setDarkMode(p => !p)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}
 
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<Home currentUser={currentUser} />} />
 
        {/* ── Auth (redirect away if already logged in) ── */}
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
        <Route path="/verify-phone" element={
          <AuthRoute currentUser={currentUser}>
            <VerifyPhonePage addToast={addToast} />
          </AuthRoute>
        }/>
        <Route path="/reset-password" element={
          <AuthRoute currentUser={currentUser}>
            <ResetPasswordPage addToast={addToast} />
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
 
        {/* ── Deliverer onboarding flow ── */}
 
        {/*
          /onboarding — only if the deliverer hasn't completed onboarding yet.
          Once submitted: sets onboardingDone=true + status=pending in DB,
          then navigates to /under-review.
        */}
        <Route path="/onboarding" element={
          <OnboardingRoute currentUser={currentUser}>
            <VehicleInfoPage
              currentUser={currentUser}
              setCurrentUser={updateCurrentUser}
              addToast={addToast}
              onSubmitSuccess={() => {
                // Update local state to reflect DB changes (backend also updated via API)
                updateCurrentUser({ onboardingDone: true, status: 'pending' });
                navigate('/under-review', { replace: true });
              }}
            />
          </OnboardingRoute>
        }/>
 
        {/*
          /under-review — shown while admin is reviewing (status = 'pending').
          The page polls the backend. When approved (status → 'active'),
          onApproved is called which sets status to 'verified_welcome'
          (first-time welcome) and navigates to /verified.
          Guard: only deliverers with onboardingDone=true and status='pending' can see this.
        */}
        <Route path="/under-review" element={
          <UnderReviewRoute currentUser={currentUser}>
            <UnderReviewPage
              currentUser={currentUser}
              onApproved={() => {
                // Set to verified_welcome so /verified shows the one-time welcome screen
                updateCurrentUser({ status: 'verified_welcome' });
                navigate('/verified', { replace: true });
              }}
            />
          </UnderReviewRoute>
        }/>
 
        {/*
          /verified — one-time welcome screen after admin approval.
          "Get Started" sets status='active' + welcomeSeen=true then goes to dashboard.
          Guard: only deliverers with status='verified_welcome' can see this.
          On subsequent logins (welcomeSeen=true), resolveDelivererPath sends
          them straight to /deliverer-dashboard instead.
        */}
        <Route path="/verified" element={
          <VerifiedRoute currentUser={currentUser}>
            <VerifiedPage
              currentUser={currentUser}
              onGetStarted={() => {
                // Mark as active AND mark that they've seen the welcome screen
                updateCurrentUser({ status: 'active', welcomeSeen: true });
                navigate('/deliverer-dashboard', { replace: true });
              }}
            />
          </VerifiedRoute>
        }/>
 
        {/* ── Deliverer Dashboard ── */}
        <Route path="/deliverer-dashboard" element={
          <DelivererOnlyRoute currentUser={currentUser}>
            {/* If deliverer hasn't finished onboarding, redirect them back */}
            {currentUser?.role === 'deliverer' && !currentUser?.onboardingDone
              ? <Navigate to="/onboarding" replace />
              : currentUser?.role === 'deliverer' && currentUser?.status === 'pending'
              ? <Navigate to="/under-review" replace />
              : <DelivererDashPage currentUser={currentUser} onLogout={handleLogout} isOnline={delivererOnline} setIsOnline={setDelivererOnline} />
            }
          </DelivererOnlyRoute>
        }>
          <Route index                      element={<DelivererOverviewPage currentUser={currentUser} />} />
          <Route path="earnings"            element={<EarningsPage />} />
          <Route path="schedule"            element={<ActiveSchedulePage />} />
          <Route path="navigation/:orderId" element={<DelivererMapPage />} />
          <Route path="profile"             element={<ProfilePage />} />
          <Route path="settings"            element={<SettingsPage />} />
          <Route path="support"             element={<SupportPage currentUser={enrichedUser(currentUser)} />} />
          <Route path="support/safety"      element={<SafetyGuidelinesPage currentUser={currentUser} />} />
          <Route path="support/earnings-policy" element={<EarningsPolicyPage />} />
          <Route path="messages" element={
            <Suspense fallback={<ChatLoader />}>
              <DelivererMessagesPage currentUser={enrichedUser(currentUser)} />
            </Suspense>
          }/>
        </Route>
 
        {/* ── Client Dashboard ── */}
        <Route path="/client-dashboard" element={
          <ClientOnlyRoute currentUser={currentUser}>
            <ClientDashboard currentUser={currentUser} onLogout={handleLogout} addToast={addToast} />
          </ClientOnlyRoute>
        } />

        {/* ── Admin Dashboard ── */}
        <Route path="/dashboard" element={
          <PrivateRoute currentUser={currentUser}>
            <AdminOnlyRoute currentUser={currentUser}>
              <DashPage currentUser={currentUser} onLogout={handleLogout} addToast={addToast} />
            </AdminOnlyRoute>
          </PrivateRoute>
        }>
          <Route index                   element={<DoP />} />
          <Route path="order"            element={<OrderPage />} />
          <Route path="order/:orderId"   element={<OrderDetail currentUser={currentUser} />} />
          <Route path="users"            element={<UserPage currentUser={currentUser} onLogout={handleLogout} />} />
          <Route path="users/:userId"    element={<UserDetailPage currentUser={currentUser} onLogout={handleLogout} />} />
          <Route path="verification"     element={<VerificationPage currentUser={currentUser} onLogout={handleLogout} />} />
          <Route path="finances"         element={<FinancePage addToast={addToast} />} />
          <Route path="reports"          element={<ReportsPage />} />
          <Route path="profile"          element={<AdminProfilePage currentUser={currentUser} />} />
          <Route path="settings"         element={<AdminSettingsPage currentUser={currentUser} />} />
          
        </Route>
         <Route path="/dashboard/messages" element={
            <Suspense fallback={<ChatLoader />}>
              <AdminCourierChat currentUser={enrichedUser(currentUser)} />
            </Suspense>
          }/>
          <Route path="/dashboard/verification/:id" element={<DocViewerPage />} />
 
        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}