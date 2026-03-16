"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Upload, Send, ChevronLeft, Stethoscope, X,
  Eraser, Loader2, ImageIcon, Mic, MicOff, RefreshCcw,
  Sparkles, CircleDot, Pen, ShieldCheck, History, Clock,
  Play, Pause, AlertTriangle, FileCheck, Phone, Volume2, VolumeX
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuraVoice } from "@/hooks/useAuraVoice";
import { EmergencyOverlay } from "@/components/EmergencyOverlay";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────────── */
interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;       // data-url for display
  imageBase64?: string;    // base64 only for API
  imageMimeType?: string;
  timestamp: Date | string;
}

interface HistoryItem {
  id: string;
  timestamp: string;
  transcript: string; // JSON string
  structured_notes: string; // JSON string
}

/* ─── Drawing canvas component ───────────────────────────────────── */
function AnnotationCanvas({
  backgroundUrl,
  onConfirm,
  onCancel,
}: {
  backgroundUrl: string;
  onConfirm: (annotatedBase64: string) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "circle">("pen");
  const [color, setColor] = useState("#ef4444");
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = backgroundUrl;
  }, [backgroundUrl]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const pos = getPos(e, canvas);
    setIsDrawing(true);
    lastPos.current = pos;
    if (tool === "circle") {
      const ctx = canvas.getContext("2d")!;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 30, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || tool !== "pen") return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    if (lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    lastPos.current = pos;
  };

  const clearAnnotations = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = backgroundUrl;
  };

  const confirm = () => {
    const canvas = canvasRef.current!;
    const full = canvas.toDataURL("image/jpeg", 0.85);
    onConfirm(full.split(",")[1]);
  };

  const COLORS = ["#ef4444", "#f97316", "#10b981", "#059669", "#06b6d4", "#8b5cf6"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
    >
      <div className="w-full max-w-3xl bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Mark Pain Area</h2>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Draw or circle where it hurts</p>
          </div>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative bg-slate-100">
          <canvas
            ref={canvasRef}
            className="w-full max-h-[55vh] object-contain cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={() => setIsDrawing(false)}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={() => setIsDrawing(false)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTool("pen")}
              className={cn("p-2.5 rounded-xl border transition-all", tool === "pen"
                ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                : "border-slate-200 text-slate-400 hover:border-slate-300")}
            >
              <Pen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool("circle")}
              className={cn("p-2.5 rounded-xl border transition-all", tool === "circle"
                ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                : "border-slate-200 text-slate-400 hover:border-slate-300")}
            >
              <CircleDot className="w-4 h-4" />
            </button>
            <button onClick={clearAnnotations} className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all" title="Clear All">
              <Eraser className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5 ml-1">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn("w-5 h-5 rounded-full transition-transform hover:scale-125", color === c ? "ring-2 ring-white scale-125" : "")}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button onClick={confirm} className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
              Send to Dr. Aura →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function VisualConsultPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm **Dr. Aura**, your Visual AI Medical Consultant. 👋\n\nI'm here to help you understand what's going on with your body. You can:\n\n- 📸 **Take a photo or upload an image** of the affected area\n- ✏️ **Draw on the image** to show exactly where it hurts\n- 💬 **Tell me your symptoms** in the chat\n\nLet's start — what's bothering you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [annotatingImageUrl, setAnnotatingImageUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { speak, stop } = useAuraVoice();
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const startSpeaking = useCallback((index: number, text: string) => {
    setSpeakingIndex(index);
    speak(text);
    // Note: window.speechSynthesis doesn't have reliable per-utterance 'end' events in all browsers 
    // when using global volume controls, but we'll manage the index locally.
  }, [speak]);

  const stopSpeaking = useCallback(() => {
    stop();
    setSpeakingIndex(null);
  }, [stop]);

  const userId = typeof window !== "undefined" ? localStorage.getItem("myhealth_user_id") || "demo_user" : "demo_user";
  const token = typeof window !== "undefined" ? localStorage.getItem("myhealth_token") || "" : "";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setIsHistoryLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/visual-consult/history/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error("Failed to fetch visual history:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:8080/api/v1/auth/profile/${userId}`)
        .then(res => res.json())
        .then(data => data.success && setCurrentUser(data.data));

      fetchHistory();
    }
  }, [userId, fetchHistory]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingImageUrl(ev.target?.result as string);
      setAnnotatingImageUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(s);
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s;
      }, 100);
    } catch {
      alert("Camera permission denied. Please allow camera access and try again.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setIsCameraOpen(false);
    setPendingImageUrl(dataUrl);
    setAnnotatingImageUrl(dataUrl);
  };

  const closeCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setIsCameraOpen(false);
  };

  const handleAnnotationConfirm = (annotatedBase64: string) => {
    setPendingImageUrl(`data:image/jpeg;base64,${annotatedBase64}`);
    setAnnotatingImageUrl(null);
  };

  const removePendingImage = () => setPendingImageUrl(null);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text && !pendingImageUrl) return;

    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;
    let imageUrl: string | undefined;

    if (pendingImageUrl) {
      imageUrl = pendingImageUrl;
      const [meta, data] = pendingImageUrl.split(",");
      imageBase64 = data;
      imageMimeType = meta.match(/:(.*?);/)?.[1] || "image/jpeg";
    }

    const userMsg: Message = {
      role: "user",
      content: text || "Here is an image of my affected area.",
      imageUrl,
      imageBase64,
      imageMimeType,
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setPendingImageUrl(null);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/v1/visual-consult/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          messages: nextMessages.map(m => ({
            role: m.role,
            content: m.content,
            imageBase64: m.imageBase64,
            imageMimeType: m.imageMimeType,
            timestamp: m.timestamp,
          })),
        }),
      });

      const result = await res.json();
      if (result.success) {
        const aiMsg: Message = { role: 'assistant', content: result.reply, timestamp: new Date() };
        setMessages(prev => [...prev, aiMsg]);
        
        // --- REALISM UPGRADE: TTS & EMERGENCY ---
        speak(result.reply);
        
        if (result.risk_score > 60) {
           setIsEmergencyOpen(true);
        }

        fetchHistory();
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `⚠️ **Connection issue**: ${err.message || "Could not reach the AI. Please check your connection and try again."}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, pendingImageUrl, messages, userId, token, fetchHistory, speak]);

  const loadHistoryItem = (item: HistoryItem) => {
    try {
      const transcript = JSON.parse(item.transcript);
      const formatted = transcript.map((m: any) => ({
        ...m,
        timestamp: item.timestamp
      }));
      setMessages(formatted);
      setIsHistoryOpen(false);
    } catch (err) {
      console.error("Failed to load history item:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden text-slate-900">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[0%] right-[0%] w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[140px]" />
      </div>

      <header className="relative z-10 flex items-center gap-5 px-6 py-5 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex-shrink-0">
        <Link
          href="/dashboard"
          className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-500/40 transition-all group"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-slate-900 font-black text-base tracking-tight leading-none">Dr. Aura</h1>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] mt-0.5">Visual AI Consultant · Online</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50 transition-all font-bold text-xs flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            History
          </button>
          <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Gemini Vision
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 relative z-10 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                {msg.role === "assistant" && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center shadow-lg shadow-emerald-500/20 mt-1">
                    <Stethoscope className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={cn("max-w-[78%] space-y-2", msg.role === "user" ? "items-end flex flex-col" : "")}>
                  {msg.imageUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl max-w-xs">
                      <img src={msg.imageUrl} alt="Shared by user" className="w-full object-cover" />
                      <div className="absolute top-2 right-2 px-2.5 py-1 bg-slate-900/90 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest border border-white/10">
                        Annotated
                      </div>
                    </div>
                  )}
                  <div className={cn(
                    "relative group rounded-[2.5rem] px-7 py-5 text-sm leading-relaxed shadow-lg",
                    msg.role === "user"
                      ? "bg-emerald-500 text-white rounded-tr-sm shadow-emerald-500/10"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                  )}>
                    {/* Manual Speak Button for AI messages */}
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => speakingIndex === i ? stopSpeaking() : startSpeaking(i, msg.content)}
                        className={cn(
                          "absolute -right-12 top-2 p-3 rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-xl transition-all opacity-0 group-hover:opacity-100 hover:border-emerald-200 text-slate-400 hover:text-emerald-500 shadow-sm",
                          speakingIndex === i && "opacity-100 text-emerald-500 border-emerald-200 animate-pulse"
                        )}
                        title={speakingIndex === i ? "Stop Speaking" : "Listen to Dr. Aura"}
                      >
                        {speakingIndex === i ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    )}

                    {msg.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          h3: ({ children }) => <h3 className="font-black text-slate-900 text-sm mt-3 mb-1 first:mt-0">{children}</h3>,
                          strong: ({ children }) => <strong className="font-black text-emerald-600">{children}</strong>,
                          p: ({ children }) => <p className="mb-2 last:mb-0 text-slate-700">{children}</p>,
                          ul: ({ children }) => <ul className="space-y-1 mb-2 ml-3">{children}</ul>,
                          li: ({ children }) => <li className="text-slate-600 text-sm flex gap-2"><span className="text-emerald-500 mt-0.5">▸</span><span>{children}</span></li>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  <p className={cn("text-[10px] text-slate-600 font-bold px-2", msg.role === "user" ? "text-right" : "")}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-[2.5rem] rounded-tl-sm px-7 py-5 flex items-center gap-4 shadow-xl">
                  <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                  <span className="text-xs text-slate-500 font-bold">Dr. Aura is performing high-fidelity scan...</span>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md ml-12 bg-slate-900 rounded-3xl p-6 border border-emerald-500/20 shadow-2xl font-mono text-[10px] space-y-2 overflow-hidden relative group"
              >
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 via-emerald-400 to-emerald-500/50 animate-pulse" />
                 <div className="flex items-center justify-between text-emerald-500/60 mb-2">
                    <span className="font-black tracking-[0.2em]">DIAGNOSTIC_KERNEL_v4.2</span>
                    <span className="animate-pulse">● LIVE_STREAM</span>
                 </div>
                 <div className="space-y-1.5">
                    <p className="text-emerald-400/90 flex gap-2"><span className="text-emerald-600 font-black">1.</span> [SYS] INITIALIZING_MULTIMODAL_ENGINE...</p>
                    <p className="text-emerald-400/80 flex gap-2"><span className="text-emerald-600 font-black">2.</span> [VIS] RESOLVING_IMAGE_MESH_VECTORS...</p>
                    <p className="text-emerald-400/70 flex gap-2"><span className="text-emerald-600 font-black">3.</span> [BIO] CORRELATING_LONGITUDINAL_VITALS_7DA...</p>
                    <p className="text-emerald-400/60 flex gap-2"><span className="text-emerald-600 font-black">4.</span> [MED] SYNTHESIZING_CLINICAL_HYPOTHESIS...</p>
                    <motion.p animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-emerald-500 font-black flex gap-2">
                      <span className="text-emerald-600">5.</span> [AURA] GENERATING_ASSESSMENT_PROTOCOL...
                    </motion.p>
                 </div>
                 <div className="mt-4 pt-4 border-t border-emerald-500/10 flex justify-between text-[8px] text-emerald-800 font-black uppercase tracking-widest">
                    <span>Latency: 42ms</span>
                    <span>Tokens: 1442/s</span>
                 </div>
              </motion.div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="relative z-10 border-t border-slate-200 bg-white/80 backdrop-blur-xl px-4 py-6 flex-shrink-0">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {pendingImageUrl && !annotatingImageUrl && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="relative inline-block">
                <img src={pendingImageUrl} alt="Preview" className="h-24 rounded-2xl object-cover border border-emerald-500/40 shadow-xl" />
                <button onClick={removePendingImage} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <X className="w-3 h-3 text-white" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-end gap-3">
            <button onClick={openCamera} className="p-3.5 rounded-2xl border border-slate-200 text-slate-400 hover:text-emerald-500 transition-all flex-shrink-0">
              <Camera className="w-5 h-5" />
            </button>
            <button onClick={() => fileRef.current?.click()} className="p-3.5 rounded-2xl border border-slate-200 text-slate-400 hover:text-emerald-500 transition-all flex-shrink-0">
              <Upload className="w-5 h-5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex items-end shadow-inner">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your symptoms..."
                rows={1}
                className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 text-sm px-4 py-3.5 resize-none outline-none leading-relaxed max-h-32"
                style={{ minHeight: "52px" }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={isLoading || (!input.trim() && !pendingImageUrl)}
              className="p-3.5 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95 disabled:opacity-40 transition-all shadow-xl shadow-emerald-500/20 flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-slate-600 text-center font-medium">
            Dr. Aura uses Gemini Vision · Not a substitute for professional medical care
          </p>
        </div>
      </div>

      <AnimatePresence>
        {annotatingImageUrl && (
          <AnnotationCanvas backgroundUrl={annotatingImageUrl} onConfirm={handleAnnotationConfirm} onCancel={() => { setAnnotatingImageUrl(null); setPendingImageUrl(null); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCameraOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-3xl flex flex-col items-center justify-center gap-8 p-10">
            <div className="w-full max-w-2xl rounded-[3rem] overflow-hidden border border-white shadow-[0_30px_100px_rgba(0,0,0,0.2)] bg-white">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Medical Camera</h2>
                <button onClick={closeCamera} className="p-2 text-slate-400 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-black aspect-video relative">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-emerald-500/40 rounded-full border-dashed animate-pulse pointer-events-none" />
              </div>
              <div className="flex gap-4 p-8 bg-slate-50">
                <button onClick={closeCamera} className="flex-1 py-4 border border-slate-200 text-slate-500 rounded-2xl font-black uppercase text-xs">Cancel</button>
                <button onClick={capturePhoto} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 active:scale-95 shadow-2xl">
                  <Camera className="w-5 h-5" /> Capture Scan
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsHistoryOpen(false)} className="fixed inset-0 z-[60] bg-slate-900/10 backdrop-blur-md" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-[70] bg-white border-l border-slate-200 shadow-2xl flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Saved Scans</h2>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isHistoryLoading ? <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto mt-20" /> : history.map((item) => (
                  <button key={item.id} onClick={() => loadHistoryItem(item)} className="w-full p-4 rounded-2xl border border-slate-100 bg-white hover:border-emerald-300 transition-all text-left">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-bold line-clamp-2">{(() => { try { return JSON.parse(item.structured_notes)?.summary || "Visual Consultation"; } catch { return "Visual Consultation"; } })()}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <EmergencyOverlay 
        isOpen={isEmergencyOpen} 
        riskScore={75}
        userName={currentUser?.name || "Patient"}
        onClose={() => setIsEmergencyOpen(false)}
      />
    </div>
  );
}
