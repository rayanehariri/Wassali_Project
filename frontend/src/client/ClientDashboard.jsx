// ClientDashboard.jsx — Shell + sidebar (aligned with admin / deliverer)
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import "../client.css";

import PageHome from "./Myorders";
import PageTrack from "./Pagetrack";
import PageWallet from "./Pagewallet";
import PageSettings from "./Pagesettings";
import PageSupport from "./Pagesupport";
import PageProfile from "./Pageprofile";
import NewDeliveryPage from "./NewDeliveryPage";
import ChooseDelivererPage from "./ChooseDelivererPage";
import CheckoutPage from "./CheckoutPage";
import SuccessPage from "./SuccessPage";
import DelivererProfilePage from "./Delivererprofilepage";
import DelivererHistory from "./track/DelivererHistory";
import ClientSideBar from "./ClientSideBar";

import { WassaliLogo } from "./Shared";
import { http } from "../api/http";

const FLOW_STORAGE_KEY_PREFIX = "client_delivery_flow";

export default function ClientDashboard({ currentUser, onLogout, addToast }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [active, setActive] = useState("home");
  const [trackStartPanel, setTrackStartPanel] = useState(null);
  const [trackChatDeliverer, setTrackChatDeliverer] = useState(null);
  const [deliveryStep, setDeliveryStep] = useState(null);
  const [deliveryData, setDeliveryData] = useState({});
  const [flowHydrated, setFlowHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clientOnline, setClientOnline] = useState(true);
  const userFlowKey = `${FLOW_STORAGE_KEY_PREFIX}:${currentUser?._id ?? currentUser?.id ?? "anon"}`;

  useEffect(() => {
    document.querySelector(".cd-main-scroll")?.scrollTo(0, 0);
  }, [active, deliveryStep]);

  // Keep requested start panel stable long enough for PageTrack bootstrap.
  // It can be reset safely after user leaves/reopens track manually.

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setMobileOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    if (searchParams.get("view") !== "settings") return;
    setDeliveryStep(null);
    setDeliveryData({});
    setActive("settings");
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    // Restore pending flow (choose/select) so user can continue after navigation.
    try {
      const raw = localStorage.getItem(userFlowKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.requestId && !deliveryStep) {
        setDeliveryData(saved);
        // Keep the top "Resume" bar visible until the user chooses to continue.
      }
    } catch {}
    finally {
      setFlowHydrated(true);
    }
  }, [userFlowKey, deliveryStep]);

  useEffect(() => {
    if (!flowHydrated) return;
    // Persist only if we already have a created request.
    if (deliveryData?.requestId && ["choose", "checkout", "success"].includes(deliveryStep || "")) {
      try { localStorage.setItem(userFlowKey, JSON.stringify(deliveryData)); } catch {}
      return;
    }
    if (!deliveryStep) {
      try {
        if (!deliveryData?.requestId) localStorage.removeItem(userFlowKey);
        else localStorage.setItem(userFlowKey, JSON.stringify(deliveryData));
      } catch {}
    }
  }, [deliveryStep, deliveryData, userFlowKey, flowHydrated]);

  useEffect(() => {
    let alive = true;
    async function loadActiveRequestFromServer() {
      try {
        const res = await http.get("/client/requests/active");
        const req = res?.data?.request ?? res?.data?.data?.request ?? null;
        if (!alive) return;
        if (req?._id) {
          setDeliveryData((prev) => ({ ...prev, requestId: req._id }));
          return;
        }
        // Clear stale local flow if server has no active request.
        setDeliveryData((prev) => {
          if (!prev?.requestId) return prev;
          const next = { ...prev };
          delete next.requestId;
          return next;
        });
        try { localStorage.removeItem(userFlowKey); } catch {}
      } catch {
        // Keep local flow fallback only.
      }
    }
    loadActiveRequestFromServer();
    return () => { alive = false; };
  }, [userFlowKey]);

  function startNewDelivery() { setDeliveryStep("form"); }
  function goToChoose(formData) { setDeliveryData((d) => ({ ...d, ...formData })); setDeliveryStep("choose"); }
  function goToProfile(deliverer) { setDeliveryData((d) => ({ ...d, deliverer })); setDeliveryStep("profile"); }
  function goToCheckout(deliverer) { setDeliveryData((d) => ({ ...d, deliverer })); setDeliveryStep("checkout"); }
  function goToSuccess() { setDeliveryStep("success"); }
  function pauseDeliveryFlow() { setDeliveryStep(null); }
  function exitDeliveryFlow() {
    setDeliveryStep(null);
    setDeliveryData({});
    try { localStorage.removeItem(userFlowKey); } catch {}
  }
  function openTrackChatFromSuccess() {
    setTrackChatDeliverer(deliveryData?.deliverer || null);
    setDeliveryStep(null);
    setDeliveryData({});
    setTrackStartPanel("chat");
    setActive("track");
  }

  function handleSidebarNav(key) {
    pauseDeliveryFlow();
    setActive(key);
  }

  const inDeliveryFlow = deliveryStep !== null;
  const savedPendingRequest = Boolean(!inDeliveryFlow && deliveryData?.requestId);

  const sidebarProps = {
    currentUser,
    onLogout,
    active,
    inDeliveryFlow,
    onNavigate: handleSidebarNav,
    onNewDelivery: startNewDelivery,
  };

  return (
    <SidebarProvider style={{ "--sidebar-width": "210px" }}>
      <div className="flex h-screen w-full overflow-hidden" style={{ background: "#0a0d14" }}>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}

        <div className="hidden h-full shrink-0 md:block">
          <ClientSideBar {...sidebarProps} isMobile={false} />
        </div>

        <div
          className="fixed top-0 left-0 z-50 h-full transition-transform duration-300 ease-out md:hidden"
          style={{
            transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
            width: "220px",
          }}
        >
          <ClientSideBar {...sidebarProps} isMobile onClose={() => setMobileOpen(false)} />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden" style={{ color: "white", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
          <div
            className="flex shrink-0 items-center justify-between border-b border-[#1e2d3d] px-4 py-3 md:hidden"
            style={{ background: "#0f1117" }}
          >
            <button
              type="button"
              onClick={() => setMobileOpen((p) => !p)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-all"
              style={{ background: "#1e2536", borderColor: "#334155" }}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={18} color="#94a3b8" /> : <Menu size={18} color="#94a3b8" />}
            </button>
            <div className="flex min-w-0 items-center gap-2">
              <WassaliLogo size={18} />
              <span className="truncate text-[15px] font-extrabold text-white" style={{ fontFamily: "'Outfit',system-ui,sans-serif" }}>Wassali</span>
              <span className="shrink-0 text-[9px] font-bold tracking-[0.14em] text-slate-500">CLIENT</span>
            </div>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}
            >
              {(currentUser?.name ?? "C").charAt(0).toUpperCase()}
            </div>
          </div>

          <main className="cd-main-scroll cd-scroll flex-1 overflow-y-auto" style={{ background: "#060c18", minWidth: 0 }}>
            {savedPendingRequest && (
              <div
                style={{
                  margin: "14px 16px 0",
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "rgba(37,99,235,0.12)",
                  border: "1px solid rgba(37,99,235,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 12, color: "#bfdbfe", fontWeight: 600 }}>
                  You have a pending request. Continue choosing a deliverer.
                </span>
                <button
                  type="button"
                  onClick={() => setDeliveryStep("choose")}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(191,219,254,0.4)",
                    background: "rgba(191,219,254,0.08)",
                    color: "#dbeafe",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Resume
                </button>
              </div>
            )}

            {deliveryStep === "form" && (
              <NewDeliveryPage currentUser={currentUser} onNext={goToChoose} onBack={exitDeliveryFlow} addToast={addToast} />
            )}
            {deliveryStep === "choose" && (
              <ChooseDelivererPage
                deliveryData={deliveryData}
                onNext={goToCheckout}
                onBack={() => setDeliveryStep("form")}
              />
            )}
            {deliveryStep === "profile" && (
              <DelivererProfilePage
                deliverer={deliveryData.deliverer}
                deliveryData={deliveryData}
                onAccept={goToCheckout}
                onBack={() => setDeliveryStep("choose")}
              />
            )}
            {deliveryStep === "checkout" && (
              <CheckoutPage
                deliveryData={deliveryData}
                onNext={goToSuccess}
                onBack={() => setDeliveryStep("choose")}
              />
            )}
            {deliveryStep === "success" && (
              <SuccessPage
                deliveryData={deliveryData}
                onDone={exitDeliveryFlow}
                setActive={setActive}
                onOpenTrackChat={openTrackChatFromSuccess}
              />
            )}

            {!inDeliveryFlow && active === "home" && (
              <PageHome
                currentUser={currentUser}
                setActive={setActive}
                addToast={addToast}
                onNewDelivery={startNewDelivery}
                onSettings={() => setActive("settings")}
                isOnline={clientOnline}
                onToggleOnline={setClientOnline}
              />
            )}
            {!inDeliveryFlow && active === "track" && (
              <PageTrack
                currentUser={currentUser}
                setActive={setActive}
                addToast={addToast}
                startPanel={trackStartPanel}
                startChatDeliverer={trackChatDeliverer}
                onSettings={() => setActive("settings")}
                orderId={deliveryData?.orderId || deliveryData?.deliveryId || null}
              />
            )}
            {!inDeliveryFlow && active === "wallet" && (
              <PageWallet setActive={setActive} addToast={addToast} currentUser={currentUser} onSettings={() => setActive("settings")} />
            )}
            {!inDeliveryFlow && active === "settings" && (
              <PageSettings currentUser={currentUser} setActive={setActive} addToast={addToast} />
            )}
            {!inDeliveryFlow && active === "profile" && (
              <PageProfile currentUser={currentUser} />
            )}
            {!inDeliveryFlow && active === "support" && (
              <PageSupport currentUser={currentUser} setActive={setActive} addToast={addToast} />
            )}
            {!inDeliveryFlow && active === "deliverer-history" && (
              <DelivererHistory onBack={() => setActive("home")} onNewDelivery={startNewDelivery} />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
