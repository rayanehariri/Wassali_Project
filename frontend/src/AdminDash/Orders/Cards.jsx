import { ShoppingCart, Clock, Truck, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    label: "Total Orders",
    value: "1,248",
    change: "+12%",
    positive: true,
    icon: ShoppingCart,
    iconColor: "#3b82f6",
    glowColor: "rgba(59, 130, 246, 0.15)",
  },
  {
    label: "Pending Pickups",
    value: "42",
    change: "+5%",
    positive: true,
    icon: Clock,
    iconColor: "#eab308",
    glowColor: "rgba(234, 179, 8, 0.15)",
  },
  {
    label: "In Transit",
    value: "115",
    change: "+8%",
    positive: true,
    icon: Truck,
    iconColor: "#3b82f6",
    glowColor: "rgba(59, 130, 246, 0.15)",
  },
  {
    label: "Delivered Today",
    value: "89",
    change: "+15%",
    positive: true,
    icon: CheckCircle,
    iconColor: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.15)",
  },
];

export default function OrdersStatsCards() {
  return (
    <div  className="grid grid-cols-4 gap-4 !py-7 !px-5">
      {stats.map(({ label, value, change, positive, icon: Icon, iconColor, glowColor }) => (
        <Card
          key={label}
          style={{
            background: `radial-gradient(circle at top right, ${glowColor} 0%, transparent 60%), #1E293B`,
            border: "1px solid #33415580",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            borderRadius: "12px",
            flexShrink: 0,
          }}
        >
          <CardContent className="!py-4 !px-6 ">

            {/* Top row — icon + change */}
            <div className="flex items-center justify-between mb-5">
              <Icon size={22} style={{ color: iconColor }} />
              <div className="flex items-center gap-0.5">
                <TrendingUp size={13} style={{ color: positive ? "#10b981" : "#ef4444" }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: positive ? "#10b981" : "#ef4444" }}
                >
                  {change}
                </span>
              </div>
            </div>

            <div className="!pt-2">
            <p className="text-sm text-slate-400 mb-1 !pb-2">{label}</p>

            {/* Value */}
            <span className="text-3xl font-bold text-white leading-none">
              {value}
            </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}