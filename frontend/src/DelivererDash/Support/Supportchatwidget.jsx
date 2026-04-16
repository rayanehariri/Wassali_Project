// SupportChatWidget.jsx
import { useState, useRef, useEffect } from "react";
import { X, Paperclip, Send, Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  collection, addDoc, query, orderBy, onSnapshot,
  updateDoc, doc, serverTimestamp, where,
  getDocs, setDoc, getDoc,
} from "firebase/firestore";
import { db } from "../../Firebase.config";

const SUPPORT_AGENT_UID = "support-agent-001";

function formatTime(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

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
  // ← KEY FIX: use id as fallback when uid is null
  const userUid = currentUser?.uid || currentUser?.id || null;

  const [convId,      setConvId]      = useState(null);
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState("");
  const [agentTyping, setAgentTyping] = useState(false);
  const [ready,       setReady]       = useState(false);
  const [error,       setError]       = useState(null);
  const endRef         = useRef(null);
  const typingTimerRef = useRef(null);

  const agentInfo = { name: "Amina B.", role: "Support Specialist", avatar: "AB" };

  useEffect(() => {
    // ← wait until we have a valid uid
    if (!userUid) {
      setError("Please log in to use support chat.");
      return;
    }

    async function init() {
      try {
        // ── ensure user doc exists in Firestore ────────────
        const userRef = doc(db, "users", userUid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid:      userUid,
            name:     currentUser?.name ?? "User",
            role:     currentUser?.role ?? "client",
            avatar:   (currentUser?.name ?? "U").slice(0, 2).toUpperCase(),
            status:   "online",
            lastSeen: serverTimestamp(),
          }, { merge: true });
        }

        // ── find or create support conversation ────────────
        const q = query(
          collection(db, "conversations"),
          where("participants", "array-contains", userUid),
          where("type", "==", "support")
        );
        const snap = await getDocs(q);

        let id;
        if (!snap.empty) {
          id = snap.docs[0].id;
        } else {
          const ref = doc(collection(db, "conversations"));
          await setDoc(ref, {
            participants:  [userUid, SUPPORT_AGENT_UID],
            type:          "support",
            status:        "active",
            lastMessage:   "",
            lastMessageAt: serverTimestamp(),
            typing:        {},
            unreadCount:   { [userUid]: 0, [SUPPORT_AGENT_UID]: 0 },
          });
          id = ref.id;

          // welcome message from agent
          await addDoc(collection(db, "conversations", id, "messages"), {
            senderId:  SUPPORT_AGENT_UID,
            text:      `Hello! I'm ${agentInfo.name} from the Wassali support team. How can I assist you today? 👋`,
            timestamp: serverTimestamp(),
            read:      false,
          });
        }

        setConvId(id);
        setReady(true);
      } catch (err) {
        console.error("Support chat init error:", err);
        setError("Failed to connect to support. Please try again.");
      }
    }

    init();
  }, [userUid]);

  // Listen to messages
  useEffect(() => {
    if (!convId || !userUid) return;

    const q = query(
      collection(db, "conversations", convId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      snap.docs.forEach(d => {
        if (d.data().senderId !== userUid && !d.data().read) {
          updateDoc(
            doc(db, "conversations", convId, "messages", d.id),
            { read: true }
          ).catch(() => {});
        }
      });
    }, err => {
      console.error("Messages listener error:", err);
    });

    return () => unsub();
  }, [convId, userUid]);

  // Listen to typing
  useEffect(() => {
    if (!convId || !userUid) return;

    const unsub = onSnapshot(doc(db, "conversations", convId), snap => {
      const t = snap.data()?.typing ?? {};
      setAgentTyping(
        Object.entries(t)
          .filter(([u]) => u !== userUid)
          .some(([, v]) => v)
      );
    }, () => {});

    return () => unsub();
  }, [convId, userUid]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentTyping]);

  function handleInputChange(e) {
    setInput(e.target.value);
    if (!convId || !userUid) return;
    updateDoc(doc(db, "conversations", convId), {
      [`typing.${userUid}`]: true,
    }).catch(() => {});
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      updateDoc(doc(db, "conversations", convId), {
        [`typing.${userUid}`]: false,
      }).catch(() => {});
    }, 2000);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || !convId || !userUid) return;
    setInput("");
    clearTimeout(typingTimerRef.current);
    updateDoc(doc(db, "conversations", convId), {
      [`typing.${userUid}`]: false,
    }).catch(() => {});

    await addDoc(collection(db, "conversations", convId, "messages"), {
      senderId:  userUid,
      text,
      timestamp: serverTimestamp(),
      read:      false,
    });

    await updateDoc(doc(db, "conversations", convId), {
      lastMessage:   text,
      lastMessageAt: serverTimestamp(),
    });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

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