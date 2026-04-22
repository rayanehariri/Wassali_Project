// DelivererSideBar.jsx
import { useNavigate, useLocation } from "react-router-dom";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  DollarSign,
  Clock,
  User,
  Settings,
  Headphones,
  LogOut,
  X,
} from "lucide-react";
import LogoIcon from "../auth/LogoIcon";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, id: "dashboard", path: "/deliverer-dashboard"          },
  { label: "Earnings",  icon: DollarSign,      id: "earnings",  path: "/deliverer-dashboard/earnings"  },
  { label: "Schedule",  icon: Clock,           id: "schedule",  path: "/deliverer-dashboard/schedule"  },
  { label: "Profile",   icon: User,            id: "profile",   path: "/deliverer-dashboard/profile"   },
  { label: "Settings",  icon: Settings,        id: "settings",  path: "/deliverer-dashboard/settings"  },
  { label: "Support",   icon: Headphones,      id: "support",   path: "/deliverer-dashboard/support"   },
];

export default function DelivererSideBar({ onLogout, onClose, isMobile }) {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const activeItem =
    navItems.find(item => pathname === item.path) ??
    navItems.find(item => item.path !== "/deliverer-dashboard" && pathname.startsWith(item.path)) ??
    (pathname === "/deliverer-dashboard" ? navItems[0] : null);

  function handleNav(path) {
    navigate(path);
    if (isMobile && onClose) onClose();
  }

  return (
    <div className="h-full w-full bg-[#0b1525] border-r border-[#1a2744]">

      {/* ── Logo + optional close button (mobile) ── */}
      <SidebarHeader className="!px-5 !pt-5 !pb-6">
        <div className="!flex !items-center !justify-between">
          <button
            type="button"
            onClick={() => {
              navigate("/");
              if (isMobile && onClose) onClose();
            }}
            className="!m-0 !flex !cursor-pointer !items-center !gap-2 !border-none !bg-transparent !p-0 text-left transition-opacity hover:opacity-90"
          >
            <LogoIcon size={26} color="#3b82f6" />
            <div className="!flex !items-end !gap-1 !leading-none">
              <span className="!text-[17px] !font-bold !text-white">Wassali</span>
              <span className="!mb-[2px] !text-[10px] !font-bold !tracking-wide !text-blue-400">
                Drive
              </span>
            </div>
          </button>

          {/* Close button — visible only on mobile */}
          {isMobile && (
            <button
              onClick={onClose}
              style={{
                width: "28px", height: "28px", borderRadius: "8px",
                background: "#111c2e", border: "1px solid #1e2d3d",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#64748b", flexShrink: 0,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </SidebarHeader>

      {/* ── Nav items ── */}
      <SidebarContent className="!px-3 !flex !flex-col !flex-1">
        <SidebarMenu className="!gap-0.5">
          {navItems.map(({ label, icon: Icon, id, path }) => {
            const isActive = activeItem?.id === id;
            return (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton
                  onClick={() => handleNav(path)}
                  className={cn(
                    "!group !flex !w-full !items-center !gap-2.5 !rounded-[10px] !px-3 !py-2.5 !text-[13.5px] !font-medium !transition-all !duration-150",
                    isActive
                      ? "!bg-[#2563eb] !text-white hover:!bg-blue-700 !shadow-[0_4px_6px_-4px_rgba(19,127,236,0.5),0_10px_15px_-3px_rgba(19,127,236,0.3)]"
                      : "!text-slate-400 hover:!bg-[#0D59F226] hover:!text-slate-100"
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      "!shrink-0 !transition-opacity",
                      isActive ? "!opacity-100" : "!opacity-70 group-hover:!opacity-90"
                    )}
                  />
                  {label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

      </SidebarContent>

      <div className="!px-3 !pb-4 !pt-2 !mt-auto">
        <SidebarSeparator className="!mb-2 !bg-[#1a2744]" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              className="!flex !w-full !items-center !gap-2.5 !rounded-[10px] !px-3 !py-2.5 !text-[13.5px] !font-medium !text-slate-400 !transition-all !duration-150 hover:!bg-red-500/[.08] hover:!text-red-400"
            >
              <LogOut size={16} className="!shrink-0 !opacity-70" />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>

    </div>
  );
}