import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function OrdersTopBar() {
  return (
    <header
      className="flex items-center justify-between !px-7 !py-5"
      style={{
        background: "#0f1117",
        borderBottom: "1px solid #1e2d3d",
      }}
    >
      {/* Title */}
      <h1 className="text-white font-bold text-[18px]">Order Management</h1>

      {/* Right side — search + bell */}
      <div className="flex items-center gap-3">

        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Search orders..."
            style={{
              background: "#1e2536",
              border: "1px solid #33415580",
              borderRadius: "8px",
              color: "#f1f5f9",
              fontSize: "13px",
              width: "220px",
              paddingLeft: "32px",
              height: "36px",
            }}
            className="!placeholder-slate-500 focus:!border-blue-500"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[#1e2d3d]" />

        {/* Notification bell */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full !bg-[#1e2536] !border !border-[#2a3550] hover:!bg-[#263045]"
            >
              <Bell size={18} className="text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f1117]" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 !bg-[#1e2536] !border-[#2a3550] !text-slate-100"
            align="end"
          >
            <p className="text-sm font-semibold mb-2">Notifications</p>
            <div className="text-xs text-slate-400">No new notifications</div>
          </PopoverContent>
        </Popover>

      </div>
    </header>
  );
}