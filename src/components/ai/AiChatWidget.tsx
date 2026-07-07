"use client";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat logs when a new message is added
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, open]);

  async function ask() {
    if (!question.trim()) return;

    const userQuestion = question.trim();
    setQuestion(""); // Clear input immediately
    const userMsg: Message = { role: "user", content: userQuestion };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.answer ?? data.error ?? "No response received.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to connect to the assistant. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open ? (
        <div className="flex w-[calc(100vw-3rem)] max-w-[24rem] h-[400px] animate-[modal-in_0.25s_cubic-bezier(0.16,1,0.3,1)] flex-col rounded-3xl border border-border-strong/50 bg-surface/90 p-4 shadow-[var(--shadow-lg)] backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <span className="flex items-center gap-2.5 text-sm font-extrabold text-fg">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-[#6366f1] text-accent-fg shadow-[0_2px_8px_rgba(99,102,241,0.25)]">
                <Bot size={16} />
              </span>
              AI Team Assistant
            </span>
            <div className="flex items-center gap-1.5">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="flex h-7 w-7 items-center justify-center rounded-xl text-faint hover:bg-surface-2 hover:text-rose-500 transition-all duration-200"
                  title="Clear conversation"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-xl text-faint transition-all hover:bg-surface-2 hover:text-fg hover:scale-105 active:scale-95"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto my-3 flex flex-col gap-3 pr-1 py-1 scrollbar-thin">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center p-4 my-auto">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent mb-2.5 shadow-sm">
                  <Bot size={20} />
                </span>
                <p className="text-xs font-black text-fg">AI Team Assistant</p>
                <p className="text-[10px] font-bold text-muted mt-1.5 max-w-[200px] leading-relaxed">
                  Ask about project activity, recent task completions, open blockers, or submission trends.
                </p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-semibold transition-all duration-300",
                  msg.role === "user"
                    ? "self-end bg-gradient-to-tr from-accent to-[#6366f1] text-white rounded-tr-none shadow-sm"
                    : "self-start bg-surface-2/80 border border-border/75 text-fg rounded-tl-none select-text"
                )}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="self-start flex items-center gap-1 bg-surface-2/80 border border-border/75 rounded-2xl rounded-tl-none p-3.5 text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input Area */}
          <div className="flex items-center gap-2 border-t border-border/60 pt-3">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about the team..."
              className="bg-surface/30 flex-1 min-h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter" && question && !loading) {
                  ask();
                }
              }}
            />
            <Button onClick={ask} disabled={loading || !question.trim()} className="rounded-xl h-9 min-h-9 px-3">
              <Send size={14} />
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          onClick={() => setOpen(true)} 
          className="rounded-full h-12 px-6 shadow-[0_8px_24px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_28px_rgba(99,102,241,0.45)] text-sm font-extrabold transition-all duration-300 hover:scale-[1.04]"
        >
          <Bot size={18} className="animate-[bounce_2s_infinite]" />
          Ask Assistant
        </Button>
      )}
    </div>
  );
}


