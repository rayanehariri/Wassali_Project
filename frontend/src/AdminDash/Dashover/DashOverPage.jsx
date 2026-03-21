import DashTop from "./DashTopBar";
import Cards from "./Cards";
import TChart from "./TrafficCharts";
import MChart from "./MoneyChart";
import IDVerification from "./IDVerification";
import RecentReports from "./RecentRepo";

export default function DoP(){
    return(
        <>
        <DashTop/>
         <div className="flex flex-col">
        <Cards/>
         <div className="grid grid-cols-2 gap-4 !px-5 !py-4">
        <TChart/>
        <MChart/>
        </div>
       <div className="grid gap-4 !px-5 !pb-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <IDVerification/>
        <RecentReports/>
      </div>
      </div>
        </>
    )
}