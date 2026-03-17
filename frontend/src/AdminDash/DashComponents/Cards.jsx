import { Users, Bike, DollarSign, Star, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    label: "Active Customers",
    value: "12,450",
    change: "+12%",
    positive: true,
    icon: Users,
    iconColor: "#3b82f6", 
  },
  {
    label: "Active Deliverers",
    value: "3,200",
    change: "+5%",
    positive: true,
    icon: Bike,
    iconColor: "#3b82f6",
  },
  {
    label: "Monthly Revenue",
    value: "$145.2k",
    change: "+8%",
    positive: true,
    icon: DollarSign,
    iconColor: "#3b82f6",  
  },
  {
    label: "Website Rating",
    value: "4.8",
    change: "+0.2%",
    positive: true,
    icon: Star,
    iconColor: "#eab308", 
    suffix: "/ 5.0",
  },
];

export default function Cards() {
  return (
    <div className="grid grid-cols-1 !py-7 !px-3 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-6">
      {stats.map(({ label, value, change, positive, icon: Icon, iconColor, suffix }) => (
        <Card
  key={label}
  style={{
    background: "#1E293B",
    border: "1px solid #33415580",
    backdropFilter: "blur(40px)",
    WebkitBackdropFilter: "blur(40px)",
    borderRadius: "12px",
    width:"300px"
  }}
>
  <CardContent  className="!py-4 !px-6 ">  {/* ← use style not className */}

    {/* Top row — label + icon */}
    <div className="flex items-center gap-2 mb-4 justify-between" >  {/* ← gap-2 not gap-8 */}
      <span className="text-[14px] font-medium !px-3 text-slate-400">
        {label}
      </span>
      <Icon size={18} style={{ color: iconColor }} />
    </div>

    {/* Value + change inline */}
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[28px] font-bold !px-3 text-white !py-4 leading-none">
        {value}
      </span>
      {suffix && (
        <span className="text-[13px] text-slate-400 leading-none">
          {suffix}
        </span>
      )}
      <div className="flex items-center gap-0.5 ml-1">
        {positive
          ? <TrendingUp size={14} style={{ color: "#10b981" }} />
          : <TrendingDown size={14} style={{ color: "#ef4444" }} />
        }
        <span
          className="text-[13px] font-semibold"
          style={{ color: positive ? "#10b981" : "#ef4444" }}
        >
          {change}
        </span>
      </div>
    </div>
  </CardContent>
</Card>
      ))}
    </div>
  );
}