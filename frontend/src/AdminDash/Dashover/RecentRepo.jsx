import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const reports = [
  {
    id: 1,
    icon: "⚠",
    iconBg: "rgba(239,68,68,0.15)",
    iconColor: "#ef4444",
    title: "Late Delivery Complaint",
    description: "Order #9921 • Reported by User ID #402",
    priority: "HIGH PRIORITY",
    priorityColor: "#ef4444",
    priorityBg: "rgba(239,68,68,0.1)",
  },
  {
    id: 2,
    icon: "?",
    iconBg: "rgba(234,179,8,0.15)",
    iconColor: "#eab308",
    title: "Deliverer Support",
    description: "Question about payout schedule",
    priority: "MEDIUM PRIORITY",
    priorityColor: "#eab308",
    priorityBg: "rgba(234,179,8,0.1)",
  },
];

export default function RecentReports() {
  return (
    <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "16px" }} className="!pt-4">
      <CardHeader className="!pt-3 !px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="!text-white !text-[16px] !font-bold">
            Recent Reports
          </CardTitle>
          <span className="text-blue-400 text-[13px] cursor-pointer hover:underline">
            View All
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 !pb-4 !px-6">
        {reports.map(({ id, icon, iconBg, iconColor, title, description, priority, priorityColor, priorityBg }, index) => (
          <div key={id}>
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  color: iconColor,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1">
                <p className="text-white font-semibold text-[14px]">{title}</p>
                <p className="text-slate-400 text-[12px]">{description}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: priorityColor,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{ color: priorityColor }}
                    className="text-[11px] font-semibold tracking-wider"
                  >
                    {priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Separator between items */}
            {index < reports.length - 1 && (
              <Separator className="!bg-[#1e2d3d] mt-4" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}