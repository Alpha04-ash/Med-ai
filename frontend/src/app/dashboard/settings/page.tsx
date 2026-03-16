"use client";

import { useState } from "react";
import { User, Shield, Bell, HardDrive, Smartphone, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile Information", icon: User },
  { id: "security", label: "Security & Access", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "data", label: "Data & Privacy", icon: HardDrive },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-700 h-full flex flex-col">
      
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-lg">
              <Smartphone className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              System Settings
            </h1>
          </div>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px] pl-1">
            Manage your AI assistant configurations and account preferences
          </p>
        </div>
      </header>

      {/* ── Layout ── */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 flex-1">
        
        {/* Sidebar Nav */}
        <aside className="lg:w-64 flex-shrink-0">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-emerald-400 dark:text-emerald-600" : "")} />
                {tab.label}
                {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50 hidden lg:block" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 lg:p-10 shadow-sm relative overflow-hidden">
           
           {/* Ambient Glow */}
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" />

           {activeTab === "profile" && <ProfileSettings />}
           {activeTab === "security" && <SecuritySettings />}
           {activeTab === "notifications" && <NotificationSettings />}
           {activeTab === "data" && <DataSettings />}
        </div>
      </div>
    </div>
  );
}

// ── Dummy Tabs ──

function ProfileSettings() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase mb-1">Profile Information</h2>
        <p className="text-sm text-slate-500 font-bold">Update your clinical identity details.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Full Name</label>
          <input type="text" defaultValue="John Doe" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contact Email</label>
          <input type="email" defaultValue="clinical.access@example.com" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
        <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePasswordUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase mb-1">Security & Access</h2>
        <p className="text-sm text-slate-500 font-bold">Manage your password and HIPAA compliance layers.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2 max-w-sm">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Update Password</label>
          <input type="password" placeholder="Current Password" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all mb-2" />
          <input type="password" placeholder="New Password" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
          
          <button 
            onClick={handlePasswordUpdate}
            disabled={loading}
            className="mt-4 w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Updating..." : success ? "Password Updated" : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase mb-1">Notifications</h2>
        <p className="text-sm text-slate-500 font-bold">Configure AI telemetry alerts and digest emails.</p>
      </div>
      <div className="space-y-3">
        {['Critical Real-time Alerts', 'Daily Health Digests', 'AI Doctor Suggestions', 'System Updates'].map((item, i) => (
          <label key={i} className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <input type="checkbox" defaultChecked={i < 2} className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function DataSettings() {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [doctorEmail, setDoctorEmail] = useState("");
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  
  const userId = typeof window !== "undefined" ? localStorage.getItem("myhealth_user_id") || "demo_user" : "demo_user";

  const handleAction = async (action: 'export' | 'purge' | 'forward') => {
    if (action === 'purge') setShowPurgeModal(false);
    
    setLoadingAction(action);
    setMessage(null);
    try {
      let url = `http://localhost:8080/api/v1/users/${userId}/${action}`;
      let method = 'GET';
      let body = undefined;

      if (action === 'purge') method = 'DELETE';
      if (action === 'forward') {
        method = 'POST';
        body = JSON.stringify({ email: doctorEmail });
        if (!doctorEmail) {
           setMessage({ type: 'error', text: 'Please enter a valid physician email.' });
           setLoadingAction(null);
           return;
        }
      }

      const headers = { 'Content-Type': 'application/json' };
      const res = await fetch(url, { method, headers, body });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || 'Action failed');

      if (action === 'export') {
         // Create a downloadable blob
         const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
         const blobUrl = URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = blobUrl;
         link.download = `medical_footprint_${userId}.json`;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         setMessage({ type: 'success', text: 'Medical record successfully exported.' });
      } else if (action === 'purge') {
         setMessage({ type: 'success', text: 'Telemetry data completely purged from servers.' });
      } else if (action === 'forward') {
         setMessage({ type: 'success', text: data.message || `Data securely sent to ${doctorEmail}.` });
         setDoctorEmail("");
      }

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase mb-1">Data & Privacy</h2>
          <p className="text-sm text-slate-500 font-bold">Manage your medical footprint and securely transmit history.</p>
        </div>

        {message && (
          <div className={cn("p-4 rounded-xl text-sm font-bold border", message.type === 'success' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800")}>
            {message.text}
          </div>
        )}

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          <button 
            onClick={() => handleAction('export')}
            disabled={loadingAction !== null}
            className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all disabled:opacity-50"
          >
            {loadingAction === 'export' ? "Exporting..." : "Export Medical Record (.JSON)"}
          </button>
          <button 
            onClick={() => setShowPurgeModal(true)}
            disabled={loadingAction !== null}
            className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all disabled:opacity-50"
          >
            {loadingAction === 'purge' ? "Purging..." : "Purge Telemetry Data"}
          </button>
        </div>
      </div>

      {/* Purge Confirmation Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Are you absolutely sure?</h3>
            <p className="text-slate-500 mb-8 text-sm font-medium leading-relaxed">
              This action cannot be undone. This will permanently delete your entire patient history, AI consultations, and telemetry data from our servers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowPurgeModal(false)}
                className="flex-1 px-5 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleAction('purge')}
                className="flex-1 px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 transition-all active:scale-95"
              >
                Yes, Purge Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
