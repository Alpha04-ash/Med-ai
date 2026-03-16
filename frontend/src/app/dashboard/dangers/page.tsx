"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Activity, HeartCrack, RefreshCw, Loader2, Download } from "lucide-react";
import { generateHealthPDF } from "@/lib/pdf-export";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  High:     { color: "text-red-500",    bg: "bg-red-100 dark:bg-red-900/30",    border: "border-red-200 dark:border-red-900/50" },
  Moderate: { color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-200 dark:border-orange-900/50" },
  Low:      { color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30", border: "border-yellow-200 dark:border-yellow-900/50" },
};

export default function DangersPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = typeof window !== "undefined" ? localStorage.getItem("myhealth_user_id") || "demo_user" : "demo_user";

  const fetchLatest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/reports/latest/${userId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setReport(data.data);
      } else {
        setError(data.message || "No report found. Generate one now!");
      }
    } catch (e) {
      setError("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/reports/generate/${userId}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setReport(data.data);
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError("Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { fetchLatest(); }, []);

  const suggestions = report?.suggestions 
    ? (typeof report.suggestions === 'string' ? JSON.parse(report.suggestions) : report.suggestions)
    : null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            Risk Assessment
          </h1>
          <p className="text-slate-500 mt-2">AI-computed danger flags based on your personal health profile and vitals.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => report ? generateHealthPDF(report) : null}
            disabled={!report}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={generateReport}
            disabled={generating}
            className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {generating ? "Analyzing..." : "Run AI Analysis"}
          </button>
        </div>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="ml-3 text-slate-500">Loading your health report...</span>
        </div>
      )}

      {error && !loading && !report && (
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
          <p className="text-amber-800 dark:text-amber-200 font-medium">{error}</p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">Click <strong>"Run AI Analysis"</strong> above to generate your first report.</p>
        </div>
      )}

      {report && suggestions && !loading && (
        <>
          {/* Risk Score Summary */}
          <div className={cn(
            "p-6 rounded-3xl border flex items-center gap-6",
            report.classification === 'Critical' ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 
            report.classification === 'Monitor' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30' : 
            'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30'
          )}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 shadow-inner border border-slate-200 dark:border-slate-700 flex-shrink-0">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{report.risk_score}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Acuity Risk Score</p>
              <h2 className={cn(
                "text-2xl font-black",
                report.classification === 'Critical' ? 'text-red-600' : 
                report.classification === 'Monitor' ? 'text-amber-600' : 'text-emerald-600'
              )}>
                {report.classification}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{suggestions.summary}</p>
            </div>
          </div>

          {/* Danger Cards */}
          <div className="space-y-6">
            {suggestions.dangers.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                <p className="font-bold text-emerald-700 dark:text-emerald-300">No critical risks detected — great work!</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">Continue logging vitals regularly to keep your data accurate.</p>
              </div>
            ) : (
              suggestions.dangers.map((risk: any, idx: number) => {
                const styles = SEVERITY_STYLES[risk.severity] || SEVERITY_STYLES.Low;
                return (
                  <div key={idx} className={cn("p-6 rounded-3xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center", styles.border)}>
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0", styles.bg)}>
                      <HeartCrack className={cn("w-7 h-7", styles.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{risk.title}</h3>
                        <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest", styles.bg, styles.color)}>
                          {risk.severity} RISK
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{risk.desc}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl md:w-64 w-full border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Recommended Action</p>
                      <p className="text-sm text-slate-900 dark:text-white font-bold">{risk.action}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-200 dark:border-emerald-900/30 flex items-start gap-4">
            <Activity className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
              This assessment is AI-generated from your verified profile characteristics and logged vitals. Click <strong>Run AI Analysis</strong> after logging new vitals to refresh your score.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
