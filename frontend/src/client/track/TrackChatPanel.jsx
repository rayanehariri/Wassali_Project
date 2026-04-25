import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useChat } from "../../hooks/Usechat";
import {
  ConvItem,
  MessageBubble,
  TypingDots,
  DateSeparator,
  MessageInput,
} from "../../components/chat/Chatcomponents";
async function resolveDelivererUid(deliverer) {
  const mongoId = deliverer?.deliverer_id || deliverer?.id || null;
  if (!mongoId) return null;
  return mongoId;
}

export default function TrackChatPanel({ deliverer, onClose }) {
  const [input, setInput] = useState("");
  const [bootstrapError, setBootstrapError] = useState("");
  const endRef = useRef(null);
  const currentUid = (() => {
    try {
      const raw = localStorage.getItem("currentUser");
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.uid || parsed?.id || null;
    } catch {
      return null;
    }
  })();
  const currentName = (() => {
    try {
      const raw = localStorage.getItem("currentUser");
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.name || "You";
    } catch {
      return "You";
    }
  })();

  const {
    conversations,
    activeConvId,
    setActiveConvId,
    messages,
    otherTyping,
    loadingConvs,
    chatError,
    handleTyping,
    sendMessage,
    createConversation,
    otherUser,
  } = useChat(currentUid);

  const delivererKey =
    deliverer?.deliverer_id || deliverer?.id || deliverer?.mongoId || null;

  useEffect(() => {
    let alive = true;
    async function bootstrap() {
      if (!currentUid) {
        setBootstrapError("Chat requires a signed-in session.");
        return;
      }
      if (!delivererKey) return;
      try {
        const otherUid = await resolveDelivererUid(deliverer);
        if (!alive || !otherUid) return;
        const convId = await createConversation(otherUid, "customer");
        if (alive && convId) setActiveConvId(convId);
      } catch {
        // keep list/messages accessible; user can pick a thread manually
      }
    }
    bootstrap();
    return () => {
      alive = false;
    };
  }, [delivererKey, currentUid, createConversation, setActiveConvId, deliverer]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  async function handleSend() {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "86vw",
          maxWidth: 960,
          height: "78vh",
          background: "#071828",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 22,
          boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          overflow: "hidden",
        }}
      >
        <div style={{ background: "#050f1e", borderRight: "1px solid rgba(255,255,255,0.07)", overflowY: "auto" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "white" }}>Recent Deliverers</h3>
          </div>
          {loadingConvs ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
              <div style={{ width: 20, height: 20, border: "2px solid rgba(59,130,246,0.3)", borderTopColor: "#3b82f6", borderRadius: "50%" }} />
            </div>
          ) : chatError ? (
            <p style={{ margin: 0, padding: 16, fontSize: 12, color: "#fca5a5" }}>{chatError}</p>
          ) : conversations.length === 0 ? (
            <p style={{ margin: 0, padding: 16, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>No conversations yet.</p>
          ) : (
            conversations.map((conv) => (
              <ConvItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConvId}
                onClick={() => setActiveConvId(conv.id)}
                currentUid={currentUid}
              />
            ))
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", background: "#0d1117" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
              {otherUser?.name || "Conversation"}
            </div>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}>
              <X size={16} />
            </button>
          </div>

          {bootstrapError ? (
            <div style={{ padding: 16, color: "#fca5a5", fontSize: 12 }}>{bootstrapError}</div>
          ) : !activeConvId ? (
            <div style={{ padding: 16, color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Select a deliverer to open chat.</div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                <DateSeparator label="TODAY" />
                {messages.map((msg, i) => {
                  const prev = messages[i - 1];
                  const showAv = !prev || prev.senderId !== msg.senderId;
                  return (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      isOwn={msg.senderId === currentUid}
                      showAvatar={showAv}
                      avatarUser={msg.senderId === currentUid ? { uid: currentUid, name: currentName } : otherUser}
                    />
                  );
                })}
                {otherTyping && <TypingDots label={`${String(otherUser?.name || "PARTNER").split(" ")[0].toUpperCase()} IS TYPING`} />}
                <div ref={endRef} />
              </div>
              <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <MessageInput
                  value={input}
                  onChange={setInput}
                  onSend={handleSend}
                  onTyping={handleTyping}
                  placeholder="Type a message..."
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
