// ═══════════════════════════════════════════════════════════
// ReviewModal.jsx — Rate & review a deliverer
// Matches screenshot: avatar header, 5-star tap to rate,
// quick feedback chips, additional comments, submit button
// ═══════════════════════════════════════════════════════════
import { useState } from 'react';

const QUICK_TAGS = ['Fast Delivery', 'Professional', 'Good Pricing', 'Careful', 'Friendly'];

export default function ReviewModal({ deliverer, onClose }) {
  const [rating,       setRating]       = useState(4);
  const [hoverRating,  setHoverRating]  = useState(0);
  const [selected,     setSelected]     = useState(['Fast Delivery']);
  const [comment,      setComment]      = useState('');
  const [submitted,    setSubmitted]    = useState(false);

  function toggleTag(tag) {
    setSelected(s => s.includes(tag) ? s.filter(t => t !== tag) : [...s, tag]);
  }

  function handleSubmit() {
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  }

  const displayRating = hoverRating || rating;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'cdFadeUp .2s ease both',
      }}>
      <div style={{
        background: 'linear-gradient(145deg, #0d2448, #091830)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 22,
        padding: '28px 28px 22px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        position: 'relative',
      }}>

        {/* ── Deliverer header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: deliverer.avatarColor || 'linear-gradient(135deg,#1a4a6a,#0d2a4a)',
            border: `2.5px solid ${deliverer.avatarBorder || 'rgba(78,222,163,0.4)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: 'white', flexShrink: 0,
            fontFamily: "'DM Sans',system-ui,sans-serif",
          }}>
            {deliverer.initials}
          </div>
          <div>
            <h3 style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 800, color: 'white', fontFamily: "'Outfit',system-ui,sans-serif" }}>
              Review {deliverer.name}
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
              How was your last delivery experience?
            </p>
          </div>
        </div>

        {/* ── Stars ── */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{ display: 'inline-flex', gap: 8, marginBottom: 8 }}
            onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map(i => (
              <svg
                key={i}
                width="32" height="32" viewBox="0 0 24 24"
                fill={i <= displayRating ? '#3b82f6' : 'none'}
                stroke={i <= displayRating ? '#3b82f6' : 'rgba(255,255,255,0.2)'}
                strokeWidth="1.8"
                style={{ cursor: 'pointer', transition: 'transform .12s', transform: i <= displayRating ? 'scale(1.12)' : 'scale(1)' }}
                onClick={() => setRating(i)}
                onMouseEnter={() => setHoverRating(i)}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ))}
          </div>
          <p style={{
            margin: 0, fontSize: 10, fontWeight: 700,
            color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em',
            fontFamily: "'DM Sans',system-ui,sans-serif",
          }}>
            TAP TO RATE
          </p>
        </div>

        {/* ── Quick Feedback ── */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
            Quick Feedback
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {QUICK_TAGS.map(tag => {
              const on = selected.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '6px 13px', borderRadius: 8,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'DM Sans',system-ui,sans-serif",
                    background: on ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${on ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.12)'}`,
                    color: on ? '#60a5fa' : 'rgba(255,255,255,0.55)',
                    transition: 'all .15s',
                  }}>
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Additional Comments ── */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
            Additional Comments
          </p>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience with this deliverer..."
            rows={4}
            className="cd-input"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              color: 'white', fontSize: 13,
              fontFamily: "'DM Sans',system-ui,sans-serif",
              resize: 'none', outline: 'none',
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* ── Submit ── */}
        <button
          onClick={handleSubmit}
          disabled={submitted}
          style={{
            width: '100%', border: 'none', borderRadius: 13,
            padding: '14px 0', fontSize: 14, fontWeight: 700,
            cursor: submitted ? 'default' : 'pointer',
            background: submitted
              ? 'linear-gradient(135deg,#4ade80,#22c55e)'
              : 'linear-gradient(135deg,#3b82f6,#2563eb)',
            color: 'white',
            fontFamily: "'DM Sans',system-ui,sans-serif",
            letterSpacing: '0.04em',
            boxShadow: '0 4px 18px rgba(59,130,246,0.3)',
            transition: 'all .2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 10,
          }}>
          {submitted ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Review Submitted!
            </>
          ) : 'Submit Review'}
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%', background: 'none', border: 'none',
            fontSize: 13, color: 'rgba(255,255,255,0.35)',
            cursor: 'pointer', fontFamily: "'DM Sans',system-ui,sans-serif",
            padding: '6px 0', transition: 'color .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
          Cancel
        </button>
      </div>
    </div>
  );
}
