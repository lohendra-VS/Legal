import React, { useState, useEffect, useRef } from "react";
import {
  Scale,
  Briefcase,
  Calendar,
  Clock,
  Camera,
  FolderOpen,
  Bell,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Share2,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Volume2,
  X,
  Eye,
  Info,
  RotateCw,
  Check,
  CalendarDays,
  Copy,
  ArrowUpRight,
  UploadCloud,
  Landmark,
  ShieldCheck
} from "lucide-react";

const MUSIRI_COURTS = [
  "Sub Court, Musiri",
  "District Munsif Court, Musiri",
  "Judicial Magistrate Court, Musiri",
  "Principal District Court, Tiruchirappalli",
  "Madurai Bench of Madras High Court",
  "Taluk Executive Magistrate / Tahsildar Court, Musiri"
];

const CASE_STAGES = [
  "Bail / Remand / Surrender",
  "Summons / Appearance of Parties",
  "Filing Written Statement / Counter",
  "Framing of Issues / Charges",
  "Petitioner / PW Evidence",
  "Respondent / DW Evidence",
  "Cross-Examination",
  "Interlocutory Application (IA) Enquiry",
  "Final Arguments",
  "Pronouncement of Orders / Judgment"
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState("portfolio");

  const [cases, setCases] = useState(() => {
    try {
      const saved = localStorage.getItem("vivek_musiri_cases");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [hearings, setHearings] = useState(() => {
    try {
      const saved = localStorage.getItem("vivek_musiri_hearings");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem("vivek_musiri_docs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [advocateSettings, setAdvocateSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("vivek_musiri_settings");
      return saved
        ? JSON.parse(saved)
        : {
            advocateName: "Vivek",
            qualifications: "M.Sc., B.L.",
            advocatePhone: "9894191077",
            barCouncilNo: "MS/Musiri/Bar",
            chamberAddress: "Chamber #4, Combined Court Complex, Musiri",
            enableT1Daemon: true,
            enableChime: true
          };
    } catch {
      return {
        advocateName: "Vivek",
        qualifications: "M.Sc., B.L.",
        advocatePhone: "9894191077",
        barCouncilNo: "MS/Musiri/Bar",
        chamberAddress: "Chamber #4, Combined Court Complex, Musiri",
        enableT1Daemon: true,
        enableChime: true
      };
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourtFilter, setSelectedCourtFilter] = useState("ALL");
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
  const [selectedCaseForAction, setSelectedCaseForAction] = useState(null);
  const [selectedCaseDetails, setSelectedCaseDetails] = useState(null);
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Splash Screen Timer & Initial Bell Chime
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("vivek_musiri_cases", JSON.stringify(cases));
    } catch (e) {
      showToast("Storage full! Remove older files.");
    }
  }, [cases]);

  useEffect(() => {
    try {
      localStorage.setItem("vivek_musiri_hearings", JSON.stringify(hearings));
    } catch (e) {}
  }, [hearings]);

  useEffect(() => {
    try {
      localStorage.setItem("vivek_musiri_docs", JSON.stringify(documents));
    } catch (e) {
      showToast("Document storage full! Delete older scans.");
    }
  }, [documents]);

  useEffect(() => {
    localStorage.setItem("vivek_musiri_settings", JSON.stringify(advocateSettings));
  }, [advocateSettings]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const playLegalChime = () => {
    if (!advocateSettings.enableChime) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch {}
  };

  const tomorrowISO = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const tomorrowHearings = hearings.filter((h) => h.hearingDate === tomorrowISO);

  const sendWhatsAppSelfReminder = () => {
    const list = tomorrowHearings.length > 0 ? tomorrowHearings : hearings;
    if (list.length === 0) {
      showToast("No hearings scheduled to export.");
      return;
    }
    let text = `*CHAMBERS OF ADV. VIVEK, M.Sc., B.L.*\n*Cause List Digest*\n----------------------------\n`;
    list.forEach((h, idx) => {
      text += `\n${idx + 1}. *${h.caseNo}* (${h.court})\n   Stage: ${h.stage}\n   Date: ${h.hearingDate}\n   Hall/Item: ${h.courtHall || "N/A"}\n`;
    });
    const phone = advocateSettings.advocatePhone.replace(/[^0-9]/g, "");
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans pb-20 md:pb-6 relative selection:bg-amber-100">
      
      {/* OPENING COURT SPLASH ANIMATION */}
      {showSplash && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white transition-opacity duration-700 animate-fadeIn">
          {/* Subtle Ambient Courthouse Background Silhouette */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600 via-slate-900 to-black pointer-events-none" />

          {/* Animated Crest */}
          <div className="relative mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-900 via-amber-700 to-amber-500 p-0.5 shadow-2xl shadow-amber-600/30 animate-pulse">
              <div className="w-full h-full bg-slate-950 rounded-3xl flex flex-col items-center justify-center border border-amber-400/40">
                <Landmark className="w-10 h-10 text-amber-400 mb-1" />
                <Scale className="w-5 h-5 text-amber-300" />
              </div>
            </div>
            <div className="absolute -inset-2 bg-amber-500/20 blur-xl -z-10 rounded-full" />
          </div>

          {/* Advocate Chambers Typography */}
          <div className="space-y-1 z-10">
            <p className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-semibold">
              Law Chambers of
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              ADVOCATE VIVEK
            </h1>
            <p className="text-xs font-mono font-medium text-slate-300">
              B.Sc., B.L. • Musiri Bar Association
            </p>
            <p className="text-[11px] text-amber-200/80 pt-1 font-serif italic">
              Sub Court • District Munsif & Judicial Magistrate Courts
            </p>
          </div>

          {/* Loading Bar & Enter Button */}
          <div className="mt-8 w-48 sm:w-56 space-y-3 z-10">
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-600 to-amber-300 rounded-full animate-[progress_2s_ease-in-out]" />
            </div>
            <button
              onClick={() => setShowSplash(false)}
              className="text-[11px] text-slate-400 hover:text-amber-300 font-semibold tracking-wider uppercase transition flex items-center justify-center gap-1 mx-auto"
            >
              <span>Enter Chambers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-5 z-50 bg-slate-900 text-amber-100 px-4 py-3 rounded-xl shadow-xl flex items-center justify-between text-xs sm:text-sm">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-serif font-bold text-slate-950 leading-tight">ADV. VIVEK</h1>
                <span className="text-[10px] bg-slate-100 border border-slate-300 font-mono px-1 rounded">B.Sc., B.L.</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">Musiri Bar Association</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={sendWhatsAppSelfReminder}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 sm:px-3 sm:py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              title="Share Cause List via WhatsApp"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp List</span>
            </button>
            <button
              onClick={() => setIsCaseModalOpen(true)}
              className="bg-slate-950 hover:bg-slate-800 text-white p-2 sm:px-3 sm:py-2 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Add Case</span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:flex max-w-6xl mx-auto px-4 border-t border-slate-100 space-x-6 text-xs font-semibold">
          {[
            { id: "portfolio", label: `Dockets (${cases.length})`, icon: Briefcase },
            { id: "diary", label: `Hearing Diary & Calendar (${hearings.length})`, icon: CalendarDays },
            { id: "scanner", label: "A4 Scanner & Cam", icon: Camera },
            { id: "vault", label: `Document Vault (${documents.length})`, icon: FolderOpen },
            { id: "reminders", label: "Advocate Settings", icon: Bell }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 flex items-center gap-2 border-b-2 transition ${
                activeTab === tab.id
                  ? "border-amber-600 text-amber-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 w-full flex-1">
        {activeTab === "portfolio" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search case no, client, court..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-800 focus:outline-none"
                />
              </div>
              <select
                value={selectedCourtFilter}
                onChange={(e) => setSelectedCourtFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Court Forums</option>
                {MUSIRI_COURTS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {cases.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center mt-4">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-serif font-bold text-slate-800 text-sm">Chamber Docket is Empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Click "Add Case" above to register your first Musiri court file.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cases
                  .filter((c) => {
                    const matchQ =
                      c.caseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.parties.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchC = selectedCourtFilter === "ALL" || c.court === selectedCourtFilter;
                    return matchQ && matchC;
                  })
                  .map((c) => (
                    <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                            {c.caseType}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[120px]">{c.court}</span>
                        </div>
                        <h3 className="font-serif font-bold text-base text-slate-900 mt-2">{c.caseNo}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1">{c.parties}</p>
                        <div className="mt-3 bg-slate-50 p-2 rounded text-[11px] text-slate-600 flex justify-between">
                          <span>Stage: <strong>{c.stage}</strong></span>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          onClick={() => setSelectedCaseDetails(c)}
                          className="font-bold text-amber-800 hover:text-amber-900"
                        >
                          View Details
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCaseForAction(c);
                              setIsHearingModalOpen(true);
                            }}
                            className="text-[11px] bg-slate-900 text-white px-2 py-1 rounded"
                          >
                            + Hearing
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove case ${c.caseNo}?`)) {
                                setCases(cases.filter((item) => item.id !== c.id));
                                setHearings(hearings.filter((h) => h.caseId !== c.id));
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* DIARY VIEW WITH COURT CALENDAR */}
        {activeTab === "diary" && (
          <HearingDiaryWithCalendar
            hearings={hearings}
            cases={cases}
            tomorrowISO={tomorrowISO}
            onOpenHearingModal={() => {
              setSelectedCaseForAction(cases[0] || null);
              setIsHearingModalOpen(true);
            }}
            onDeleteHearing={(id) => setHearings(hearings.filter((h) => h.id !== id))}
          />
        )}

        {/* SCANNER VIEW */}
        {activeTab === "scanner" && (
          <DocumentScannerComponent
            cases={cases}
            onSave={(newDoc) => {
              setDocuments([newDoc, ...documents]);
              showToast("Document saved to Vault.");
              setActiveTab("vault");
            }}
          />
        )}

        {/* VAULT VIEW */}
        {activeTab === "vault" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div>
                <h2 className="font-serif font-bold text-sm sm:text-base text-slate-900">Document Vault</h2>
                <p className="text-[11px] text-slate-500">Stored summons, Vakalatnamas, and court orders.</p>
              </div>
              <button
                onClick={() => setActiveTab("scanner")}
                className="bg-slate-950 text-white text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Scan New</span>
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center">
                <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Vault is empty. Take a photo or upload a paper document.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between"
                  >
                    <div
                      onClick={() => setSelectedDocPreview(doc)}
                      className="aspect-[3/4] bg-slate-100 cursor-pointer overflow-hidden relative group"
                    >
                      <img src={doc.imageData} alt={doc.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition">
                        <Eye className="w-4 h-4 mr-1 text-amber-400" /> Preview
                      </div>
                    </div>
                    <div className="p-2.5">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{doc.title}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{doc.caseNo}</p>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{doc.date}</span>
                        <button
                          onClick={() => setDocuments(documents.filter((d) => d.id !== doc.id))}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS VIEW */}
        {activeTab === "reminders" && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 max-w-xl mx-auto space-y-4">
            <h2 className="font-serif font-bold text-base text-slate-900 border-b pb-2">Advocate Chamber Settings</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Advocate Mobile / WhatsApp Number</label>
              <input
                type="text"
                placeholder="+91 94431..."
                value={advocateSettings.advocatePhone}
                onChange={(e) => setAdvocateSettings({ ...advocateSettings, advocatePhone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chamber Office Address</label>
              <input
                type="text"
                value={advocateSettings.chamberAddress}
                onChange={(e) => setAdvocateSettings({ ...advocateSettings, chamberAddress: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="chime"
                checked={advocateSettings.enableChime}
                onChange={(e) => setAdvocateSettings({ ...advocateSettings, enableChime: e.target.checked })}
              />
              <label htmlFor="chime" className="text-xs text-slate-700 font-medium">Enable Chamber Acoustic Alert Chime</label>
            </div>

            <div className="pt-3 border-t">
              <button
                onClick={playLegalChime}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Volume2 className="w-4 h-4 text-amber-700" />
                <span>Test Chamber Bell Chime</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex justify-around py-2 px-1 shadow-lg">
        {[
          { id: "portfolio", label: "Dockets", icon: Briefcase },
          { id: "diary", label: "Diary", icon: CalendarDays },
          { id: "scanner", label: "Scanner", icon: Camera },
          { id: "vault", label: "Vault", icon: FolderOpen },
          { id: "reminders", label: "Settings", icon: Bell }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2 rounded-lg ${
              activeTab === tab.id ? "text-amber-800 font-bold" : "text-slate-500"
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-amber-800" : "text-slate-400"}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* MODAL: ADD CASE */}
      {isCaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full p-5 space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-serif font-bold text-sm sm:text-base">Register Legal Matter</h3>
              <button onClick={() => setIsCaseModalOpen(false)} className="p-1"><X className="w-5 h-5" /></button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const newCase = {
                  id: "C-" + Date.now(),
                  caseNo: form.caseNo.value.trim(),
                  caseType: form.caseType.value,
                  parties: form.parties.value.trim(),
                  court: form.court.value,
                  stage: form.stage.value
                };
                setCases([newCase, ...cases]);
                setIsCaseModalOpen(false);
                showToast(`Case ${newCase.caseNo} registered.`);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Case Number / CNR</label>
                <input required name="caseNo" placeholder="e.g. O.S. 42/2026" className="w-full border p-2 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Matter Type</label>
                  <select name="caseType" className="w-full border p-2 rounded bg-white">
                    <option>O.S. (Civil Suit)</option>
                    <option>C.C. (Criminal Case)</option>
                    <option>I.A. (Interlocutory)</option>
                    <option>MCOP (Accident)</option>
                    <option>E.P. (Execution)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Court Forum</label>
                  <select name="court" className="w-full border p-2 rounded bg-white">
                    {MUSIRI_COURTS.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Parties (Petitioner vs Respondent)</label>
                <input required name="parties" placeholder="e.g. Ramasamy vs. Subramanian" className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Current Stage</label>
                <select name="stage" className="w-full border p-2 rounded bg-white">
                  {CASE_STAGES.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsCaseModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-950 text-white font-bold rounded">Save Case</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG HEARING */}
      {isHearingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-serif font-bold text-sm sm:text-base">Schedule Hearing Date</h3>
              <button onClick={() => setIsHearingModalOpen(false)} className="p-1"><X className="w-5 h-5" /></button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const matchedCase = cases.find((c) => c.id === form.caseId.value);
                const newHearing = {
                  id: "H-" + Date.now(),
                  caseId: form.caseId.value,
                  caseNo: matchedCase ? matchedCase.caseNo : "Matter",
                  court: matchedCase ? matchedCase.court : "Musiri",
                  hearingDate: form.hearingDate.value,
                  stage: form.stage.value,
                  courtHall: form.courtHall.value.trim(),
                  notes: form.notes.value.trim()
                };
                setHearings([newHearing, ...hearings]);
                setIsHearingModalOpen(false);
                showToast(`Hearing scheduled for ${newHearing.hearingDate}`);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Select Case</label>
                <select name="caseId" defaultValue={selectedCaseForAction?.id || cases[0]?.id} className="w-full border p-2 rounded bg-white">
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>{c.caseNo} - {c.parties}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Date</label>
                  <input required name="hearingDate" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Court Hall / Item</label>
                  <input name="courtHall" placeholder="e.g. Hall 1, Item 12" className="w-full border p-2 rounded" />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Purpose / Stage</label>
                <select name="stage" className="w-full border p-2 rounded bg-white">
                  {CASE_STAGES.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Advocate Chamber Prep Note</label>
                <input name="notes" placeholder="e.g. Cross of PW1; keep deeds ready" className="w-full border p-2 rounded" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsHearingModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-950 text-white font-bold rounded">Record Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CASE DETAILS */}
      {selectedCaseDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-3">
            <div className="flex justify-between items-start border-b pb-2">
              <div>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">{selectedCaseDetails.caseType}</span>
                <h3 className="font-serif font-bold text-lg mt-1">{selectedCaseDetails.caseNo}</h3>
              </div>
              <button onClick={() => setSelectedCaseDetails(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="text-xs space-y-2 text-slate-700">
              <p><strong>Parties:</strong> {selectedCaseDetails.parties}</p>
              <p><strong>Court:</strong> {selectedCaseDetails.court}</p>
              <p><strong>Current Stage:</strong> {selectedCaseDetails.stage}</p>
            </div>
            <div className="pt-3 border-t flex justify-end">
              <button onClick={() => setSelectedCaseDetails(null)} className="px-4 py-1.5 bg-slate-950 text-white rounded text-xs font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IMAGE PREVIEW */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-2xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center pb-2 border-b">
              <h4 className="font-bold text-xs truncate">{selectedDocPreview.title}</h4>
              <button onClick={() => setSelectedDocPreview(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-auto py-2 flex items-center justify-center">
              <img src={selectedDocPreview.imageData} alt="Doc" className="max-h-[65vh] object-contain rounded" />
            </div>
            <button onClick={() => setSelectedDocPreview(null)} className="w-full py-2 bg-slate-950 text-white rounded text-xs font-bold mt-2">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// CALENDAR & HEARING DIARY COMBINED COMPONENT
function HearingDiaryWithCalendar({
  hearings,
  cases,
  tomorrowISO,
  onOpenHearingModal,
  onDeleteHearing
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const hearingCountMap = {};
  hearings.forEach((h) => {
    if (h.hearingDate) {
      hearingCountMap[h.hearingDate] = (hearingCountMap[h.hearingDate] || 0) + 1;
    }
  });

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ dayNumber: d, dateISO: dStr, count: hearingCountMap[dStr] || 0 });
  }

  const displayedHearings = selectedDate
    ? hearings.filter((h) => h.hearingDate === selectedDate)
    : [...hearings].sort((a, b) => new Date(a.hearingDate) - new Date(b.hearingDate));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="font-serif font-bold text-sm sm:text-base text-slate-900">
            Advocate Vivek's Hearing Diary & Court Calendar
          </h2>
          <p className="text-[11px] text-slate-500">
            Interactive cause list with listing counters per date.
          </p>
        </div>
        <button
          onClick={onOpenHearingModal}
          disabled={cases.length === 0}
          className="bg-slate-950 disabled:opacity-40 text-white text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-1 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>Log Date</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-700" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">
              {monthNames[month]} {year}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCurrentDate(new Date());
                setSelectedDate(todayStr);
              }}
              className="text-[11px] font-semibold px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 mb-2 uppercase">
          <span className="text-rose-500">Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((item, idx) => {
            if (!item) {
              return <div key={`empty-${idx}`} className="min-h-[50px] sm:min-h-[64px] bg-slate-50/50 rounded-lg" />;
            }

            const isToday = item.dateISO === todayStr;
            const isTomorrow = item.dateISO === tomorrowISO;
            const isSelected = item.dateISO === selectedDate;
            const hasHearings = item.count > 0;

            return (
              <div
                key={item.dateISO}
                onClick={() => setSelectedDate(isSelected ? null : item.dateISO)}
                className={`min-h-[50px] sm:min-h-[64px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition relative ${
                  isSelected
                    ? "border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20"
                    : isToday
                    ? "border-slate-800 bg-slate-50 font-bold"
                    : isTomorrow
                    ? "border-amber-400 bg-amber-50/30"
                    : hasHearings
                    ? "border-amber-200 bg-amber-50/20 hover:border-amber-400"
                    : "border-slate-100 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      isToday
                        ? "bg-slate-950 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold"
                        : "text-slate-800"
                    }`}
                  >
                    {item.dayNumber}
                  </span>

                  {isTomorrow && (
                    <span className="text-[9px] bg-amber-500 text-white px-1 rounded font-bold uppercase hidden sm:inline">
                      T-1
                    </span>
                  )}
                </div>

                {hasHearings ? (
                  <div className="mt-1 flex items-center justify-end">
                    <span
                      className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs ${
                        isTomorrow
                          ? "bg-amber-600 text-white animate-pulse"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      <span className="text-[9px] font-normal hidden sm:inline">Listings:</span>
                      {item.count}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-300 self-end">—</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900" /> Today
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" /> Tomorrow (T-1)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-md bg-amber-100 border border-amber-300" /> Hearings Listed
            </span>
          </div>

          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-amber-800 font-bold hover:underline"
            >
              Clear Filter (Show All)
            </button>
          )}
        </div>
      </div>

      {selectedDate && (
        <div className="bg-amber-100/70 border border-amber-300 p-3 rounded-xl flex items-center justify-between text-xs text-amber-950">
          <span>
            Displaying appearances for: <strong>{selectedDate}</strong> ({displayedHearings.length} matter(s))
          </span>
          <button
            onClick={() => setSelectedDate(null)}
            className="text-[11px] font-bold text-amber-900 underline"
          >
            Show All Dates
          </button>
        </div>
      )}

      {displayedHearings.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center">
          <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">
            {selectedDate
              ? `No hearings scheduled on ${selectedDate}.`
              : "No court appearances scheduled in the diary."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedHearings.map((h) => {
            const isTomorrow = h.hearingDate === tomorrowISO;
            return (
              <div
                key={h.id}
                className={`bg-white border rounded-xl p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2 shadow-2xs ${
                  isTomorrow ? "border-amber-400 bg-amber-50/40 ring-1 ring-amber-300" : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {h.hearingDate}
                    </span>
                    {isTomorrow && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 animate-pulse">
                        Listed Tomorrow (T-1)
                      </span>
                    )}
                    <span className="text-xs text-slate-500">{h.courtHall}</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-slate-900 mt-1">{h.caseNo}</h4>
                  <p className="text-xs text-slate-600">Stage: <strong>{h.stage}</strong></p>
                  {h.notes && <p className="text-[11px] text-amber-900 italic mt-0.5">Prep: {h.notes}</p>}
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => onDeleteHearing(h.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                    title="Remove Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// DOCUMENT SCANNER COMPONENT
function DocumentScannerComponent({ cases, onSave }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [filterMode, setFilterMode] = useState("contrast");
  const [rotation, setRotation] = useState(0);
  const [title, setTitle] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState("");

  const startLiveCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      alert("Direct camera access blocked. Please use the 'Camera Photo' or 'Upload File' button below.");
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const captureLiveFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    processAndSetImage(canvas.toDataURL("image/jpeg", 0.7));
    stopLiveCamera();
  };

  const handleMobileCameraFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 900;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        processAndSetImage(canvas.toDataURL("image/jpeg", 0.65));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const processAndSetImage = (dataUrl) => {
    setCapturedImage(dataUrl);
    setRotation(0);
  };

  const handleSaveToVault = () => {
    if (!capturedImage || !title.trim()) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const isSideways = rotation === 90 || rotation === 270;
      canvas.width = isSideways ? img.height : img.width;
      canvas.height = isSideways ? img.width : img.height;
      const ctx = canvas.getContext("2d");

      if (filterMode === "bw") {
        ctx.filter = "grayscale(100%) contrast(150%)";
      } else if (filterMode === "contrast") {
        ctx.filter = "contrast(180%) brightness(95%)";
      } else {
        ctx.filter = "none";
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const finalCompressedImage = canvas.toDataURL("image/jpeg", 0.7);
      const matched = cases.find((c) => c.id === selectedCaseId);

      onSave({
        id: "DOC-" + Date.now(),
        title: title.trim(),
        caseNo: matched ? matched.caseNo : "General File",
        caseId: selectedCaseId || null,
        imageData: finalCompressedImage,
        date: new Date().toLocaleDateString("en-IN")
      });
    };
    img.src = capturedImage;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-2xs max-w-2xl mx-auto space-y-4">
      <div className="border-b pb-2">
        <h2 className="font-serif font-bold text-base text-slate-900">Document Scanner & Photo Capture</h2>
        <p className="text-[11px] text-slate-500">Take a photo or upload Vakalatnamas, plaints, or summons.</p>
      </div>

      <div className="relative aspect-[3/4] max-h-[380px] sm:max-h-[460px] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-300">
        {isStreaming ? (
          <video ref={videoRef} playsInline muted autoPlay className="w-full h-full object-cover" />
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            style={{
              transform: `rotate(${rotation}deg)`,
              filter:
                filterMode === "bw"
                  ? "grayscale(100%) contrast(150%)"
                  : filterMode === "contrast"
                  ? "contrast(180%) brightness(95%)"
                  : "none"
            }}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center p-6 text-slate-400">
            <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold">No Document Loaded</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Use camera or upload a file from your phone.</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <label className="flex-1 min-w-[130px] bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs">
          <Camera className="w-4 h-4" />
          <span>Camera Photo</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleMobileCameraFile}
            className="hidden"
          />
        </label>

        <label className="flex-1 min-w-[130px] bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300">
          <UploadCloud className="w-4 h-4" />
          <span>Upload File</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleMobileCameraFile}
            className="hidden"
          />
        </label>

        {!isStreaming ? (
          <button
            onClick={startLiveCamera}
            className="px-3 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Live Cam
          </button>
        ) : (
          <button
            onClick={captureLiveFrame}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold animate-pulse"
          >
            Snap Frame
          </button>
        )}
      </div>

      {capturedImage && (
        <div className="pt-3 border-t border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Filter:</span>
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="border p-1.5 rounded bg-white text-xs"
              >
                <option value="raw">Original Clean</option>
                <option value="contrast">High Contrast</option>
                <option value="bw">Legal B&W</option>
              </select>
            </div>

            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-2 border border-slate-300 rounded flex items-center gap-1 hover:bg-slate-50"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate 90°</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">Document Title *</label>
              <input
                required
                type="text"
                placeholder="e.g. Vakalatnama Signed, Bail Order"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Link to Case</label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full border p-2 rounded bg-white"
              >
                <option value="">General Chamber Record</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNo} ({c.parties})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveToVault}
            disabled={!title.trim()}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold rounded-lg shadow-2xs text-xs"
          >
            Archive to Digital Vault
          </button>
        </div>
      )}
    </div>
  );
}
