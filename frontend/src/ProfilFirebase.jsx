import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "./Firebase.config";

async function createUserProfile(userData) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  await setDoc(doc(db, "users", uid), {
    uid,
    name:      userData.name,
    role:      userData.role,        // "deliverer" | "customer" | "admin" | "support"
    avatar:    userData.name.slice(0, 2).toUpperCase(),
    avatarUrl: userData.avatarUrl ?? "",
    status:    "online",
    lastSeen:  serverTimestamp(),
  }, { merge: true });
}