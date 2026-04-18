// firebase.config.js
// ─── STEP 1: Replace these values with YOUR Firebase project config ───────────
// Go to: https://console.firebase.google.com
// → Your Project → Project Settings → Your Apps → Web App → Config
 
import { initializeApp } from "firebase/app";
import { getFirestore }  from "firebase/firestore";
import { getAuth }       from "firebase/auth";
import { getStorage }    from "firebase/storage";
 
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
 
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