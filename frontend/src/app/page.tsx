"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck, HeartPulse, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("myhealth_token");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center overflow-x-hidden">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-8 h-8 text-emerald-500" />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">MyHealth<span className="text-emerald-500">AI</span></span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors">
            Login
          </Link>
          <Link href="/register" className="text-sm font-medium bg-emerald-500 text-white px-5 py-2.5 rounded-full hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95">
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-6 z-10 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Next-Gen Medical Telemetry
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl leading-tight mb-8">
          Personal AI Doctor & <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Real-time Dashboard</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-12">
          Monitor your vitals, identify health risks securely, and consult with an advanced AI that understands complex medical context and visual diagnostics.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Link href="/register" className="flex items-center justify-center gap-2 w-full bg-emerald-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:-translate-y-1">
            Start Monitoring <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-24 w-full text-sm">
          {[
            { 
              icon: <Sparkles className="w-6 h-6 text-emerald-500" />, 
              title: "Multimodal Interface",
              desc: "See, Hear, and Speak with Dr. Aura. Integrated Vision, Voice recognition, and manual TTS controls for a seamless medical consult."
            },
            { 
              icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />, 
              title: "Clinical Grounding",
              desc: "Engineered to avoid hallucinations. All AI agents are grounded in verified AHA, ADA, and GINA medical clinical guidelines." 
            },
            { 
              icon: <Activity className="w-6 h-6 text-rose-500" />, 
              title: "Live Telemetry Dashboard",
              desc: "Real-time WebSocket layer for vital streaming with a deterministic risk engine for immediate acuity assessment." 
            }
          ].map((f, i) => (
            <div key={i} className="p-6 md:p-8 rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-left hover:scale-[1.02] transition-transform cursor-default">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
