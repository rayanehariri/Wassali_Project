
import { Outlet } from "react-router-dom"
import SideBar from "./common/SideBar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashPage({ currentUser, onLogout, addToast }){
    return(
   <SidebarProvider style={{ "--sidebar-width": "220px" }}>
      <div className="flex h-screen w-full bg-[#0a0d14]">
        
        <SideBar currentUser={currentUser} onLogout={onLogout} /> 
        <div className="flex flex-col flex-1 overflow-y-auto">
        <Outlet  context={{ currentUser,onLogout,addToast }} />
          <main className="flex-1 overflow-y-auto p-6">
          </main>
        </div>

      </div>
    </SidebarProvider>
    )
}