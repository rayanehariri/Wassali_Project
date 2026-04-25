import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp,
  where, getDocs, setDoc, getDoc, limit,
} from "firebase/firestore";
import { auth, db } from "../Firebase.config"; // ← adjust path
import { http } from "../api/http";
 
// ── helpers ───────────────────────────────────────────────────────────────────
export function timeAgo(ts) {
  if (!ts) return "";
  const d    = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 5)    return "NOW";
  if (diff < 60)   return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}M`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}H`;
  return "YESTERDAY";
}
 
export function formatTime(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
  let resolvedUid = currentUidProp ?? auth.currentUser?.uid ?? null;
  if (!resolvedUid) {
    try {
      const raw = localStorage.getItem("currentUser");
      const parsed = raw ? JSON.parse(raw) : null;
      resolvedUid = parsed?.uid || parsed?.id || null;
    } catch {}
  }
  // Prefer backend user id for deterministic client<->deliverer chats.
  try {
    const raw = localStorage.getItem("currentUser");
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed?.id) resolvedUid = parsed.id;
  } catch {}
  const currentUid = resolvedUid;
 
  const typingTimerRef = useRef(null);

  const buildInitials = useCallback((name, fallback = "U") => {
    const words = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return String(fallback || "U").slice(0, 2).toUpperCase();
  }, []);

  const resolveUserProfile = useCallback(async (uidLike) => {
    const fallbackName = `User ${String(uidLike || "").slice(0, 6)}`;
    try {
      const direct = await getDoc(doc(db, "users", uidLike));
      if (direct.exists()) {
        const data = direct.data() || {};
        const name = data.name || data.username || fallbackName;
        return {
          uid: uidLike,
          ...data,
          name,
          avatar: data.avatar || buildInitials(name, uidLike),
        };
      }
    } catch {}

    // Conversations currently use Mongo ids; users docs are keyed by Firebase uid.
    try {
      const q = query(collection(db, "users"), where("mongoId", "==", uidLike), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const match = snap.docs[0];
        const data = match.data() || {};
        const name = data.name || data.username || fallbackName;
        return {
          uid: uidLike,
          ...data,
          firebaseUid: match.id,
          name,
          avatar: data.avatar || buildInitials(name, uidLike),
        };
      }
    } catch {}

    try {
      const res = await http.get(`/auth/peer/${encodeURIComponent(uidLike)}/`);
      const u = res?.data?.user ?? res?.data?.data?.user;
      if (u) {
        const name = u.name || u.username || fallbackName;
        return {
          uid: uidLike,
          mongoId: u._id,
          name,
          avatar: buildInitials(name, uidLike),
          role: u.role,
        };
      }
    } catch {}

    return { uid: uidLike, name: fallbackName, avatar: buildInitials(fallbackName, uidLike) };
  }, [buildInitials]);
 
  // ── 1. Listen to conversations ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentUid) {
      setLoadingConvs(false);
      setConversations([]);
      setChatError("Missing user uid for chat session.");
      return;
    }
    setLoadingConvs(true);
    setChatError("");
 
    const orderedQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUid),
      orderBy("lastMessageAt", "desc")
    );
    const fallbackQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUid)
    );
 
    async function mapConvs(docs) {
      const convs = await Promise.all(docs.map(async (d) => {
        const data = d.data ? d.data() : d;
 
        // fetch participant profiles
        const profiles = await Promise.all((data.participants ?? []).map(resolveUserProfile));
 
        const otherId = data.participants?.find(p => p !== currentUid);
        return {
          id:              d.id,
          ...data,
          participantData: profiles,
          otherUser:       profiles.find(p => p.uid !== currentUid) ?? null,
          isTyping:        data.typing?.[otherId] ?? false,
        };
      }));
      convs.sort((a, b) => {
        const aTs = a?.lastMessageAt?.toMillis?.() ?? 0;
        const bTs = b?.lastMessageAt?.toMillis?.() ?? 0;
        return bTs - aTs;
      });
      // One thread per counterparty (avoids duplicate rows for the same deliverer/client).
      const byOther = new Map();
      for (const c of convs) {
        const oid = c.otherUser?.uid ?? c.participants?.find((p) => p !== currentUid);
        if (!oid) continue;
        const prev = byOther.get(oid);
        if (!prev) {
          byOther.set(oid, c);
          continue;
        }
        const pTs = prev?.lastMessageAt?.toMillis?.() ?? 0;
        const nTs = c?.lastMessageAt?.toMillis?.() ?? 0;
        if (nTs >= pTs) byOther.set(oid, c);
      }
      const deduped = [...byOther.values()].sort((a, b) => {
        const aTs = a?.lastMessageAt?.toMillis?.() ?? 0;
        const bTs = b?.lastMessageAt?.toMillis?.() ?? 0;
        return bTs - aTs;
      });
      setConversations(deduped);
      setLoadingConvs(false);
    }

    let unsub = () => {};
    unsub = onSnapshot(
      orderedQuery,
      async (snap) => {
        setChatError("");
        await mapConvs(snap.docs);
      },
      (err) => {
        const msg = String(err?.message || "");
        // Missing index is common on first setup: retry with simpler query.
        if (msg.includes("index") || msg.includes("failed-precondition")) {
          unsub = onSnapshot(
            fallbackQuery,
            async (snap) => {
              setChatError("");
              await mapConvs(snap.docs);
            },
            () => {
              setChatError("Chat conversations failed to load.");
              setLoadingConvs(false);
            }
          );
          return;
        }
        setChatError("Chat conversations failed to load.");
        setLoadingConvs(false);
      }
    );

    return () => { try { unsub(); } catch {} };
  }, [currentUid]);
 
  // ── 2. Listen to messages ──────────────────────────────────────────────────
  useEffect(() => {
    if (!activeConvId || !currentUid) return;
    setLoadingMsgs(true);
 
    const q = query(
      collection(db, "conversations", activeConvId, "messages"),
      orderBy("timestamp", "asc")
    );
 
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingMsgs(false);
 
      // mark incoming as read
      snap.docs.forEach(d => {
        if (d.data().senderId !== currentUid && !d.data().read) {
          updateDoc(
            doc(db, "conversations", activeConvId, "messages", d.id),
            { read: true }
          ).catch(() => {});
        }
      });
 
      // reset unread count for current user
      updateDoc(doc(db, "conversations", activeConvId), {
        [`unreadCount.${currentUid}`]: 0,
      }).catch(() => {});
    });
 
    return () => unsub();
  }, [activeConvId, currentUid]);
 
  // ── 3. Listen to typing ────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeConvId || !currentUid) return;
 
    const unsub = onSnapshot(doc(db, "conversations", activeConvId), (snap) => {
      const typing = snap.data()?.typing ?? {};
      const othersTyping = Object.entries(typing)
        .filter(([uid]) => uid !== currentUid)
        .some(([, val]) => val);
      setOtherTyping(othersTyping);
    });
 
    return () => unsub();
  }, [activeConvId, currentUid]);
 
  // ── 4. Handle typing indicator ─────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (!activeConvId || !currentUid) return;
 
    updateDoc(doc(db, "conversations", activeConvId), {
      [`typing.${currentUid}`]: true,
    }).catch(() => {});
 
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      updateDoc(doc(db, "conversations", activeConvId), {
        [`typing.${currentUid}`]: false,
      }).catch(() => {});
    }, 2000);
  }, [activeConvId, currentUid]);
 
  // ── 5. Send message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text, extra = {}) => {
    if (!text?.trim() || !activeConvId || !currentUid) return;
 
    clearTimeout(typingTimerRef.current);
    updateDoc(doc(db, "conversations", activeConvId), {
      [`typing.${currentUid}`]: false,
    }).catch(() => {});
 
    await addDoc(collection(db, "conversations", activeConvId, "messages"), {
      senderId:  currentUid,
      text:      text.trim(),
      timestamp: serverTimestamp(),
      read:      false,
      ...extra,
    });
 
    // update conversation preview + increment other user's unread
    const conv = (await getDoc(doc(db, "conversations", activeConvId))).data();
    const otherId = conv?.participants?.find(p => p !== currentUid);
 
    await updateDoc(doc(db, "conversations", activeConvId), {
      lastMessage:                        text.trim(),
      lastMessageAt:                      serverTimestamp(),
      [`unreadCount.${otherId}`]:         (conv?.unreadCount?.[otherId] ?? 0) + 1,
    });
  }, [activeConvId, currentUid]);
 
  // ── 6. Create a conversation ───────────────────────────────────────────────
  const createConversation = useCallback(async (otherUid, type = "customer") => {
    if (!currentUid || !otherUid) return null;
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUid),
    );
    const snap = await getDocs(q);
    const matches = snap.docs.filter((d) => {
      const data = d.data() || {};
      const p = data.participants || [];
      const typeOk = !data.type || data.type === type;
      return p.includes(otherUid) && typeOk;
    });
    let existing = null;
    let bestTs = -1;
    for (const d of matches) {
      const lm = d.data()?.lastMessageAt;
      const ts = lm?.toMillis?.() ?? 0;
      if (ts >= bestTs) {
        bestTs = ts;
        existing = d;
      }
    }
    if (existing) {
      setActiveConvId(existing.id);
      return existing.id;
    }
 
    // create new
    const ref = doc(collection(db, "conversations"));
    await setDoc(ref, {
      participants:  [currentUid, otherUid],
      type,
      status:        "active",
      lastMessage:   "",
      lastMessageAt: serverTimestamp(),
      typing:        {},
      unreadCount:   { [currentUid]: 0, [otherUid]: 0 },
    });
    setActiveConvId(ref.id);
    return ref.id;
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
  };
}