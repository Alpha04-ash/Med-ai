"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VitalInput {
    heart_rate: number;
    systolic: number;
    diastolic: number;
    temperature: number;
    spo2: number;
    respiratory_rate: number;
}

interface VitalFormProps {
    onSubmit: (vitals: VitalInput) => void;
    className?: string;
}

export function VitalForm({ onSubmit, className }: VitalFormProps) {
    const [vitals, setVitals] = useState<VitalInput>({
        heart_rate: 75,
        systolic: 120,
        diastolic: 80,
        temperature: 36.6,
        spo2: 98,
        respiratory_rate: 16,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setVitals((prev) => ({ ...prev, [name]: Number(value) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(vitals);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm", className)}
        >
            <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-lg">Vital Entry</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium tracking-wide uppercase">Heart Rate</label>
                    <input
                        type="number"
                        name="heart_rate"
                        value={vitals.heart_rate}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium tracking-wide uppercase">SpO2 (%)</label>
                    <input
                        type="number"
                        name="spo2"
                        value={vitals.spo2}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium tracking-wide uppercase">Sys BP</label>
                    <input
                        type="number"
                        name="systolic"
                        value={vitals.systolic}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium tracking-wide uppercase">Dia BP</label>
                    <input
                        type="number"
                        name="diastolic"
                        value={vitals.diastolic}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium tracking-wide uppercase">Temp (°C)</label>
                    <input
                        type="number"
                        name="temperature"
                        step="0.1"
                        value={vitals.temperature}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium tracking-wide uppercase">Resp Rate</label>
                    <input
                        type="number"
                        name="respiratory_rate"
                        value={vitals.respiratory_rate}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                    />
                </div>
            </div>

            <button
                type="submit"
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
            >
                Submit Vitals
            </button>
        </form>
    );
}
