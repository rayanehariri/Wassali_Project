import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import SideBar from "./common/SideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
 
export default function DashPage({ currentUser, onLogout, addToast }) {
  const [mobileOpen, setMobileOpen] = useState(false);
 
  // Close sidebar when screen grows past md
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setMobileOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
 
  // Prevent body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);
 
  return (
    <SidebarProvider style={{ "--sidebar-width": "220px" }}>
      <div className="!flex !h-screen !w-full" style={{ background: "#0a0d14" }}>
 
        {/* ── Desktop sidebar — always visible ── */}
        <div className="!hidden md:!block !h-full !shrink-0">
          <SideBar currentUser={currentUser} onLogout={onLogout} />
        </div>
 
        {/* ── Mobile overlay backdrop ── */}
        {mobileOpen && (
          <div
            className="!fixed !inset-0 !z-40 md:!hidden"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
            onClick={() => setMobileOpen(false)}
          />
        )}
 
        {/* ── Mobile sidebar — slides in from left ── */}
        <div
          className="!fixed !top-0 !left-0 !h-full !z-50 md:!hidden !transition-transform !duration-300"
          style={{
            transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
            width: "220px",
          }}
        >
          <SideBar currentUser={currentUser} onLogout={onLogout} />
        </div>
 
        {/* ── Main content ── */}
        <div className="!flex !flex-col !flex-1 !overflow-y-auto !min-w-0">
 
          {/* ── Mobile top bar with hamburger ── */}
          <div
            className="!flex !items-center !justify-between !px-4 !py-3 !sticky !top-0 !z-30 md:!hidden"
            style={{ background: "#0f1117", borderBottom: "1px solid #1e2d3d" }}
          >
            {/* Hamburger button */}
            <button
              onClick={() => setMobileOpen(p => !p)}
              className="!flex !items-center !justify-center !w-9 !h-9 !rounded-xl !cursor-pointer !border-none !transition-all"
              style={{ background: "#1e2536", border: "1px solid #334155" }}
              aria-label="Toggle sidebar"
            >
              {mobileOpen
                ? <X size={18} color="#94a3b8" />
                : <Menu size={18} color="#94a3b8" />
              }
            </button>
 
            {/* Logo / title in mobile bar */}
            <div className="!flex !items-center !gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              <span className="!text-[15px] !font-bold !text-white">Wassali</span>
              <span className="!text-[10px] !text-slate-400">Admin</span>
            </div>
 
            {/* User avatar */}
            <div
              className="!w-8 !h-8 !rounded-full !flex !items-center !justify-center !text-[12px] !font-bold !text-white !shrink-0"
              style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}
            >
              {(currentUser?.name ?? "A").charAt(0).toUpperCase()}
            </div>
          </div>
 
          {/* ── Page outlet ── */}
          <Outlet context={{ currentUser, onLogout, addToast }} />
        </div>
      </div>
    </SidebarProvider>
  );
}