import { useState, useEffect } from "react";
import { ShoppingCart, Clock, Truck, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getOrderStats } from "./FakeOrderApi";

export default function OrdersStatsCards() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let alive = true;
    getOrderStats().then((s) => {
      if (!alive) return;
      setStats(s);
    });
    return () => { alive = false; };
  }, []);

  const cards = stats
    ? [
        {
          label: stats.totalOrders?.label || "Total Orders",
          value: String(stats.totalOrders?.value ?? "0"),
          change: stats.totalOrders?.change ?? "Live",
          positive: stats.totalOrders?.positive !== false,
          icon: ShoppingCart,
          iconColor: "#3b82f6",
          glowColor: "rgba(59, 130, 246, 0.15)",
        },
        {
          label: stats.pendingPickups?.label || "Pending",
          value: String(stats.pendingPickups?.value ?? "0"),
          change: stats.pendingPickups?.change ?? "Live",
          positive: true,
          icon: Clock,
          iconColor: "#eab308",
          glowColor: "rgba(234, 179, 8, 0.15)",
        },
        {
          label: stats.inTransit?.label || "In Transit",
          value: String(stats.inTransit?.value ?? "0"),
          change: stats.inTransit?.change ?? "Live",
          positive: true,
          icon: Truck,
          iconColor: "#3b82f6",
          glowColor: "rgba(59, 130, 246, 0.15)",
        },
        {
          label: stats.deliveredToday?.label || "Delivered",
          value: String(stats.deliveredToday?.value ?? "0"),
          change: stats.deliveredToday?.change ?? "Live",
          positive: true,
          icon: CheckCircle,
          iconColor: "#10b981",
          glowColor: "rgba(16, 185, 129, 0.15)",
        },
      ]
    : [];

  return (
    <div className="grid grid-cols-4 gap-4 !py-7 !px-5">
      {(cards.length ? cards : [
        { label: "Total Orders", value: "—", change: "…", positive: true, icon: ShoppingCart, iconColor: "#3b82f6", glowColor: "rgba(59, 130, 246, 0.15)" },
        { label: "Pending", value: "—", change: "…", positive: true, icon: Clock, iconColor: "#eab308", glowColor: "rgba(234, 179, 8, 0.15)" },
        { label: "In Transit", value: "—", change: "…", positive: true, icon: Truck, iconColor: "#3b82f6", glowColor: "rgba(59, 130, 246, 0.15)" },
        { label: "Delivered", value: "—", change: "…", positive: true, icon: CheckCircle, iconColor: "#10b981", glowColor: "rgba(16, 185, 129, 0.15)" },
      ]).map(({ label, value, change, positive, icon: Icon, iconColor, glowColor }) => (
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
