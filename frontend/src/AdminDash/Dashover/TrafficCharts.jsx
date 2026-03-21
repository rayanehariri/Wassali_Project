import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { time: "00:00", value: 10 },
  { time: "06:00", value: 45 },
  { time: "12:00", value: 60 },
  { time: "18:00", value: 40 },
  { time: "21:00", value: 110 },
  { time: "24:00", value: 70 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1e2536",
        border: "1px solid #33415580",
        borderRadius: "8px",
        padding: "8px 12px",
      }}>
        <p style={{ color: "#94a3b8", fontSize: "12px" }}>{label}</p>
        <p style={{ color: "#3b82f6", fontSize: "14px", fontWeight: 600 }}>
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function TChart() {
  return (
    <div style={{
      background: "#161f2e",
      border: "1px solid #1e2d3d",
      borderRadius: "16px",
      padding: "24px",
      width: "100%",
      height: "100%",
    }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-[16px]">Current Traffic Rate</h3>
          <p className="text-slate-400 text-[12px] mt-0.5">System Load: High</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[12px]">Last 24 Hours</span>
          <span style={{
            background: "rgba(16,185,129,0.1)",
            color: "#10b981",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 700,
            padding: "2px 8px",
          }}>
            +15%
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#blueGradient)"
            dot={false}
            activeDot={{ r: 5, fill: "#3b82f6", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}