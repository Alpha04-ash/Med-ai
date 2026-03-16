"use client";

import { 
  Activity, 
  ChevronRight, 
  Send, 
  AlertCircle,
  Thermometer,
  Clock,
  ClipboardList,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnatomyFormProps {
  selectedPart: string | null;
  onSubmit: (data: any) => void;
  painLevel: number;
  setPainLevel: (val: number) => void;
  painType: string;
  setPainType: (val: string) => void;
  duration: string;
  setDuration: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
}

const PAIN_TYPES = ["Sharp", "Dull", "Burning", "Pressure", "Stabbing", "Tingling", "Numbness"];
const DURATIONS = ["Today", "Few days", "1 week", "Several weeks", "Months"];

export function AnatomyForm({ 
  selectedPart, 
  onSubmit, 
  painLevel, 
  setPainLevel, 
  painType, 
  setPainType, 
  duration, 
  setDuration, 
  description, 
  setDescription 
}: AnatomyFormProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;

    onSubmit({
      bodyPart: selectedPart,
      painLevel,
      painType,
      duration,
      description
    });
  };

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-8 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-emerald-500" />
          Describe Symptoms
        </h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Medical Assessment Panel</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {/* Selected Part */}
        <div className="space-y-4">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Selected Body Part</label>
          <div className={cn(
            "p-4 rounded-2xl border transition-all flex items-center justify-between",
            selectedPart 
              ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20" 
              : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"
          )}>
            <span className="text-lg font-black uppercase tracking-tight">
              {selectedPart || "Select on 3D Model"}
            </span>
            {selectedPart ? <Activity className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
          </div>
        </div>

        {/* Intensity */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pain Intensity</label>
             <span className="text-4xl font-black text-emerald-500">{painLevel}</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={painLevel} 
            onChange={(e) => setPainLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <p className="text-[10px] font-bold text-slate-400 uppercase text-right tracking-widest">Scale: 1 (Mild) - 10 (Critical)</p>
        </div>

        {/* Pain Type */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pain Type</label>
          <select 
            value={painType}
            onChange={(e) => setPainType(e.target.value)}
            className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 dark:text-white"
          >
            <option value="">Select Character...</option>
            {PAIN_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Duration</label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  duration === d
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-xl"
                    : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 hover:border-emerald-500/30"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-slate-400">Describe Symptoms</label>
           <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain your symptoms in detail..."
            className="w-full h-40 p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm leading-relaxed focus:ring-2 focus:ring-emerald-500 outline-none resize-none placeholder:text-slate-400 dark:text-white"
          />
        </div>
      </form>

      {/* Submit */}
      <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleSubmit}
          disabled={!selectedPart}
          className={cn(
            "w-full py-5 rounded-2xl text-base font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all",
            selectedPart
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-500/40 hover:scale-[1.02] active:scale-95"
              : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
          )}
        >
          Analyze Symptoms
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
