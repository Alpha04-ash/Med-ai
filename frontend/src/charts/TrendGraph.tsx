"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { cn } from "@/lib/utils";

interface DataPoint {
    time: string;
    hr: number;
    spo2: number;
}

interface TrendGraphProps {
    data: DataPoint[];
    className?: string;
}

export function TrendGraph({ data, className }: TrendGraphProps) {
    return (
        <div className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm", className)}>
            <h3 className="font-semibold text-lg mb-4">Live Telemetry</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            domain={['dataMin - 10', 'dataMax + 10']}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            domain={[85, 100]}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="hr"
                            stroke="#ef4444"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                            isAnimationActive={true}
                            name="Heart Rate"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="spo2"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                            isAnimationActive={true}
                            name="SpO2"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
