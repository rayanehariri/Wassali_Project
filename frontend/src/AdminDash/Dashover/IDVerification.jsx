import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const applicants = [
  { name: "Ahmed K.",  role: "Delivery Partner", submitted: "2 hrs ago",  status: "Pending",  avatar: "AK" },
  { name: "Sarah M.",  role: "Delivery Partner", submitted: "5 hrs ago",  status: "Pending",  avatar: "SM" },
  { name: "John D.",   role: "Delivery Partner", submitted: "1 day ago",  status: "Rejected", avatar: "JD" },
];

const statusStyle = {
  Pending:  { background: "rgba(234,179,8,0.15)",  color: "#eab308" },
  Rejected: { background: "rgba(239,68,68,0.15)",  color: "#ef4444" },
  Approved: { background: "rgba(16,185,129,0.15)", color: "#10b981" },
};

export default function IDVerification() {
  return (
    <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "16px" }} className="!py-4">
      <CardHeader className="!pt-3 !px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="!text-white !text-[16px] !font-bold">
            ID Verification Queue
          </CardTitle>
          <span className="text-blue-400 text-[13px] cursor-pointer hover:underline">
            View All
          </span>
        </div>
      </CardHeader>

      <CardContent className="!px-6">
        <Table>
          <TableHeader>
            <TableRow style={{ borderColor: "#1e2d3d" }}>
              <TableHead className="!text-slate-500 !text-[11px] uppercase tracking-wider">Applicant</TableHead>
              <TableHead className="!text-slate-500 !text-[11px] uppercase tracking-wider">ID Document</TableHead>
              <TableHead className="!text-slate-500 !text-[11px] uppercase tracking-wider">Submitted</TableHead>
              <TableHead className="!text-slate-500 !text-[11px] uppercase tracking-wider">Status</TableHead>
              <TableHead className="!text-slate-500 !text-[11px] uppercase tracking-wider">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="!pb-4">
            {applicants.map(({ name, role, submitted, status, avatar }) => (
              <TableRow key={name} style={{ borderColor: "#1e2d3d" }} className="hover:!bg-white/5">
                
                {/* Applicant */}
                <TableCell className="!py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback
                        style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
                        className="!text-white !text-[12px] !font-bold"
                      >
                        {avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white text-[13px] font-semibold">{name}</p>
                      <p className="text-slate-400 text-[11px]">{role}</p>
                    </div>
                  </div>
                </TableCell>

                {/* ID Document */}
                <TableCell>
                  <div
                    style={{
                      width: "48px",
                      height: "32px",
                      background: "#1e2d3d",
                      borderRadius: "6px",
                      border: "1px solid #33415580",
                    }}
                  />
                </TableCell>

                {/* Submitted */}
                <TableCell className="!text-slate-400 !text-[13px]">
                  {submitted}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    style={{
                      ...statusStyle[status],
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "3px 10px",
                    }}
                  >
                    {status}
                  </Badge>
                </TableCell>

                {/* Action */}
                <TableCell>
                  {status === "Rejected" ? (
                    <span className="text-slate-400 text-[12px] cursor-pointer hover:text-white">
                      Review
                    </span>
                  ) : (
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        background: "rgba(16,185,129,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Check size={14} color="#10b981" />
                    </div>
                  )}
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}