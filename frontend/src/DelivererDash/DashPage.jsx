import { useState, useEffect } from "react";
 import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import DelivererSideBar from "./SideBar";
import DelivererTopBar from "./TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Menu, X } from "lucide-react";
 
export default function DelivererDashPage({ currentUser, onLogout, isOnline, setIsOnline }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
 
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
 
  // Close sidebar on route change (mobile)


const location = useLocation();

useEffect(() => {
  setSidebarOpen(false);
}, [location.pathname]);
 
  return (
    <SidebarProvider style={{ "--sidebar-width": "220px" }}>
      <div className="flex h-screen w-full bg-[#0a0d14] overflow-hidden">
 
        {/* ── Mobile overlay backdrop ── */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 40,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(2px)",
            }}
          />
        )}
 
        {/* ── Sidebar ── */}
        <div style={{
          // Desktop: static in flow
          // Mobile: fixed overlay sliding in from left
          ...(isMobile ? {
            position: "fixed",
            top: 0, left: 0, bottom: 0,
            zIndex: 1000, 
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
            width: "220px",
            background: "#0f172a", //
          } : {
            position: "relative",
            flexShrink: 0,
          }),
        }}>
          <DelivererSideBar
            currentUser={currentUser}
            onLogout={onLogout}
            onClose={() => setSidebarOpen(false)}
            isMobile={isMobile}
          />
        </div>
 
        {/* ── Main area ── */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}>
          <DelivererTopBar
            currentUser={currentUser}
            onLogout={onLogout}
            isMobile={isMobile}
            onMenuClick={() => setSidebarOpen(p => !p)}
            isOnline={isOnline}
            onToggleOnline={setIsOnline}
          />
          <main style={{ flex: 1, overflowY: "auto" }}>
            <Outlet />
          </main>
        </div>
 
      </div>
    </SidebarProvider>
  );
}