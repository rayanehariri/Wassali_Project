import { Check, CheckCheck, MapPin, Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTime, timeAgo } from "../../hooks/Usechat";
 
// ── Avatar helper ─────────────────────────────────────────────────────────────
export function ChatAvatar({ user, size = 40, showDot = true }) {
  const s = { width: size, height: size };
  return (
    <div className="!relative !shrink-0" style={s}>
      <Avatar style={s}>
        <AvatarImage src={user?.avatarUrl} />
        <AvatarFallback style={{
          background: "linear-gradient(135deg,#1d4ed8,#7c3aed)",
          fontSize: Math.floor(size * 0.3), fontWeight: 700, color: "white",
        }}>
          {user?.avatar ?? (user?.name ?? "?").slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showDot && user?.status === "online" && (
        <span className="!absolute !bottom-0 !right-0 !rounded-full !border-2"
          style={{
            width: Math.max(8, size * 0.22), height: Math.max(8, size * 0.22),
            background: "#10b981", borderColor: "#0d1117",
          }} />
      )}
    </div>
  );
}
 
// ── Typing dots animation ─────────────────────────────────────────────────────
export function TypingDots({ label }) {
  return (
    <div className="!flex !items-center !gap-2 !mb-3">
      <div className="!flex !items-center !gap-1 !px-3 !py-2.5 !rounded-2xl"
        style={{ background: "#1a2535", borderRadius: "16px 16px 16px 4px" }}>
        {[0, 1, 2].map(i => (
          <span key={i} className="!inline-block !w-1.5 !h-1.5 !rounded-full"
            style={{ background: "#475569", animation: `chatDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      {label && (
        <span className="!text-[10px] !font-bold !text-slate-500 !tracking-widest">{label}</span>
      )}
      <style>{`
        @keyframes chatDot {
          0%,60%,100% { transform:translateY(0);   opacity:.5; }
          30%         { transform:translateY(-4px); opacity:1;  }
        }
      `}</style>
    </div>
  );
}
 
// ── Message Bubble ────────────────────────────────────────────────────────────
export function MessageBubble({ msg, isOwn, showAvatar = true, avatarUser }) {
  const hasLocation = msg.locationType === "live";
  const hasFile     = !!msg.fileUrl;
 
  return (
    <div className={`!flex !items-end !gap-2 !mb-3 ${isOwn ? "!flex-row-reverse" : "!flex-row"}`}>
 
      {/* Avatar — only for incoming */}
      {!isOwn && showAvatar && (
        <ChatAvatar user={avatarUser} size={32} showDot={false} />
      )}
      {!isOwn && !showAvatar && <div style={{ width: 32 }} />}
 
      <div className={`!max-w-[68%] !flex !flex-col ${isOwn ? "!items-end" : "!items-start"}`}>
 
        {/* Live location card */}
        {hasLocation ? (
          <div className="!rounded-2xl !overflow-hidden"
            style={{
              background:   "#1a2535",
              border:       "1px solid #253045",
              borderRadius: "16px 16px 16px 4px",
              minWidth:     240,
            }}>
            {msg.text && (
              <p className="!text-[13px] !text-white !px-4 !pt-3 !pb-0 !m-0 !leading-relaxed">{msg.text}</p>
            )}
            <div className="!flex !items-center !gap-3 !p-3 !m-3 !rounded-xl"
              style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)" }}>
              <div className="!w-9 !h-9 !rounded-xl !flex !items-center !justify-center !shrink-0"
                style={{ background: "rgba(37,99,235,0.15)" }}>
                <MapPin size={16} color="#3b82f6" />
              </div>
              <div>
                <p className="!text-[12px] !font-bold !text-white !m-0">LIVE LOCATION SHARED</p>
                <p className="!text-[11px] !text-slate-400 !m-0">{msg.locationLabel ?? "3.4 km from destination"}</p>
              </div>
            </div>
          </div>
        ) : hasFile ? (
          /* File attachment */
          <div className="!rounded-2xl !overflow-hidden"
            style={{ background: isOwn ? "#2563eb" : "#1a2535", minWidth: 200 }}>
            {msg.text && (
              <p className="!text-[13px] !text-white !px-4 !pt-3 !pb-1 !m-0 !leading-relaxed">{msg.text}</p>
            )}
            <div className="!flex !items-center !gap-3 !px-3 !pb-3 !mx-3 !mb-0 !rounded-xl !mt-2"
              style={{ background: "rgba(0,0,0,0.2)" }}>
              <div className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center"
                style={{ background: "rgba(255,255,255,0.15)" }}>
                <span style={{ fontSize: 16 }}>📄</span>
              </div>
              <div className="!flex-1 !min-w-0">
                <p className="!text-[12px] !font-semibold !text-white !m-0 !truncate">{msg.fileName}</p>
                {msg.fileSize && <p className="!text-[11px] !m-0" style={{ color: "rgba(255,255,255,0.5)" }}>{Math.round(msg.fileSize / 1024)} KB</p>}
              </div>
              <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="!opacity-70 hover:!opacity-100">
                <Download size={14} color="white" />
              </a>
            </div>
          </div>
        ) : (
          /* Regular text */
          <div className="!px-4 !py-2.5 !rounded-2xl"
            style={{
              background:   isOwn ? "#2563eb" : "#1a2535",
              border:       isOwn ? "none" : "none",
              borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              boxShadow:    isOwn ? "0 4px 12px rgba(37,99,235,0.25)" : "none",
            }}>
            <p className="!text-[13.5px] !text-white !m-0 !leading-relaxed">{msg.text}</p>
          </div>
        )}
 
        {/* Timestamp + read receipt */}
        <div className={`!flex !items-center !gap-1 !mt-1 ${isOwn ? "!flex-row-reverse" : ""}`}>
          <span className="!text-[10px] !text-slate-600">{formatTime(msg.timestamp)}</span>
          {isOwn && (
            msg.read
              ? <CheckCheck size={12} color="#3b82f6" />
              : <Check      size={12} color="#475569" />
          )}
        </div>
      </div>
 
      {/* Own avatar */}
      {isOwn && showAvatar && (
        <ChatAvatar user={avatarUser} size={32} showDot={false} />
      )}
      {isOwn && !showAvatar && <div style={{ width: 32 }} />}
    </div>
  );
}
 
// ── Date separator ────────────────────────────────────────────────────────────
export function DateSeparator({ label = "TODAY, OCTOBER 24" }) {
  return (
    <div className="!flex !items-center !gap-3 !my-5">
      <div className="!flex-1 !h-px" style={{ background: "#1e2535" }} />
      <span className="!text-[10px] !font-bold !text-slate-500 !tracking-widest !px-3 !py-1 !rounded-full"
        style={{ background: "#1a2535" }}>
        {label}
      </span>
      <div className="!flex-1 !h-px" style={{ background: "#1e2535" }} />
    </div>
  );
}
 
// ── Conversation list item ────────────────────────────────────────────────────
export function ConvItem({ conv, isActive, onClick, currentUid, variant = "default" }) {
  const other   = conv.otherUser;
  const unread  = conv.unreadCount?.[currentUid] ?? 0;
 
  return (
    <div
      onClick={onClick}
      className="!flex !items-center !gap-3 !px-4 !py-3 !cursor-pointer !transition-all"
      style={{
        background:  isActive ? "rgba(37,99,235,0.14)" : "transparent",
        borderLeft:  isActive ? "3px solid #2563eb"    : "3px solid transparent",
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      <ChatAvatar user={other} size={40} />
 
      <div className="!flex-1 !min-w-0">
        <div className="!flex !items-center !justify-between !mb-0.5">
          <span className="!text-[13.5px] !font-semibold !text-white !truncate">{other?.name ?? "Unknown"}</span>
          <span className="!text-[10px] !font-bold !text-slate-500 !shrink-0 !ml-2 !tracking-wide">
            {timeAgo(conv.lastMessageAt)}
          </span>
        </div>
        {conv.isTyping ? (
          <p className="!text-[12px] !text-blue-400 !m-0 !italic">typing...</p>
        ) : (
          <p className="!text-[12px] !text-slate-500 !m-0 !truncate">{conv.lastMessage || "No messages yet"}</p>
        )}
        {/* extra status line for admin variant */}
        {variant === "admin" && other?.deliveryStatus && (
          <p className="!text-[11px] !m-0 !mt-0.5"
            style={{ color: other.deliveryStatus === "IN TRANSIT" ? "#10b981" : "#94a3b8" }}>
            {other.deliveryStatusLabel}
          </p>
        )}
      </div>
 
      {unread > 0 && (
        <span className="!w-5 !h-5 !rounded-full !flex !items-center !justify-center !text-[10px] !font-bold !text-white !shrink-0"
          style={{ background: "#2563eb" }}>
          {unread}
        </span>
      )}
    </div>
  );
}
 
// ── Message input bar ─────────────────────────────────────────────────────────
export function MessageInput({ value, onChange, onSend, onTyping, placeholder = "Type a message...", showAttach = true }) {
  const { Mic, Plus, Paperclip, Send } = require("lucide-react");
 
  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
  }
 
  return (
    <div className="!flex !items-center !gap-3 !px-4 !py-3 !rounded-2xl"
      style={{ background: "#161e2e", border: "1px solid #1e2d3d" }}>
 
      {showAttach && (
        <button className="!flex !items-center !justify-center !w-7 !h-7 !cursor-pointer !bg-transparent !border-none !shrink-0">
          <Plus size={18} color="#475569" />
        </button>
      )}
 
      <input
        value={value}
        onChange={e => { onChange(e.target.value); onTyping?.(); }}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className="!flex-1 !bg-transparent !border-none !outline-none !text-[13px]"
        style={{ color: "#f1f5f9" }}
      />
 
      <button className="!flex !items-center !justify-center !cursor-pointer !bg-transparent !border-none !shrink-0">
        <Mic size={17} color="#475569" />
      </button>
 
      <button
        onClick={onSend}
        disabled={!value?.trim()}
        className="!w-9 !h-9 !rounded-full !flex !items-center !justify-center !cursor-pointer !border-none !transition-all !shrink-0"
        style={{
          background: value?.trim() ? "#2563eb" : "#1e2d3d",
          boxShadow:  value?.trim() ? "0 4px 12px rgba(37,99,235,0.4)" : "none",
        }}>
        <Send size={14} color={value?.trim() ? "white" : "#475569"} />
      </button>
    </div>
  );
}