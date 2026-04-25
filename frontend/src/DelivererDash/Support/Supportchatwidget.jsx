// SupportChatWidget.jsx — Uses shared Socket.IO connection via useChat hook
import { useState, useRef, useEffect } from "react";
import { X, Paperclip, Send, Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChat, formatTime, resolveCurrentUid } from "../../hooks/Usechat";

const SUPPORT_AGENT_UID = "ADMIN-ROOT-001";

function Bubble({ msg, isOwn }) {
  return (
    <div className={`!flex !mb-3 ${isOwn ? "!justify-end" : "!justify-start"}`}>
      <div className={`!max-w-[85%] !flex !flex-col ${isOwn ? "!items-end" : "!items-start"}`}>
        <div className="!px-3.5 !py-2.5 !rounded-2xl" style={{
          background:   isOwn ? "#2563eb" : "#1a2535",
          borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          boxShadow:    isOwn ? "0 3px 10px rgba(37,99,235,0.3)" : "none",
        }}>
          <p className="!text-[13px] !text-white !m-0 !leading-relaxed">{msg.text}</p>
        </div>
        <div className={`!flex !items-center !gap-1 !mt-1 ${isOwn ? "!flex-row-reverse" : ""}`}>
          <span className="!text-[10px] !text-slate-600">{formatTime(msg.timestamp)}</span>
          {isOwn && (msg.read
            ? <CheckCheck size={11} color="#3b82f6" />
            : <Check      size={11} color="#475569" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SupportChatWidget({ currentUser, onClose, variant = "deliverer" }) {
  const userUid = resolveCurrentUid(currentUser?.id || currentUser?.uid);

  const {
    messages,
    otherTyping: agentTyping,
    chatError,
    sendMessage,
    createConversation,
    activeConvId,
    setActiveConvId,
    handleTyping,
  } = useChat(userUid);

  const [input, setInput] = useState("");
  const [ready, setReady] = useState(false);
  const endRef = useRef(null);
  const bootstrapRef = useRef(false);

  const agentInfo = { name: "Amina B.", role: "Support Specialist", avatar: "AB" };

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
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentTyping]);

  function handleInputChange(e) {
    setInput(e.target.value);
    handleTyping?.();
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || !activeConvId || !userUid) return;
    setInput("");
    sendMessage(text);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const error = chatError || (!userUid ? "Please log in to use support chat." : null);
  const h = variant === "client" ? 460 : 400;

  return (
    <div className="!flex !flex-col !rounded-2xl !overflow-hidden" style={{
      background:  "#0d1117",
      border:      "1px solid #1e2d3d",
      boxShadow:   "0 20px 60px rgba(0,0,0,0.6)",
      height:       h,
      width:        "100%",
    }}>

      {/* Header */}
      <div className="!flex !items-center !justify-between !px-4 !py-3"
        style={{ background: "#111c2e", borderBottom: "1px solid #1e2d3d" }}>
        <div className="!flex !items-center !gap-3">
          <div className="!relative">
            <Avatar className="!w-9 !h-9">
              <AvatarFallback style={{
                background: "linear-gradient(135deg,#059669,#10b981)",
                fontSize: "12px", fontWeight: 700, color: "white",
              }}>
                {agentInfo.avatar}
              </AvatarFallback>
            </Avatar>
            <span className="!absolute !bottom-0 !right-0 !w-2.5 !h-2.5 !rounded-full !border-2"
              style={{ background: "#10b981", borderColor: "#111c2e" }} />
          </div>
          <div>
            <p className="!text-[13px] !font-bold !text-white !m-0">{agentInfo.name}</p>
            <p className="!text-[10px] !text-slate-500 !m-0">{agentInfo.role} • Online</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose}
            className="!w-6 !h-6 !flex !items-center !justify-center !cursor-pointer !bg-transparent !border-none"
            style={{ color: "#64748b" }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="!flex-1 !overflow-y-auto !px-4 !py-4" style={{ background: "#0d1117" }}>
        {error ? (
          <div className="!flex !items-center !justify-center !h-full">
            <p className="!text-[12px] !text-red-400 !text-center !m-0">{error}</p>
          </div>
        ) : !ready ? (
          <div className="!flex !items-center !justify-center !h-full">
            <div className="!w-5 !h-5 !border-2 !border-blue-600/30 !border-t-blue-500 !rounded-full !animate-spin" />
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <Bubble
                key={msg.id}
                msg={msg}
                isOwn={msg.senderId === userUid}
              />
            ))}
            {agentTyping && (
              <div className="!flex !mb-3">
                <div className="!flex !items-center !gap-1 !px-3 !py-2 !rounded-2xl"
                  style={{ background: "#1a2535", borderRadius: "16px 16px 16px 4px" }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} className="!inline-block !w-1.5 !h-1.5 !rounded-full"
                      style={{
                        background: "#475569",
                        animation: `swDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="!px-3 !py-3" style={{ background: "#111c2e", borderTop: "1px solid #1e2d3d" }}>
        <div className="!flex !items-center !gap-2 !px-3 !py-2.5 !rounded-xl"
          style={{ background: "#0d1117", border: "1px solid #1e2d3d" }}>
          <button className="!cursor-pointer !bg-transparent !border-none !shrink-0">
            <Paperclip size={14} color="#475569" />
          </button>
          <input
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={ready ? "Type a message..." : "Connecting..."}
            disabled={!ready}
            className="!flex-1 !bg-transparent !border-none !outline-none !text-[13px] disabled:!opacity-50"
            style={{ color: "#f1f5f9" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !ready}
            className="!w-8 !h-8 !rounded-full !flex !items-center !justify-center !cursor-pointer !border-none !transition-all !shrink-0"
            style={{
              background: input.trim() && ready ? "#2563eb" : "#1e2535",
              boxShadow:  input.trim() && ready ? "0 4px 10px rgba(37,99,235,0.4)" : "none",
            }}>
            <Send size={13} color={input.trim() && ready ? "white" : "#475569"} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes swDot {
          0%,60%,100% { transform:translateY(0);   opacity:.5; }
          30%          { transform:translateY(-3px); opacity:1;  }
        }
      `}</style>
    </div>
  );
}