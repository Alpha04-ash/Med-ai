"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HealthScoreGaugeProps {
  score: number; // 0 to 100
  size?: number;
}

export function HealthScoreGauge({ score, size = 200 }: HealthScoreGaugeProps) {
  const [mounted, setMounted] = useState(false);
  const normalizedScore = Math.min(100, Math.max(0, score));
  
  // Set mounted to trigger the entry animation
  useEffect(() => {
    setMounted(true);
  }, []);

  const getColor = (s: number) => {
    if (s >= 80) return "#10b981"; // emerald-500
    if (s >= 50) return "#f59e0b"; // amber-500
    return "#ef4444"; // red-500
  };

  const color = getColor(normalizedScore);
  
  // SVG Math
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // start from bottom left (approx 135deg offset) and leave a gap at bottom
  // 3/4 circle = 270 degrees of actual stroke length
  const gapAngleDegrees = 90;
  const strokeLength = circumference * ((360 - gapAngleDegrees) / 360);
  
  // Dash offset logic
  // Progress determines how much of the strokeLength we show
  const progressRatio = normalizedScore / 100;
  const activeLength = strokeLength * progressRatio;
  const dashOffset = circumference - activeLength;

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      
      {/* Dynamic Ambient Glow Box Shadow */}
      <div 
        className="absolute inset-0 rounded-full blur-[32px] opacity-20 dark:opacity-30 transition-colors duration-1000"
        style={{ backgroundColor: color, transform: 'scale(0.8)' }}
      />
      
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="relative z-10 drop-shadow-sm"
        // Rotate so the gap is at the bottom (135deg rotation)
        style={{ transform: "rotate(135deg)" }}
      >
        {/* Track (Background Ring) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${strokeLength} ${circumference}`}
        />
        
        {/* Indicator (Active Progress Ring) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          // Dasharray total is circumference
          strokeDasharray={`${circumference} ${circumference}`}
          // Start at full offset (empty), animate to target offset
          strokeDashoffset={mounted ? dashOffset : circumference}
          className="transition-all duration-1000 ease-out"
          style={{ transitionDelay: "300ms" }} // small delay for nice intro
        />
      </svg>

      {/* Center Values */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center -mt-2">
        <span className="text-[3.5rem] leading-none font-black tracking-tighter text-slate-900 dark:text-white transition-colors duration-500">
          {mounted ? normalizedScore : 0}
        </span>
        <span className="text-[10px] mt-1 font-black tracking-[0.3em] text-slate-400 uppercase">
          Health Score
        </span>
      </div>
    </div>
  );
}
