"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, ShieldCheck, HeartPulse } from "lucide-react";

interface RiskGaugeProps {
  score: number; // 0 to 100
  classification: "Stable" | "Monitor" | "Critical";
  size?: number;
  className?: string;
}

export function RiskGauge({ score, classification, size = 200, className }: RiskGaugeProps) {
  const [mounted, setMounted] = useState(false);
  const normalizedScore = Math.min(100, Math.max(0, score));
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const getStyle = () => {
    switch (classification) {
      case "Stable": return { color: "#10b981", bg: "bg-emerald-500", light: "bg-emerald-100 dark:bg-emerald-900/20", icon: ShieldCheck };
      case "Monitor": return { color: "#f59e0b", bg: "bg-amber-500", light: "bg-amber-100 dark:bg-amber-900/20", icon: AlertTriangle };
      case "Critical": return { color: "#ef4444", bg: "bg-red-500", light: "bg-red-100 dark:bg-red-900/20", icon: HeartPulse };
      default: return { color: "#64748b", bg: "bg-slate-500", light: "bg-slate-100 dark:bg-slate-900/20", icon: AlertTriangle };
    }
  };

  const style = getStyle();
  const Icon = style.icon;
  
  // SVG Math (3/4 Circle Gauge)
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const gapAngleDegrees = 90;
  const strokeLength = circumference * ((360 - gapAngleDegrees) / 360);
  
  const progressRatio = normalizedScore / 100;
  const activeLength = strokeLength * progressRatio;
  const dashOffset = circumference - activeLength;

  return (
    <div className={cn("relative flex items-center justify-center select-none group", className)} style={{ width: size, height: size }}>
      
      {/* Ambient Glow */}
      <div 
        className="absolute inset-0 rounded-full blur-[40px] opacity-10 dark:opacity-20 transition-all duration-1000 group-hover:opacity-30"
        style={{ backgroundColor: style.color, transform: 'scale(0.8)' }}
      />
      
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="relative z-10 drop-shadow-sm"
        style={{ transform: "rotate(135deg)" }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          className="text-slate-100 dark:text-slate-800"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${strokeLength} ${circumference}`}
        />
        
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={style.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={mounted ? dashOffset : circumference}
          className="transition-all duration-1000 ease-out"
          style={{ transitionDelay: "200ms" }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center -mt-2">
        <Icon className={cn("w-6 h-6 mb-1 transition-colors duration-500", classification === "Critical" ? "text-red-500" : "text-slate-400")} />
        <span className="text-[3.2rem] leading-none font-black tracking-tighter text-slate-900 dark:text-white">
          {mounted ? normalizedScore : 0}
        </span>
        <div className={cn("mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-black/5", style.bg)}>
          {classification}
        </div>
      </div>
    </div>
  );
}
