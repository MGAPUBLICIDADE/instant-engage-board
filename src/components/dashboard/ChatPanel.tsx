import { useEffect, useMemo, useRef, useState } from "react";
import {
  Instagram,
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  Phone,
  MoreVertical,
  CheckCheck,
} from "lucide-react";
import {
  formatTime,
  getMessages,
  leads,
  type Message,
} from "@/lib/mock-data";

interface Props {
  leadId: string;
}

export function ChatPanel({ leadId }: Props) {
  const lead = leads.find((l) => l.id === leadId) ?? leads[0];
  const initial = useMemo(() => getMessages(lead.id), [lead.id]);
  const [messages, setMessages] = useState<Message[]>(initial);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(getMessages(lead.id));
  }, [lead.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        leadId: lead.id,
        from: "agent",
        text,
        at: new Date().toISOString(),
        channel: lead.channel,
      },
    ]);
    setDraft("");
  }

  const ChannelIcon = lead.channel === "whatsapp" ? MessageCircle : Instagram;
  const channelTone = lead.channel === "whatsapp" ? "text-whatsapp" : "text-instagram";

  return (
    <div className="glass-panel flex h-full flex-col overflow-hidden rounded-2xl">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-accent text-xs font-bold">
            {lead.avatar}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success ring-2 ring-card" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{lead.name}</p>
            <p className={`flex items-center gap-1 text-[11px] ${channelTone}`}>
              <ChannelIcon className="h-3 w-3" />
              <span className="capitalize">{lead.channel}</span>
              <span className="mx-1 h-1 w-1 rounded-full bg-muted-foreground/60" />
              <span className="text-muted-foreground">online</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconBtn><Phone className="h-4 w-4" /></IconBtn>
          <IconBtn><MoreVertical className="h-4 w-4" /></IconBtn>
        </div>
      </div>

      {/* Smart alert */}
      {lead.priority === "high" && (
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive animate-fade-up">
          <span className="flex h-2 w-2 rounded-full bg-destructive animate-pulse-soft" />
          <span className="font-semibold">Responder agora —</span>
          <span className="text-destructive/80">cliente em alta prioridade</span>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((msg) => {
          const isAgent = msg.from === "agent";
          return (
            <div
              key={msg.id}
              className={`flex animate-fade-up ${isAgent ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-snug shadow-[var(--shadow-soft)] ${
                  isAgent
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-surface-elevated text-foreground"
                }`}
              >
                <p>{msg.text}</p>
                <div
                  className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                    isAgent ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  <span>{formatTime(msg.at)}</span>
                  {isAgent && <CheckCheck className="h-3 w-3" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t border-border/60 p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface px-3 py-2 transition-colors focus-within:border-primary/50">
          <IconBtn><Smile className="h-4 w-4" /></IconBtn>
          <IconBtn><Paperclip className="h-4 w-4" /></IconBtn>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Mensagem para ${lead.name.split(" ")[0]}...`}
            rows={1}
            className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 enabled:glow-ring"
          >
            <Send className="h-3.5 w-3.5" strokeWidth={2.5} />
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground">
      {children}
    </button>
  );
}
