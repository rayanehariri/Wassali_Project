import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Phone, Info, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useChat } from "../hooks/Usechat";
import {
  ChatAvatar, ConvItem, MessageBubble,
  TypingDots, DateSeparator, MessageInput,
} from "../components/chat/Chatcomponents";
 
export default function AdminCourierChat({ currentUser }) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const endRef = useRef(null);
 
  const {
    conversations, activeConvId, setActiveConvId,
    messages, otherTyping,
    loadingConvs,
    handleTyping, sendMessage,
    activeConv, otherUser,
  } = useChat(currentUser?.uid);
 
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);
 
  async function handleSend() {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
  }
 
  const filtered = conversations.filter(c =>
    (c.otherUser?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );
 
  return (
    <div className="!flex !h-screen !overflow-hidden" style={{ background: "#080d18" }}>
 
      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <div className="!w-[215px] !shrink-0 !flex !flex-col !h-full"
        style={{ background: "#0d1220", borderRight: "1px solid #141c2e" }}>
 
        {/* Return to Dashboard */}
        <div className="!px-4 !py-4 !flex !items-center !gap-3"
          style={{ borderBottom: "1px solid #141c2e" }}>
          <button
            onClick={() => navigate("/dashboard")}
            className="!flex !items-center !gap-2 !text-[12px] !font-semibold !text-slate-400 hover:!text-white !bg-transparent !border-none !cursor-pointer !transition-colors !p-0 !tracking-wide"
          >
            <ArrowLeft size={13} /> RETURN TO DASHBOARD
          </button>
        </div>
 
        {/* Active Couriers header */}
        <div className="!px-4 !pt-4 !pb-2">
          <h2 className="!text-[15px] !font-extrabold !text-white !m-0 !mb-3">Active Couriers</h2>
          {/* Search */}
          <div className="!flex !items-center !gap-2 !px-3 !py-2 !rounded-xl"
            style={{ background: "#131b2e", border: "1px solid #1e2d3d" }}>
            <Search size={13} color="#475569" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search shipments..."
              className="!flex-1 !bg-transparent !border-none !outline-none !text-[12px]"
              style={{ color: "#cbd5e1" }}
            />
          </div>
        </div>
 
        {/* Courier list */}
        <div className="!flex-1 !overflow-y-auto !mt-1">
          {loadingConvs ? (
            <div className="!flex !justify-center !py-8">
              <div className="!w-5 !h-5 !border-2 !border-blue-600/30 !border-t-blue-500 !rounded-full !animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="!text-[12px] !text-slate-600 !text-center !py-8 !m-0">No active couriers</p>
          ) : (
            filtered.map(conv => (
              <ConvItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConvId}
                onClick={() => setActiveConvId(conv.id)}
                currentUid={currentUser?.uid}
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
                  {/* Status pill */}
                  <span className="!text-[10px] !font-bold !px-2 !py-0.5 !rounded-full"
                    style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}>
                    ● IN TRANSIT
                  </span>
                  {otherUser.deliveryId && (
                    <span className="!text-[11px] !text-slate-500">ID: {otherUser.deliveryId}</span>
                  )}
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
            <DateSeparator />
            {messages.map((msg, i) => {
              const prev = messages[i - 1];
              const showAv = !prev || prev.senderId !== msg.senderId;
              return (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isOwn={msg.senderId === currentUser?.uid}
                  showAvatar={showAv}
                  avatarUser={msg.senderId === currentUser?.uid ? currentUser : otherUser}
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
            <p className="!text-[14px] !font-semibold !text-slate-500 !m-0">Select a courier</p>
            <p className="!text-[12px] !text-slate-600 !m-0 !mt-1">Choose from the left to open chat</p>
          </div>
        </div>
      )}
    </div>
  );
}