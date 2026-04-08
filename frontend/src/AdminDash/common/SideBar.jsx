
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "../../lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BadgeCheck,
  CreditCard,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import LogoIcon from "@/auth/LogoIcon";
 
const navItems = [
  { label: "Dashboard",     icon: LayoutDashboard, id: "dashboard",     path: "/dashboard"               },
  { label: "Orders",        icon: ShoppingCart,    id: "orders",        path: "/dashboard/order"         },
  { label: "Users",         icon: Users,           id: "users",         path: "/dashboard/users"         },
  { label: "Verifications", icon: BadgeCheck,      id: "verifications", path: "/dashboard/verification"  },
  { label: "Finances",      icon: CreditCard,      id: "finances",      path: "/dashboard/finances"      },
  { label: "Messages",      icon: MessageSquare,   id: "messages",      path: "/dashboard/messages"      },
  { label: "Settings",      icon: Settings,        id: "settings",      path: "/dashboard/settings"      },
];
 
export default function SideBar({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
 
  // Match active item: exact match first, then startsWith (for nested routes)
  const activeItem = navItems.find((item) => pathname === item.path)
    ?? navItems.find((item) => item.path !== "/dashboard" && pathname.startsWith(item.path))
    ?? (pathname === "/dashboard" ? navItems[0] : null);
 
  return (
    <Sidebar className="!bg-[#0f1117] border-r border-[#1e2d3d]">
 
      <SidebarHeader className="!px-5 !py-8 !pt-5 !pb-6.5">
        <div className=" logo flex items-center gap-1.5 !text-3xl">
          <LogoIcon size={30} />
          <div className="flex flex-col leading-tight">
            <span>Wassali</span>
            <span className="text-[10px] text-slate-400 tracking-widest">Admin</span>
          </div>
        </div>
      </SidebarHeader>
 
      {/* ── Nav items ── */}
      <SidebarContent className="!px-5">
        <SidebarMenu className="!gap-0.5">
          {navItems.map(({ label, icon: Icon, id, path }) => {
            const isActive = activeItem?.id === id;
            return (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton
                  onClick={() => navigate(path)}
                  className={cn(
                    "!group !flex !w-full !items-center !gap-2.5 !rounded-[10px] !px-3 !py-2.5 !text-[13.5px] !font-medium !transition-all !duration-150",
                    isActive
                      ? "!bg-[#2563eb] !text-white hover:bg-blue-700 !shadow-[0_4px_6px_-4px_rgba(19,127,236,0.5),0_10px_15px_-3px_rgba(19,127,236,0.3)]"
                      : "!text-slate-400 hover:bg-[#1e2536] hover:text-slate-100"
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
 
        {/* ── Divider + Logout ── */}
        <SidebarSeparator className="!my-2 !bg-[#1e2d3d]" />
 
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              className="!flex !w-full !items-center !gap-2.5 rounded-[10px] !px-3 !py-2.5 !text-[13.5px] !font-medium !text-slate-400 !transition-all !duration-150 hover:bg-[#1e2536] hover:text-slate-100"
            >
              <LogOut size={16} className="shrink-0 opacity-70" />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
 
      {/* ── User footer ── */}
      <SidebarFooter className="!px-3 !pb-4 !pt-2">
        <div className="!flex !cursor-pointer !items-center !gap-2.5 !rounded-[10px] !px-3 !py-2.5 transition-colors hover:bg-[#1e2536]">
          <Avatar className="!h-8 w-8 !shrink-0">
            <AvatarImage src={currentUser?.avatar || "/avatars/admin.png"} alt={currentUser?.name} />
            <AvatarFallback className="!bg-gradient-to-br !from-blue-500 !to-violet-600 !text-xs !font-bold !text-white">
              {currentUser?.name?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="!flex !flex-col !overflow-hidden !leading-tight">
            <span className="!truncate !text-[13px] !font-semibold !text-slate-100">
              {currentUser?.name || "Admin User"}
            </span>
            <span className="!truncate !text-[11px] !text-slate-500">
              {currentUser?.email || "admin@wassali.com"}
            </span>
          </div>
        </div>
      </SidebarFooter>
 
    </Sidebar>
  );
}