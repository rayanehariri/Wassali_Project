
import SideBar from "./common/SideBar"
import DoP from "./DashComponents/DashOverPage"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashPage(){
    return(
   <SidebarProvider style={{ "--sidebar-width": "220px" }}>
      <div className="flex h-screen w-full bg-[#0a0d14]">
        
        {/* Sidebar — left */}
        <SideBar />

        {/* Main content — right */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <DoP />
          <main className="flex-1 overflow-y-auto p-6">
          </main>
        </div>

      </div>
    </SidebarProvider>
    )
}