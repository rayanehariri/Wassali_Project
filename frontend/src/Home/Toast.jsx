import { useState, useCallback } from 'react';

// ─── TOAST CONTAINER ──────────────────────────────────────
// Shows notification popups (success, error, info, warning)

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type} toast-in`}>

          {/* Icon */}
          <span className="toast-icon">
            {toast.type === 'success' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="12" x2="12" y2="16" />
              </svg>
            )}
            {toast.type === 'warning' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </span>

          {/* Message */}
          <div className="toast-body">
            <div className="toast-title">{toast.title}</div>
            {toast.msg && <div className="toast-msg">{toast.msg}</div>}
          </div>

          {/* Close button */}
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Progress bar */}
          <div className="toast-progress" style={{ animationDuration: `${toast.duration}ms` }}></div>
        </div>
      ))}
    </div>
  );
}

// ─── USE TOAST HOOK ────────────────────────────────────────
// Call addToast('success', 'Title', 'Message') anywhere in the app

function useToast() {
  const [toasts, setToasts] = useState([]);

  // Remove a toast by its id
  const removeToast = useCallback(function(id) {
    setToasts(function(prev) {
      return prev.filter(function(t) { return t.id !== id; });
    });
  }, []);

  // Add a new toast
  const addToast = useCallback(function(type, title, msg = '', duration = 4000) {
    const id = Date.now() + Math.random();
    setToasts(function(prev) {
      return [...prev, { id, type, title, msg, duration }];
    });
    setTimeout(function() { removeToast(id); }, duration);
  }, [removeToast]);

  return { toasts, addToast, removeToast };
}

export { ToastContainer, useToast };