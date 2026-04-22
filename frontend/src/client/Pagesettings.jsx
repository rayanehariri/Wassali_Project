import { useState } from "react";
import { Fingerprint, ShieldCheck, Check, Eye, EyeOff, Smartphone, Laptop, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { TopBar } from "./Shared";
import { http } from "../api/http";
import { changePassword } from "../auth/FakeUsers";

export default function PageSettings({ currentUser, setActive, addToast }) {
  const [firstName, setFirstName] = useState(currentUser?.name?.split(" ")[0] || "Mohamed");
  const [lastName, setLastName] = useState(currentUser?.name?.split(" ")[1] || "Benali");
  const [email, setEmail] = useState(currentUser?.email || "m.benali@wassali.dz");
  const [recoveryEmail, setRecoveryEmail] = useState("security@wassali.dz");
  const [publicProfile, setPublicProfile] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  return (
    <div style={{ animation: "cdFadeUp .3s ease both" }}>
      <TopBar
        placeholder="Search security logs, active sessions..."
        onSettings={() => setActive?.("settings")}
        setActive={setActive}
        addToast={addToast}
        currentUser={currentUser}
      />
      <div className="cd-page-wrap" style={{ paddingTop: 24 }}>
        <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#3b82f6", letterSpacing: "0.14em" }}>
          ACCOUNT CONFIGURATION
        </p>
        <h1 style={{ margin: "0 0 20px", fontSize: 28, fontWeight: 800, color: "white", fontFamily: "'Outfit',system-ui,sans-serif" }}>
          Client Settings
        </h1>

        <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">
          <div className="!flex !flex-col !gap-5">
            <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: 16 }}>
              <CardContent className="!p-5 md:!p-6">
                <div className="!flex !items-center !gap-3 !mb-6">
                  <div className="!w-10 !h-10 !rounded-xl !flex !items-center !justify-center" style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.25)" }}>
                    <Fingerprint size={18} color="#3b82f6" />
                  </div>
                  <h2 className="!m-0 !text-[17px] !font-bold !text-white">Login & Identity</h2>
                </div>

                <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-4 !mb-4">
                  <div>
                    <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-2 !tracking-widest">FIRST NAME</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="cd-input !w-full !px-4 !py-3 !rounded-xl !text-[13px] !text-white !outline-none" style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }} />
                  </div>
                  <div>
                    <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-2 !tracking-widest">LAST NAME</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="cd-input !w-full !px-4 !py-3 !rounded-xl !text-[13px] !text-white !outline-none" style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }} />
                  </div>
                </div>

                <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-4 !mb-4">
                  <div>
                    <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-2 !tracking-widest">LOGIN EMAIL</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="cd-input !w-full !px-4 !py-3 !rounded-xl !text-[13px] !text-white !outline-none" style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }} />
                  </div>
                  <div>
                    <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-2 !tracking-widest">RECOVERY EMAIL</label>
                    <input value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} className="cd-input !w-full !px-4 !py-3 !rounded-xl !text-[13px] !text-white !outline-none" style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }} />
                  </div>
                </div>

                <div className="!mb-4">
                  <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-2 !tracking-widest">PASSWORD</label>
                  <div className="!flex !items-center !px-4 !py-3 !rounded-xl" style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }}>
                    <span className="!flex-1 !text-[14px] !text-white !tracking-widest !font-medium">{showPassword ? "my-secret-password" : "••••••••••••••••"}</span>
                    <button onClick={() => setShowPassword((v) => !v)} className="!bg-transparent !border-none !cursor-pointer !text-slate-400 hover:!text-white">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-4 !mb-5">
                  <div>
                    <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-2 !tracking-widest">CURRENT PASSWORD</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="cd-input !w-full !px-4 !py-3 !rounded-xl !text-[13px] !text-white !outline-none" style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }} />
                  </div>
                  <div>
                    <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-2 !tracking-widest">NEW PASSWORD</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="cd-input !w-full !px-4 !py-3 !rounded-xl !text-[13px] !text-white !outline-none" style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }} />
                  </div>
                </div>

                <Separator className="!bg-[#1e2d3d] !mb-4" />

                <button
                  onClick={() => {
                    (async () => {
                      setSaving(true);
                      try {
                        const me = await http.get("/auth/me/");
                        const meUser = me?.data?.user ?? me?.data?.data?.user;
                        const username = meUser?.username || currentUser?.username;
                        const mergedName = `${firstName} ${lastName}`.trim();
                        await http.patch("/auth/me/", {
                          username: mergedName || username,
                          email,
                        });
                        if (currentPassword && newPassword && username) {
                          await changePassword(username, currentPassword, newPassword);
                          setCurrentPassword("");
                          setNewPassword("");
                        }
                        setSaved(true);
                        addToast?.("success", "Settings updated", "Profile changes saved to your account.");
                        setTimeout(() => setSaved(false), 2200);
                      } catch (e) {
                        addToast?.("error", "Update failed", e?.response?.data?.message || e?.message || "Could not save settings.");
                      } finally {
                        setSaving(false);
                      }
                    })();
                  }}
                  disabled={saving}
                  className="!w-full !py-3.5 !rounded-xl !text-[14px] !font-bold !text-white !cursor-pointer !flex !items-center !justify-center !gap-2"
                  style={{ background: "#2563eb", border: "none", boxShadow: "0 4px 16px rgba(37,99,235,0.4)", opacity: saving ? 0.7 : 1 }}
                >
                  {saved ? <><Check size={15} /> Updated!</> : saving ? "Saving..." : "Update Credentials"}
                </button>
              </CardContent>
            </Card>

            <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: 16 }}>
              <CardContent className="!p-5 md:!p-6">
                <div className="!flex !items-center !gap-3 !mb-5">
                  <div className="!w-10 !h-10 !rounded-xl !flex !items-center !justify-center" style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.25)" }}>
                    <ShieldCheck size={18} color="#3b82f6" />
                  </div>
                  <h2 className="!m-0 !text-[17px] !font-bold !text-white">Privacy & Permissions</h2>
                </div>
                <div className="!flex !flex-col !gap-2">
                  {[
                    { label: "Public Profile", sub: "Visible to deliverers", value: publicProfile, setter: setPublicProfile },
                    { label: "Email Alerts", sub: "Delivery and payment updates", value: emailAlerts, setter: setEmailAlerts },
                    { label: "Location Sharing", sub: "Used while tracking active order", value: locationSharing, setter: setLocationSharing },
                  ].map((item) => (
                    <div key={item.label} className="!flex !items-center !justify-between !px-4 !py-3.5 !rounded-xl" style={{ background: "#0f1b2d", border: "1px solid #1a2d4a" }}>
                      <div>
                        <p className="!m-0 !text-[13px] !font-semibold !text-white">{item.label}</p>
                        <p className="!m-0 !text-[10px] !font-bold !text-slate-500 !tracking-wider">{item.sub}</p>
                      </div>
                      <Switch checked={item.value} onCheckedChange={item.setter} className="!data-[state=checked]:!bg-blue-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="!flex !flex-col !gap-5">
            <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: 16 }}>
              <CardContent className="!p-5 md:!p-6">
                <h2 className="!m-0 !mb-5 !text-[17px] !font-bold !text-white">Security Hub</h2>
                <div className="!flex !flex-col !gap-2">
                  {[
                    { id: 1, device: "Windows Chrome", location: "Algiers", lastSeen: "Current", current: true },
                    { id: 2, device: "iPhone Safari", location: "Bab Ezzouar", lastSeen: "2h ago", current: false },
                  ].map((session) => (
                    <div key={session.id} className="!flex !items-center !justify-between !px-4 !py-3 !rounded-xl" style={{ background: "#0f1b2d", border: "1px solid #1a2d4a" }}>
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center" style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)" }}>
                          {session.device.toLowerCase().includes("iphone") ? <Smartphone size={13} color="#3b82f6" /> : <Laptop size={13} color="#3b82f6" />}
                        </div>
                        <div>
                          <p className="!m-0 !text-[13px] !font-semibold !text-white">{session.device}</p>
                          <p className="!m-0 !text-[11px] !text-slate-500">{session.location} • {session.lastSeen}</p>
                        </div>
                      </div>
                      {session.current ? (
                        <span className="!text-[10px] !font-bold !px-2.5 !py-1 !rounded-lg" style={{ background: "rgba(37,99,235,0.15)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.3)" }}>
                          CURRENT
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="!text-[10px] !font-bold !px-2.5 !py-1 !rounded-lg !cursor-pointer !flex !items-center !gap-1"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
                        >
                          <Trash2 size={11} />
                          DELETE
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}