import { initializeApp } from "firebase/app";
import { getFirestore }  from "firebase/firestore";
import { getAuth }       from "firebase/auth";
import { getStorage }    from "firebase/storage";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  // Fail fast so chat/auth issues are obvious during setup.
  throw new Error("Firebase is not configured. Add VITE_FIREBASE_* variables in frontend/.env");
}

const app       = initializeApp(firebaseConfig);

export const db      = getFirestore(app);   // Firestore database
export const auth    = getAuth(app);        // Authentication
export const storage = getStorage(app);     // File uploads

export default app;
 
// ─── Firestore Data Structure ─────────────────────────────────────────────────
//
// conversations/
//   {conversationId}/               ← auto-generated ID
//     participants: ["uid1","uid2"]  ← array of user UIDs
//     type: "support" | "customer"  ← who is chatting with whom
//     lastMessage: "..."
//     lastMessageAt: Timestamp
//     unreadCount: { uid1: 0, uid2: 2 }
//     status: "active" | "archived"
//
//     messages/                     ← sub-collection
//       {messageId}/
//         senderId: "uid1"
//         text: "..."
//         fileUrl: "..."            ← optional
//         fileName: "..."           ← optional
//         fileSize: 145000          ← optional
//         timestamp: Timestamp
//         read: false
//         typing: false             ← stored separately
//
// users/
//   {uid}/
//     name: "Alex Morgan"
//     role: "customer" | "deliverer" | "admin" | "support"
//     avatar: "AM"
//     avatarUrl: ""
//     status: "online" | "offline"
//     lastSeen: Timestamp