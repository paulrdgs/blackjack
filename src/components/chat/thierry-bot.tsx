"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendChatMessage, type ChatMessage } from "@/lib/chat/actions";

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Salut, moi c'est Thierry, ton croupier ! 🃏 Une question sur les règles, la stratégie ou le site ? Je suis là.",
};

export function ThierryBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  function handleSend() {
    const text = input.trim();
    if (!text || pending) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");

    startTransition(async () => {
      const res = await sendChatMessage(next);
      const reply =
        "reply" in res
          ? res.reply
          : res.error;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    });
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {/* Chat modal */}
      {open && (
        <div className="flex h-[28rem] w-[20rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
            <Image
              src="/images/thierry.png"
              alt="Thierry"
              width={32}
              height={32}
              unoptimized
              className="size-8 rounded-full object-cover"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Thierry</span>
              <span className="text-xs text-muted-foreground">Ton croupier</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Fermer le chat"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {pending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Thierry réfléchit…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Écris à Thierry…"
              className="h-9 flex-1 rounded-lg border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            <button
              onClick={handleSend}
              disabled={pending || !input.trim()}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              aria-label="Envoyer"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? "Fermer Thierry" : "Discuter avec Thierry"}
      >
        <Image
          src="/images/thierry.png"
          alt="Thierry"
          width={72}
          height={72}
          unoptimized
          className="size-18 rounded-lg object-cover"
        />
      </button>
    </div>
  );
}
