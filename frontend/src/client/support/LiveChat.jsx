// ═══════════════════════════════════════════════════════════
// ChatPanel.jsx — Live chat with Wassali support agent
// Uses shared Socket.IO connection via useChat hook
// Usage: <ChatPanel onClose={() => {}} />
// ═══════════════════════════════════════════════════════════
import { useState, useRef, useEffect } from 'react';
import { useChat, formatTime, resolveCurrentUid } from '../../hooks/Usechat';

const SUPPORT_AGENT_UID = "ADMIN-ROOT-001";

export default function LiveChat({ onClose }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const userUid = resolveCurrentUid();

  const {
    messages,
    otherTyping,
    chatError,
    sendMessage,
    createConversation,
    activeConvId,
    setActiveConvId,
    handleTyping,
    loadingConvs,
  } = useChat(userUid);

  const [ready, setReady] = useState(false);
  const bootstrapRef = useRef(false);

  // Bootstrap: create or find the support conversation on mount
  useEffect(() => {
    if (bootstrapRef.current || !userUid) return;
    bootstrapRef.current = true;
    createConversation(SUPPORT_AGENT_UID, "support").then((id) => {
      if (id) {
        setActiveConvId(id);
        setReady(true);
      }
    });
  }, [userUid, createConversation, setActiveConvId]);

  // Mark ready once we have an active conversation
  useEffect(() => {
    if (activeConvId) setReady(true);
  }, [activeConvId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  function send() {
    const text = input.trim();
    if (!text || !activeConvId) return;
    setInput('');
    sendMessage(text);
  }

  function handleInput(e) {
    setInput(e.target.value);
    handleTyping?.();
  }

  const error = chatError || (!userUid ? "Please log in to use live chat." : null);

  return (
    <div style={{
      position:'fixed', bottom:24, right:24, zIndex:1000,
      width:340,
      background:'linear-gradient(145deg,#0d2040,#091830)',
      border:'1px solid rgba(255,255,255,0.12)',
      borderRadius:20,
      boxShadow:'0 30px 70px rgba(0,0,0,0.6)',
      display:'flex', flexDirection:'column',
      animation:'cdFadeUp .3s ease both',
    }}>

      {/* ── Agent header ── */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#1a3a6a,#0d2040)', border:'2px solid rgba(59,130,246,0.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'white', fontFamily:"'DM Sans',system-ui,sans-serif" }}>A</div>
          {/* Online dot */}
          <div style={{ position:'absolute', bottom:0, right:0, width:10, height:10, borderRadius:'50%', background:'#4ade80', border:'2px solid #091830' }}/>
        </div>
        <div style={{ flex:1 }}>
          <p style={{ margin:'0 0 2px', fontSize:13, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Amina B.</p>
          <p style={{ margin:0, fontSize:9, fontWeight:700, color:'#60a5fa', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>CUSTOMER SUPPORT SPECIALIST</p>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', display:'flex', padding:4, flexShrink:0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px 14px 8px', display:'flex', flexDirection:'column', gap:10, maxHeight:310, minHeight:240 }}>
        {error ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}>
            <p style={{ fontSize:12, color:'#fca5a5', textAlign:'center', margin:0 }}>{error}</p>
          </div>
        ) : !ready ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}>
            <div style={{ width:20, height:20, border:'2px solid rgba(59,130,246,0.3)', borderTopColor:'#3b82f6', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <div key={m.id} style={{ display:'flex', flexDirection:'column', alignItems: m.senderId === userUid ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth:'82%', padding:'10px 13px',
                  borderRadius: m.senderId === userUid ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.senderId === userUid ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : 'rgba(255,255,255,0.07)',
                  border: m.senderId === userUid ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  fontSize:13, color:'white',
                  fontFamily:"'DM Sans',system-ui,sans-serif", lineHeight:1.5,
                }}>
                  {m.text}
                </div>
                <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',system-ui,sans-serif", marginTop:3, padding:'0 4px' }}>{formatTime(m.timestamp)}</span>
              </div>
            ))}

            {/* Typing indicator */}
            {otherTyping && (
              <div style={{ display:'flex', alignItems:'flex-start' }}>
                <div style={{ padding:'10px 14px', borderRadius:'14px 14px 14px 4px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'rgba(255,255,255,0.4)', animation:`cdDotPulse 1.2s ease ${i*0.2}s infinite` }}/>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef}/>
          </>
        )}
      </div>

      {/* ── Input bar ── */}
      <div style={{ padding:'10px 14px 14px', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:8 }}>
        {/* Attachment button */}
        <button style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.35)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        </button>

        <input
          value={input}
          onChange={handleInput}
          onKeyDown={e => { if (e.key === 'Enter') send(); }}
          placeholder={ready ? "Type your message..." : "Connecting..."}
          disabled={!ready}
          className="cd-input"
          style={{ flex:1, padding:'9px 12px', fontSize:13, color:'white', borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', fontFamily:"'DM Sans',system-ui,sans-serif", outline:'none' }}
        />

        {/* Send button */}
        <button onClick={send}
          disabled={!input.trim() || !ready}
          style={{ width:34, height:34, borderRadius:10, background:'#2563eb', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, transition:'opacity .15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}
