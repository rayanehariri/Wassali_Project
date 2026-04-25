import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

// ── helpers ───────────────────────────────────────────────────────────────────
export function timeAgo(ts) {
  if (!ts) return "";
  const d = ts instanceof Date ? ts : new Date(ts);
  if (isNaN(d.getTime())) return "";
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 5)    return "NOW";
  if (diff < 60)   return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}M`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}H`;
  return "YESTERDAY";
}

export function formatTime(ts) {
  if (!ts) return "";
  const d = ts instanceof Date ? ts : new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Socket singleton ──────────────────────────────────────────────────────────
let _socket = null;
let _socketUserId = null;
let _socketReady = false;      // true after first successful authenticate
const _authCallbacks = [];      // queued callbacks waiting for auth

/**
 * Get (or create) the singleton Socket.IO connection.
 * Exported so support-chat widgets can share the same connection.
 */
export function getSocket() {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  // Reuse existing socket
  if (_socket) return _socket;

  // Build the backend URL (same origin or env override)
  const backendUrl =
    import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:5000";

  _socket = io(backendUrl, {
    transports: ["polling", "websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  _socket.on("connect", () => {
    // Always re-read token on (re)connect in case it was refreshed
    const freshToken = localStorage.getItem("access_token");
    if (freshToken) {
      _socket.emit("authenticate", { token: `Bearer ${freshToken}` });
    }
  });

  _socket.on("authenticated", (data) => {
    _socketUserId = data.user_id;
    _socketReady = true;
    // Flush any pending auth callbacks
    while (_authCallbacks.length) {
      const cb = _authCallbacks.shift();
      try { cb(); } catch {}
    }
  });

  _socket.on("auth_error", () => {
    console.warn("Chat socket auth failed — token may be expired.");
    _socketReady = false;
  });

  return _socket;
}

/**
 * Returns true if the socket is authenticated and ready.
 */
export function isSocketReady() {
  return _socketReady && _socket?.connected;
}

/**
 * Run `fn` once the socket is authenticated. If already ready, runs immediately.
 */
export function onSocketReady(fn) {
  if (_socketReady && _socket?.connected) {
    fn();
  } else {
    _authCallbacks.push(fn);
  }
}

/**
 * Resolve the current user's backend MongoDB _id from localStorage.
 * Prefers `id` (backend _id), falls back to `uid`.
 */
export function resolveCurrentUid(propUid) {
  try {
    const raw = localStorage.getItem("currentUser");
    const parsed = raw ? JSON.parse(raw) : null;
    // Backend _id is stored as `id`; uid is the enriched copy
    return parsed?.id || parsed?.uid || propUid || null;
  } catch {
    return propUid || null;
  }
}

// ── main hook ─────────────────────────────────────────────────────────────────
export function useChat(currentUidProp) {
  const [conversations,  setConversations]  = useState([]);
  const [activeConvId,   setActiveConvId]   = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [otherTyping,    setOtherTyping]    = useState(false);
  const [loadingConvs,   setLoadingConvs]   = useState(true);
  const [loadingMsgs,    setLoadingMsgs]    = useState(false);
  const [chatError,      setChatError]      = useState("");

  // Single, consistent uid resolution
  const currentUid = resolveCurrentUid(currentUidProp);

  const typingTimerRef = useRef(null);
  const socketRef = useRef(null);

  // ── Ref to track activeConvId inside socket listeners ─────────────────────
  const activeConvIdRef = useRef(activeConvId);
  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  // ── 1. Connect socket & listen to events ──────────────────────────────────
  useEffect(() => {
    if (!currentUid) {
      setLoadingConvs(false);
      setConversations([]);
      setChatError("Missing user id for chat session.");
      return;
    }

    const socket = getSocket();
    if (!socket) {
      setLoadingConvs(false);
      setChatError("No auth token found.");
      return;
    }
    socketRef.current = socket;
    setChatError("");
    setLoadingConvs(true);

    function onConversationsList(convs) {
      setConversations(convs || []);
      setLoadingConvs(false);
      setChatError("");
    }

    function onNewMessage(data) {
      const { conversationId, message } = data;
      setMessages((prev) => {
        if (conversationId === activeConvIdRef.current) {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        }
        return prev;
      });
    }

    function onMessagesHistory(data) {
      const { conversationId, messages: msgs } = data;
      if (conversationId === activeConvIdRef.current) {
        setMessages(msgs || []);
        setLoadingMsgs(false);
      }
    }

    function onTyping(data) {
      const { conversationId, userId, isTyping } = data;
      if (conversationId === activeConvIdRef.current && userId !== currentUid) {
        setOtherTyping(isTyping);
      }
    }

    function onMessagesRead(data) {
      const { conversationId, readBy } = data;
      if (conversationId === activeConvIdRef.current && readBy !== currentUid) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === currentUid && !m.read ? { ...m, read: true } : m
          )
        );
      }
    }

    function onConversationCreated() {
      socket.emit("get_conversations");
    }

    socket.on("conversations_list", onConversationsList);
    socket.on("new_message", onNewMessage);
    socket.on("messages_history", onMessagesHistory);
    socket.on("typing", onTyping);
    socket.on("messages_read", onMessagesRead);
    socket.on("conversation_created", onConversationCreated);

    // Request conversations — handle both "already authenticated" and "not yet" cases
    if (isSocketReady()) {
      socket.emit("get_conversations");
    } else {
      onSocketReady(() => {
        socket.emit("get_conversations");
      });
    }

    return () => {
      socket.off("conversations_list", onConversationsList);
      socket.off("new_message", onNewMessage);
      socket.off("messages_history", onMessagesHistory);
      socket.off("typing", onTyping);
      socket.off("messages_read", onMessagesRead);
      socket.off("conversation_created", onConversationCreated);
    };
  }, [currentUid]);

  // ── 2. Join conversation when activeConvId changes ────────────────────────
  useEffect(() => {
    if (!activeConvId || !currentUid) return;
    const socket = socketRef.current;
    if (!socket) return;

    setLoadingMsgs(true);
    setMessages([]);
    setOtherTyping(false);

    socket.emit("join_conversation", { conversationId: activeConvId });
  }, [activeConvId, currentUid]);

  // ── 3. Handle typing indicator ────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (!activeConvId || !currentUid) return;
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("typing", { conversationId: activeConvId, isTyping: true });

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("typing", { conversationId: activeConvId, isTyping: false });
    }, 2000);
  }, [activeConvId, currentUid]);

  // ── 4. Send message ───────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text, extra = {}) => {
    if (!text?.trim() || !activeConvId || !currentUid) return;
    const socket = socketRef.current;
    if (!socket) return;

    clearTimeout(typingTimerRef.current);
    socket.emit("typing", { conversationId: activeConvId, isTyping: false });

    socket.emit("send_message", {
      conversationId: activeConvId,
      text: text.trim(),
      extra,
    });
  }, [activeConvId, currentUid]);

  // ── 5. Create a conversation ──────────────────────────────────────────────
  const createConversation = useCallback(async (otherUid, type = "customer") => {
    if (!currentUid || !otherUid) return null;
    const socket = socketRef.current;
    if (!socket) return null;

    return new Promise((resolve) => {
      function onCreated(data) {
        if (data.otherUid === otherUid && data.type === type) {
          socket.off("conversation_created", onCreated);
          const convId = data.conversationId;
          setActiveConvId(convId);
          resolve(convId);
        }
      }
      socket.on("conversation_created", onCreated);
      socket.emit("create_conversation", { otherUid, type });

      // Timeout fallback
      setTimeout(() => {
        socket.off("conversation_created", onCreated);
        resolve(null);
      }, 5000);
    });
  }, [currentUid]);

  const activeConv     = conversations.find(c => c.id === activeConvId) ?? null;
  const otherUser      = activeConv?.otherUser ?? null;
  const unreadTotal    = conversations.reduce((sum, c) =>
    sum + (c.unreadCount?.[currentUid] ?? 0), 0);

  return {
    conversations, activeConvId, setActiveConvId,
    messages, otherTyping,
    loadingConvs, loadingMsgs,
    chatError,
    handleTyping, sendMessage, createConversation,
    activeConv, otherUser, unreadTotal,
    currentUid,
  };
}