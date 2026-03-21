import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarProvider,
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
 
const navItems = [
  { label: "Dashboard",     icon: LayoutDashboard, id: "dashboard"     },
  { label: "Orders",        icon: ShoppingCart,    id: "orders"        },
  { label: "Users",         icon: Users,           id: "users"         },
  { label: "Verifications", icon: BadgeCheck,      id: "verifications" },
  { label: "Finances",      icon: CreditCard,      id: "finances"      },
  { label: "Messages",      icon: MessageSquare,   id: "messages"      },
  { label: "Settings",      icon: Settings,        id: "settings"      },
];
 
export default function SideBar() {
  const [active, setActive] = useState("dashboard");
 
  return (
    // --sidebar-width must live on SidebarProvider, not on Sidebar
   
      <Sidebar className="!bg-[#0f1117] border-r border-[#1e2d3d]">
 
        
        <SidebarHeader className="!px-5 !py-8 !pt-6 !pb-6.5">
         <div className="site-logo flex items-center gap-1.5 !text-3xl " >  {/* renamed from .logo */}
          <svg
            style={{
              display: "inline-block",
              verticalAlign: "middle",
              marginRight: "6px",
              width: "24px",
              height: "24px",
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
         <div className="flex flex-col leading-tight">
    <span >Wassali</span>
    <span className="text-[10px] text-slate-400  tracking-widest">
      Admin
    </span>
  </div>
        </div>
        
        </SidebarHeader>
 
        {/* ── Nav items ── */}
        <SidebarContent className="!px-5">
          <SidebarMenu className="!gap-0.5">
            {navItems.map(({ label, icon: Icon, id }) => (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton
                  onClick={() => setActive(id)}
                  className={cn(
                    // !important overrides shadcn's own bg/text defaults
                    "!group !flex !w-full !items-center !gap-2.5 !rounded-[10px] !px-3 !py-2.5 !text-[13.5px] !font-medium !transition-all !duration-150",
                    active === id
                      ? "!bg-[#2563eb] !text-white hover:bg-blue-700 !shadow-[0_4px_6px_-4px_rgba(19,127,236,0.5),0_10px_15px_-3px_rgba(19,127,236,0.3)]"
                      : "!text-slate-400 hover:bg-[#1e2536] hover:text-slate-100"
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      "!shrink-0 !transition-opacity",
                      active === id
                        ? "!opacity-100"
                        : "!opacity-70 group-hover:!opacity-90"
                    )}
                  />
                  {label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
 
          {/* ── Divider + Logout ── */}
          <SidebarSeparator className="!my-2 !bg-[#1e2d3d]" />
 
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => console.log("logout")}
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
              <AvatarImage src="/avatars/admin.png" alt="Admin User" />
              <AvatarFallback className="!bg-gradient-to-br !from-blue-500 !to-violet-600 !text-xs !font-bold !text-white">
                AU
              </AvatarFallback>
            </Avatar>
            <div className="!flex !flex-col !overflow-hidden l!eading-tight">
              <span className="!truncate !text-[13px] !font-semibold !text-slate-100">
                Admin User
              </span>
              <span className="!truncate !text-[11px] !text-slate-500">
                admin@wassali.com
              </span>
            </div>
          </div>
        </SidebarFooter>
 
      </Sidebar>
   
  );
}