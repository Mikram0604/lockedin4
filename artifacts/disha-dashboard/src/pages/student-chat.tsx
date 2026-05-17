import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Send, Loader2, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { StudentLayout } from "@/components/student-layout";

interface ChatMessage {
  id: string | number;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

export default function StudentChat() {
  const [_, setLocation] = useLocation();
  const [phone, setPhone] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedPhone = localStorage.getItem("studentPhone");
    if (!storedPhone) {
      setLocation("/student");
      return;
    }
    setPhone(storedPhone);
    fetchHistory(storedPhone);
  }, [setLocation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchHistory = async (phoneNumber: string) => {
    try {
      const res = await fetch(`/api/web-chat/history?phone=${encodeURIComponent(phoneNumber)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.history && data.history.length > 0) {
          const formattedHistory = data.history.reverse().map((m: any) => ({
            id: m.id,
            text: m.message,
            sender: m.direction === "inbound" ? "user" : "bot",
            timestamp: m.createdAt,
          }));
          setMessages(formattedHistory);
        } else {
          // If no history, send a dummy "Hi" to trigger onboarding implicitly
          handleSend("Hi", phoneNumber, true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (text: string, overridePhone?: string, hidden = false) => {
    const msgText = text.trim();
    if (!msgText) return;

    const currentPhone = overridePhone || phone;
    const tempId = Date.now().toString();

    if (!hidden) {
      setMessages(prev => [...prev, { id: tempId, text: msgText, sender: "user", timestamp: new Date().toISOString() }]);
      setInput("");
    }
    setIsSending(true);

    try {
      const res = await fetch("/api/web-chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${currentPhone}`, message: msgText }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [
          ...prev, 
          { id: Date.now().toString() + "_bot", text: data.reply, sender: "bot", timestamp: new Date().toISOString() }
        ]);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900" style={{ fontFamily: "var(--app-font-display)" }}>Disha Chat</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span> Always here to help
            </p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm text-[15px] whitespace-pre-wrap ${
                      isUser 
                        ? "bg-blue-600 text-white rounded-tr-sm" 
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {isSending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4 shrink-0">
        <div className="max-w-3xl mx-auto relative flex items-center gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="Type your message..."
            className="h-14 rounded-full pl-6 pr-14 text-base bg-slate-50 border-transparent focus-visible:ring-blue-600/20 focus-visible:bg-white"
          />
          <Button 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isSending}
            size="icon"
            className="absolute right-2 h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send size={18} className="ml-1" />
          </Button>
        </div>
      </div>
    </StudentLayout>
  );
}
