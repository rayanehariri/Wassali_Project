
import OrdersStatsCards from "./Orders/Cards";
import OrdersTable from "./Orders/OrderTable";
import OrdersTopBar from "./Orders/TopBar";


export default function OrderPage(){
    return(
       <div  className="!py-3" style={{ background: "#0f1117", minHeight: "100vh", display: "flex", flexDirection: "column", gap:"15px" }}>
 
     <div style={{ padding: "0 24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            {/* Breadcrumb */}
            <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 6px" }}>
              Dashboard{" "}
              <span style={{ color: "#334155" }}>/</span>{" "}
              <span style={{ color: "#3b82f6", fontWeight: 600 }}> Orders</span>
            </p>
            <h1 style={{ fontSize: "28px", fontWeight: 900, color: "white", margin: "0 0 4px" }}>
              Order Management
            </h1>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>
                 Manage access, roles, and statuses for all platform users.
            </p>
          </div>

          
        </div>
        <OrdersStatsCards />
        
       <OrdersTable />
    </div>
    )
}