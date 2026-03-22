"use client";

import { useState, useEffect, useCallback } from "react";
import { AIChat } from "@/components/AIChat";
import { StructuredNotes } from "@/components/StructuredNotes";
import { useRouter } from "next/navigation";
import { History, PlusCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmergencyOverlay } from "@/components/EmergencyOverlay";

interface ConvItem {
  id: string;
  timestamp: string;
  transcript: string;      // JSON string of [{role, content}]
  structured_notes: string; // JSON string of structured notes object
  ai_doctor_id: string;
}

function getTitle(transcript: string): string {
  try {
    const msgs = JSON.parse(transcript);
    const first = msgs.find((m: any) => m.role === "user");
    if (first?.content) {
      return first.content.slice(0, 48) + (first.content.length > 48 ? "…" : "");
    }
  } catch {}
  return "Consultation";
}

function parseTranscript(transcript: string): { id: string; role: "user" | "assistant"; content: string }[] {
  try {
    const msgs = JSON.parse(transcript);
    return msgs.map((m: any, i: number) => ({
      id: `hist-${i}`,
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content ?? "",
    }));
  } catch {
    return [];
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today · " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function DoctorsPage() {
  const router = useRouter();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [chatMessages, setChatMessages] = useState<{ id: string; role: "user" | "assistant"; content: string; image?: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [notesData, setNotesData] = useState<any>(null);
  const [conversations, setConversations] = useState<ConvItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [histLoading, setHistLoading] = useState(true);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const userId = typeof window !== "undefined" ? localStorage.getItem("myhealth_user_id") || "demo_user" : "demo_user";

  // ── fetch history ──────────────────────────────────────────────────────────
  const fetchHistory = useCallback(() => {
    setHistLoading(true);
    fetch(`http://localhost:8080/api/v1/conversations/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setConversations(data.data);
      })
      .catch(() => {})
      .finally(() => setHistLoading(false));
  }, [userId]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/v1/auth/profile/${userId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setUser(d.data); });
  }, [userId]);

  // ── WebSocket connect ──────────────────────────────────────────────────────
  const connectWs = useCallback((sessionId: string) => {
    const socket = new WebSocket(`ws://localhost:8080/ws?userId=${userId}&sessionId=${sessionId}`);
    socket.onopen = () => { setIsConnected(true); setWs(socket); };
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat_reply") {
          setIsTyping(false);
            setChatMessages((prev) => [
              ...prev,
              { id: Date.now().toString(), role: "assistant", content: data.payload.ai_response_text },
            ]);
            if (data.payload.structured_notes) {
              setNotesData(data.payload.structured_notes);
              if (data.payload.structured_notes.is_emergency) {
                setIsEmergencyOpen(true);
              }
            }
        } else if (data.type === "error") {
          setIsTyping(false);
          setChatMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), role: "assistant", content: data.message || "An error occurred." },
          ]);
        }
      } catch {}
    };
    socket.onclose = () => {
      setIsConnected(false);
      fetchHistory(); // refresh history after session is saved
    };
    setWs(socket);
    return socket;
  }, [userId, fetchHistory]);

  // ── WebSocket + auth (initial mount) ───────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("myhealth_token");
    if (!token) { router.push("/login"); return; }

    const sessionId = localStorage.getItem("myhealth_session") || `sess_${Date.now()}`;
    localStorage.setItem("myhealth_session", sessionId);

    fetchHistory();
    const socket = connectWs(sessionId);
    return () => socket.close();
  }, [router, userId, fetchHistory, connectWs]);

  // ── actions ────────────────────────────────────────────────────────────────
  const openNewConsultation = useCallback(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      // WS already closed — just clear the UI
      setChatMessages([]);
      setNotesData(null);
      setActiveConvId(null);
      return;
    }

    // Close the current WS: this triggers the backend to save the session
    ws.close();

    // Wait briefly for the save, then reconnect with a brand-new sessionId
    setTimeout(() => {
      const newSessionId = `sess_${Date.now()}`;
      localStorage.setItem("myhealth_session", newSessionId);
      connectWs(newSessionId);
      setChatMessages([]);
      setNotesData(null);
      setActiveConvId(null);
    }, 600);
  }, [ws, connectWs]);

  const loadConversation = (conv: ConvItem) => {
    const msgs = parseTranscript(conv.transcript);
    setChatMessages(msgs);
    setActiveConvId(conv.id);

    // Restore structured notes if they were saved
    try {
      const notes = JSON.parse(conv.structured_notes);
      // Only set if it's a real notes object (not empty or the old placeholder string)
      if (notes && typeof notes === 'object' && notes.symptoms) {
        setNotesData(notes);
      } else {
        setNotesData(null);
      }
    } catch {
      setNotesData(null);
    }
  };

  const handleSendMessage = useCallback(
    (text: string, imageBase64?: string, doctorType?: "general" | "physical" | "mental") => {
      // If viewing a past conversation, switch back to live mode first
      if (activeConvId) {
        setActiveConvId(null);
        setChatMessages([]);
      }
      setChatMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: text, image: imageBase64 }]);
      setIsTyping(true);

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "chat_message", payload: { text, image: imageBase64, doctorType } }));
      } else {
        setTimeout(() => {
          setIsTyping(false);
          setChatMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), role: "assistant", content: "The backend WebSocket is offline. Please start the backend server." },
          ]);
        }, 1000);
      }
    },
    [ws, activeConvId]
  );

  // ── Handle focus from Anatomy Page ──────────────────────────────────
  useEffect(() => {
    const focusPart = localStorage.getItem("myhealth_symptom_focus");
    if (focusPart && isConnected) {
      handleSendMessage(`I am feeling pain or discomfort in my ${focusPart}. Please help me analyze this.`);
      localStorage.removeItem("myhealth_symptom_focus");
    }
  }, [isConnected, handleSendMessage]);

  return (
    <>
    <div className="h-full flex flex-col lg:flex-row p-4 md:p-8 max-w-[1600px] mx-auto gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── History Sidebar ─────────────────────────────────────── */}
      <div className="flex flex-col w-full lg:w-72 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm h-[300px] lg:h-[calc(100vh-4rem)] flex-shrink-0">
        <button
          onClick={openNewConsultation}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors mb-5 shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          New Consultation
        </button>

        <div className="flex items-center gap-2 px-2 mb-3 text-slate-400 dark:text-slate-500">
          <History className="w-3.5 h-3.5" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest">Past Consultations</h3>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          {histLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
            </div>
          )}

          {!histLoading && conversations.length === 0 && (
            <p className="text-center text-xs text-slate-400 p-4 leading-relaxed">
              No past consultations yet. Start a chat and close the tab — it auto-saves.
            </p>
          )}

          {conversations.map((conv) => {
            const isActive = activeConvId === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv)}
                className={cn(
                  "flex flex-col text-left w-full p-3 rounded-xl transition-all border",
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                )}
              >
                <span className={cn("text-sm font-semibold truncate w-full", isActive ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-white")}>
                  {getTitle(conv.transcript)}
                </span>
                <span className="text-xs text-slate-400 mt-0.5">{formatDate(conv.timestamp)}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 hidden lg:block">
          <div className="flex items-center gap-2 px-2 text-xs">
            <span className="relative flex h-2 w-2">
              {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-emerald-500" : "bg-red-500"}`} />
            </span>
            <span className="text-slate-400">{isConnected ? "AI Core Online" : "AI Core Offline"}</span>
          </div>
          {activeConvId && (
            <p className="text-[10px] text-emerald-500 px-2 mt-1.5">
              Viewing saved session · Send a message to start a new live chat
            </p>
          )}
        </div>
      </div>

      {/* ── Main: Chat + Notes ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col xl:flex-row gap-6 lg:h-[calc(100vh-4rem)] min-h-[500px]">
        <div className="flex-1 flex flex-col min-w-[50%] h-full">
          <AIChat
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            className="flex-1 h-full shadow-md rounded-3xl border-slate-200 dark:border-slate-800"
          />
        </div>
        <div className="hidden xl:flex w-80 flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <StructuredNotes data={notesData} className="flex-1 rounded-3xl border-slate-200 dark:border-slate-800 shadow-md min-h-[400px]" />
        </div>
      </div>
    </div>

    <EmergencyOverlay 
      isOpen={isEmergencyOpen} 
      riskScore={95}
      userName={user?.name || "Patient"}
      onClose={() => setIsEmergencyOpen(false)}
    />
    </>
  );
}
