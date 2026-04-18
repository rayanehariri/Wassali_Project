// DelivererTopBar.jsx
import { useState } from "react";
import { Bell, Settings, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
const notifications = [
  { id: 1, color: "#3b82f6", label: "New Order Available",   sub: "Mohammadia • 850 DZD",         time: "Just now"  },
  { id: 2, color: "#10b981", label: "Payout Processed",      sub: "Weekly earnings deposited.",    time: "2hrs ago"  },
  { id: 3, color: "#f59e0b", label: "New 5-Star Rating!",    sub: '"Great service, very fast!"',   time: "3hrs ago"  },
  { id: 4, color: "#a78bfa", label: "Surge Pricing Active",  sub: "2× multiplier in your zone.",   time: "5hrs ago"  },
];

export default function DelivererTopBar({ currentUser, onLogout, isMobile, onMenuClick }) {
 const [isOnline, setIsOnline] = useState(true);
 const navigate = useNavigate();

  return (
    <div style={{
      height: "60px",
      background: "#0d1827",
      borderBottom: "1px solid #1e2d3d",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 16px", flexShrink: 0,
    }}>

      {/* Left — hamburger (mobile) or online status (desktop) */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

        {/* Hamburger — mobile only */}
        {isMobile && (
          <button
            onClick={onMenuClick}
            style={{
              width: "36px", height: "36px",
              background: "transparent", border: "1px solid #1e2d3d",
              borderRadius: "10px", color: "#94a3b8",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            <Menu size={18} />
          </button>
        )}
      </div>

      {/* Right — actions + profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>

        {/* Online status pill */}
        <div style={{
          padding: "6px 10px", gap: "5px",
          background: "transparent", border: "1px solid #1e2d3d",
          borderRadius: "10px", color: "#64748b",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: isOnline ? "#10b981" : "#64748b",
            boxShadow: isOnline ? "0 0 0 3px rgba(16,185,129,0.2)" : "none",
            flexShrink: 0,
          }} />
          {/* Hide label on very small screens */}
          <span style={{
            fontSize: "13px", color: isOnline ? "#10b981" : "#64748b", fontWeight: 600,
            display: isMobile ? "none" : "inline",
          }}>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {/* Bell */}
        <Popover>
          <PopoverTrigger asChild>
            <button style={{
              width: "36px", height: "36px",
              background: "transparent", border: "1px solid #1e2d3d",
              borderRadius: "10px", color: "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative", flexShrink: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1e2d3d"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
            >
              <Bell size={16} />
              <span style={{
                position: "absolute", top: "8px", right: "8px",
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#3b82f6", border: "1.5px solid #0d1827",
              }} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" style={{
            background: "#161f2e", border: "1px solid #1e2d3d",
            borderRadius: "14px", padding: "12px",
            width: isMobile ? "calc(100vw - 32px)" : "300px",
            maxWidth: "300px",
          }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "white", margin: "0 0 10px" }}>
              Notifications
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  padding: "10px", borderRadius: "10px",
                  background: "#1e2d3d", cursor: "pointer",
                }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                    background: `${n.color}20`,
                    border: `1px solid ${n.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: n.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "white", margin: "0 0 2px" }}>{n.label}</p>
                    <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 2px" }}>{n.sub}</p>
                    <p style={{ fontSize: "10px", color: "#475569", margin: 0 }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Settings — hide on mobile to save space */}
        {!isMobile && (
          <button
            type="button"
            onClick={() => navigate("/deliverer-dashboard/settings")}
            style={{
              width: "36px", height: "36px",
              background: "transparent", border: "1px solid #1e2d3d",
              borderRadius: "10px", color: "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1e2d3d"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
          >
            <Settings size={16} />
          </button>
        )}

        {/* Divider */}
        {!isMobile && (
          <div style={{ width: "1px", height: "28px", background: "#1e2d3d", margin: "0 2px" }} />
        )}

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "4px 6px", borderRadius: "10px", cursor: "pointer",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#1e2d3d"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Avatar className="h-8 w-8" style={{ flexShrink: 0 }}>
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback style={{
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  fontSize: "11px", fontWeight: 700, color: "white",
                }}>
                  {(currentUser?.name ?? "D").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Hide name/ID on mobile */}
              {!isMobile && (
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "white", margin: 0, lineHeight: 1.3 }}>
                    {currentUser?.name ?? "Deliverer"}
                  </p>
                  <p style={{ fontSize: "10px", color: "#64748b", margin: 0, lineHeight: 1.3 }}>
                    ID: {currentUser?.id?.slice(-6) ?? "000000"}
                  </p>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" style={{
            background: "#161f2e", border: "1px solid #1e2d3d",
            borderRadius: "12px", padding: "8px", minWidth: "180px",
          }}>
            <DropdownMenuItem style={{ color: "#94a3b8", fontSize: "13px", borderRadius: "8px", padding: "8px", cursor: "pointer" }}
              onClick={() => navigate("/deliverer-dashboard/profile")}
              onMouseEnter={e => e.currentTarget.style.background = "#1e2d3d"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem style={{ color: "#94a3b8", fontSize: "13px", borderRadius: "8px", padding: "8px", cursor: "pointer" }}
              onClick={() => navigate("/deliverer-dashboard/settings")}
              onMouseEnter={e => e.currentTarget.style.background = "#1e2d3d"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: "#1e2d3d" }} />
            <DropdownMenuItem onClick={onLogout} style={{ color: "#ef4444", fontSize: "13px", borderRadius: "8px", padding: "8px", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
}