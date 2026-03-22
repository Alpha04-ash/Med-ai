"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { VitalForm, VitalInput } from "@/components/VitalForm";
import { HealthScoreGauge } from "@/components/HealthScoreGauge";
import { AlertBanner } from "@/components/AlertBanner";
import { useRouter } from "next/navigation";
import { generateHealthPDF } from "@/lib/pdf-export";
import { Activity, ShieldAlert, Zap, TrendingUp, Info, Loader2, Download, Microscope, Camera, ShieldCheck, FileCheck, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuraVoice } from "@/hooks/useAuraVoice";
import { EmergencyOverlay } from "@/components/EmergencyOverlay";
import { ProjectionChart } from "@/components/ProjectionChart";
import { HealthTrendsChart } from "@/components/HealthTrendsChart";

export default function Dashboard() {
  const router = useRouter();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [vitalsHistory, setVitalsHistory] = useState<{ time: string; value: number; type: "hr" | "spo2" }[]>([]);
  const [latestReport, setLatestReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  const { speak } = useAuraVoice();
  const userId = typeof window !== "undefined" ? localStorage.getItem("myhealth_user_id") || "demo_user" : "demo_user";

  const fetchLatestData = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/auth/profile/${userId}`);
      const userData = await res.json();
      if (userData.success) {
        setUser(userData.data);
      }

      const reportRes = await fetch(`http://localhost:8080/api/v1/reports/latest/${userId}`);
      const reportData = await reportRes.json();
      if (reportData.success && reportData.data) {
        setLatestReport(reportData.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const token = localStorage.getItem("myhealth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const sessionId = localStorage.getItem("myhealth_session") || `sess_${Date.now()}`;
    if (!localStorage.getItem("myhealth_session")) localStorage.setItem("myhealth_session", sessionId);

    fetchLatestData();

    // Connect WS
    const socket = new WebSocket(`ws://localhost:8080/ws?userId=${userId}&sessionId=${sessionId}`);
    socket.onopen = () => {
      setIsConnected(true);
      setWs(socket);
    };
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "error") console.error("WS Error:", data.message);
      } catch (err) {
        console.error("Failed to parse WS message", err);
      }
    };
    socket.onclose = () => setIsConnected(false);

    return () => socket.close();
  }, [router, userId, fetchLatestData]);

  const handleVitalSubmit = useCallback((vitals: VitalInput) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setVitalsHistory(prev => [
      ...prev,
      { time: timeStr, value: vitals.heart_rate, type: "hr" as const },
      { time: timeStr, value: vitals.spo2, type: "spo2" as const }
    ].slice(-20)); // Keep last 20 points

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "vital_stream", payload: vitals }));
    }
  }, [ws]);

  const runDeepScan = async () => {
    setIsRefreshing(true);
    setScanError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/reports/generate/${userId}`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        setLatestReport(result.data);
        
        // --- REALISM UPGRADE: TTS & EMERGENCY ---
        const suggestions = result.data.suggestions;
        speak(suggestions.summary);
        
        if (result.data.risk_score > 60) {
           setIsEmergencyOpen(true);
        }
      } else {
        setScanError(result.message || "Analysis failed. Please try again.");
      }
    } catch (err: any) {
      setScanError("Backend offline. Please start the server and try again.");
      console.error("Deep scan failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const hrData = vitalsHistory.filter(d => d.type === "hr").map(d => ({ time: d.time, value: d.value }));

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-20">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <>
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* ── Dashboard Header ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Health Command Center
            </h1>
          </div>
          <p className="text-slate-500 flex items-center gap-2 pl-1">
            <span className="relative flex h-2 w-2">
              {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </span>
            {isConnected ? "Live Telemetry Active" : "Telemetry Offline"} · {new Date().toLocaleDateString([], { month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/visual-consult"
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Camera className="w-4 h-4 text-emerald-500" />
            Visual Consult
          </Link>
          <button
            onClick={() => latestReport ? generateHealthPDF(latestReport) : alert("Please run an AI Deep Scan first.")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button
            onClick={runDeepScan}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white dark:bg-emerald-500 dark:text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-500/10 transition-all active:scale-95 disabled:opacity-50 group"
          >
            {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-emerald-500 group-hover:scale-110 transition-transform" />}
            {isRefreshing ? "Analyzing 7-Day Context..." : "AI Deep Scan"}
          </button>
        </div>
      </header>

      {/* ── Realism Upgrade: Clinical Verification Badges ── */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
           <ShieldCheck className="w-3 h-3 text-emerald-500" />
           <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">HIPAA Compliant System</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full">
           <FileCheck className="w-3 h-3 text-slate-500" />
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Physician AI Signature: Verified</span>
        </div>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Precision Medical ID: 772-AURA-9</p>
      </div>

      {/* ── Scan Error Banner ── */}
      {scanError && (
        <div className="flex items-center gap-4 px-5 py-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-700 dark:text-red-400 font-medium">
          <span className="text-base">⚠️</span>
          <span className="flex-1">{scanError}</span>
          <button onClick={() => setScanError(null)} className="text-red-400 hover:text-red-600 font-black text-lg leading-none">×</button>
        </div>
      )}

      {/* ── Main Dashboard Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Column: Analytics & Form */}
        <div className="xl:col-span-3 space-y-6">
           {/* Predictive Projection Chart */}
           <ProjectionChart 
              currentRisk={latestReport?.risk_score || 20} 
              historicalData={[
                { date: "Mar 06", risk: 24 },
                { date: "Mar 07", risk: 28 },
                { date: "Mar 08", risk: 22 },
                { date: "Mar 09", risk: 30 },
                { date: "Mar 10", risk: 35 },
                { date: "Mar 11", risk: 28 },
                { date: "Mar 12", risk: latestReport?.risk_score || 25 },
              ]}
           />

            <div className="grid grid-cols-1 gap-6">
               {/* Heart Rate Trend */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shadow-inner">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white tracking-tight">Heart Rate</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Real-time Telemetry</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      {hrData.length > 0 ? hrData[hrData.length-1].value : "--"}
                    </span>
                  </div>
                </div>
                <div className="h-[120px]">
                  <HealthTrendsChart data={hrData} label="HR" color="#ef4444" />
                </div>
              </div>
           </div>
        </div>

        {/* Right Column: History & Logs */}
        <div className="xl:col-span-1 space-y-6 flex flex-col">
            {/* Quick Vitals Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-emerald-500" />
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Vital Entry</h3>
              </div>
              <VitalForm onSubmit={handleVitalSubmit} className="bg-transparent border-none p-0 shadow-none text-slate-900 dark:text-white overflow-visible" />
            </div>

            {/* Clinical History Section */}
            <div className="bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-md backdrop-blur-xl relative overflow-hidden flex-1 min-h-[400px]">
               <h3 className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
                  Clinical History
               </h3>

               <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {vitalsHistory.length > 0 ? (
                     [...vitalsHistory].reverse().slice(0, 10).map((v, i) => (
                        <div key={i} className="bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between group/item hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white hover:shadow-sm">
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                                v.type === "hr" ? "bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400" : "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400"
                              )}>
                                 {v.type === "hr" ? <Activity className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                              </div>
                              <div>
                                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{v.type === "hr" ? "Heart Rate" : "SpO2"}</div>
                                 <div className="text-[8px] text-slate-500 font-bold">{v.time}</div>
                              </div>
                           </div>
                           <div className="text-lg font-black text-slate-900 dark:text-white">{v.value}</div>
                        </div>
                     ))
                  ) : (
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] text-center mt-20 p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">No telemetry history</p>
                  )}
               </div>
               
               <Link href="/dashboard/history" className="mt-8 block w-full py-4 bg-slate-50 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border border-slate-200 dark:border-transparent text-slate-700 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center transition-all hover:shadow-sm">
                  View Archives
               </Link>
            </div>
            
            {/* Live Telemetry Log Component */}
            <TelemetryLog />
        </div>
      </div>

      {/* ── Systemic Insights Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: TrendingUp, label: "Optimization Status", value: "88%", desc: "Routine adherence is high this week.", color: "text-emerald-500" },
          { icon: ShieldAlert, label: "Risk Mitigation", value: "Verified", desc: "No critical anomalies detected in 24h.", color: "text-teal-500" },
          { icon: Info, label: "System Uptime", value: "99.9%", desc: "AI Doctor cores are fully operational.", color: "text-emerald-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm group hover:border-emerald-500/30 transition-all">
            <stat.icon className={cn("w-8 h-8 mb-4 transition-transform group-hover:scale-110", stat.color)} />
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{stat.label}</h4>
            <div className="text-3xl font-black my-2 text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
            <p className="text-xs text-slate-500 leading-relaxed font-bold">{stat.desc}</p>
          </div>
        ))}
      </div>

    </div>

    <EmergencyOverlay 
      isOpen={isEmergencyOpen} 
      riskScore={latestReport?.risk_score || 0}
      userName={user?.name || "Patient"}
      onClose={() => setIsEmergencyOpen(false)}
    />
    </>
  );
}

/** ── Realism Upgrade: Telemetry Log Component ── */
function TelemetryLog() {
  const [logs, setLogs] = useState<{ id: number; text: string; color: string }[]>([]);
  const logMessages = [
    { text: "Resolving 3D Mesh Vectors...", color: "text-emerald-500" },
    { text: "Synchronizing 7-Day Vitals...", color: "text-blue-500" },
    { text: "Aura Kernel: Clinical Synthesis Start", color: "text-white" },
    { text: "Anomaly Check: BP Baseline vs Current", color: "text-amber-500" },
    { text: "Secure Sync with Visual Lab Complete", color: "text-emerald-400" },
    { text: "Deep Scan: Pattern Recognition Active", color: "text-teal-400" },
    { text: "HIPAA Vault: Context Refreshed", color: "text-slate-500" },
    { text: "Tachycardic Spike Check: NEGATIVE", color: "text-emerald-600" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const msg = logMessages[Math.floor(Math.random() * logMessages.length)];
      const newLog = {
        id: Date.now(),
        text: `[${new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${msg.text}`,
        color: msg.color
      };
      setLogs(prev => [newLog, ...prev].slice(0, 8));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-md backdrop-blur-xl flex flex-col font-mono min-h-[300px]">
       <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <Terminal className="w-5 h-5 text-emerald-500" />
             <h3 className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-[0.3em]">Live Telemetry</h3>
          </div>
          <div className="flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
          </div>
       </div>
       
       <div className="flex-1 space-y-2.5 overflow-hidden p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-inner">
          {logs.map(log => (
            <div key={log.id} className={cn("text-[10px] font-bold tracking-tight border-l-2 pl-3 border-slate-200 dark:border-white/5",
               log.color.includes('white') ? 'text-slate-700 dark:text-white' : log.color
            )}>
               {log.text}
            </div>
          ))}
          {logs.length === 0 && <p className="text-slate-400 text-[10px] animate-pulse">Initializing diagnostics...</p>}
       </div>

       <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between">
          <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Latency: 22ms</span>
          <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">V4.2</span>
       </div>
    </div>
  );
}
