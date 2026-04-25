import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Info } from "lucide-react";
import { useChat } from "../hooks/Usechat";
import { getActiveTask } from "./Schedule/FakeApi";
import {
  ChatAvatar, ConvItem, MessageBubble,
  TypingDots, DateSeparator, MessageInput,
} from "../components/chat/Chatcomponents";
 
export default function DelivererMessagesPage({ currentUser }) {
  const navigate    = useNavigate();
  const [input, setInput] = useState("");
  const endRef      = useRef(null);
 
  const {
    conversations, activeConvId, setActiveConvId,
    messages, otherTyping,
    loadingConvs,
    chatError,
    handleTyping, sendMessage, createConversation,
    activeConv, otherUser,
  } = useChat(currentUser?.id || currentUser?.uid);
  const selfId = currentUser?.id || currentUser?.uid;

  useEffect(() => {
    let alive = true;
    async function bootstrapActiveClientChat() {
      if (activeConvId) return;
      try {
        const task = await getActiveTask();
        const clientId = task?.clientId;
        if (!alive || !clientId) return;
        const convId = await createConversation(clientId, "customer");
        if (alive && convId) setActiveConvId(convId);
      } catch {
        // fallback to conversation list
      }
    }
    bootstrapActiveClientChat();
    return () => { alive = false; };
  }, [activeConvId, createConversation, setActiveConvId]);

  const pickedInitialRef = useRef(false);
  useEffect(() => {
    if (activeConvId) {
      pickedInitialRef.current = true;
      return;
    }
    if (pickedInitialRef.current) return;
    if (conversations.length > 0) {
      setActiveConvId(conversations[0].id);
      pickedInitialRef.current = true;
    }
  }, [conversations, activeConvId, setActiveConvId]);
 
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);
 
  async function handleSend() {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
  }
 
  return (
    <div className="!flex !h-screen !overflow-hidden" style={{ background: "#0d1117" }}>
 
      {/* ── LEFT ─────────────────────────────────────────────────────────── */}
      <div className="!w-[250px] !shrink-0 !flex !flex-col !h-full"
        style={{ background: "#0f1520", borderRight: "1px solid #1a2535" }}>
 
        {/* Return button */}
        <div className="!px-4 !py-4" style={{ borderBottom: "1px solid #1a2535" }}>
          <button
            onClick={() => navigate(-1)}
            className="!flex !items-center !gap-2 !text-[13px] !text-slate-400 hover:!text-white !bg-transparent !border-none !cursor-pointer !transition-colors !p-0"
          >
            <ArrowLeft size={14} /> Return
          </button>
        </div>
 
        {/* Messages title */}
        <div className="!px-4 !pt-5 !pb-2">
          <h2 className="!text-[22px] !font-extrabold !text-white !m-0">Messages</h2>
        </div>
 
        {/* Conversation list */}
        <div className="!flex-1 !overflow-y-auto !mt-2">
          {loadingConvs ? (
            <div className="!flex !justify-center !py-8">
              <div className="!w-5 !h-5 !border-2 !border-blue-600/30 !border-t-blue-500 !rounded-full !animate-spin" />
            </div>
          ) : chatError ? (
            <p className="!text-[12px] !text-red-300 !text-center !py-8 !m-0 !px-3">{chatError}</p>
          ) : conversations.length === 0 ? (
            <p className="!text-[12px] !text-slate-600 !text-center !py-8 !m-0">No conversations yet</p>
          ) : (
            conversations.map(conv => (
              <ConvItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConvId}
                onClick={() => setActiveConvId(conv.id)}
                currentUid={selfId}
              />
            ))
          )}
        </div>
      </div>
 
      {/* ── RIGHT ────────────────────────────────────────────────────────── */}
      {activeConvId && otherUser ? (
        <div className="!flex-1 !flex !flex-col !overflow-hidden">
 
          {/* Header */}
          <div className="!flex !items-center !justify-between !px-6 !py-4"
            style={{ background: "#0f1520", borderBottom: "1px solid #1a2535" }}>
            <div className="!flex !items-center !gap-3">
              <ChatAvatar user={otherUser} size={42} />
              <div>
                <h3 className="!text-[16px] !font-bold !text-white !m-0">{otherUser.name}</h3>
                <p className="!text-[11px] !font-semibold !text-green-400 !m-0">● ONLINE NOW</p>
              </div>
            </div>
            <div className="!flex !gap-2">
              <button className="!w-8 !h-8 !rounded-xl !flex !items-center !justify-center !cursor-pointer !border-none"
                style={{ background: "#1a2535", border: "1px solid #253045" }}>
                <Phone size={14} color="#64748b" />
              </button>
              <button className="!w-8 !h-8 !rounded-xl !flex !items-center !justify-center !cursor-pointer !border-none"
                style={{ background: "#1a2535", border: "1px solid #253045" }}>
                <Info size={14} color="#64748b" />
              </button>
            </div>
          </div>
 
          {/* Messages */}
          <div className="!flex-1 !overflow-y-auto !px-6 !py-4"
            style={{ background: "#0d1117" }}>
            <DateSeparator label="TODAY" />
            {messages.map((msg, i) => {
              const prev   = messages[i - 1];
              const showAv = !prev || prev.senderId !== msg.senderId;
              return (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isOwn={msg.senderId === selfId}
                  showAvatar={showAv}
                  avatarUser={msg.senderId === selfId ? currentUser : otherUser}
                />
              );
            })}
 
            {/* Typing indicator — matches "SARAH IS TYPING" design */}
            {otherTyping && (
              <TypingDots
                label={`${otherUser.name.split(" ")[0].toUpperCase()} IS TYPING`}
              />
            )}
            <div ref={endRef} />
          </div>
 
          {/* Input */}
          <div className="!px-5 !py-4" style={{ background: "#0f1520", borderTop: "1px solid #1a2535" }}>
            <MessageInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              onTyping={handleTyping}
              placeholder="Type your message..."
            />
          </div>
        </div>
      ) : (
        <div className="!flex-1 !flex !items-center !justify-center" style={{ background: "#0d1117" }}>
          <p className="!text-[13px] !text-slate-600">Select a conversation</p>
        </div>
      )}
    </div>
  );
}