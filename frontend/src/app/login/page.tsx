"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HeartPulse, Loader2, Mail, Lock, ShieldCheck, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to login");

      localStorage.setItem("myhealth_token", data.data.token);
      localStorage.setItem("myhealth_user_id", data.data.user.id);
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-6 relative overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-white dark:border-slate-800 rounded-[3rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <Link href="/" className="group">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-500">
                <HeartPulse className="w-10 h-10 text-white" />
              </div>
            </Link>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-6 tracking-tight uppercase">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Secure Protocol Access
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold text-center leading-relaxed"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 z-10" />
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:bg-white dark:focus:bg-slate-800 transition-all font-medium placeholder:text-slate-400 dark:text-white"
                  placeholder="name@clinical.sys"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Key</label>
                <button type="button" className="text-[9px] font-black text-emerald-500 hover:text-emerald-600 uppercase tracking-widest">Forgot Pass?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 z-10" />
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:bg-white dark:focus:bg-slate-800 transition-all font-medium placeholder:text-slate-400 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="group relative w-full overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest py-5 rounded-[1.5rem] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl disabled:opacity-70 disabled:scale-100"
            >
              <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative flex items-center justify-center gap-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Initialize Dashboard
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          <p className="text-center mt-10 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Identity Unverified? <Link href="/register" className="text-emerald-500 hover:text-emerald-400 transition-colors ml-1">Create Protocol Account</Link>
          </p>
        </div>

        {/* Legal Footer Links */}
        <div className="flex justify-center gap-6 mt-8">
           <Link href="/terms" className="text-[9px] font-black text-slate-400 hover:text-emerald-500 uppercase tracking-widest transition-colors">Terms of Use</Link>
           <Link href="/privacy" className="text-[9px] font-black text-slate-400 hover:text-emerald-500 uppercase tracking-widest transition-colors">Security Data Policy</Link>
        </div>
      </motion.div>
    </div>
  );
}
