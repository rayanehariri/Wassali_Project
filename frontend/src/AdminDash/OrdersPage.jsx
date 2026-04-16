import { useEffect, useState } from "react";
import OrdersStatsCards from "./Orders/Cards";
import OrdersTable from "./Orders/OrderTable";
import OrdersTopBar from "./Orders/TopBar";
 
function useBreakpoint() {
  const [bp, setBp] = useState({ isMobile: false, isTablet: false });
  useEffect(() => {
    const check = () =>
      setBp({
        isMobile: window.innerWidth < 640,
        isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
      });
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return bp;
}
 
export default function OrderPage() {
  const { isMobile } = useBreakpoint();
 
  return (
    <div
      className="!py-3"
      style={{
        background: "#0f1117",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: isMobile ? "0 16px" : "0 24px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 6px" }}>
            Dashboard{" "}
            <span style={{ color: "#334155" }}>/</span>{" "}
            <span style={{ color: "#3b82f6", fontWeight: 600 }}> Orders</span>
          </p>
          <h1
            style={{
              fontSize: isMobile ? "22px" : "28px",
              fontWeight: 900,
              color: "white",
              margin: "0 0 4px",
            }}
          >
            Order Management
          </h1>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>
            Manage and track customer orders, including status updates, processing, and fulfillment
          </p>
        </div>
      </div>
 
      <OrdersStatsCards />
      <OrdersTable />
    </div>
  );
}