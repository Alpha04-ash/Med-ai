"use client";

import { useState, useEffect } from "react";
import { History, MessageSquare, FileText, AlertCircle, Loader2 } from "lucide-react";

interface HistoryItem {
  id: string;
  type: "consultation" | "report";
  timestamp: string;
  title: string;
  subtitle: string;
  meta?: string;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("myhealth_user_id") || "demo_user"
      : "demo_user";

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const [convRes, reportRes] = await Promise.all([
          fetch(`http://localhost:8080/api/v1/conversations/${userId}`),
          fetch(`http://localhost:8080/api/v1/reports/latest/${userId}`),
        ]);

        const convData = await convRes.json();
        const reportData = await reportRes.json();

        const combined: HistoryItem[] = [];

        // Map conversations
        if (convData.success && Array.isArray(convData.data)) {
          for (const conv of convData.data) {
            // Try to extract first user message as title
            let firstMsg = "AI Consultation";
            try {
              const transcript = JSON.parse(conv.transcript);
              const firstUser = transcript.find((m: any) => m.role === "user");
              if (firstUser?.content) {
                firstMsg = firstUser.content.slice(0, 60) + (firstUser.content.length > 60 ? "…" : "");
              }
            } catch {}

            combined.push({
              id: conv.id,
              type: "consultation",
              timestamp: conv.timestamp,
              title: "AI Consultation",
              subtitle: firstMsg,
              meta: `Session with AI Doctor`,
            });
          }
        }

        // Map health reports — fetch all, not just latest
        // We reuse the latest-report endpoint; in future could fetch all
        if (reportData.success && reportData.data) {
          const rep = reportData.data;
          const sugg = rep.suggestions;
          combined.push({
            id: rep.id,
            type: "report",
            timestamp: rep.timestamp,
            title: "AI Health Report",
            subtitle: sugg?.summary || "Health risk assessment generated.",
            meta: `Risk Score: ${rep.risk_score} · ${rep.classification}`,
          });
        }

        // Sort descending by date
        combined.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setItems(combined);
      } catch {
        setError("Could not connect to the backend. Make sure the server is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <History className="w-8 h-8 text-emerald-500" />
          Health History
        </h1>
        <p className="text-slate-500 mt-2">
          Your past AI consultations and health reports, sorted by date.
        </p>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="ml-3 text-slate-500">Loading your health history...</span>
        </div>
      )}

      {error && !loading && (
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 dark:text-amber-200 font-medium">{error}</p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              Start a consultation or run an AI analysis to begin building your history.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-20">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">No history yet</h3>
          <p className="text-slate-400 text-sm mt-2">
            Visit the <strong>AI Consultation</strong> page to start a session, or click{" "}
            <strong>Run AI Analysis</strong> on Risk Assessment to generate your first report.
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />

          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="relative flex gap-5 items-start">
                {/* Icon bubble */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-sm ${
                    item.type === "consultation"
                      ? "bg-blue-100 dark:bg-blue-900/40"
                      : "bg-emerald-100 dark:bg-emerald-900/40"
                  }`}
                >
                  {item.type === "consultation" ? (
                    <MessageSquare
                      className={`w-5 h-5 ${
                        item.type === "consultation"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    />
                  ) : (
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>

                {/* Card */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.subtitle}
                  </p>
                  {item.meta && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
                      {item.meta}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
