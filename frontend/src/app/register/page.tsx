"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HeartPulse, Loader2, User, Mail, Lock, Ruler, Weight } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ 
    name: "", email: "", password: "", age: "", gender: "Male", weight: "", height: "",
    baseline_systolic: "120", baseline_diastolic: "80"
  });
  const [agreed, setAgreed] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Registration failed");

      localStorage.setItem("myhealth_token", data.data.token);
      localStorage.setItem("myhealth_user_id", data.data.user.id);
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 pt-12 pb-12 relative overflow-hidden">
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-2xl relative z-10">
        <div className="flex justify-center mb-6">
          <Link href="/">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <HeartPulse className="w-8 h-8 text-white" />
            </div>
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 dark:text-white">Create Account</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Join MyHealth AI for personalized telemetry</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 dark:text-slate-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="John Doe" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 dark:text-slate-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="you@example.com" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-slate-300">Age</label>
            <input type="number" required value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full px-4 py-3 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="25" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-slate-300">Gender</label>
            <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-3 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-white">
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-slate-300">Height (cm)</label>
            <div className="relative">
              <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="number" required value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="175" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-slate-300">Weight (kg)</label>
            <div className="relative">
              <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="number" required value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="70" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-slate-300 font-bold text-emerald-600 dark:text-emerald-400">Normal Sys BP</label>
            <input type="number" required value={formData.baseline_systolic} onChange={(e) => setFormData({...formData, baseline_systolic: e.target.value})} className="w-full px-4 py-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="120" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-slate-300 font-bold text-emerald-600 dark:text-emerald-400">Normal Dia BP</label>
            <input type="number" required value={formData.baseline_diastolic} onChange={(e) => setFormData({...formData, baseline_diastolic: e.target.value})} className="w-full px-4 py-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="80" />
          </div>

          <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl mt-2">
            <input 
              type="checkbox" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer" 
            />
            <label className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-none cursor-pointer">
              I agree to the <Link href="/terms" className="text-emerald-500 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-emerald-500 hover:underline">Privacy Policy</Link>
            </label>
          </div>

          <button type="submit" disabled={loading} className="md:col-span-2 w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 mt-4 disabled:opacity-70">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          Already have an account? <Link href="/login" className="text-emerald-500 hover:text-emerald-600 font-bold">Login here</Link>
        </p>
      </div>
    </div>
  );
}
