import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertBannerProps {
    classification: "Stable" | "Monitor" | "Critical";
    reasons: string[];
    className?: string;
}

export function AlertBanner({ classification, reasons, className }: AlertBannerProps) {
    if (classification === "Stable") {
        return (
            <div className={cn("bg-emerald-50/80 dark:bg-emerald-950/30 border-2 border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-2xl p-5 flex items-start gap-4 shadow-sm backdrop-blur-md transition-all", className)}>
                <div className="bg-emerald-100 dark:bg-emerald-500/20 p-1.5 rounded-full">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h4 className="font-black text-sm uppercase tracking-widest text-emerald-900 dark:text-emerald-200">Patient Stable</h4>
                    <p className="text-sm mt-1 font-bold text-emerald-700/80 dark:text-emerald-400/80">All vitals are within standard normal limits.</p>
                </div>
            </div>
        );
    }

    const isCritical = classification === "Critical";

    return (
        <div className={cn(
            "rounded-2xl p-5 flex items-start gap-4 border-2 shadow-sm animate-in fade-in slide-in-from-top-2 backdrop-blur-md transition-all",
            isCritical
                ? "bg-red-50/80 dark:bg-red-950/30 border-red-100 dark:border-red-900/50 text-red-800 dark:text-red-300"
                : "bg-amber-50/80 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50 text-amber-800 dark:text-amber-300",
            className
        )}>
            <div className={cn(
                "p-1.5 rounded-full",
                isCritical ? "bg-red-100 dark:bg-red-500/20" : "bg-amber-100 dark:bg-amber-500/20"
            )}>
                {isCritical ? (
                    <AlertTriangle className={cn("w-5 h-5 flex-shrink-0", isCritical ? "text-red-600 dark:text-red-400 animate-pulse" : "")} />
                ) : (
                    <AlertCircle className={cn("w-5 h-5 flex-shrink-0", "text-amber-600 dark:text-amber-400")} />
                )}
            </div>

            <div>
                <h4 className="font-black text-sm uppercase tracking-widest mb-1.5">
                    {isCritical ? "Critical Vitals Detected" : "Elevated Risk Detected"}
                </h4>
                <ul className="space-y-1.5">
                    {reasons.map((reason, idx) => (
                        <li key={idx} className="text-sm font-bold opacity-80 flex items-start gap-2">
                           <span className="mt-2 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                            {reason}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
