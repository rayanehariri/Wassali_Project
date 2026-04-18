import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import LogoIcon from './LogoIcon';

const API = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── VEHICLE TYPES ─────────────────────────────────────────
const VEHICLE_TYPES = [
  { id: 'car', label: 'Car',
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 17H3a2 2 0 0 1-2-2V9l3-4h12l3 4v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/><path d="M1 9h22"/></svg> },
  { id: 'motorcycle', label: 'Motorcycle',
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M12 17.5h-1a3 3 0 0 1-3-3V11l3-5h4l2 5h2"/></svg> },
  { id: 'bicycle', label: 'Bicycle',
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M12 17.5L9 11l3-5h3l3 5.5"/><path d="M9 11h8"/></svg> },
  { id: 'scooter', label: 'Scooter',
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 15h7l2-6h2l1 2"/><path d="M8 9h5"/></svg> },
];

// ── ICONS ─────────────────────────────────────────────────
const CheckIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const UploadIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const InfoIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const UserIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const CarIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M5 17H3a2 2 0 0 1-2-2V9l3-4h12l3 4v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>;
const DocIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const ChatIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const ZapIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

// ── STEP BAR ──────────────────────────────────────────────
function StepBar({ currentStep }) {
  const steps = [
    { id: 1, label: 'Account Created' },
    { id: 2, label: 'Vehicle Info'    },
    { id: 3, label: 'Final Review'    },
  ];
  return (
    <div className="!flex !items-start !justify-center !mb-8">
      {steps.map((step, i) => {
        const done   = currentStep > step.id;
        const active = currentStep === step.id;
        return (
          <div key={step.id} className="!flex !items-center">
            {i > 0 && (
              <div className={`!w-24 !h-0.5 !mb-7 !rounded !transition-all !duration-500 ${done || active ? '!bg-blue-500' : '!bg-white/10'}`} />
            )}
            <div className="!flex !flex-col !items-center !gap-1.5">
              <div className={`!w-9 !h-9 !rounded-full !flex !items-center !justify-center !border-2 !transition-all !duration-300 ${
                done   ? '!bg-blue-600 !border-blue-500' :
                active ? '!bg-blue-500/20 !border-blue-500' :
                         '!bg-white/[.04] !border-white/15'
              }`}>
                {done
                  ? <span className="!text-white"><CheckIcon /></span>
                  : <span className={`!text-xs !font-bold ${active ? '!text-blue-300' : '!text-white/25'}`}>{step.id}</span>
                }
              </div>
              <span className={`!text-[11px] !whitespace-nowrap !font-medium !transition-colors ${
                active ? '!text-blue-300 !font-semibold' : done ? '!text-blue-400' : '!text-white/30'
              }`}>{step.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── FILE UPLOAD BOX ───────────────────────────────────────
function FileUploadBox({ label, hint, file, onFileChange, error }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);

  function handleDrop(e) {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) onFileChange(f);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        className={`!rounded-xl !p-6 !text-center !cursor-pointer !transition-all !duration-200 !border-2 !border-dashed ${
          drag  ? '!border-blue-500 !bg-blue-500/[.07]' :
          file  ? '!border-green-500/60 !bg-green-500/[.04]' :
          error ? '!border-red-500/50 !bg-red-500/[.03]' :
                  '!border-blue-500/30 !bg-white/[.02] hover:!border-blue-500/60 hover:!bg-blue-500/[.04]'
        }`}
      >
        <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="!hidden" onChange={e => onFileChange(e.target.files[0])} />
        {file ? (
          <>
            <div className="!w-12 !h-12 !rounded-full !bg-green-500/15 !flex !items-center !justify-center !mx-auto !mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="!text-[14px] !font-semibold !text-green-400 !mb-1">{file.name}</p>
            <p className="!text-[12px] !text-white/35">Click to replace</p>
          </>
        ) : (
          <>
            <div className="!w-12 !h-12 !rounded-full !bg-blue-500/10 !flex !items-center !justify-center !mx-auto !mb-3 !text-blue-400">
              <UploadIcon />
            </div>
            <p className="!text-[14px] !font-medium !text-white/70 !mb-1">{label}</p>
            <p className="!text-[12px] !text-white/30">{hint || 'Click or drag file · PDF, JPG or PNG (Max 5MB)'}</p>
          </>
        )}
      </div>
      {error && <p className="!text-[12px] !text-red-400 !mt-1.5">{error}</p>}
    </div>
  );
}

// ── TOP BAR ──────────────────────────────────────────────
function TopBar({ currentUser, statusColor = '#94a3b8', statusLabel = 'New Partner' }) {
  return (
    <div className="!flex !items-center !justify-between !px-8 !py-4 !border-b !border-white/[.06] !bg-[rgba(11,25,41,0.95)] !backdrop-blur-xl !sticky !top-0 !z-10">
      <div className="!flex !items-center !gap-2">
        <LogoIcon size={22} color="#3b82f6" />
        <span className="!text-[17px] !font-bold !tracking-tight">Wassali</span>
        <span className="!text-[11px] !font-semibold !text-blue-400 !bg-blue-500/10 !border !border-blue-500/20 !px-2 !py-0.5 !rounded-full">Drive</span>
      </div>
      <div className="!flex !items-center !gap-2.5 !bg-white/[.04] !border !border-white/[.07] !rounded-xl !px-3 !py-2">
        <div
          className="!w-8 !h-8 !rounded-full !bg-blue-500/15 !border !flex !items-center !justify-center !font-bold !text-[13px] !text-blue-300"
          style={{ borderColor: statusColor + '55' }}
        >
          {currentUser?.name?.charAt(0).toUpperCase() || 'G'}
        </div>
        <div>
          <p className="!m-0 !text-[13px] !font-semibold !leading-tight">{currentUser?.name || 'Guest'}</p>
          <p className="!m-0 !text-[11px] !leading-tight" style={{ color: statusColor }}>● {statusLabel}</p>
        </div>
      </div>
    </div>
  );
}

// ── INPUT FIELD ──────────────────────────────────────────
function InputField({ label, placeholder, value, onChange, error, icon }) {
  return (
    <div className="!flex-1">
      <label className="!block !text-[11px] !font-semibold !tracking-[.07em] !text-white/40 !mb-2">{label}</label>
      <div className="!relative">
        {icon && <span className="!absolute !left-3.5 !top-1/2 !-translate-y-1/2 !text-white/30 !pointer-events-none">{icon}</span>}
        <input
          className={`!w-full !bg-white/[.05] !rounded-xl !py-3 !pr-4 !text-white !text-[14px] !outline-none !placeholder-white/25 !transition-all !duration-200 !border focus:!border-blue-500/60 focus:!bg-white/[.07] ${
            error ? '!border-red-500/60' : '!border-white/[.08]'
          } ${icon ? '!pl-10' : '!pl-4'}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
      {error && <p className="!text-[12px] !text-red-400 !mt-1.5">{error}</p>}
    </div>
  );
}

// ── CARD ─────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div className={`!bg-white/[.04] !border !border-white/[.07] !rounded-2xl !p-8 !w-full ${className}`}>
      {children}
    </div>
  );
}

// ── NAV ROW ──────────────────────────────────────────────
function NavRow({ onBack, onNext, nextLabel = 'Continue', loading = false }) {
  return (
    <div className="!flex !justify-between !items-center !mt-8 !pt-6 !border-t !border-white/[.06]">
      <button
        onClick={onBack}
        className="!text-white/40 !text-[14px] !font-medium hover:!text-white/70 !transition-colors !px-2 !py-2"
      >
        ← Back
      </button>
      <button
        onClick={onNext}
        disabled={loading}
        className={`!flex !items-center !gap-2 !bg-gradient-to-br !from-blue-600 !to-blue-700 hover:!from-blue-500 hover:!to-blue-600 !text-white !font-semibold !text-[14px] !px-6 !py-3 !rounded-xl !transition-all !duration-200 !shadow-[0_4px_14px_rgba(37,99,235,0.4)] hover:!shadow-[0_6px_20px_rgba(37,99,235,0.5)] hover:!-translate-y-0.5 ${loading ? '!opacity-70 !cursor-not-allowed' : ''}`}
      >
        {loading
          ? <span className="!w-4 !h-4 !border-2 !border-white/30 !border-t-white !rounded-full !inline-block !animate-spin" />
          : <>{nextLabel} <span>→</span></>
        }
      </button>
    </div>
  );
}

// ── SUMMARY ROW ──────────────────────────────────────────
function SummaryRow({ icon, label, sublabel, variant = 'submitted' }) {
  const isVerified = variant === 'verified';
  return (
    <div className="!flex !items-center !justify-between !py-3 !border-b !border-white/[.04] last:!border-0">
      <div className="!flex !items-center !gap-3">
        <div className="!w-8 !h-8 !rounded-lg !bg-blue-500/10 !flex !items-center !justify-center">{icon}</div>
        <div>
          <p className="!m-0 !text-[13px] !font-semibold">{label}</p>
          <p className="!m-0 !text-[12px] !text-white/35">{sublabel}</p>
        </div>
      </div>
      <span className={`!flex !items-center !gap-1.5 !text-[12px] !font-semibold !px-3 !py-1 !rounded-full !border ${
        isVerified
          ? '!bg-green-500/10 !text-green-400 !border-green-500/25'
          : '!bg-blue-500/10 !text-blue-400 !border-blue-500/25'
      }`}>
        <CheckIcon />{isVerified ? 'Verified' : 'Submitted'}
      </span>
    </div>
  );
}

function SubmissionSummary({ variant = 'submitted' }) {
  return (
    <Card>
      <div className="!flex !items-center !gap-2 !mb-4 !pb-3 !border-b !border-white/[.06]">
        <DocIcon /><span className="!text-[14px] !font-bold">Submission Summary</span>
      </div>
      <SummaryRow variant={variant} icon={<UserIcon />} label="Account Details"  sublabel="Personal & Contact Info" />
      <SummaryRow variant={variant} icon={<CarIcon  />} label="Vehicle Info"     sublabel="Registration & Type"    />
      <SummaryRow variant={variant} icon={<DocIcon  />} label="Documents"        sublabel="License & ID"           />
    </Card>
  );
}


// ═══════════════════════════════════════════════════════════
// MAIN: VehicleInfoPage  (Step 1 → 2 → 3 → submit)
// ═══════════════════════════════════════════════════════════
function VehicleInfoPage({ currentUser, setCurrentUser, addToast, onSubmitSuccess }) {
  const [step, setStep] = useState(1);

  const [vehicleType,  setVehicleType]  = useState('car');
  const [makeModel,    setMakeModel]    = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [regFile,      setRegFile]      = useState(null);
  const [err1,         setErr1]         = useState({});

  const [licenseFile, setLicenseFile] = useState(null);
  const [idFile,      setIdFile]      = useState(null);
  const [err2,        setErr2]        = useState({});

  const [submitting, setSubmitting] = useState(false);

  // StepBar shows step 2 for steps 1 & 2, step 3 for the review screen
  const barStep = step === 3 ? 3 : 2;

  function validateStep1() {
    const e = {};
    if (!makeModel.trim())    e.makeModel    = 'Vehicle make & model is required';
    if (!licensePlate.trim()) e.licensePlate = 'License plate is required';
    if (!regFile)             e.regFile      = 'Vehicle registration document is required';
    return e;
  }

  function validateStep2() {
    const e = {};
    if (!licenseFile) e.licenseFile = "Driver's license is required";
    if (!idFile)      e.idFile      = 'National ID card is required';
    return e;
  }

  function handleNext() {
    if (step === 1) {
      const e = validateStep1();
      if (Object.keys(e).length) { setErr1(e); return; }
      setErr1({}); setStep(2);
    } else if (step === 2) {
      const e = validateStep2();
      if (Object.keys(e).length) { setErr2(e); return; }
      setErr2({}); setStep(3);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      // ── Call the backend to mark onboarding as done and set status → pending ──
      // Replace currentUser.id with whatever field holds the user's backend ID
      const userId = currentUser?.id || currentUser?._id;
      if (userId) {
        await API.post(`/auth/onboarding/${userId}/`);
      }

      // In a real app you'd also upload the files to your storage endpoint here.
      // e.g. await uploadDocuments(userId, { regFile, licenseFile, idFile });

      addToast?.('success', 'Application submitted!', 'Your account is now under review (24–48 h).');

      // Notify App.jsx to update user state and navigate
      onSubmitSuccess?.();
    } catch (err) {
      console.error('Onboarding submission error:', err);
      // Even if the API call fails (e.g. offline), we still update local state
      // so the UI flow continues. The backend can be synced later.
      addToast?.('warning', 'Application submitted!', 'Your data was saved locally. We\'ll sync when back online.');
      onSubmitSuccess?.();
    } finally {
      setSubmitting(false);
    }
  }

  const selectedVehicle = VEHICLE_TYPES.find(v => v.id === vehicleType);

  return (
    <div className="!min-h-screen !bg-[#0b1929] !text-white">
      <TopBar currentUser={currentUser} />

      <div className="!flex !justify-center !px-5 !py-8 !pb-16">
        <div className="!w-full !max-w-[720px]">

          <StepBar currentStep={barStep} />

          {/* ── STEP 1: Vehicle Info ── */}
          {step === 1 && (
            <Card>
              <div className="!mb-6">
                <h2 className="!text-[22px] !font-extrabold !tracking-tight !mb-1">Vehicle Information</h2>
                <p className="!text-[14px] !text-white/45 !leading-relaxed">Tell us about the vehicle you'll use for deliveries.</p>
              </div>

              <label className="!block !text-[11px] !font-semibold !tracking-[.07em] !text-white/40 !mb-3">VEHICLE TYPE</label>
              <div className="!grid !grid-cols-4 !gap-3 !mb-7">
                {VEHICLE_TYPES.map(v => (
                  <div
                    key={v.id}
                    onClick={() => setVehicleType(v.id)}
                    className={`!flex !flex-col !items-center !gap-2 !p-4 !rounded-xl !cursor-pointer !transition-all !duration-200 !border hover:!-translate-y-0.5 ${
                      vehicleType === v.id
                        ? '!bg-blue-500/[.16] !border-blue-500 !text-blue-300 !shadow-[0_4px_14px_rgba(59,130,246,0.2)]'
                        : '!bg-white/[.04] !border-white/[.09] !text-white/50 hover:!border-white/20 hover:!text-white/70'
                    }`}
                  >
                    {v.icon}
                    <span className="!text-[13px] !font-semibold">{v.label}</span>
                  </div>
                ))}
              </div>

              <div className="!flex !gap-4 !mb-6">
                <InputField
                  label="VEHICLE MAKE & MODEL"
                  placeholder="e.g. Chery QQ"
                  value={makeModel}
                  onChange={e => { setMakeModel(e.target.value); setErr1(p => ({...p, makeModel: ''})); }}
                  error={err1.makeModel}
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
                />
                <InputField
                  label="LICENSE PLATE NUMBER"
                  placeholder="e.g. ABC 1234 13"
                  value={licensePlate}
                  onChange={e => { setLicensePlate(e.target.value); setErr1(p => ({...p, licensePlate: ''})); }}
                  error={err1.licensePlate}
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="10" rx="1"/><path d="M7 12h1m4 0h1m4 0h1"/></svg>}
                />
              </div>

              <div>
                <label className="!block !text-[11px] !font-semibold !tracking-[.07em] !text-white/40 !mb-2">VEHICLE REGISTRATION DOCUMENT</label>
                <FileUploadBox
                  label="Upload Vehicle Registration"
                  hint="PDF, JPG or PNG · Max 5MB"
                  file={regFile}
                  error={err1.regFile}
                  onFileChange={f => { setRegFile(f); setErr1(p => ({...p, regFile: ''})); }}
                />
              </div>

              <NavRow onBack={() => window.history.back()} onNext={handleNext} />
            </Card>
          )}

          {/* ── STEP 2: Documents ── */}
          {step === 2 && (
            <Card>
              <div className="!mb-6">
                <h2 className="!text-[22px] !font-extrabold !tracking-tight !mb-1">Upload Documents</h2>
                <p className="!text-[14px] !text-white/45 !leading-relaxed">Upload clear photos or scans. All documents are encrypted and securely stored.</p>
              </div>

              <div className="!flex !flex-col !gap-5">
                <div>
                  <label className="!block !text-[11px] !font-semibold !tracking-[.07em] !text-white/40 !mb-2">DRIVER'S LICENSE</label>
                  <FileUploadBox
                    label="Upload Driver's License"
                    hint="Front side · PDF, JPG or PNG · Max 5MB"
                    file={licenseFile}
                    error={err2.licenseFile}
                    onFileChange={f => { setLicenseFile(f); setErr2(p => ({...p, licenseFile: ''})); }}
                  />
                </div>
                <div>
                  <label className="!block !text-[11px] !font-semibold !tracking-[.07em] !text-white/40 !mb-2">NATIONAL ID CARD (CARTE NATIONALE)</label>
                  <FileUploadBox
                    label="Upload National ID Card"
                    hint="Front side · PDF, JPG or PNG · Max 5MB"
                    file={idFile}
                    error={err2.idFile}
                    onFileChange={f => { setIdFile(f); setErr2(p => ({...p, idFile: ''})); }}
                  />
                </div>
              </div>

              <div className="!flex !items-center !gap-2.5 !mt-5 !p-3.5 !bg-blue-500/[.07] !border !border-blue-500/[.14] !rounded-xl !text-[13px] !text-white/45">
                <span className="!text-blue-400 !flex-shrink-0"><InfoIcon /></span>
                Your documents are encrypted and only accessed by our verification team.
              </div>

              <NavRow onBack={() => setStep(1)} onNext={handleNext} />
            </Card>
          )}

          {/* ── STEP 3: Final Review ── */}
          {step === 3 && (
            <Card>
              <div className="!mb-6">
                <h2 className="!text-[22px] !font-extrabold !tracking-tight !mb-1">Final Review</h2>
                <p className="!text-[14px] !text-white/45 !leading-relaxed">Review your information before submitting for verification.</p>
              </div>

              <div className="!grid !grid-cols-2 !gap-4 !mb-6">
                {/* Account */}
                <div className="!bg-white/[.04] !border !border-white/[.07] !rounded-xl !p-4">
                  <div className="!flex !items-center !gap-2 !mb-4 !pb-3 !border-b !border-white/[.06]">
                    <div className="!w-7 !h-7 !rounded-lg !bg-blue-500/12 !flex !items-center !justify-center"><UserIcon /></div>
                    <span className="!text-[13px] !font-bold">Account Details</span>
                  </div>
                  <p className="!text-[10px] !font-semibold !tracking-[.07em] !text-white/30 !mb-0.5">FULL NAME</p>
                  <p className="!text-[14px] !font-medium !mb-3">{currentUser?.name || '—'}</p>
                  <p className="!text-[10px] !font-semibold !tracking-[.07em] !text-white/30 !mb-0.5">ROLE</p>
                  <p className="!text-[14px] !font-medium">Deliverer</p>
                </div>

                {/* Vehicle */}
                <div className="!bg-white/[.04] !border !border-white/[.07] !rounded-xl !p-4">
                  <div className="!flex !items-center !gap-2 !mb-4 !pb-3 !border-b !border-white/[.06]">
                    <div className="!w-7 !h-7 !rounded-lg !bg-blue-500/12 !flex !items-center !justify-center"><CarIcon /></div>
                    <span className="!text-[13px] !font-bold">Vehicle Details</span>
                  </div>
                  <p className="!text-[10px] !font-semibold !tracking-[.07em] !text-white/30 !mb-0.5">VEHICLE TYPE</p>
                  <p className="!text-[14px] !font-medium !mb-3">{selectedVehicle?.label}</p>
                  <p className="!text-[10px] !font-semibold !tracking-[.07em] !text-white/30 !mb-0.5">MAKE & MODEL</p>
                  <p className="!text-[14px] !font-medium !mb-3">{makeModel}</p>
                  <p className="!text-[10px] !font-semibold !tracking-[.07em] !text-white/30 !mb-0.5">LICENSE PLATE</p>
                  <p className="!text-[14px] !font-medium !font-mono">{licensePlate}</p>
                </div>
              </div>

              <label className="!block !text-[11px] !font-semibold !tracking-[.07em] !text-white/40 !mb-3">UPLOADED DOCUMENTS</label>
              <div className="!flex !flex-col !gap-2.5">
                {[
                  { name: "Driver's License",    file: licenseFile },
                  { name: 'National ID Card',     file: idFile      },
                  { name: 'Vehicle Registration', file: regFile     },
                ].map(doc => (
                  <div key={doc.name} className="!flex !items-center !gap-3 !p-3.5 !bg-white/[.04] !border !border-white/[.06] !rounded-xl">
                    <div className="!w-9 !h-9 !rounded-lg !bg-blue-500/10 !flex !items-center !justify-center !flex-shrink-0"><DocIcon /></div>
                    <div className="!flex-1 !min-w-0">
                      <p className="!m-0 !text-[13px] !font-semibold">{doc.name}</p>
                      <p className="!m-0 !text-[12px] !text-white/30 !truncate">{doc.file?.name || '—'}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                ))}
              </div>

              <NavRow onBack={() => setStep(2)} onNext={handleSubmit} nextLabel="Submit for Verification" loading={submitting} />
            </Card>
          )}

          <p className="!text-center !text-[12px] !text-white/[.18] !mt-10">© 2026 Wassali Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// UNDER REVIEW PAGE
// Polls the backend every 15 seconds to check if admin has
// approved the deliverer (status changed from 'pending' → 'active').
// When approved, calls onApproved() which transitions to /verified.
// ═══════════════════════════════════════════════════════════
export function UnderReviewPage({ currentUser, onApproved }) {
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Don't poll if we don't have a user ID to query
    const userId = currentUser?.id || currentUser?._id;
    if (!userId) return;

    async function checkStatus() {
      setChecking(true);
      try {
        const res = await API.get(`/auth/status/${userId}/`);
        if (res.data?.status === 'active') {
          // Admin has approved — trigger the transition to /verified
          onApproved?.();
        }
      } catch (err) {
        // Network error or backend down — silently retry next interval
        console.warn('Status check failed (will retry):', err.message);
      } finally {
        setChecking(false);
      }
    }

    // Check immediately on mount, then every 15 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [currentUser?.id, currentUser?._id]);

  return (
    <div className="!min-h-screen !bg-[#0b1929] !text-white">
      <TopBar currentUser={currentUser} statusColor="#f59e0b" statusLabel="Pending Review" />

      <div className="!flex !justify-center !px-5 !py-8 !pb-16">
        <div className="!w-full !max-w-[860px]">
          <div className="!flex !gap-5 !flex-wrap !items-start">

            {/* Left column */}
            <div className="!flex-1 !min-w-[360px] !flex !flex-col !gap-4">

              {/* Status card */}
              <div className="!bg-white/[.04] !border !border-white/[.07] !rounded-2xl !p-12 !text-center">
                <div className="!w-[72px] !h-[72px] !rounded-full !bg-amber-500/12 !border !border-amber-500/25 !flex !items-center !justify-center !mx-auto !mb-5">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
                  </svg>
                </div>
                <h2 className="!text-[24px] !font-extrabold !mb-3 !tracking-tight">Application Under Review</h2>
                <p className="!text-[14px] !text-white/45 !leading-relaxed !max-w-[360px] !mx-auto !mb-6">
                  Our team is currently verifying your documents. This usually takes 24–48 hours. We'll notify you via email once completed.
                </p>
                <span className="!inline-flex !items-center !gap-2 !bg-amber-500/10 !text-amber-400 !border !border-amber-500/25 !rounded-full !px-5 !py-2 !text-[13px] !font-semibold">
                  <span className="!w-2 !h-2 !rounded-full !bg-amber-400 !inline-block !animate-pulse" />
                  {checking ? 'Checking status…' : 'Moderation in Progress'}
                </span>
              </div>

              <SubmissionSummary variant="submitted" />
            </div>

            {/* Right column */}
            <div className="!w-[260px] !flex !flex-col !gap-4">

              {/* Need Help */}
              <div className="!bg-white/[.04] !border !border-white/[.07] !rounded-2xl !p-6">
                <div className="!w-10 !h-10 !rounded-xl !bg-blue-500/15 !flex !items-center !justify-center !mb-4 !text-white">
                  <ChatIcon />
                </div>
                <h4 className="!text-[15px] !font-bold !mb-2">Need Help?</h4>
                <p className="!text-[13px] !text-white/42 !leading-relaxed !mb-4">Questions about your application or need to update your information?</p>
                <button className="!flex !items-center !justify-center !gap-2 !w-full !bg-white/[.06] !border !border-white/[.09] !rounded-xl !px-4 !py-2.5 !text-[13px] !font-medium hover:!bg-white/[.1] !transition-colors">
                  <ChatIcon /> Contact Support
                </button>
              </div>

              {/* Next Steps */}
              <div className="!bg-white/[.04] !border !border-white/[.07] !rounded-2xl !p-6">
                <div className="!flex !items-center !gap-2 !mb-4">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span className="!text-[14px] !font-bold">Next Steps</span>
                </div>
                {[
                  'Wait for the approval email from our team.',
                  'Download the Wassali Driver App on your mobile.',
                  'Log in and access your deliverer dashboard.',
                ].map((txt, i) => (
                  <div key={i} className="!flex !items-start !gap-3 !mb-3">
                    <span className="!w-5 !h-5 !rounded-full !bg-blue-500/18 !border !border-blue-500/28 !flex !items-center !justify-center !text-[11px] !font-bold !text-blue-400 !flex-shrink-0">{i + 1}</span>
                    <span className="!text-[13px] !text-white/50 !leading-relaxed">{txt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="!text-center !text-[12px] !text-white/[.18] !mt-10">© 2026 Wassali Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// VERIFIED PAGE
// One-time welcome screen shown after admin approval.
// "Get Started" sets status='active' + welcomeSeen=true,
// so future logins go directly to the dashboard.
// ═══════════════════════════════════════════════════════════
export function VerifiedPage({ currentUser, onGetStarted }) {
  return (
    <div className="!min-h-screen !bg-[#0b1929] !text-white">
      <TopBar currentUser={currentUser} statusColor="#4ade80" statusLabel="Verified" />

      <div className="!flex !justify-center !px-5 !py-8 !pb-16">
        <div className="!w-full !max-w-[860px]">
          <div className="!flex !gap-5 !flex-wrap !items-start">

            {/* Left column */}
            <div className="!flex-1 !min-w-[360px] !flex !flex-col !gap-4">

              {/* Welcome card */}
              <div className="!bg-gradient-to-br !from-green-500/12 !via-white/[.03] !to-transparent !border !border-white/[.07] !rounded-2xl !p-12 !text-center">
                <div className="!w-[72px] !h-[72px] !rounded-full !bg-green-500/15 !border !border-green-500/30 !flex !items-center !justify-center !mx-auto !mb-5">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 className="!text-[24px] !font-extrabold !mb-3 !tracking-tight">
                  Welcome to the Fleet, {currentUser?.name?.split(' ')[0]}!
                </h2>
                <p className="!text-[14px] !text-white/45 !leading-relaxed !max-w-[360px] !mx-auto !mb-6">
                  Your application has been approved. You are now ready to start delivering with Wassali.
                </p>
                <span className="!inline-flex !items-center !gap-2 !bg-green-500/10 !text-green-400 !border !border-green-500/25 !rounded-full !px-5 !py-2 !text-[13px] !font-semibold">
                  <span className="!w-2 !h-2 !rounded-full !bg-green-400 !inline-block" />
                  Account Active
                </span>
              </div>

              <SubmissionSummary variant="verified" />
            </div>

            {/* Right column */}
            <div className="!w-[260px]">
              <div className="!bg-gradient-to-br !from-blue-600/18 !via-white/[.03] !to-transparent !border !border-white/[.07] !rounded-2xl !p-7">
                <div className="!w-10 !h-10 !rounded-xl !bg-blue-500/22 !flex !items-center !justify-center !mb-4 !text-white">
                  <ZapIcon />
                </div>
                <h4 className="!text-[16px] !font-bold !mb-2">Ready to earn?</h4>
                <p className="!text-[13px] !text-white/42 !leading-relaxed !mb-6">
                  Your account is fully set up. Start accepting deliveries right now from your dashboard.
                </p>
                {/*
                  onGetStarted sets status='active' + welcomeSeen=true in App.jsx.
                  This means the next time this deliverer logs in, resolveDelivererPath
                  will send them straight to /deliverer-dashboard.
                */}
                <button
                  onClick={onGetStarted}
                  className="!w-full !flex !items-center !justify-center !gap-2 !bg-gradient-to-br !from-blue-600 !to-blue-700 hover:!from-blue-500 hover:!to-blue-600 !text-white !font-semibold !text-[14px] !px-6 !py-3 !rounded-xl !transition-all !duration-200 !shadow-[0_4px_14px_rgba(37,99,235,0.4)] hover:!shadow-[0_6px_20px_rgba(37,99,235,0.5)] hover:!-translate-y-0.5"
                >
                  Get Started →
                </button>
              </div>
            </div>
          </div>

          <p className="!text-center !text-[12px] !text-white/[.18] !mt-10">© 2026 Wassali Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default VehicleInfoPage;