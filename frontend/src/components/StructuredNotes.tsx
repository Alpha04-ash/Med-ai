"use client";

import { FileText, Activity, Layers, Crosshair, ClipboardCheck, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StructuredNotesData {
  symptoms: string[];
  possible_causes: string[];
  suggested_actions: string[];
  confidence_score: number;
}

interface StructuredNotesProps {
  data: StructuredNotesData | null;
  className?: string;
}

export function StructuredNotes({ data, className }: StructuredNotesProps) {
  if (!data) {
    return (
      <div
        className={cn(
          "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[400px] shadow-sm",
          className
        )}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2 max-w-[200px]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Analysis Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Share your symptoms in the chat to begin a real-time health assessment.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 mt-4">
          <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Waiting for Data...</span>
        </div>
      </div>
    );
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full",
        className
      )}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-5 border-b border-slate-50 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Assessment</h3>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Live Structured Observations</p>
            </div>
          </div>
          <div
            className={cn(
              "px-3 py-1.5 rounded-xl border text-[10px] font-bold tracking-wider flex items-center gap-2",
              getConfidenceColor(data.confidence_score)
            )}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {data.confidence_score}% CONFIDENCE
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {/* Symptoms */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h4 className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Identified Symptoms</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.symptoms.map((item, i) => (
              <span
                key={i}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                {item}
              </span>
            ))}
            {data.symptoms.length === 0 && (
              <p className="text-xs text-slate-400 italic">No specific symptoms identified yet...</p>
            )}
          </div>
        </section>

        {/* Possible Causes */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-amber-500" />
            <h4 className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Possible Causes</h4>
          </div>
          <ul className="space-y-3">
            {data.possible_causes.map((item, i) => (
              <li key={i} className="flex items-start gap-3 group">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 group-hover:scale-125 transition-transform" />
                <span className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{item}</span>
              </li>
            ))}
            {data.possible_causes.length === 0 && (
              <p className="text-xs text-slate-400 italic">Analysis in progress...</p>
            )}
          </ul>
        </section>

        {/* Suggested Actions */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Crosshair className="w-4 h-4 text-blue-500" />
            <h4 className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Suggested Actions</h4>
          </div>
          <div className="space-y-3">
            {data.suggested_actions.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 flex gap-3 items-start"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 leading-relaxed">{item}</p>
              </div>
            ))}
            {data.suggested_actions.length === 0 && (
              <p className="text-xs text-slate-400 italic font-medium">Listening for actionable details...</p>
            )}
          </div>
        </section>
      </div>

      {/* Footer / Disclaimer */}
      <div className="flex-shrink-0 p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] leading-relaxed text-slate-400 font-medium italic">
          Disclaimer: This is an AI-generated assessment for informational purposes only. Consult a real medical professional for diagnosis.
        </p>
      </div>
    </div>
  );
}
