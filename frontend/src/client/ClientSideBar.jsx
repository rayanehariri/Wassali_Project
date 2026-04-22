// Client sidebar — same shell / menu pattern as admin & deliverer dashboards
import { useNavigate } from "react-router-dom";
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
  Package,
  MapPin,
  Wallet,
  User,
  Settings,
  Headphones,
  LogOut,
  X,
  Plus,
} from "lucide-react";
import LogoIcon from "@/auth/LogoIcon";

const navItems = [
  { key: "home", label: "My Orders", icon: Package },
  { key: "track", label: "Track Delivery", icon: MapPin },
  { key: "wallet", label: "Wallet", icon: Wallet },
  { key: "profile", label: "Profile", icon: User },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function ClientSideBar({
  onLogout,
  active,
  inDeliveryFlow,
  onNavigate,
  onNewDelivery,
  isMobile,
  onClose,
}) {
  const navigate = useNavigate();

  function handleNav(key) {
    onNavigate(key);
    if (isMobile && onClose) onClose();
  }

  return (
    <div className="h-full w-[210px] min-w-[210px] max-w-[210px] bg-[#0f1117] border-r border-[#1e2d3d] flex flex-col">

      <SidebarHeader className="!px-5 !pt-5 !pb-6">
        <div className="!flex !items-center !justify-between !gap-2">
          <button
            type="button"
            onClick={() => {
              navigate("/");
              if (isMobile && onClose) onClose();
            }}
            className="!m-0 !flex !min-w-0 !cursor-pointer !items-center !gap-2 !border-none !bg-transparent !p-0 text-left transition-opacity hover:!opacity-90"
            title="Back to home"
          >
            <LogoIcon size={26} color="#3b82f6" />
            <div className="!flex !items-end !gap-1 !leading-none">
              <span className="!text-[17px] !font-bold !text-white">Wassali</span>
              <span className="!mb-[2px] !text-[10px] !font-bold !tracking-wide !text-blue-400">
                Client
              </span>
            </div>
          </button>

          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="!shrink-0"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "#111c2e",
                border: "1px solid #1e2d3d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
              }}
              aria-label="Close menu"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="!px-4 !flex !flex-1 !flex-col !overflow-y-auto">
        <SidebarMenu className="!gap-0.5">
          {navItems.map(({ key, label, icon: Icon }) => {
            const isOn = !inDeliveryFlow && active === key;
            return (
              <SidebarMenuItem key={key}>
                <SidebarMenuButton
                  onClick={() => handleNav(key)}
                  className={cn(
                    "!group !flex !w-full !items-center !gap-2.5 !rounded-[10px] !px-3 !py-2.5 !text-[13.5px] !font-medium !transition-all !duration-150",
                    isOn
                      ? "!bg-[#2563eb] !text-white hover:!bg-blue-700 !shadow-[0_4px_6px_-4px_rgba(19,127,236,0.5),0_10px_15px_-3px_rgba(19,127,236,0.3)]"
                      : "!text-slate-400 hover:!bg-[#1e2536] hover:!text-slate-100"
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      "!shrink-0 !transition-opacity",
                      isOn ? "!opacity-100" : "!opacity-70 group-hover:!opacity-90"
                    )}
                  />
                  {label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <div className="!px-0 !pt-3 !pb-1">
          <SidebarMenu className="!gap-0.5">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleNav("support")}
                className={cn(
                  "!group !flex !w-full !items-center !gap-2.5 !rounded-[10px] !px-3 !py-2.5 !text-[13.5px] !font-medium !transition-all !duration-150",
                  !inDeliveryFlow && active === "support"
                    ? "!bg-[#2563eb] !text-white hover:!bg-blue-700 !shadow-[0_4px_6px_-4px_rgba(19,127,236,0.5),0_10px_15px_-3px_rgba(19,127,236,0.3)]"
                    : "!text-slate-400 hover:!bg-[#1e2536] hover:!text-slate-100"
                )}
              >
                <Headphones
                  size={16}
                  className={cn(
                    "!shrink-0 !transition-opacity",
                    !inDeliveryFlow && active === "support" ? "!opacity-100" : "!opacity-70 group-hover:!opacity-90"
                  )}
                />
                Support
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        <div className="!px-0 !pt-1 !pb-1">
          <button
            type="button"
            onClick={() => {
              onNewDelivery();
              if (isMobile && onClose) onClose();
            }}
            className={cn(
              "!flex !w-full !items-center !justify-center !gap-2 !rounded-[10px] !px-3 !py-2.5 !text-[13px] !font-semibold !transition-all !duration-150",
              inDeliveryFlow
                ? "!bg-blue-500/25 !text-blue-100"
                : "!bg-gradient-to-r !from-[#ADC6FF] !to-[#7aa8f5] !text-[#0a1628] hover:!opacity-90"
            )}
          >
            <Plus size={16} strokeWidth={2.5} />
            New Delivery
          </button>
        </div>
      </SidebarContent>
      <div className="!px-4 !pb-4 !pt-2 !mt-auto">
        <SidebarSeparator className="!mb-2 !bg-[#1e2d3d]" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                onLogout?.();
                navigate("/");
                if (isMobile && onClose) onClose();
              }}
              className="!flex !w-full !items-center !gap-2.5 !rounded-[10px] !px-3 !py-2.5 !text-[13.5px] !font-medium !text-slate-400 !transition-all !duration-150 hover:!bg-[#1e2536] hover:!text-slate-100"
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
