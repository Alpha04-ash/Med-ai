"use client";

import Link from "next/link";
import { ChevronLeft, Scale, AlertTriangle, CheckCircle2, HeartPulse, FileText, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-6 md:p-12 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <header className="mb-16">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all mb-8 font-bold text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Sign Up
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Terms of Service</h1>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Last Updated: March 2026</p>
            </div>
          </div>
        </header>

        <section className="space-y-12">
          {/* Section 1 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-blue-500">
                <FileText className="w-4 h-4" />
              </span>
              User Agreement
            </h2>
            <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-900 space-y-4">
              <p className="leading-relaxed">
                By accessing MyHealth AI, you agree to provide accurate medical baseline data to ensure the 
                safety and precision of our AI-driven clinical analysis.
              </p>
            </div>
          </motion.div>

          {/* Section 2 (Crucial for Medical Apps) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3 text-amber-600 dark:text-amber-500">
              <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </span>
              Medical Disclaimer
            </h2>
            <div className="pl-11 border-l-2 border-amber-100 dark:border-amber-900/40 space-y-4">
              <p className="leading-relaxed font-bold">
                MyHealth AI is an assistant tool, NOT a replacement for emergency services or 
                licensed medical practitioners. 
              </p>
              <p className="leading-relaxed text-slate-500 text-sm">
                In the event of a medical emergency, immediately contact your local emergency services (911/112). 
                AI-generated insights should be discussed with a qualified healthcare professional before taking 
                any clinical action.
              </p>
            </div>
          </motion.div>

          {/* Section 3 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-emerald-500">
                <Activity className="w-4 h-4" />
              </span>
              Platform Usage
            </h2>
            <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-900 space-y-4">
              <ul className="space-y-3">
                {[
                  'You must be 18+ to use the full diagnostic suite.',
                  'One account per patient identity.',
                  'Prohibited use for illegal medical document generation.',
                  'Real-time telemetry remains the property of the patient.'
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </section>

        <footer className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-emerald-500" />
            <span className="font-black text-xs uppercase tracking-widest text-slate-400">MyHealth AI Protocol</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase truncate">Legal Protocol Engine v1.0</p>
        </footer>
      </div>
    </div>
  );
}
