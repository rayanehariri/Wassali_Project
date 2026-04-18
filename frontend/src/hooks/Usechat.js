import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp,
  where, getDocs, setDoc, getDoc,
} from "firebase/firestore";
import { db } from "../Firebase.config"; // ← adjust path
 
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
   const currentUid = currentUidProp ?? null;
 
  const typingTimerRef = useRef(null);
 
  // ── 1. Listen to conversations ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentUid) return;
    setLoadingConvs(true);
 
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUid),
      orderBy("lastMessageAt", "desc")
    );
 
    const unsub = onSnapshot(q, async (snap) => {
      const convs = await Promise.all(snap.docs.map(async (d) => {
        const data = d.data();
 
        // fetch participant profiles
        const profiles = await Promise.all(
          (data.participants ?? []).map(async (uid) => {
            try {
              const userDoc = await getDoc(doc(db, "users", uid));
              return userDoc.exists()
                ? { uid, ...userDoc.data() }
                : { uid, name: uid.slice(0, 8), avatar: "??" };
            } catch { return { uid, name: "User", avatar: "??" }; }
          })
        );
 
        const otherId = data.participants?.find(p => p !== currentUid);
        return {
          id:              d.id,
          ...data,
          participantData: profiles,
          otherUser:       profiles.find(p => p.uid !== currentUid) ?? null,
          isTyping:        data.typing?.[otherId] ?? false,
        };
      }));
 
      setConversations(convs);
      setLoadingConvs(false);
    });
 
    return () => unsub();
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
    // check if conversation already exists
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUid),
      where("type", "==", type)
    );
    const snap = await getDocs(q);
    const existing = snap.docs.find(d =>
      d.data().participants?.includes(otherUid)
    );
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
    handleTyping, sendMessage, createConversation,
    activeConv, otherUser, unreadTotal,
  };
}