"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, LineChart, Line } from "recharts";

interface ProjectionChartProps {
  currentRisk: number;
  historicalData: { date: string; risk: number }[];
}

export function ProjectionChart({ currentRisk, historicalData }: ProjectionChartProps) {
  // Generate a prediction based on the trend of historical data
  const generateProjection = () => {
    const last3 = historicalData.slice(-3);
    const trend = last3.length >= 2 
      ? (last3[last3.length - 1].risk - last3[0].risk) / (last3.length - 1)
      : 0;
    
    const projection = [];
    let lastRisk = currentRisk;

    for (let i = 1; i <= 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        // Projecting a slightly worsening trend if trend is positive, or stabilizing if negative
        const volatility = (Math.random() - 0.5) * 5;
        lastRisk = Math.min(100, Math.max(0, lastRisk + trend + volatility));
        
        projection.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            risk: Math.round(lastRisk),
            isProjection: true
        });
    }
    return projection;
  };

  const fullData = [
    ...historicalData.map(d => ({ ...d, isProjection: false })),
    ...generateProjection()
  ];

  return (
    <div className="w-full h-[400px] bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-700" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Pathology Projection</h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">7-Day Historical vs 7-Day Predicted Risk</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">History</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full border border-slate-300 border-dashed" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Projection</span>
           </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={fullData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorProjection" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.05}/>
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 9, fontWeight: 800, fill: '#94a3b8'}} 
            dy={10}
          />
          <YAxis 
            hide 
            domain={[0, 100]} 
          />
          <Tooltip 
            content={({ active, payload }) => {
                if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                        <div className="bg-slate-900 px-4 py-2 rounded-xl shadow-2xl border border-white/10">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                {data.isProjection ? 'PROJECTION' : 'CONFIRMED'}
                            </p>
                            <p className="text-white font-black text-lg">
                                {data.risk} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                            </p>
                            <p className="text-emerald-500 text-[10px] font-bold mt-1 uppercase tracking-tighter">
                                {data.date}
                            </p>
                        </div>
                    );
                }
                return null;
            }}
          />
          
          <Area 
            type="monotone" 
            dataKey="risk" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRisk)" 
            connectNulls
            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
          />
          
          <ReferenceLine x={historicalData[historicalData.length - 1]?.date} stroke="#e2e8f0" strokeDasharray="3 3" label={{ position: 'top', value: 'PRESENT', fill: '#94a3b8', fontSize: 8, fontWeight: 900 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
