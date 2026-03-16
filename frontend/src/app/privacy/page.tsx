"use client";

import Link from "next/link";
import { ChevronLeft, ShieldCheck, Lock, Eye, Zap, Database, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-6 md:p-12 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
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
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Privacy Policy</h1>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Last Updated: March 2026</p>
            </div>
          </div>
        </header>

        <section className="space-y-12">
          {/* Section 1 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-emerald-500">
                <Database className="w-4 h-4" />
              </span>
              Data Collection
            </h2>
            <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-900 space-y-4">
              <p className="leading-relaxed">
                MyHealth AI collects medical telemetry data including heart rate, blood pressure, and symptom logs to provide 
                real-time health insights via our AI diagnostic engines.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['Biometric Vitals', 'Consultation Transcripts', 'Visual Diagnosis Photos', 'Diagnostic Reports'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                    <Zap className="w-3 h-3 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Section 2 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-emerald-500">
                <Lock className="w-4 h-4" />
              </span>
              Security Infrastructure
            </h2>
            <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-900 space-y-4">
              <p className="leading-relaxed">
                All health records are encrypted using AES-256 at rest and TLS 1.3 in transit. Our servers are 
                fully HIPAA-compliant and all AI analysis is performed in secure, isolated environments.
              </p>
            </div>
          </motion.div>

          {/* Section 3 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-emerald-500">
                <Eye className="w-4 h-4" />
              </span>
              Transparency
            </h2>
            <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-900 space-y-4">
              <p className="leading-relaxed">
                You retain 100% ownership of your medical footprint. At any time, you can export your entire clinical 
                history or execute a permanent purge of all telemetry data via the Settings panel.
              </p>
            </div>
          </motion.div>
        </section>

        <footer className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-emerald-500" />
            <span className="font-black text-xs uppercase tracking-widest text-slate-400">MyHealth AI Protocol</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase truncate">Secure Medical Neural Network</p>
        </footer>
      </div>
    </div>
  );
}
