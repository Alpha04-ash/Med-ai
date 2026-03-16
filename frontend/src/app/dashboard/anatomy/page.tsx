"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { AnatomyForm } from "@/components/AnatomyForm";
import {
  ChevronLeft,
  RotateCcw,
  Stethoscope,
  Activity,
  Scan,
  Info,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Load the 3D component client-side only (Three.js requires browser APIs)
const BodyModel = dynamic(() => import("@/components/BodyModel"), { ssr: false });

// All 40 selectable regions, grouped for the navigator sidebar
const NAV_GROUPS = [
  {
    label: "Head & Neck",
    parts: ["Head", "Face", "Forehead", "Jaw / Chin", "Neck"],
  },
  {
    label: "Chest & Abdomen",
    parts: [
      "Upper Chest",
      "Lower Chest",
      "Left Pectoral",
      "Right Pectoral",
      "Upper Abdomen",
      "Lower Abdomen",
    ],
  },
  {
    label: "Back",
    parts: ["Upper Back", "Mid Back", "Lower Back", "Left Glute", "Right Glute"],
  },
  {
    label: "Shoulders & Arms",
    parts: [
      "Left Shoulder",
      "Right Shoulder",
      "Left Upper Arm",
      "Right Upper Arm",
      "Left Elbow",
      "Right Elbow",
      "Left Forearm",
      "Right Forearm",
      "Left Wrist",
      "Right Wrist",
      "Left Hand",
      "Right Hand",
    ],
  },
  {
    label: "Hips & Legs",
    parts: [
      "Left Hip",
      "Right Hip",
      "Left Thigh",
      "Right Thigh",
      "Left Knee",
      "Right Knee",
      "Left Lower Leg",
      "Right Lower Leg",
      "Left Ankle",
      "Right Ankle",
      "Left Foot",
      "Right Foot",
    ],
  },
];

export default function AnatomyPage() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [view, setView] = useState<"front" | "back">("front");

  const [painLevel, setPainLevel] = useState(5);
  const [painType, setPainType] = useState("");
  const [duration, setDuration] = useState("Today");
  const [description, setDescription] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = useCallback((part: string) => setSelectedPart(part), []);

  const handleSubmit = (data: any) => {
    console.log("SYMPTOM SUBMIT →", data);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">

      {/* ── Subtle background lights ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[130px]" />
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[130px]" />
      </div>

      {/* ── HEADER ── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl">
        <div className="flex items-center gap-5">
          <Link
            href="/dashboard"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 transition-all shadow-sm group"
          >
            <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-emerald-500 transition-colors" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                Digital Anatomy Selector
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-0.5">
                40 Regions · AI-Ready
              </p>
            </div>
          </div>
        </div>

        {/* Anterior / Posterior Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          {(["front", "back"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                view === v
                  ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-md"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              {v === "front" ? "Anterior" : "Posterior"}
            </button>
          ))}
        </div>
      </header>

      {/* ── MAIN 3-COLUMN LAYOUT ── */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative z-10 w-full">

        {/* LEFT NAVIGATOR */}
        <aside className="lg:flex flex-col w-full lg:w-64 xl:w-72 flex-shrink-0 lg:border-r border-b lg:border-b-0 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl lg:overflow-hidden h-[300px] lg:h-auto">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Body Navigator
            </span>
            <Scan className="w-4 h-4 text-emerald-500/50" />
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 custom-scrollbar">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest px-2 mb-2">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.parts.map((part) => {
                    const isSelected = selectedPart === part;
                    return (
                      <button
                        key={part}
                        onClick={() => handleSelect(part)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5",
                          isSelected
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        )}
                      >
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full flex-shrink-0",
                          isSelected ? "bg-white" : "bg-emerald-400/40"
                        )} />
                        {part}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="hidden lg:block px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">
              Click body or use navigator
            </p>
          </div>
        </aside>

        {/* CENTER: 3D VIEWER */}
        <section className="relative flex flex-col p-4 lg:p-6 gap-4 min-h-[400px] h-[50vh] lg:h-auto lg:flex-1 w-full lg:w-auto">

          {/* Viewer Card */}
          <div className="flex-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-white dark:border-slate-800 shadow-2xl overflow-hidden relative">
            <BodyModel
              onSelect={handleSelect}
              selectedPart={selectedPart}
              view={view}
            />

            {/* Reset btn */}
            <button
              onClick={() => { setSelectedPart(null); setView("front"); }}
              title="Reset"
              className="absolute top-5 left-5 z-20 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white dark:border-slate-700 shadow-xl hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all group"
            >
              <RefreshCcw className="w-4 h-4 text-slate-500 group-hover:text-emerald-500 transition-all group-hover:rotate-[-180deg] duration-700" />
            </button>

            {/* Live indicator */}
            <div className="absolute top-5 right-5 z-20 flex items-center gap-2 px-4 py-2 bg-slate-900/90 rounded-full border border-white/10 shadow-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-[0.25em]">
                {view === "front" ? "Anterior" : "Posterior"}
              </span>
            </div>
          </div>

          {/* Hint bar */}
          <div className="flex items-center justify-center gap-2 py-2">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              Click any highlighted region · Drag to rotate · Scroll to zoom
            </p>
          </div>
        </section>

        {/* RIGHT: SYMPTOM FORM */}
        <section className="w-full lg:w-[360px] xl:w-[400px] flex-shrink-0 lg:border-l border-t lg:border-t-0 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl overflow-y-auto lg:overflow-hidden flex flex-col">
          <AnatomyForm
            selectedPart={selectedPart}
            onSubmit={handleSubmit}
            painLevel={painLevel}
            setPainLevel={setPainLevel}
            painType={painType}
            setPainType={setPainType}
            duration={duration}
            setDuration={setDuration}
            description={description}
            setDescription={setDescription}
          />
        </section>
      </main>

      {/* ── SUCCESS OVERLAY ── */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-md w-full text-center border border-emerald-500/25 shadow-[0_0_80px_rgba(16,185,129,0.12)]"
            >
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-emerald-500/30 rotate-6">
                <Activity className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                Symptoms Submitted
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                Your telemetry data has been sent to the AI Doctor for analysis. Return to the dashboard for your results.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
