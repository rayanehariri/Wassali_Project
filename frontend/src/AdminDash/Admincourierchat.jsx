import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, Phone, Info, Star, Plus, Users, Headphones } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useChat } from "../hooks/Usechat";
import {
  ChatAvatar, ConvItem, MessageBubble,
  TypingDots, DateSeparator, MessageInput,
} from "../components/chat/Chatcomponents";
import { http } from "../api/http";

export default function AdminCourierChat({ currentUser }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const endRef = useRef(null);

  // Tab: "all" | "couriers" | "support"
  const [tab, setTab] = useState("all");

  // New chat modal state
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const {
    conversations, activeConvId, setActiveConvId,
    messages, otherTyping,
    loadingConvs,
    handleTyping, sendMessage, createConversation,
    activeConv, otherUser, currentUid,
  } = useChat(currentUser?.uid || currentUser?.id);

  // Auto-open a conversation if ?userId= is in the URL
  const targetUserId = searchParams.get("userId");
  const bootstrapRef = useRef(false);
  useEffect(() => {
    if (!targetUserId || bootstrapRef.current || !currentUid) return;
    bootstrapRef.current = true;
    createConversation(targetUserId, "customer").then((id) => {
      if (id) setActiveConvId(id);
    });
  }, [targetUserId, currentUid, createConversation, setActiveConvId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  async function handleSend() {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
  }

  // Filter conversations by tab and search
  const filtered = conversations.filter(c => {
    // Tab filter
    if (tab === "couriers" && c.type !== "customer") return false;
    if (tab === "support" && c.type !== "support") return false;
    // Search filter
    if (search && !(c.otherUser?.name ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Search users for new chat
  useEffect(() => {
    if (!userSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await http.get("/admin/users/", {
          params: { search: userSearch.trim(), page: 1, per_page: 10 },
        });
        const users = res.data?.users || res.data?.data?.users || [];
        setSearchResults(users.filter(u => u.role !== "admin"));
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [userSearch]);

  async function startChatWith(userId, type = "customer") {
    const convId = await createConversation(userId, type);
    if (convId) setActiveConvId(convId);
    setShowNewChat(false);
    setUserSearch("");
    setSearchResults([]);
  }

  const tabs = [
    { id: "all",      label: "All",      icon: null },
  ];

  return (
     <div className="!flex !flex-1 !h-full !overflow-hidden" style={{ background: "#080d18" }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <div className="!w-[260px] !shrink-0 !flex !flex-col !h-full"
        style={{ background: "#0d1220", borderRight: "1px solid #141c2e" }}>

        {/* Header with New Chat button */}
        <div className="!px-4 !py-4 !flex !items-center !justify-between"
          style={{ borderBottom: "1px solid #141c2e" }}>
          <h2 className="!text-[15px] !font-extrabold !text-white !m-0">Messages</h2>
          <button
            onClick={() => setShowNewChat(true)}
            className="!w-8 !h-8 !rounded-xl !flex !items-center !justify-center !cursor-pointer !border-none !transition-all"
            style={{ background: "#2563eb", boxShadow: "0 2px 8px rgba(37,99,235,0.4)" }}
            title="Start new conversation"
          >
            <Plus size={16} color="white" />
          </button>
        </div>

        {/* Tab filter */}
        <div className="!flex !gap-1 !px-3 !pt-3 !pb-1">
          {tabs.map(t => (
            <button key={t.id}
              onClick={() => setTab(t.id)}
              className="!flex !items-center !gap-1.5 !px-3 !py-1.5 !rounded-lg !text-[11px] !font-bold !cursor-pointer !border-none !transition-all"
              style={{
                background: tab === t.id ? "rgba(37,99,235,0.15)" : "transparent",
                color: tab === t.id ? "#60a5fa" : "#64748b",
                border: tab === t.id ? "1px solid rgba(37,99,235,0.3)" : "1px solid transparent",
              }}
            >
              {t.icon && <t.icon size={12} />}
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="!px-3 !pt-2 !pb-2">
          <div className="!flex !items-center !gap-2 !px-3 !py-2 !rounded-xl"
            style={{ background: "#131b2e", border: "1px solid #1e2d3d" }}>
            <Search size={13} color="#475569" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="!flex-1 !bg-transparent !border-none !outline-none !text-[12px]"
              style={{ color: "#cbd5e1" }}
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="!flex-1 !overflow-y-auto">
          {loadingConvs ? (
            <div className="!flex !justify-center !py-8">
              <div className="!w-5 !h-5 !border-2 !border-blue-600/30 !border-t-blue-500 !rounded-full !animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="!text-center !py-8">
              <p className="!text-[12px] !text-slate-600 !m-0">No conversations</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="!text-[11px] !text-blue-400 !mt-2 !bg-transparent !border-none !cursor-pointer"
              >
                Start a new chat
              </button>
            </div>
          ) : (
            filtered.map(conv => (
              <ConvItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConvId}
                onClick={() => setActiveConvId(conv.id)}
                currentUid={currentUid}
                variant="admin"
              />
            ))
          )}
        </div>
      </div>

      {/* ── MAIN CHAT ────────────────────────────────────────────────────── */}
      {activeConvId && otherUser ? (
        <div className="!flex-1 !flex !flex-col !overflow-hidden">

          {/* Chat header */}
          <div className="!flex !items-center !justify-between !px-6 !py-4"
            style={{ background: "#0d1220", borderBottom: "1px solid #141c2e" }}>
            <div className="!flex !items-center !gap-4">
              <ChatAvatar user={otherUser} size={44} />
              <div>
                <div className="!flex !items-center !gap-2 !mb-0.5">
                  <h2 className="!text-[17px] !font-extrabold !text-white !m-0">{otherUser.name}</h2>
                  {/* Rating badge */}
                  {otherUser.rating && (
                    <span className="!flex !items-center !gap-1 !px-2 !py-0.5 !rounded-full !text-[11px] !font-bold"
                      style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
                      <Star size={9} fill="#10b981" color="#10b981" /> {otherUser.rating}
                    </span>
                  )}
                </div>
                <div className="!flex !items-center !gap-3">
                  {/* Role pill */}
                  <span className="!text-[10px] !font-bold !px-2 !py-0.5 !rounded-full"
                    style={{
                      background: activeConv?.type === "support"
                        ? "rgba(168,85,247,0.15)" : "rgba(59,130,246,0.15)",
                      color: activeConv?.type === "support" ? "#a855f7" : "#60a5fa",
                      border: activeConv?.type === "support"
                        ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(59,130,246,0.3)",
                    }}>
                    {activeConv?.type === "support" ? "● SUPPORT" : `● ${(otherUser.role || "USER").toUpperCase()}`}
                  </span>
                  {/* Online status */}
                  <span className="!text-[11px] !text-slate-500">
                    {otherUser.status === "online" ? "🟢 Online" : "⚫ Offline"}
                  </span>
                </div>
              </div>
            </div>
            <div className="!flex !gap-2">
              <button className="!w-9 !h-9 !rounded-xl !flex !items-center !justify-center !cursor-pointer !border-none !transition-all"
                style={{ background: "#131b2e", border: "1px solid #1e2d3d" }}>
                <Phone size={15} color="#64748b" />
              </button>
              <button className="!w-9 !h-9 !rounded-xl !flex !items-center !justify-center !cursor-pointer !border-none !transition-all"
                style={{ background: "#131b2e", border: "1px solid #1e2d3d" }}>
                <Info size={15} color="#64748b" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="!flex-1 !overflow-y-auto !px-6 !py-4"
            style={{ background: "#080d18" }}>
            <DateSeparator date={messages[0]?.timestamp} />
            {messages.map((msg, i) => {
              const prev = messages[i - 1];
              const showAv = !prev || prev.senderId !== msg.senderId;
              return (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isOwn={msg.senderId === currentUid}
                  showAvatar={showAv}
                  avatarUser={msg.senderId === currentUid ? currentUser : otherUser}
                />
              );
            })}
            {otherTyping && <TypingDots />}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="!px-5 !py-4" style={{ background: "#0d1220", borderTop: "1px solid #141c2e" }}>
            <MessageInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              onTyping={handleTyping}
              placeholder="Type a message..."
            />
          </div>
        </div>
      ) : (
        <div className="!flex-1 !flex !items-center !justify-center" style={{ background: "#080d18" }}>
          <div className="!text-center">
            <div className="!w-14 !h-14 !rounded-2xl !flex !items-center !justify-center !mx-auto !mb-4"
              style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)" }}>
              <Search size={22} color="#3b82f6" />
            </div>
            <p className="!text-[14px] !font-semibold !text-slate-500 !m-0">Select a conversation</p>
            <p className="!text-[12px] !text-slate-600 !m-0 !mt-1">Choose from the left or start a new chat</p>
          </div>
        </div>
      )}

      {/* ── NEW CHAT MODAL ─────────────────────────────────────────────── */}
      {showNewChat && (
        <div className="!fixed !inset-0 !z-50 !flex !items-center !justify-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowNewChat(false); }}
        >
          <div className="!w-full !max-w-[440px] !rounded-2xl !overflow-hidden"
            style={{ background: "#111c2e", border: "1px solid #1e2d3d", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>

            {/* Modal header */}
            <div className="!flex !items-center !justify-between !px-5 !py-4"
              style={{ borderBottom: "1px solid #1e2d3d" }}>
              <h3 className="!text-[16px] !font-bold !text-white !m-0">New Conversation</h3>
              <button onClick={() => setShowNewChat(false)}
                className="!w-7 !h-7 !rounded-lg !flex !items-center !justify-center !cursor-pointer !border-none"
                style={{ background: "#1a2744" }}>
                <Plus size={14} color="#64748b" style={{ transform: "rotate(45deg)" }} />
              </button>
            </div>

            {/* Search input */}
            <div className="!px-5 !py-4">
              <div className="!flex !items-center !gap-2 !px-3 !py-2.5 !rounded-xl"
                style={{ background: "#0d1220", border: "1px solid #1e2d3d" }}>
                <Search size={14} color="#475569" />
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  autoFocus
                  className="!flex-1 !bg-transparent !border-none !outline-none !text-[13px]"
                  style={{ color: "#f1f5f9" }}
                />
              </div>
            </div>

            {/* Results */}
            <div className="!max-h-[300px] !overflow-y-auto !px-2 !pb-4">
              {searchLoading ? (
                <div className="!flex !justify-center !py-6">
                  <div className="!w-5 !h-5 !border-2 !border-blue-600/30 !border-t-blue-500 !rounded-full !animate-spin" />
                </div>
              ) : searchResults.length === 0 ? (
                <p className="!text-[12px] !text-slate-600 !text-center !py-6 !m-0">
                  {userSearch.trim() ? "No users found" : "Type to search for users"}
                </p>
              ) : (
                searchResults.map(user => (
                  <div key={user._id || user.id}
                    className="!flex !items-center !gap-3 !px-3 !py-3 !rounded-xl !cursor-pointer !transition-all"
                    style={{ background: "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(37,99,235,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={() => startChatWith(user._id || user.id, "customer")}
                  >
                    <div className="!w-10 !h-10 !rounded-full !flex !items-center !justify-center !shrink-0"
                      style={{ background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", fontSize: 13, fontWeight: 700, color: "white" }}>
                      {(user.username || user.name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="!flex-1 !min-w-0">
                      <p className="!text-[13px] !font-semibold !text-white !m-0 !truncate">{user.username || user.name}</p>
                      <p className="!text-[11px] !text-slate-500 !m-0">{user.email || ""}</p>
                    </div>
                    <span className="!text-[10px] !font-bold !px-2 !py-0.5 !rounded-full !shrink-0"
                      style={{
                        background: user.role === "deliverer" ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)",
                        color: user.role === "deliverer" ? "#10b981" : "#60a5fa",
                      }}>
                      {(user.role || "client").toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}