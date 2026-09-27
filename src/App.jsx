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
  RefreshCw,
  Server
} from "lucide-react";

const getApiBaseUrl = () => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) {
      return import.meta.env.VITE_API_BASE;
    }
  } catch (e) {
    // Environment lookup fallback
  }
  // If hosted on the same domain or behind a reverse proxy
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "/api";
  }
  return "http://localhost:5000/api";
};

const API_BASE = getApiBaseUrl();

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
  const [activeTab, setActiveTab] = useState("portfolio");
  const [backendOnline, setBackendOnline] = useState(false);

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
            qualifications: "B.Sc., B.L.",
            advocatePhone: "",
            barCouncilNo: "MS/Musiri/Bar",
            chamberAddress:
              "Chamber #4, Opp. Combined Court Complex, Musiri, Tiruchirappalli - 621211",
            enableT1Daemon: true,
            enableChime: true,
            enablePush: true,
            t1AlertTime: "20:00"
          };
    } catch {
      return {
        advocateName: "Vivek",
        qualifications: "B.Sc., B.L.",
        advocatePhone: "",
        barCouncilNo: "MS/Musiri/Bar",
        chamberAddress:
          "Chamber #4, Opp. Combined Court Complex, Musiri, Tiruchirappalli - 621211",
        enableT1Daemon: true,
        enableChime: true,
        enablePush: true,
        t1AlertTime: "20:00"
      };
    }
  });

  const [autoReminderLogs, setAutoReminderLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("vivek_musiri_logs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourtFilter, setSelectedCourtFilter] = useState("ALL");
  const [caseTypeFilter, setCaseTypeFilter] = useState("ALL");
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
  const [selectedCaseForAction, setSelectedCaseForAction] = useState(null);
  const [selectedCaseDetails, setSelectedCaseDetails] = useState(null);
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchBackendData = async () => {
    try {
      const [casesRes, hearingsRes, docsRes, settingsRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/cases`).catch(() => null),
        fetch(`${API_BASE}/hearings`).catch(() => null),
        fetch(`${API_BASE}/documents`).catch(() => null),
        fetch(`${API_BASE}/settings`).catch(() => null),
        fetch(`${API_BASE}/logs`).catch(() => null)
      ]);

      let anySuccess = false;

      if (casesRes && casesRes.ok) {
        const casesData = await casesRes.json();
        setCases(casesData);
        localStorage.setItem("vivek_musiri_cases", JSON.stringify(casesData));
        anySuccess = true;
      }
      if (hearingsRes && hearingsRes.ok) {
        const hearingsData = await hearingsRes.json();
        setHearings(hearingsData);
        localStorage.setItem("vivek_musiri_hearings", JSON.stringify(hearingsData));
        anySuccess = true;
      }
      if (docsRes && docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData);
        localStorage.setItem("vivek_musiri_docs", JSON.stringify(docsData));
        anySuccess = true;
      }
      if (settingsRes && settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setAdvocateSettings(settingsData);
        localStorage.setItem("vivek_musiri_settings", JSON.stringify(settingsData));
        anySuccess = true;
      }
      if (logsRes && logsRes.ok) {
        const logsData = await logsRes.json();
        setAutoReminderLogs(logsData);
        localStorage.setItem("vivek_musiri_logs", JSON.stringify(logsData));
        anySuccess = true;
      }

      setBackendOnline(anySuccess);
    } catch {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
    const pollInterval = setInterval(fetchBackendData, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    localStorage.setItem("vivek_musiri_cases", JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem("vivek_musiri_hearings", JSON.stringify(hearings));
  }, [hearings]);

  useEffect(() => {
    localStorage.setItem("vivek_musiri_docs", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem("vivek_musiri_settings", JSON.stringify(advocateSettings));
  }, [advocateSettings]);

  useEffect(() => {
    localStorage.setItem("vivek_musiri_logs", JSON.stringify(autoReminderLogs));
  }, [autoReminderLogs]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4200);
  };

  const playLegalChime = () => {
    if (!advocateSettings.enableChime) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();

      const primaryOsc = audioCtx.createOscillator();
      const overtoneOsc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      primaryOsc.type = "sine";
      primaryOsc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      primaryOsc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.35); // A5

      overtoneOsc.type = "triangle";
      overtoneOsc.frequency.setValueAtTime(1174.66, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.95);

      primaryOsc.connect(gainNode);
      overtoneOsc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      primaryOsc.start();
      overtoneOsc.start();
      primaryOsc.stop(audioCtx.currentTime + 1.0);
      overtoneOsc.stop(audioCtx.currentTime + 1.0);
    } catch {
      // Audio playback fallback
    }
  };

  useEffect(() => {
    if (!advocateSettings.enableT1Daemon) return;

    const checkTomorrowHearings = () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowISO = tomorrow.toISOString().split("T")[0];

      const tomorrowList = hearings.filter((h) => h.hearingDate === tomorrowISO);

      if (tomorrowList.length > 0) {
        const todayStr = today.toISOString().split("T")[0];
        const alreadyLogged = autoReminderLogs.some(
          (log) => log.dispatchDate === todayStr && log.type === "T1_AUTOMATED"
        );

        if (!alreadyLogged) {
          playLegalChime();

          if (advocateSettings.enablePush && "Notification" in window) {
            if (Notification.permission === "granted") {
              try {
                new Notification("T-1 Hearing Alert: Adv. Vivek, Musiri", {
                  body: `You have ${tomorrowList.length} matter(s) listed tomorrow in Musiri / Trichy courts. Cause list is ready for review.`,
                  icon: "https://cdn-icons-png.flaticon.com/512/3253/3253246.png"
                });
              } catch (e) {
                // Mobile notification fallback
              }
            }
          }

          const newLog = {
            id: "LOG-" + Date.now(),
            dispatchDate: todayStr,
            targetHearingDate: tomorrowISO,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            casesCount: tomorrowList.length,
            recipientPhone: advocateSettings.advocatePhone || "Not Configured",
            matters: tomorrowList.map((h) => `${h.caseNo} (${h.court})`),
            type: "T1_AUTOMATED"
          };

          setAutoReminderLogs((prev) => [newLog, ...prev]);
          showToast(`Automated T-1 Alert: ${tomorrowList.length} matter(s) listed for appearance tomorrow.`);
        }
      }
    };

    checkTomorrowHearings();
    const daemonInterval = setInterval(checkTomorrowHearings, 45000);
    return () => clearInterval(daemonInterval);
  }, [hearings, advocateSettings, autoReminderLogs]);

  const requestPushPermission = async () => {
    if ("Notification" in window) {
      try {
        const res = await Notification.requestPermission();
        if (res === "granted") {
          showToast("Browser push notifications authorized for Adv. Vivek.");
        } else {
          showToast("Notification permission was not granted.");
        }
      } catch {
        showToast("Push notification request failed.");
      }
    } else {
      showToast("Push notifications not supported on this browser.");
    }
  };

  const generateWhatsAppMessage = (listToNotify) => {
    const todayStr = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    let msg = `*CHAMBERS OF ADV. VIVEK, B.Sc., B.L.*\n`;
    msg += `*Musiri Bar Association & Combined Court Complex*\n`;
    msg += `*HEARING DIARY & CAUSE LIST DIGEST (${todayStr})*\n`;
    msg += `═══════════════════════════════════════\n\n`;

    listToNotify.forEach((h, idx) => {
      msg += `*${idx + 1}. ${h.caseNo}*\n`;
      msg += `   🏛️ *Court:* ${h.court}\n`;
      msg += `   ⚖️ *Parties:* ${h.parties || "N/A"}\n`;
      msg += `   📌 *Stage:* ${h.stage}\n`;
      msg += `   📅 *Date:* ${h.hearingDate}\n`;
      if (h.courtHall) msg += `   📍 *Hall/Item:* ${h.courtHall}\n`;
      if (h.notes) msg += `   📝 *Chamber Prep:* ${h.notes}\n`;
      msg += `\n`;
    });

    msg += `_Chamber Vault & Scanned Records: Verified._`;
    return msg;
  };

  const sendWhatsAppSelfReminder = (customHearings = null) => {
    const listToNotify = customHearings || hearings;
    if (listToNotify.length === 0) {
      showToast("No scheduled hearings found to prepare WhatsApp digest.");
      return;
    }

    if (!advocateSettings.advocatePhone.trim()) {
      showToast("Please enter Advocate Vivek's phone number in Advocate Alerts tab.");
      setActiveTab("reminders");
      return;
    }

    const msg = generateWhatsAppMessage(listToNotify);
    const cleanPhone = advocateSettings.advocatePhone.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
    showToast("Opening WhatsApp with Adv. Vivek's cause list.");
  };

  const tomorrowISO = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const tomorrowHearings = hearings.filter((h) => h.hearingDate === tomorrowISO);
  const next7DaysHearings = hearings.filter((h) => {
    const diff = (new Date(h.hearingDate) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-100 selection:text-amber-950">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-950 text-amber-50 border border-amber-500/30 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Official Legal Executive Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            
            {/* Advocate Brand Crest */}
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-amber-400 flex items-center justify-center shadow-md border border-amber-500/30">
                  <Scale className="w-6 h-6 text-amber-400" />
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                    backendOnline ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  title={backendOnline ? "Node.js Backend Connected" : "Local Storage Chamber Mode"}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 font-serif">
                    VIVEK
                  </h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                    B.Sc., B.L.
                  </span>
                  <span className="hidden sm:inline-flex bg-amber-500/10 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-amber-500/20">
                    Advocate
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[260px] sm:max-w-md">
                  Musiri Bar Association • Sub Court, Munsif & JM Court, Trichy Dist.
                </p>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-2.5">
              <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-600">
                <Server className={`w-3.5 h-3.5 ${backendOnline ? "text-emerald-600" : "text-amber-600"}`} />
                <span>
                  Storage:{" "}
                  <strong className={backendOnline ? "text-emerald-700" : "text-amber-700"}>
                    {backendOnline ? "Connected" : "Local Active"}
                  </strong>
                </span>
              </div>

              <button
                onClick={() => sendWhatsAppSelfReminder()}
                className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-semibold px-3 sm:px-3.5 py-2 rounded-lg transition shadow-sm"
                title="Send cause list digest to Adv. Vivek's WhatsApp"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
                <span className="hidden sm:inline">Send To My WhatsApp</span>
                <span className="sm:hidden">WhatsApp</span>
              </button>

              <button
                onClick={() => setIsCaseModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition shadow-sm border border-slate-800"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>New Case File</span>
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="border-t border-slate-100 flex items-center justify-between overflow-x-auto py-1.5">
            <nav className="flex space-x-1 sm:space-x-2">
              {[
                { id: "portfolio", label: "Case Docket", icon: Briefcase, count: cases.length },
                { id: "diary", label: "Hearing Diary", icon: CalendarDays, count: hearings.length },
                { id: "scanner", label: "Hard-Copy Scanner", icon: Camera },
                { id: "vault", label: "Digital Vault", icon: FolderOpen, count: documents.length },
                { id: "reminders", label: "T-1 Eve Alerts", icon: Bell, badge: tomorrowHearings.length }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono ${
                          isActive ? "bg-slate-800 text-amber-300" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="text-xs text-slate-500 font-mono hidden md:flex items-center gap-2 pl-4">
              <span>Bar Roll:</span>
              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-semibold border border-slate-200">
                {advocateSettings.barCouncilNo}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Chamber KPI Stat Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Dockets</p>
              <h3 className="text-2xl font-bold font-serif text-slate-950 mt-0.5">{cases.length}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Musiri Court matters</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab("reminders")}
            className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-400 transition group"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">Tomorrow (T-1)</p>
                {tomorrowHearings.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                )}
              </div>
              <h3 className="text-2xl font-bold font-serif text-amber-900 mt-0.5">{tomorrowHearings.length}</h3>
              <p className="text-[11px] text-amber-700/80 mt-0.5">Listed for appearance</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100/60 border border-amber-300 text-amber-900 flex items-center justify-center group-hover:bg-amber-100 transition">
              <Bell className="w-5 h-5 text-amber-800" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Next 7 Days</p>
              <h3 className="text-2xl font-bold font-serif text-slate-950 mt-0.5">{next7DaysHearings.length}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Cause list scheduled</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab("vault")}
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-slate-400 transition"
          >
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vault Records</p>
              <h3 className="text-2xl font-bold font-serif text-slate-950 mt-0.5">{documents.length}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Scanned paper copies</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
          </div>

        </div>
      </section>

      {/* Main Tab Router */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === "portfolio" && (
          <CasePortfolioView
            cases={cases}
            hearings={hearings}
            documents={documents}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCourtFilter={selectedCourtFilter}
            setSelectedCourtFilter={setSelectedCourtFilter}
            caseTypeFilter={caseTypeFilter}
            setCaseTypeFilter={setCaseTypeFilter}
            onOpenNewCaseModal={() => setIsCaseModalOpen(true)}
            onOpenHearingModal={(caseItem) => {
              setSelectedCaseForAction(caseItem);
              setIsHearingModalOpen(true);
            }}
            onViewCaseDetails={(caseItem) => setSelectedCaseDetails(caseItem)}
            onDeleteCasePrompt={(caseItem) => setDeleteConfirmation({ type: "CASE", target: caseItem })}
          />
        )}

        {activeTab === "diary" && (
          <HearingsDiaryView
            hearings={hearings}
            cases={cases}
            onOpenHearingModal={(c) => {
              setSelectedCaseForAction(c || null);
              setIsHearingModalOpen(true);
            }}
            onDeleteHearingPrompt={(h) => setDeleteConfirmation({ type: "HEARING", target: h })}
            onSendWhatsApp={sendWhatsAppSelfReminder}
          />
        )}

        {activeTab === "scanner" && (
          <HardCopyScannerView
            cases={cases}
            onSaveScannedDocument={async (newDoc) => {
              setDocuments((prev) => [newDoc, ...prev]);
              try {
                await fetch(`${API_BASE}/documents`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(newDoc)
                }).catch(() => null);
              } catch {
                // local fallback
              }
              showToast(`Document "${newDoc.title}" archived in Vault.`);
              setActiveTab("vault");
            }}
          />
        )}

        {activeTab === "vault" && (
          <DocumentVaultView
            documents={documents}
            cases={cases}
            onPreviewDocument={(doc) => setSelectedDocPreview(doc)}
            onDeleteDocPrompt={(doc) => setDeleteConfirmation({ type: "DOC", target: doc })}
            onOpenScanner={() => setActiveTab("scanner")}
          />
        )}

        {activeTab === "reminders" && (
          <AdvocateRemindersView
            settings={advocateSettings}
            onUpdateSettings={async (newSettings) => {
              setAdvocateSettings(newSettings);
              try {
                await fetch(`${API_BASE}/settings`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(newSettings)
                }).catch(() => null);
              } catch {
                // local fallback
              }
            }}
            hearings={hearings}
            logs={autoReminderLogs}
            onTestAlert={async () => {
              playLegalChime();
              try {
                const res = await fetch(`${API_BASE}/notifications/test-t1`, { method: "POST" }).catch(() => null);
                if (res && res.ok) {
                  const data = await res.json();
                  setAutoReminderLogs((prev) => [data.log, ...prev]);
                }
              } catch {
                // local fallback
              }
              showToast("Acoustic chamber bell sounded. T-1 notification simulated.");
            }}
            onRequestPushPermission={requestPushPermission}
            onSendWhatsApp={sendWhatsAppSelfReminder}
            generateWhatsAppMessage={generateWhatsAppMessage}
          />
        )}
      </main>

      {/* Chamber Official Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-serif text-slate-800 font-semibold tracking-wide">
            CHAMBERS OF ADV. VIVEK, B.Sc., B.L. — Musiri, Tamil Nadu
          </p>
          <p className="text-[11px] text-slate-400">
            Combined Court Complex, Musiri • Practicing before Sub Court, Munsif Court & JM Court
          </p>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      {isCaseModalOpen && (
        <NewCaseModal
          onClose={() => setIsCaseModalOpen(false)}
          onSaveCase={async (newCase) => {
            setCases((prev) => [newCase, ...prev]);
            try {
              await fetch(`${API_BASE}/cases`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCase)
              }).catch(() => null);
            } catch {
              // local fallback
            }
            setIsCaseModalOpen(false);
            showToast(`Case ${newCase.caseNo} registered successfully.`);
          }}
        />
      )}

      {isHearingModalOpen && (
        <RecordHearingModal
          cases={cases}
          preSelectedCase={selectedCaseForAction}
          onClose={() => {
            setIsHearingModalOpen(false);
            setSelectedCaseForAction(null);
          }}
          onSaveHearing={async (newHearing) => {
            setHearings((prev) => [newHearing, ...prev]);
            setCases((prev) =>
              prev.map((c) =>
                c.id === newHearing.caseId
                  ? { ...c, stage: newHearing.stage, nextHearingDate: newHearing.hearingDate }
                  : c
              )
            );
            try {
              await fetch(`${API_BASE}/hearings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newHearing)
              }).catch(() => null);
            } catch {
              // local fallback
            }
            setIsHearingModalOpen(false);
            setSelectedCaseForAction(null);
            showToast(`Hearing for ${newHearing.caseNo} logged for ${newHearing.hearingDate}.`);
          }}
        />
      )}

      {selectedCaseDetails && (
        <CaseDetailsModal
          caseItem={selectedCaseDetails}
          hearings={hearings.filter((h) => h.caseId === selectedCaseDetails.id)}
          documents={documents.filter((d) => d.caseId === selectedCaseDetails.id)}
          onClose={() => setSelectedCaseDetails(null)}
          onOpenHearingModal={() => {
            setSelectedCaseForAction(selectedCaseDetails);
            setSelectedCaseDetails(null);
            setIsHearingModalOpen(true);
          }}
          onPreviewDoc={(doc) => setSelectedDocPreview(doc)}
        />
      )}

      {deleteConfirmation && (
        <DeleteConfirmModal
          confirmation={deleteConfirmation}
          onCancel={() => setDeleteConfirmation(null)}
          onConfirm={async () => {
            if (deleteConfirmation.type === "CASE") {
              const caseId = deleteConfirmation.target.id;
              setCases((prev) => prev.filter((c) => c.id !== caseId));
              setHearings((prev) => prev.filter((h) => h.caseId !== caseId));
              try {
                await fetch(`${API_BASE}/cases/${caseId}`, { method: "DELETE" }).catch(() => null);
              } catch {}
              showToast(`Case ${deleteConfirmation.target.caseNo} removed.`);
            } else if (deleteConfirmation.type === "HEARING") {
              const hrgId = deleteConfirmation.target.id;
              setHearings((prev) => prev.filter((h) => h.id !== hrgId));
              try {
                await fetch(`${API_BASE}/hearings/${hrgId}`, { method: "DELETE" }).catch(() => null);
              } catch {}
              showToast("Hearing record removed.");
            } else if (deleteConfirmation.type === "DOC") {
              const docId = deleteConfirmation.target.id;
              setDocuments((prev) => prev.filter((d) => d.id !== docId));
              try {
                await fetch(`${API_BASE}/documents/${docId}`, { method: "DELETE" }).catch(() => null);
              } catch {}
              showToast("Document deleted from vault.");
            }
            setDeleteConfirmation(null);
          }}
        />
      )}

      {selectedDocPreview && (
        <DocumentPreviewModal
          doc={selectedDocPreview}
          onClose={() => setSelectedDocPreview(null)}
        />
      )}
    </div>
  );
}

function CasePortfolioView({
  cases,
  hearings,
  documents,
  searchQuery,
  setSearchQuery,
  selectedCourtFilter,
  setSelectedCourtFilter,
  caseTypeFilter,
  setCaseTypeFilter,
  onOpenNewCaseModal,
  onOpenHearingModal,
  onViewCaseDetails,
  onDeleteCasePrompt
}) {
  const filteredCases = cases.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.caseNo.toLowerCase().includes(q) ||
      c.parties.toLowerCase().includes(q) ||
      c.caseType.toLowerCase().includes(q) ||
      (c.crimeNo && c.crimeNo.toLowerCase().includes(q));

    const matchesCourt = selectedCourtFilter === "ALL" || c.court === selectedCourtFilter;
    const matchesType =
      caseTypeFilter === "ALL" ||
      (caseTypeFilter === "CIVIL" && ["O.S.", "A.S.", "E.P.", "I.A."].some((t) => c.caseType.includes(t))) ||
      (caseTypeFilter === "CRIMINAL" && ["C.C.", "Crl.M.P.", "M.C."].some((t) => c.caseType.includes(t)));

    return matchesSearch && matchesCourt && matchesType;
  });

  return (
    <div className="space-y-5">
      {/* Search and Filter Ribbon */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Case No (O.S. 42/2026), Parties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800 transition"
            />
          </div>

          <select
            value={selectedCourtFilter}
            onChange={(e) => setSelectedCourtFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
          >
            <option value="ALL">All Musiri & Trichy Court Forums</option>
            {MUSIRI_COURTS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200">
            {["ALL", "CIVIL", "CRIMINAL"].map((type) => (
              <button
                key={type}
                onClick={() => setCaseTypeFilter(type)}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition ${
                  caseTypeFilter === type
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onOpenNewCaseModal}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Register Case</span>
        </button>
      </div>

      {/* Case Grid */}
      {filteredCases.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-serif font-bold text-slate-900">Docket is Clean</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
            No case records match your current filter. Register your first case matter from the Sub Court,
            Munsif Court, or Judicial Magistrate Court of Musiri.
          </p>
          <button
            onClick={onOpenNewCaseModal}
            className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add First Matter</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((caseItem) => {
            const caseHearings = hearings.filter((h) => h.caseId === caseItem.id);
            const caseDocs = documents.filter((d) => d.caseId === caseItem.id);
            
            const stageIndex = CASE_STAGES.findIndex((s) => s.toLowerCase() === caseItem.stage.toLowerCase());
            const progressPercent = Math.max(15, Math.min(100, ((stageIndex + 1) / CASE_STAGES.length) * 100));

            const isCivil = ["O.S.", "A.S.", "E.P.", "I.A."].some((t) => caseItem.caseType.includes(t));

            return (
              <div
                key={caseItem.id}
                className="bg-white border border-slate-200 hover:border-amber-400/80 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 border-b border-slate-100 flex-1">
                  
                  {/* Top Tags */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span
                      className={`text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-md border ${
                        isCivil
                          ? "bg-blue-50 text-blue-900 border-blue-200"
                          : "bg-rose-50 text-rose-900 border-rose-200"
                      }`}
                    >
                      {caseItem.caseType}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                      {caseItem.clientRole}
                    </span>
                  </div>

                  {/* Case Number & Parties */}
                  <h4 className="text-base font-bold text-slate-950 font-serif mb-1 group-hover:text-amber-900 transition">
                    {caseItem.caseNo}
                  </h4>

                  <p className="text-xs text-slate-700 font-medium mb-3 line-clamp-2 leading-relaxed">
                    {caseItem.parties}
                  </p>

                  {/* Court Venue & Bench */}
                  <div className="text-xs text-slate-500 space-y-1 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{caseItem.court}</span>
                    </div>
                    {caseItem.judgeName && (
                      <div className="text-[11px] text-slate-400 italic">
                        Bench: {caseItem.judgeName}
                      </div>
                    )}
                  </div>

                  {/* Procedural Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                      <span>PROCEDURAL STAGE</span>
                      <span className="text-amber-800 font-bold">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1 truncate">
                      {caseItem.stage}
                    </p>
                  </div>
                </div>

                {/* Hearing & Next Appearance Ribbon */}
                <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="text-[11px]">
                      Files: <strong className="text-slate-800">{caseDocs.length}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-[11px]">
                      Hearings: <strong className="text-slate-800">{caseHearings.length}</strong>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {caseItem.nextHearingDate ? `📅 ${caseItem.nextHearingDate}` : "Date Not Fixed"}
                    </span>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="p-3 bg-white flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewCaseDetails(caseItem)}
                    className="flex-1 inline-flex items-center justify-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-1.5 px-2 rounded-lg transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => onOpenHearingModal(caseItem)}
                    className="flex-1 inline-flex items-center justify-center gap-1 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold py-1.5 px-2 rounded-lg transition shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Log Hearing</span>
                  </button>

                  <button
                    onClick={() => onDeleteCasePrompt(caseItem)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Case"
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

function HearingsDiaryView({
  hearings,
  cases,
  onOpenHearingModal,
  onDeleteHearingPrompt,
  onSendWhatsApp
}) {
  const [filterMode, setFilterMode] = useState("all");

  const sortedHearings = [...hearings].sort(
    (a, b) => new Date(a.hearingDate) - new Date(b.hearingDate)
  );

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const displayedHearings = sortedHearings.filter((h) => {
    if (filterMode === "tomorrow") return h.hearingDate === tomorrowStr;
    if (filterMode === "upcoming") return h.hearingDate >= todayStr;
    if (filterMode === "past") return h.hearingDate < todayStr;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-950">
            Advocate Vivek's Hearing Diary & Cause List
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological cause list & courtroom appearance schedules across Musiri and Trichy courts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSendWhatsApp(displayedHearings)}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-200" />
            <span>Forward Cause List (WhatsApp)</span>
          </button>

          <button
            onClick={() => onOpenHearingModal(null)}
            className="inline-flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Schedule Hearing</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200 text-xs">
        {[
          { id: "all", label: "All Hearings" },
          { id: "tomorrow", label: "Tomorrow (T-1)" },
          { id: "upcoming", label: "Upcoming" },
          { id: "past", label: "Past Records" }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilterMode(btn.id)}
            className={`px-3 py-1.5 font-semibold rounded-lg transition ${
              filterMode === btn.id
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {displayedHearings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-serif font-bold text-slate-900">Diary is Clear</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            No hearings match this selected view. Schedule a hearing date to activate automated
            eve-of-hearing T-1 reminders.
          </p>
          <button
            onClick={() => onOpenHearingModal(null)}
            className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Schedule Hearing Date</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Hearing Date</th>
                  <th className="py-3 px-4">Case Number</th>
                  <th className="py-3 px-4">Court Forum</th>
                  <th className="py-3 px-4">Stage / Purpose</th>
                  <th className="py-3 px-4">Hall / Item</th>
                  <th className="py-3 px-4">Chamber Prep Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {displayedHearings.map((h) => {
                  const isTomorrow = h.hearingDate === tomorrowStr;
                  const isUpcoming = h.hearingDate >= todayStr;

                  return (
                    <tr
                      key={h.id}
                      className={`hover:bg-slate-50 transition ${
                        isTomorrow ? "bg-amber-50/50" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-xs ${
                            isTomorrow
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : isUpcoming
                              ? "bg-slate-100 text-slate-800 border border-slate-300"
                              : "bg-slate-50 text-slate-400"
                          }`}
                        >
                          {isTomorrow && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />}
                          {h.hearingDate}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-950 font-serif">
                        {h.caseNo}
                        <div className="text-[11px] font-sans font-normal text-slate-500 truncate max-w-[200px]">
                          {h.parties}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">{h.court}</td>

                      <td className="py-3.5 px-4">
                        <span className="bg-amber-50 text-amber-900 px-2.5 py-1 rounded-md border border-amber-200 text-[11px] font-semibold">
                          {h.stage}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {h.courtHall || "—"}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-xs italic max-w-xs truncate">
                        {h.notes || "None logged"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onDeleteHearingPrompt(h)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Remove Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function HardCopyScannerView({ cases, onSaveScannedDocument }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [filterMode, setFilterMode] = useState("bw");
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState("Vakalatnama");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [rotationAngle, setRotationAngle] = useState(0);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch {
      simulateCaptureFallback();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(dataUrl);
      stopCamera();
    } else {
      simulateCaptureFallback();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateCaptureFallback = () => {
    const sampleSVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" fill="%23ffffff"><rect width="600" height="850" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="4"/><text x="300" y="70" font-family="serif" font-size="20" font-weight="bold" text-anchor="middle" fill="%230f172a">IN THE SUB COURT AT MUSIRI</text><text x="300" y="100" font-family="sans-serif" font-size="13" text-anchor="middle" fill="%23475569">Tiruchirappalli District, Tamil Nadu</text><line x1="60" y1="120" x2="540" y2="120" stroke="%2394a3b8" stroke-width="1.5"/><text x="60" y="170" font-family="serif" font-size="14" font-weight="bold" fill="%231e293b">VAKALATNAMA / MEMO OF APPEARANCE</text><text x="60" y="220" font-family="sans-serif" font-size="12" fill="%23334155">I/We hereby appoint and retain:</text><text x="60" y="250" font-family="serif" font-size="16" font-weight="bold" fill="%230f172a">ADV. VIVEK, B.Sc., B.L.</text><text x="60" y="275" font-family="sans-serif" font-size="11" fill="%2364748b">Advocate, Musiri Bar Association</text><rect x="60" y="320" width="480" height="280" fill="%23f8fafc" stroke="%23e2e8f0" stroke-width="1" rx="4"/><text x="80" y="360" font-family="sans-serif" font-size="12" fill="%2364748b">[ SCANNED HARD-COPY RECORD ARCHIVED IN CHAMBER VAULT ]</text><circle cx="480" cy="740" r="45" fill="none" stroke="%23b45309" stroke-width="2"/><text x="480" y="745" font-family="serif" font-size="11" font-weight="bold" text-anchor="middle" fill="%23b45309">SEAL OF ADV</text></svg>`;
    setCapturedImage(sampleSVG);
    stopCamera();
  };

  const handleSave = () => {
    if (!docTitle.trim()) return;
    const matchedCase = cases.find((c) => c.id === selectedCaseId);
    const newDoc = {
      id: "DOC-" + Date.now(),
      title: docTitle,
      category: docCategory,
      caseId: selectedCaseId || null,
      caseNo: matchedCase ? matchedCase.caseNo : "General Chamber Archive",
      imageData: capturedImage,
      filterApplied: filterMode,
      rotationAngle,
      scannedAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    };
    onSaveScannedDocument(newDoc);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-950">Chamber Hard-Copy Document Scanner</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture summons, Vakalatnamas, plaints, and FIR copies using your device camera or gallery upload.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Viewfinder */}
        <div className="space-y-3.5">
          <div className="relative aspect-[3/4] bg-slate-950 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center shadow-inner">
            {isCameraActive ? (
              <video ref={videoRef} className="w-full h-full object-cover" />
            ) : capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured Hard Copy"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
                className={`w-full h-full object-contain transition duration-200 ${
                  filterMode === "bw"
                    ? "grayscale contrast-150 brightness-95"
                    : filterMode === "contrast"
                    ? "contrast-200 brightness-105"
                    : filterMode === "stamp"
                    ? "saturate-200 contrast-125"
                    : ""
                }`}
              />
            ) : (
              <div className="text-center p-6 text-slate-400">
                <Camera className="w-12 h-12 mx-auto mb-2 text-slate-500 opacity-60" />
                <p className="text-xs font-semibold">Viewfinder Standby</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Activate camera or upload photo from device storage
                </p>
              </div>
            )}

            {(isCameraActive || capturedImage) && (
              <div className="absolute inset-4 border-2 border-dashed border-amber-400/80 pointer-events-none rounded-lg flex flex-col justify-between p-2.5">
                <div className="flex justify-between text-[9px] text-amber-300 font-mono tracking-widest">
                  <span>TOP LEFT</span>
                  <span>A4 LEGAL FORMAT</span>
                </div>
                <div className="flex justify-between text-[9px] text-amber-300 font-mono tracking-widest">
                  <span>MUSIRI CHAMBERS</span>
                  <span>BOTTOM RIGHT</span>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Scanner Capture Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {!isCameraActive ? (
              <button
                onClick={startCamera}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-lg shadow-sm transition"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>{capturedImage ? "Retake Document" : "Open Camera"}</span>
              </button>
            ) : (
              <button
                onClick={captureFrame}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-2.5 rounded-lg shadow-sm transition"
              >
                <Camera className="w-4 h-4" />
                <span>Snap / Capture Paper</span>
              </button>
            )}

            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2.5 rounded-lg transition"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {capturedImage && (
              <>
                <button
                  onClick={() => setRotationAngle((prev) => (prev + 90) % 360)}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setCapturedImage(null);
                    setRotationAngle(0);
                  }}
                  className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-lg transition"
                  title="Discard"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Indexing Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-serif font-bold text-slate-950 border-b border-slate-200 pb-2">
            Document Indexing & Case Tagging
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Vakalatnama Signed, Bail Order Copy, Survey FMB Sketch..."
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
              >
                <option value="Vakalatnama">Vakalatnama</option>
                <option value="Plaint / Written Statement">Plaint / Written Statement</option>
                <option value="Court Order / Judgment">Court Order / Judgment</option>
                <option value="FIR / Police Report">FIR / Police Report</option>
                <option value="FMB / Land Survey Sketch">FMB / Land Survey Sketch</option>
                <option value="Affidavit / Petition">Affidavit / Petition</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link to Case Docket
              </label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
              >
                <option value="">General Chamber Document</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNo} ({c.caseType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Enhancement Filter Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              OCR & Hard-Copy Enhancement Filter
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "bw", label: "Legal B&W", desc: "Clean Ink" },
                { id: "contrast", label: "High Contrast", desc: "Judicial Seal" },
                { id: "stamp", label: "Stamp Boost", desc: "Revenue Ink" }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterMode(f.id)}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    filterMode === f.id
                      ? "border-amber-600 bg-amber-50/80 text-amber-950 font-semibold"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="block text-xs font-bold">{f.label}</span>
                  <span className="text-[10px] text-slate-500">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={!capturedImage || !docTitle.trim()}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold py-3 rounded-lg shadow-sm transition"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Archive to Case Vault</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentVaultView({ documents, cases, onPreviewDocument, onDeleteDocPrompt, onOpenScanner }) {
  const [vaultFilter, setVaultFilter] = useState("ALL");

  const filteredDocs = documents.filter((d) => {
    if (vaultFilter === "ALL") return true;
    return d.category === vaultFilter;
  });

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-950">Chambers Digital Document Vault</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Secure chamber repository of scanned paper copies, bail orders, and survey records.
          </p>
        </div>

        <button
          onClick={onOpenScanner}
          className="inline-flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition"
        >
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span>Scan New Document</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          "ALL",
          "Vakalatnama",
          "Plaint / Written Statement",
          "Court Order / Judgment",
          "FIR / Police Report",
          "FMB / Land Survey Sketch"
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => setVaultFilter(cat)}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition border ${
              vaultFilter === cat
                ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-serif font-bold text-slate-900">Vault is Empty</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            No scanned hard copies match this category. Use the built-in scanner or file uploader to archive
            Vakalatnamas, plaints, and order copies.
          </p>
          <button
            onClick={onOpenScanner}
            className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>Open Document Scanner</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div
                onClick={() => onPreviewDocument(doc)}
                className="aspect-[4/3] bg-slate-100 relative cursor-pointer flex items-center justify-center overflow-hidden border-b border-slate-100"
              >
                <img
                  src={doc.imageData}
                  alt={doc.title}
                  style={{ transform: `rotate(${doc.rotationAngle || 0}deg)` }}
                  className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${
                    doc.filterApplied === "bw"
                      ? "grayscale contrast-150"
                      : doc.filterApplied === "contrast"
                      ? "contrast-200"
                      : doc.filterApplied === "stamp"
                      ? "saturate-200"
                      : ""
                  }`}
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-sm">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Inspect Document</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block mb-1.5">
                    {doc.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-950 font-serif line-clamp-1 group-hover:text-amber-900 transition">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{doc.caseNo}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Archived: {doc.scannedAt}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDocPrompt(doc);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition"
                    title="Delete Document"
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
  );
}

function AdvocateRemindersView({
  settings,
  onUpdateSettings,
  hearings,
  logs,
  onTestAlert,
  onRequestPushPermission,
  onSendWhatsApp,
  generateWhatsAppMessage
}) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const tomorrowHearings = hearings.filter((h) => h.hearingDate === tomorrowStr);

  const [copied, setCopied] = useState(false);
  const previewText = generateWhatsAppMessage(tomorrowHearings.length > 0 ? tomorrowHearings : hearings);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shadow-inner">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold text-slate-950">
                  T-1 Eve-of-Hearing Reminder Engine
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  DAEMON ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically monitors listings and alerts Advocate Vivek on the eve of hearings (8:00 PM).
              </p>
            </div>
          </div>

          <button
            onClick={onTestAlert}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-lg transition"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Sound Chamber Bell</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Advocate Vivek's WhatsApp / Mobile Number *
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. +91 94431 00000"
                  value={settings.advocatePhone}
                  onChange={(e) => onUpdateSettings({ ...settings, advocatePhone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Cause lists and automated eve-of-hearing digests are prepared exclusively for this number.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Advocate Chamber Address (Musiri)
              </label>
              <input
                type="text"
                value={settings.chamberAddress}
                onChange={(e) => onUpdateSettings({ ...settings, chamberAddress: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
              />
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
              Autonomous Trigger Channels
            </h4>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={settings.enableT1Daemon}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, enableT1Daemon: e.target.checked })
                }
                className="rounded-md border-slate-300 text-slate-950 focus:ring-slate-900/20 w-4 h-4"
              />
              <span>T-1 Eve Autonomous Sweeper (Runs continuously)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={settings.enablePush}
                onChange={(e) => onUpdateSettings({ ...settings, enablePush: e.target.checked })}
                className="rounded-md border-slate-300 text-slate-950 focus:ring-slate-900/20 w-4 h-4"
              />
              <span>Device & Browser Push Notifications</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={settings.enableChime}
                onChange={(e) => onUpdateSettings({ ...settings, enableChime: e.target.checked })}
                className="rounded-md border-slate-300 text-slate-950 focus:ring-slate-900/20 w-4 h-4"
              />
              <span>Acoustic Chamber Bell Sound Chime</span>
            </label>

            <div className="pt-2">
              <button
                onClick={onRequestPushPermission}
                className="text-xs font-semibold text-slate-950 hover:text-amber-800 underline underline-offset-4 flex items-center gap-1"
              >
                <span>Authorize Device Push Notifications</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cause List Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-serif font-bold text-slate-950">
              Tomorrow's Court Cause List ({tomorrowStr})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {tomorrowHearings.length} matter(s) scheduled for appearance tomorrow.
            </p>
          </div>

          {tomorrowHearings.length > 0 && (
            <button
              onClick={() => onSendWhatsApp(tomorrowHearings)}
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
              <span>Send Tomorrow's List To My WhatsApp</span>
            </button>
          )}
        </div>

        {tomorrowHearings.length === 0 ? (
          <div className="text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-200 p-6 rounded-xl text-center">
            No hearings listed for tomorrow across Musiri or Trichy courts.
          </div>
        ) : (
          <div className="space-y-2">
            {tomorrowHearings.map((h) => (
              <div
                key={h.id}
                className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-950 font-serif mr-2">{h.caseNo}</span>
                  <span className="text-slate-600 font-medium">({h.court})</span>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Stage: <strong className="text-slate-900">{h.stage}</strong> • Hall:{" "}
                    {h.courtHall || "Unassigned"}
                  </div>
                </div>
                <span className="text-amber-900 font-bold bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md text-[11px]">
                  Tomorrow
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Formatted Digest Preview */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-serif font-bold text-slate-950">
              Live WhatsApp Cause List Preview (Self-Reminder)
            </h3>
          </div>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md font-semibold transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Digest"}</span>
          </button>
        </div>

        <div className="bg-[#f0f2f5] p-4 rounded-xl border border-slate-200 font-mono text-xs whitespace-pre-wrap text-slate-800 leading-relaxed shadow-inner">
          {previewText}
        </div>
      </div>

      {/* Automated T-1 Dispatch History Ledger */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-serif font-bold text-slate-950 mb-1">
          Automated T-1 Dispatch History Ledger
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Record of automated alerts triggered to Advocate Vivek's device prior to hearing dates.
        </p>

        {logs.length === 0 ? (
          <div className="text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 p-5 rounded-xl text-center">
            No automated alerts triggered yet. As tomorrow hearings approach, records will populate here.
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">
                    Dispatched on {log.dispatchDate} at {log.timestamp}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Target: {log.targetHearingDate} • {log.casesCount} case(s) notified to:{" "}
                    {log.recipientPhone}
                  </div>
                </div>
                <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                  AUTONOMOUS DISPATCHED
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CaseDetailsModal({ caseItem, hearings, documents, onClose, onOpenHearingModal, onPreviewDoc }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                {caseItem.caseType}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                {caseItem.clientRole}
              </span>
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-950">{caseItem.caseNo}</h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">{caseItem.parties}</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-900 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-5 text-xs pr-1">
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Court Forum</span>
              <span className="font-semibold text-slate-900 text-xs">{caseItem.court}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Stage</span>
              <span className="font-bold text-amber-900 text-xs">{caseItem.stage}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Presiding Bench</span>
              <span className="text-slate-800 text-xs">{caseItem.judgeName || "Unassigned"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Next Hearing</span>
              <span className="font-bold text-slate-950 text-xs">
                {caseItem.nextHearingDate || "Date Not Fixed"}
              </span>
            </div>
          </div>

          {/* Hearing History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-serif font-bold text-slate-950 text-sm">Hearing Proceeding Records</h4>
              <button
                onClick={onOpenHearingModal}
                className="text-xs font-semibold text-amber-800 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Hearing</span>
              </button>
            </div>

            {hearings.length === 0 ? (
              <p className="text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                No hearing proceedings logged for this case yet.
              </p>
            ) : (
              <div className="space-y-2">
                {hearings.map((h) => (
                  <div key={h.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900">{h.hearingDate}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold">
                        {h.stage}
                      </span>
                    </div>
                    {h.courtHall && <p className="text-slate-500 text-[11px]">Hall / Item: {h.courtHall}</p>}
                    {h.notes && <p className="text-slate-700 text-xs mt-1 italic">"{h.notes}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attached Documents */}
          <div>
            <h4 className="font-serif font-bold text-slate-950 text-sm mb-2">Attached Scanned Files</h4>
            {documents.length === 0 ? (
              <p className="text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                No scanned hard copies linked to this matter yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {documents.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => onPreviewDoc(d)}
                    className="p-2.5 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 rounded-lg cursor-pointer flex items-center gap-2 transition"
                  >
                    <FileText className="w-4 h-4 text-amber-700 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-900 truncate">{d.title}</p>
                      <p className="text-[10px] text-slate-500">{d.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function NewCaseModal({ onClose, onSaveCase }) {
  const [caseNo, setCaseNo] = useState("");
  const [caseType, setCaseType] = useState("O.S. (Original Suit)");
  const [parties, setParties] = useState("");
  const [court, setCourt] = useState(MUSIRI_COURTS[0]);
  const [judgeName, setJudgeName] = useState("");
  const [clientRole, setClientRole] = useState("Plaintiff / Petitioner");
  const [initialStage, setInitialStage] = useState(CASE_STAGES[1]);
  const [firstHearingDate, setFirstHearingDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!caseNo.trim() || !parties.trim()) return;

    const newCase = {
      id: "CASE-" + Date.now(),
      caseNo: caseNo.trim(),
      caseType,
      parties: parties.trim(),
      court,
      judgeName: judgeName.trim(),
      clientRole,
      stage: initialStage,
      nextHearingDate: firstHearingDate || null,
      registeredDate: new Date().toLocaleDateString("en-IN")
    };
    onSaveCase(newCase);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="text-base font-serif font-bold text-slate-950">
              Register New Case Matter
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Case Number * (e.g. O.S. 42/2026, C.C. 108/2026)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. O.S. 112/2026"
              value={caseNo}
              onChange={(e) => setCaseNo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Case Classification</label>
              <select
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
              >
                <option value="O.S. (Original Suit)">O.S. (Original Suit)</option>
                <option value="C.C. (Calendar Case)">C.C. (Calendar Case)</option>
                <option value="Crl.M.P. (Criminal Misc)">Crl.M.P. (Criminal Misc)</option>
                <option value="I.A. (Interlocutory)">I.A. (Interlocutory)</option>
                <option value="A.S. (Appeal Suit)">A.S. (Appeal Suit)</option>
                <option value="E.P. (Execution Petition)">E.P. (Execution Petition)</option>
                <option value="M.C. (Maintenance)">M.C. (Maintenance)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Appearing For</label>
              <select
                value={clientRole}
                onChange={(e) => setClientRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
              >
                <option value="Plaintiff / Petitioner">Plaintiff / Petitioner</option>
                <option value="Defendant / Respondent">Defendant / Respondent</option>
                <option value="Accused (Criminal Defense)">Accused (Criminal Defense)</option>
                <option value="De-facto Complainant">De-facto Complainant</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Parties (Petitioner vs Respondent) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Shanmugam vs. Revenue Divisional Officer & 3 Others"
              value={parties}
              onChange={(e) => setParties(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Court Forum</label>
            <select
              value={court}
              onChange={(e) => setCourt(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
            >
              {MUSIRI_COURTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Case Stage</label>
              <select
                value={initialStage}
                onChange={(e) => setInitialStage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
              >
                {CASE_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                First Hearing Date (Optional)
              </label>
              <input
                type="date"
                value={firstHearingDate}
                onChange={(e) => setFirstHearingDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm transition"
            >
              Save Case File
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RecordHearingModal({ cases, preSelectedCase, onClose, onSaveHearing }) {
  const [selectedCaseId, setSelectedCaseId] = useState(
    preSelectedCase ? preSelectedCase.id : cases[0]?.id || ""
  );
  const [hearingDate, setHearingDate] = useState(new Date().toISOString().split("T")[0]);
  const [stage, setStage] = useState(CASE_STAGES[2]);
  const [courtHall, setCourtHall] = useState("Hall #1 / Item 14");
  const [notes, setNotes] = useState("");

  const activeCase = cases.find((c) => c.id === selectedCaseId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCaseId || !hearingDate) return;

    const newHearing = {
      id: "HRG-" + Date.now(),
      caseId: selectedCaseId,
      caseNo: activeCase ? activeCase.caseNo : "Unspecified",
      parties: activeCase ? activeCase.parties : "N/A",
      court: activeCase ? activeCase.court : MUSIRI_COURTS[0],
      hearingDate,
      stage,
      courtHall: courtHall.trim(),
      notes: notes.trim(),
      loggedAt: new Date().toLocaleDateString("en-IN")
    };
    onSaveHearing(newHearing);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base font-serif font-bold text-slate-950">
              Schedule / Update Court Hearing
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {cases.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-600 space-y-3">
            <p>Please register a case matter first before scheduling hearings.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-950 text-white font-semibold rounded-lg"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Case Matter *
              </label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNo} — {c.parties} ({c.court})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Next Hearing Date *
                </label>
                <input
                  type="date"
                  required
                  value={hearingDate}
                  onChange={(e) => setHearingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Court Hall / Item No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hall 2, Item 18"
                  value={courtHall}
                  onChange={(e) => setCourtHall(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Next Stage / Purpose of Hearing
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
              >
                {CASE_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Advocate Strategy / Preparation Notes (Internal)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Cross-examination of PW1; Keep FMB survey sketch and certified partition deed ready."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-800"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm transition"
              >
                Record Hearing Entry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function DeleteConfirmModal({ confirmation, onCancel, onConfirm }) {
  const getTitle = () => {
    if (confirmation.type === "CASE") return `Delete Case ${confirmation.target.caseNo}?`;
    if (confirmation.type === "HEARING") return `Remove Hearing for ${confirmation.target.caseNo}?`;
    return `Delete Document "${confirmation.target.title}"?`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-3">
        <div className="flex items-center gap-2.5 text-rose-600">
          <AlertCircle className="w-5 h-5" />
          <h4 className="font-bold text-sm text-slate-950">{getTitle()}</h4>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          This operation will permanently remove this record from Advocate Vivek's chamber docket.
        </p>
        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-sm transition"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentPreviewModal({ doc, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-5 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {doc.category}
            </span>
            <h3 className="text-base font-serif font-bold text-slate-950 mt-1">{doc.title}</h3>
            <p className="text-xs text-slate-500">
              {doc.caseNo} • Archived on {doc.scannedAt}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-900 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-100 rounded-xl p-2 border border-slate-200">
          <img
            src={doc.imageData}
            alt={doc.title}
            style={{ transform: `rotate(${doc.rotationAngle || 0}deg)` }}
            className={`max-h-[65vh] object-contain rounded-lg shadow-sm ${
              doc.filterApplied === "bw"
                ? "grayscale contrast-150"
                : doc.filterApplied === "contrast"
                ? "contrast-200"
                : doc.filterApplied === "stamp"
                ? "saturate-200"
                : ""
            }`}
          />
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Filter: {doc.filterApplied ? doc.filterApplied.toUpperCase() : "ORIGINAL"}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold rounded-lg transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
