
import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import DashTop from "./DashTopBar";
import Cards from "./Cards";
import TChart from "./TrafficCharts";
import MChart from "./MoneyChart";
import IDVerification from "./IDVerification";
import RecentReports from "./RecentRepo";
 
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
 
export default function DoP() {
  const { currentUser, onLogout, addToast } = useOutletContext();
  const { isMobile, isTablet } = useBreakpoint();
  const isNarrow = isMobile || isTablet;
 
  return (
    <>
      <DashTop currentUser={currentUser} onLogout={onLogout} />
      <div className="flex flex-col">
        <Cards />
 
        {/* Charts — stacked on mobile/tablet, side-by-side on desktop */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr",
            gap: "16px",
            padding: isMobile ? "12px" : "16px 20px",
          }}
        >
          <TChart />
          <MChart />
        </div>
 
        {/* Bottom section — stacked on mobile/tablet */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isNarrow ? "1fr" : "2fr 1fr",
            gap: "16px",
            padding: isMobile ? "0 12px 12px" : "0 20px 16px",
          }}
        >
          <IDVerification />
          <RecentReports />
        </div>
      </div>
    </>
  );
}