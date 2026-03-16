"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, TrendingUp, CheckCircle2, RefreshCw, Loader2, Download, Sparkles } from "lucide-react";
import { generateHealthPDF } from "@/lib/pdf-export";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  "On Track":      { color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  "Action Needed": { color: "text-amber-500",   bg: "bg-amber-100 dark:bg-amber-900/30" },
  "Needs Focus":   { color: "text-teal-500",    bg: "bg-teal-100 dark:bg-teal-900/30" },
};

export default function ImprovementsPage() {
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
        setError(data.message || "No report found.");
      }
    } catch {
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
    } catch {
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-6 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8 text-emerald-500 flex-shrink-0" />
            Health Optimization
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">Personalized AI suggestions based on your profile and recorded vitals.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => report ? generateHealthPDF(report) : null}
            disabled={!report}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={generateReport}
            disabled={generating}
            className="flex items-center justify-center gap-2 px-6 py-3 sm:py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 w-full sm:w-auto"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {generating ? "Analyzing..." : "Update Health Plan"}
          </button>
        </div>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="ml-3 text-slate-500">Loading optimization plan...</span>
        </div>
      )}

      {error && !loading && !report && (
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
          <p className="text-amber-800 dark:text-amber-200 font-medium">{error}</p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">Click <strong>"Update Health Plan"</strong> to generate your first assessment.</p>
        </div>
      )}

      {report && suggestions && !loading && (
        <>
          {/* Improvement Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.improvements.map((item: any, idx: number) => {
              const styles = STATUS_STYLES[item.status] || STATUS_STYLES["Needs Focus"];
              return (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col group">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform", styles.bg)}>
                    <TrendingUp className={cn("w-6 h-6", styles.color)} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-1 leading-relaxed font-medium">{item.desc}</p>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mt-auto">
                    <CheckCircle2 className={cn("w-4 h-4", styles.color)} />
                    <span className={styles.color}>{item.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Daily Routine */}
          {suggestions.routine && suggestions.routine.length > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] p-10 border border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-24 h-24 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Your Personalized Daily Routine</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {suggestions.routine.map((task: string, i: number) => (
                  <li key={i} className="flex items-start gap-4 text-slate-700 dark:text-slate-300">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 shadow-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm flex-shrink-0 border border-emerald-100 dark:border-emerald-800">
                      {i + 1}
                    </div>
                    <span className="text-sm font-bold leading-relaxed pt-2">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
