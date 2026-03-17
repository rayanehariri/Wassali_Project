
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


export default function DashTop(){
    return(
         <header className="flex items-center justify-between !px-7 !py-5 bg-[#0f1117] border-b border-[#1e2d3d]">

      <h1 className="text-[18px] font-semibold text-slate-100">Dashboard Overview</h1>

      <div className="flex items-center gap-3">

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full !bg-[#1e2536] !border !border-[#2a3550] hover:!bg-[#263045]"
            >
              <Bell size={18} className="text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#161b27]" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 !bg-[#1e2536] !border-[#2a3550] !text-slate-100 !px-3 !py-2.5">
            <p className="text-sm font-semibold mb-2">Notifications</p>
            <div className="text-xs text-slate-400">No new notifications</div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-[#1e2d3d]" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer border-2 border-[#2a3550] hover:border-blue-500 transition-colors">
              <AvatarImage src="/avatars/admin.png" alt="Admin User" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white">
                AU
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="!bg-[#1e2536] !px-3 !py-3 !border-[#2a3550] !text-slate-100" align="end">
            <DropdownMenuLabel className="!text-slate-100">
              <p className="text-sm font-semibold">Admin User</p>
              <p className="text-xs text-slate-400 font-normal">admin@wassali.com</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="!bg-[#2a3550]" />
            <DropdownMenuItem className="hover:!bg-[#263045] !text-slate-300 cursor-pointer">Profile</DropdownMenuItem>
            <DropdownMenuItem className="hover:!bg-[#263045] !text-slate-300 cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="!bg-[#2a3550]" />
            <DropdownMenuItem className="hover:!bg-[#263045] !text-red-400 cursor-pointer">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
    )
}