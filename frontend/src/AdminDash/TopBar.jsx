// TopBar.jsx
import { ArrowLeft, Bell, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import LogoIcon from "@/auth/LogoIcon";

export default function TopBar({ currentUser }) {
  const navigate = useNavigate();

  return (

    <div 
     className="!py-4 !px-3"
    style={{
      
      background: "#0f1117",
      borderBottom: "1px solid #1e2d3d",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
     
      flexShrink: 0,
    }}>

      {/* ── LEFT: Logo space ──────────────────────────────── */}
      <div className=" logo flex items-center gap-1.5 !text-3xl">
          <LogoIcon size={30}/>
          <div className="flex flex-row items-end leading-tight">
            <span>Wassali</span>
            <span className="text-xl text-slate-400 tracking-widest !mb-0.5">Admin</span>
          </div>
        </div>

      {/* ── RIGHT: Icons + Profile ────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

        {/* Back arrow */}
        <button
          onClick={() => navigate(-1)}
          style={{
            width: "36px", height: "36px",
            background: "transparent",
            border: "1px solid #1e2d3d",
            borderRadius: "10px",
            color: "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1e2d3d";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          <ArrowLeft size={16} />
        </button>

        {/* Bell */}
        <button
          style={{
            width: "36px", height: "36px",
            background: "transparent",
            border: "1px solid #1e2d3d",
            borderRadius: "10px",
            color: "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1e2d3d";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          <Bell size={16} />
          {/* Notification dot */}
          <span style={{
            position: "absolute", top: "8px", right: "8px",
            width: "6px", height: "6px",
            background: "#3b82f6", borderRadius: "50%",
            border: "1.5px solid #0f1117",
          }} />
        </button>

        {/* Settings */}
        <button
          style={{
            width: "36px", height: "36px",
            background: "transparent",
            border: "1px solid #1e2d3d",
            borderRadius: "10px",
            color: "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1e2d3d";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          <Settings size={16} />
        </button>

        {/* Divider */}
        <div style={{
          width: "1px", height: "28px",
          background: "#1e2d3d", margin: "0 6px",
        }} />

        {/* Profile */}
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          cursor: "pointer", padding: "4px 8px",
          borderRadius: "10px", transition: "background 0.15s",
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#1e2d3d"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "white", margin: 0, lineHeight: 1.3 }}>
              {currentUser?.name ?? "Admin User"}
            </p>
            <p style={{ fontSize: "11px", color: "#64748b", margin: 0, lineHeight: 1.3 }}>
              {currentUser?.role ?? "Super Admin"}
            </p>
          </div>

          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser?.avatar} />
            <AvatarFallback style={{
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              fontSize: "12px", fontWeight: 700, color: "white",
            }}>
              {(currentUser?.name ?? "AU").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

      </div>
    </div>
  );
}