"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, Activity, Heart, ShieldAlert } from "lucide-react";
import { useEffect } from "react";

interface EmergencyOverlayProps {
  isOpen: boolean;
  riskScore: number;
  userName: string;
  onClose: () => void;
}

export function EmergencyOverlay({ isOpen, riskScore, userName, onClose }: EmergencyOverlayProps) {
  // Trigger Vibration on Mount
  useEffect(() => {
    if (isOpen && "vibrate" in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-red-950/90 backdrop-blur-2xl"
        >
          {/* Pulsing Background Ring */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <motion.div 
               animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
               transition={{ duration: 3, repeat: Infinity }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[40px] border-red-500/20 rounded-full"
             />
          </div>

          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            className="relative w-full max-w-lg mx-4 bg-white rounded-[4rem] p-12 text-center shadow-[0_0_100px_rgba(239,68,68,0.5)] border-4 border-red-500"
          >
            {/* Critical Icon Section */}
            <div className="mb-8 relative inline-block">
               <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-12 h-12 text-white" />
               </div>
               <motion.div 
                 animate={{ opacity: [0, 1, 0] }}
                 transition={{ duration: 1, repeat: Infinity }}
                 className="absolute -top-2 -right-2 px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-tighter"
               >
                 Acuity_Alert
               </motion.div>
            </div>

            <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
              Critical Risk Detected
            </h1>
            <p className="text-slate-500 text-lg mb-8 font-medium">
              Aura has detected a <span className="text-red-600 font-bold">Risk Score of {riskScore}/100</span>. Please proceed immediately to the nearest medical professional.
            </p>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4 mb-10">
               <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex flex-col items-center">
                  <Activity className="w-6 h-6 text-red-500 mb-2" />
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Priority</span>
                  <span className="text-xl font-black text-red-900">LEVEL_1</span>
               </div>
               <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex flex-col items-center">
                  <ShieldAlert className="w-6 h-6 text-red-500 mb-2" />
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Status</span>
                  <span className="text-xl font-black text-red-900">URGENT</span>
               </div>
            </div>

            {/* Emergency Action Buttons */}
            <div className="space-y-4">
              <a 
                href="tel:911"
                className="flex items-center justify-center gap-4 w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-[2.5rem] text-xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-500/40 group"
              >
                <Phone className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Call Emergency (911)
              </a>
              
              <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-3xl text-xs font-black uppercase tracking-widest transition-all"
              >
                I am already in care / Dismiss
              </button>
            </div>

            {/* Clinical ID */}
            <div className="mt-8 flex justify-center items-center gap-2">
               <ShieldAlert className="w-3 h-3 text-red-400" />
               <span className="text-[8px] font-mono text-red-400 font-bold uppercase tracking-[0.2em]">Protocol: AURA_E_CODE_RED.SOP</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
