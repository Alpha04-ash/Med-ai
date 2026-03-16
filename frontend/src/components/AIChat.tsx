"use client";

import { Send, Bot, User, Paperclip, X, Stethoscope, Brain, Dumbbell, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

interface AIChatProps {
  messages: Message[];
  onSendMessage: (text: string, imageBase64?: string, doctorType?: "general" | "physical" | "mental") => void;
  isTyping?: boolean;
  className?: string;
}

const DOCTOR_CONFIG = {
  general: {
    label: "General",
    fullLabel: "General Practitioner",
    icon: Stethoscope,
    color: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-500",
    bubble: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
    activeBg: "bg-emerald-500",
  },
  physical: {
    label: "Physical",
    fullLabel: "Physical Therapist",
    icon: Dumbbell,
    color: "from-orange-500 to-amber-500",
    ring: "ring-orange-500",
    bubble: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300",
    activeBg: "bg-orange-500",
  },
  mental: {
    label: "Mental",
    fullLabel: "Mental Health Counselor",
    icon: Brain,
    color: "from-violet-500 to-purple-500",
    ring: "ring-violet-500",
    bubble: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300",
    activeBg: "bg-violet-500",
  },
};

export function AIChat({ messages, onSendMessage, isTyping, className }: AIChatProps) {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [doctorType, setDoctorType] = useState<"general" | "physical" | "mental">("general");
  const [isRecording, setIsRecording] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const doc = DOCTOR_CONFIG[doctorType];
  const DocIcon = doc.icon;

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeakingMsgId(null);
  }, []);

  const handleSpeak = useCallback((id: string, text: string) => {
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  }, [stopSpeaking]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // Auto-TTS for the last AI message if enabled
    if (ttsEnabled && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant" && speakingMsgId !== lastMsg.id) {
        handleSpeak(lastMsg.id, lastMsg.content);
      }
    }
  }, [messages, isTyping, ttsEnabled, handleSpeak, speakingMsgId]);

  // Init Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + transcript);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => setIsRecording(false);
        recognitionRef.current.onerror = () => setIsRecording(false);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;
    onSendMessage(input, selectedImage || undefined, doctorType);
    setInput("");
    setSelectedImage(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm",
        className
      )}
    >
      {/* ── Header ── */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        {/* Doctor avatar + name row */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white flex-shrink-0 shadow-sm",
              doc.color
            )}
          >
            <DocIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {doc.fullLabel}
            </h2>
            <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Online · AI-powered
            </span>
          </div>

          {/* TTS Toggle */}
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={cn(
              "ml-auto p-2 rounded-xl border transition-all",
              ttsEnabled 
                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white" 
                : "bg-white text-slate-400 border-slate-100 dark:bg-slate-900 dark:border-slate-800"
            )}
            title={ttsEnabled ? "Disable AI Voice" : "Enable AI Voice"}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Specialist tabs */}
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(["general", "physical", "mental"] as const).map((type) => {
            const cfg = DOCTOR_CONFIG[type];
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => setDoctorType(type)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200",
                  doctorType === type
                    ? `${cfg.activeBg} text-white shadow-sm`
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 min-h-0">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-10 select-none">
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white mb-4 shadow-md",
                doc.color
              )}
            >
              <DocIcon className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              {doc.fullLabel}
            </p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs leading-relaxed">
              {doctorType === "general"
                ? "Describe your symptoms or ask any health question."
                : doctorType === "physical"
                ? "Tell me about your pain, injury, or physical therapy needs."
                : "Share what's on your mind. I'm here to listen and help."}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-2 items-end", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
          >
            {/* Avatar */}
            {msg.role === "assistant" ? (
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mb-0.5 bg-gradient-to-br text-white shadow-sm",
                  doc.color
                )}
              >
                <DocIcon className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mb-0.5">
                <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
              </div>
            )}

            {/* Bubble Container to hold Button + Bubble */}
            <div className={cn("max-w-[78%] flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "relative group px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-br-sm"
                    : `rounded-bl-sm ${doc.bubble} border border-current/10`
                )}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Uploaded"
                    className="w-52 max-h-52 object-cover rounded-xl mb-2 border border-white/20"
                  />
                )}
                
                {/* Manual Speak Button for AI messages */}
                {msg.role === "assistant" && (
                   <button
                     onClick={() => speakingMsgId === msg.id ? stopSpeaking() : handleSpeak(msg.id, msg.content)}
                     className={cn(
                       "absolute -right-10 top-0 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white",
                       speakingMsgId === msg.id && "opacity-100 text-emerald-500 dark:text-emerald-400 animate-pulse"
                     )}
                     title={speakingMsgId === msg.id ? "Stop Speaking" : "Listen to response"}
                   >
                     {speakingMsgId === msg.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                   </button>
                )}

                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-4 prose-headings:text-sm prose-headings:font-bold prose-ul:my-2 prose-li:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2 items-end">
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br text-white shadow-sm",
                doc.color
              )}
            >
              <DocIcon className="w-3.5 h-3.5" />
            </div>
            <div className={cn("px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5", doc.bubble)}>
              <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* ── Input ── */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 px-4 pb-4 pt-3 border-t border-slate-100 dark:border-slate-800"
      >
        {/* Image preview */}
        {selectedImage && (
          <div className="relative inline-flex mb-2 ml-1">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-400 transition-shadow">
          {/* Attach */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-1.5 text-slate-400 hover:text-emerald-500 transition-colors"
            title="Attach photo"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

          {/* Voice Input */}
          <button
            type="button"
            onClick={toggleRecording}
            className={cn(
              "flex-shrink-0 p-1.5 transition-colors",
              isRecording ? "text-red-500 animate-pulse" : "text-slate-400 hover:text-blue-500"
            )}
            title={isRecording ? "Stop Listening" : "Start Voice Input"}
          >
            {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask the ${doc.fullLabel}…`}
            className="flex-1 bg-transparent resize-none text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none py-1 leading-relaxed max-h-[120px] overflow-y-auto"
          />

          {/* Send */}
          <button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || isTyping}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-gradient-to-br text-white shadow-sm",
              (!input.trim() && !selectedImage) || isTyping
                ? "opacity-40 cursor-not-allowed from-slate-400 to-slate-500"
                : doc.color
            )}
          >
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-300 dark:text-slate-600 mt-2">
          Press Enter to send · Shift+Enter for new line · Attach photos for visual diagnosis
        </p>
      </form>
    </div>
  );
}
