import React, { useState, useEffect, useRef } from "react";
import {
  Scale,
  Calendar,
  Clock,
  FileText,
  Camera,
  Bell,
  Plus,
  Trash2,
  Share2,
  FolderOpen,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  Search,
  Filter,
  Shield,
  X,
  Volume2
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("docket"); // 'docket' | 'diary' | 'scanner' | 'daemon'
  const [cases, setCases] = useState(() => {
    const saved = localStorage.getItem("vivek_legal_cases");
    return saved ? JSON.parse(saved) : [];
  });
  const [hearings, setHearings] = useState(() => {
    const saved = localStorage.getItem("vivek_legal_hearings");
    return saved ? JSON.parse(saved) : [];
  });
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem("vivek_legal_docs");
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCaseModal, setSelectedCaseModal] = useState(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showNewHearingModal, setShowNewHearingModal] = useState(false);

  // Form states
  const [caseForm, setCaseForm] = useState({
    caseNumber: "",
    court: "Sub Court, Musiri",
    clientName: "",
    clientPhone: "",
    matterType: "Civil Suit (O.S.)",
    stage: "Plaint / Initial Pleadings",
    summary: ""
  });

  const [hearingForm, setHearingForm] = useState({
    caseId: "",
    hearingDate: "",
    courtHall: "Hall No. 1",
    purpose: "Framing Issues",
    advocateNotes: ""
  });

  // Scanner state
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("contrast"); // 'raw' | 'bw' | 'contrast'
  const [rotation, setRotation] = useState(0);
  const [docCaseId, setDocCaseId] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("vivek_legal_cases", JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem("vivek_legal_hearings", JSON.stringify(hearings));
  }, [hearings]);

  useEffect(() => {
    localStorage.setItem("vivek_legal_docs", JSON.stringify(documents));
  }, [documents]);

  // Audio synthesizer for chamber chime
  const playChamberBell = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 chime
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.6);
    } catch {
      // AudioContext fallback
    }
  };

  // Helper date calculations
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const tomorrowListings = hearings.filter((h) => h.hearingDate === getTomorrowDate());

  // Generate WhatsApp cause list
  const shareWhatsAppCauseList = () => {
    const tDate = getTomorrowDate();
    let text = `*CHAMBERS OF ADVOCATE VIVEK, B.Sc., B.L.*\n*Musiri Bar Association*\n*Cause List for Tomorrow (${tDate})*\n----------------------------------------\n`;
    if (tomorrowListings.length === 0) {
      text += "No listed court appearances scheduled for tomorrow.";
    } else {
      tomorrowListings.forEach((h, idx) => {
        const c = cases.find((item) => item.id === h.caseId);
        text += `\n${idx + 1}. *Case:* ${c ? c.caseNumber : "N/A"}\n   *Court:* ${c ? c.court : "Musiri"}\n   *Party:* ${c ? c.clientName : "N/A"}\n   *Purpose:* ${h.purpose}\n   *Chamber Note:* ${h.advocateNotes || "Standard Appearance"}\n`;
      });
    }
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Camera handling
  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      alert("Unable to access hardware camera. Check device permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setCapturedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const saveScannedDocument = () => {
    if (!capturedImage) return;
    const newDoc = {
      id: "doc_" + Date.now(),
      caseId: docCaseId || (cases[0] ? cases[0].id : ""),
      title: docTitle || "Legal Notice / Pleading",
      dataUrl: capturedImage,
      filter: selectedFilter,
      rotation,
      date: new Date().toISOString().split("T")[0]
    };
    setDocuments([newDoc, ...documents]);
    setCapturedImage(null);
    setDocTitle("");
    alert("Record archived to vault.");
  };

  // Case creation
  const handleCreateCase = (e) => {
    e.preventDefault();
    const newC = {
      id: "c_" + Date.now(),
      ...caseForm,
      filingDate: new Date().toISOString().split("T")[0]
    };
    setCases([newC, ...cases]);
    setCaseForm({
      caseNumber: "",
      court: "Sub Court, Musiri",
      clientName: "",
      clientPhone: "",
      matterType: "Civil Suit (O.S.)",
      stage: "Plaint / Initial Pleadings",
      summary: ""
    });
    setShowNewCaseModal(false);
  };

  // Hearing creation
  const handleCreateHearing = (e) => {
    e.preventDefault();
    const newH = {
      id: "h_" + Date.now(),
      ...hearingForm
    };
    setHearings([newH, ...hearings]);
    setHearingForm({
      caseId: cases[0] ? cases[0].id : "",
      hearingDate: "",
      courtHall: "Hall No. 1",
      purpose: "Framing Issues",
      advocateNotes: ""
    });
    setShowNewHearingModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-700 text-white flex items-center justify-center shadow-md">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif text-slate-900 tracking-tight">
                ADVOCATE VIVEK, B.Sc., B.L.
              </h1>
              <p className="text-xs font-medium text-amber-800 tracking-wider uppercase">
                Musiri Bar Association • Tiruchirappalli District
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playChamberBell();
                shareWhatsAppCauseList();
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition"
            >
              <Share2 className="w-4 h-4" />
              T-1 WhatsApp Cause List
            </button>
            <button
              onClick={playChamberBell}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700"
              title="Test Acoustic Chime"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex border-t border-slate-100 space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("docket")}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "docket"
                ? "border-amber-700 text-amber-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Case Dockets ({cases.length})
          </button>
          <button
            onClick={() => setActiveTab("diary")}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "diary"
                ? "border-amber-700 text-amber-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Hearing Diary ({hearings.length})
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "scanner"
                ? "border-amber-700 text-amber-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Camera className="w-4 h-4" />
            A4 Document Scanner
          </button>
          <button
            onClick={() => setActiveTab("daemon")}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "daemon"
                ? "border-amber-700 text-amber-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Bell className="w-4 h-4" />
            T-1 Notification Hub
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Active Matters</span>
            <p className="text-2xl font-serif font-bold text-slate-900 mt-1">{cases.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs uppercase text-amber-700 font-bold tracking-wider">Tomorrow's Listings (T-1)</span>
            <p className="text-2xl font-serif font-bold text-amber-800 mt-1">{tomorrowListings.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Total Scheduled</span>
            <p className="text-2xl font-serif font-bold text-slate-900 mt-1">{hearings.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Scanned Records</span>
            <p className="text-2xl font-serif font-bold text-slate-900 mt-1">{documents.length}</p>
          </div>
        </div>

        {/* TAB 1: DOCKET */}
        {activeTab === "docket" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search case no, client, court..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>
              <button
                onClick={() => setShowNewCaseModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                New Legal Matter
              </button>
            </div>

            {cases.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-lg text-slate-800">No Active Case Dockets</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Chamber practice records for Advocate Vivek are ready. Click below to add your first Musiri court file.
                </p>
                <button
                  onClick={() => setShowNewCaseModal(true)}
                  className="mt-4 inline-flex items-center gap-2 bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Docket Case
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cases
                  .filter(
                    (c) =>
                      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.court.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((c) => (
                    <div
                      key={c.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-amber-700 transition shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {c.matterType}
                          </span>
                          <span className="text-xs text-slate-500">{c.court}</span>
                        </div>
                        <h3 className="font-serif font-bold text-lg text-slate-900 mt-2">{c.caseNumber}</h3>
                        <p className="text-sm text-slate-700 mt-1">
                          <span className="font-medium text-slate-500">Client / Party:</span> {c.clientName}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          <span className="font-medium">Procedural Stage:</span> {c.stage}
                        </p>
                        {c.summary && <p className="text-xs text-slate-600 mt-2 line-clamp-2">{c.summary}</p>}
                      </div>

                      <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-xs">
                        <button
                          onClick={() => setSelectedCaseModal(c)}
                          className="font-semibold text-amber-800 hover:text-amber-900"
                        >
                          View Full Details →
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete case ${c.caseNumber}?`)) {
                              setCases(cases.filter((item) => item.id !== c.id));
                              setHearings(hearings.filter((h) => h.caseId !== c.id));
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Archive/Delete Docket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HEARING DIARY */}
        {activeTab === "diary" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif font-bold text-lg text-slate-900">Musiri Court Appearance Schedule</h2>
              <button
                onClick={() => setShowNewHearingModal(true)}
                disabled={cases.length === 0}
                className="flex items-center gap-2 bg-amber-800 disabled:opacity-50 hover:bg-amber-900 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Schedule Appearance
              </button>
            </div>

            {hearings.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-lg text-slate-800">Hearing Diary is Clear</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  No upcoming court dates registered. Schedule hearings to automate T-1 cause list reminders.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {hearings
                  .sort((a, b) => new Date(a.hearingDate) - new Date(b.hearingDate))
                  .map((h) => {
                    const c = cases.find((item) => item.id === h.caseId);
                    const isTomorrow = h.hearingDate === getTomorrowDate();
                    return (
                      <div
                        key={h.id}
                        className={`bg-white border p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition ${
                          isTomorrow ? "border-amber-500 ring-2 ring-amber-100" : "border-slate-200"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                              {h.hearingDate}
                            </span>
                            {isTomorrow && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> T-1 Listed Tomorrow
                              </span>
                            )}
                            <span className="text-xs text-slate-500">{h.courtHall}</span>
                          </div>
                          <h4 className="font-serif font-bold text-base text-slate-900 mt-1">
                            {c ? c.caseNumber : "Unlinked Matter"} • {c ? c.clientName : ""}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5">
                            <span className="font-semibold text-slate-700">Purpose:</span> {h.purpose}
                          </p>
                          {h.advocateNotes && (
                            <p className="text-xs text-amber-900 italic mt-1 bg-amber-50 px-2 py-1 rounded inline-block">
                              Note: {h.advocateNotes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setHearings(hearings.filter((item) => item.id !== h.id));
                            }}
                            className="text-slate-400 hover:text-red-600 p-2"
                            title="Delete hearing entry"
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
        )}

        {/* TAB 3: DOCUMENT SCANNER */}
        {activeTab === "scanner" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h2 className="font-serif font-bold text-lg text-slate-900 mb-2">Hard-Copy Document Camera Scanner</h2>
              <p className="text-xs text-slate-500 mb-4">
                Capture legal notices, petitions, or order sheets with high-contrast filters for archival.
              </p>

              <div className="relative bg-slate-900 rounded-lg overflow-hidden min-h-[340px] flex items-center justify-center">
                {cameraActive ? (
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover max-h-[420px]" />
                ) : capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      filter:
                        selectedFilter === "bw"
                          ? "grayscale(100%) contrast(150%)"
                          : selectedFilter === "contrast"
                          ? "contrast(180%) brightness(95%)"
                          : "none"
                    }}
                    className="max-h-[420px] object-contain transition-all"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Camera inactive. Click 'Open Viewfinder' or upload an image.</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                <div className="flex items-center gap-2">
                  {!cameraActive ? (
                    <button
                      onClick={startCamera}
                      className="px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900"
                    >
                      Open Viewfinder
                    </button>
                  ) : (
                    <button
                      onClick={captureFrame}
                      className="px-4 py-1.5 bg-amber-800 text-white text-xs font-semibold rounded-lg hover:bg-amber-900 shadow-md"
                    >
                      Capture Shot
                    </button>
                  )}

                  <label className="cursor-pointer px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50">
                    Upload File
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {capturedImage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="p-1.5 border border-slate-300 rounded hover:bg-slate-50"
                      title="Rotate 90deg"
                    >
                      <RotateCw className="w-4 h-4 text-slate-600" />
                    </button>
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="text-xs border border-slate-300 rounded p-1.5 bg-white"
                    >
                      <option value="raw">Original Clean</option>
                      <option value="bw">Legal B&W</option>
                      <option value="contrast">High Contrast</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Save Panel */}
              {capturedImage && (
                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Document Title (e.g. OS Counter)"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="border border-slate-300 rounded px-3 py-1.5 text-xs col-span-2"
                  />
                  <button
                    onClick={saveScannedDocument}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-1.5 rounded"
                  >
                    Archive to Vault
                  </button>
                </div>
              )}
            </div>

            {/* Archive List */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="font-serif font-bold text-base text-slate-900 mb-3">Chamber Document Archive</h3>
              {documents.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No scanned pleadings or order sheets saved yet.</p>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border border-slate-200 rounded-lg p-3 text-xs">
                      <p className="font-bold text-slate-800">{doc.title}</p>
                      <span className="text-[10px] text-slate-400">Archived on {doc.date}</span>
                      <img src={doc.dataUrl} alt={doc.title} className="mt-2 h-20 w-full object-cover rounded bg-slate-50" />
                      <button
                        onClick={() => setDocuments(documents.filter((d) => d.id !== doc.id))}
                        className="text-red-500 hover:text-red-700 mt-2 block text-right w-full"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: T-1 NOTIFICATION HUB */}
        {activeTab === "daemon" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-50 rounded-full text-amber-800">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-slate-900">Eve-of-Hearing (T-1) Daemon</h2>
                <p className="text-xs text-slate-500">Automated reminder system for Advocate Vivek</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-600">Daemon Status</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle className="w-3.5 h-3.5" /> Armed & Active
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Scans listed hearings continuously. Generates personal eve-of-court alerts directly to Advocate Vivek's phone.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">Tomorrow's Dispatch Preview</h4>
                {tomorrowListings.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No court listings for tomorrow. The eve daemon will remain quiet.</p>
                ) : (
                  <div className="bg-slate-100 p-3 rounded font-mono text-xs text-slate-800 whitespace-pre-line border border-slate-200">
                    {`*CHAMBERS OF ADVOCATE VIVEK*\nCause List for Tomorrow:\n` +
                      tomorrowListings
                        .map((h, i) => {
                          const c = cases.find((x) => x.id === h.caseId);
                          return `${i + 1}. ${c ? c.caseNumber : "N/A"} - ${h.purpose} (${h.courtHall})`;
                        })
                        .join("\n")}
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={shareWhatsAppCauseList}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-xs"
                >
                  <Share2 className="w-4 h-4" />
                  Dispatch WhatsApp Cause List Now
                </button>
                <button
                  onClick={playChamberBell}
                  className="flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-lg text-xs"
                >
                  <Volume2 className="w-4 h-4" />
                  Test Chamber Bell
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: NEW CASE */}
      {showNewCaseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif font-bold text-lg text-slate-900">Docket New Court Matter</h3>
              <button onClick={() => setShowNewCaseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCase} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Case Number / CNR</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. O.S. 142/2026 or C.C. 88/2026"
                  value={caseForm.caseNumber}
                  onChange={(e) => setCaseForm({ ...caseForm, caseNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Court Forum</label>
                  <input
                    type="text"
                    value={caseForm.court}
                    onChange={(e) => setCaseForm({ ...caseForm, court: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Matter Type</label>
                  <select
                    value={caseForm.matterType}
                    onChange={(e) => setCaseForm({ ...caseForm, matterType: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-sm bg-white"
                  >
                    <option>Civil Suit (O.S.)</option>
                    <option>Criminal Case (C.C.)</option>
                    <option>Motor Accident Claim (MCOP)</option>
                    <option>Revenue Appeal</option>
                    <option>Execution Petition (E.P.)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client / Party Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. K. Ramasamy"
                    value={caseForm.clientName}
                    onChange={(e) => setCaseForm({ ...caseForm, clientName: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98420..."
                    value={caseForm.clientPhone}
                    onChange={(e) => setCaseForm({ ...caseForm, clientPhone: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Procedural Stage</label>
                <input
                  type="text"
                  value={caseForm.stage}
                  onChange={(e) => setCaseForm({ ...caseForm, stage: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chamber Brief / Facts</label>
                <textarea
                  rows="2"
                  placeholder="Key prayer, facts, or strategy notes..."
                  value={caseForm.summary}
                  onChange={(e) => setCaseForm({ ...caseForm, summary: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded font-bold">
                  Save Docket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW HEARING */}
      {showNewHearingModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif font-bold text-lg text-slate-900">Schedule Court Listing</h3>
              <button onClick={() => setShowNewHearingModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateHearing} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Docket</label>
                <select
                  required
                  value={hearingForm.caseId}
                  onChange={(e) => setHearingForm({ ...hearingForm, caseId: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-sm bg-white"
                >
                  <option value="">-- Choose Matter --</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.clientName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hearing Date</label>
                  <input
                    required
                    type="date"
                    value={hearingForm.hearingDate}
                    onChange={(e) => setHearingForm({ ...hearingForm, hearingDate: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Court Hall</label>
                  <input
                    type="text"
                    value={hearingForm.courtHall}
                    onChange={(e) => setHearingForm({ ...hearingForm, courtHall: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purpose / Stage of Listing</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Cross Examination, Arguments"
                  value={hearingForm.purpose}
                  onChange={(e) => setHearingForm({ ...hearingForm, purpose: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Advocate Prep Note</label>
                <input
                  type="text"
                  placeholder="e.g. Carry original sale deed, call client at 10 AM"
                  value={hearingForm.advocateNotes}
                  onChange={(e) => setHearingForm({ ...hearingForm, advocateNotes: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewHearingModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded font-bold">
                  Schedule Hearing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW CASE DETAILS */}
      {selectedCaseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  {selectedCaseModal.matterType}
                </span>
                <h3 className="font-serif font-bold text-xl text-slate-900 mt-1">{selectedCaseModal.caseNumber}</h3>
                <p className="text-xs text-slate-500">{selectedCaseModal.court}</p>
              </div>
              <button onClick={() => setSelectedCaseModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs border-t border-slate-100 pt-3">
              <div>
                <span className="font-bold text-slate-500">Client / Party:</span>
                <p className="text-sm font-semibold text-slate-800">
                  {selectedCaseModal.clientName} ({selectedCaseModal.clientPhone || "No Phone"})
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-500">Current Stage:</span>
                <p className="text-sm text-slate-800">{selectedCaseModal.stage}</p>
              </div>
              {selectedCaseModal.summary && (
                <div>
                  <span className="font-bold text-slate-500">Case Facts / Chamber Brief:</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded mt-1 border border-slate-200">
                    {selectedCaseModal.summary}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelectedCaseModal(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
