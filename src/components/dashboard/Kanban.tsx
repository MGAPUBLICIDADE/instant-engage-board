import { useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import { Instagram, MessageCircle, Flame, AlertCircle, GripVertical } from "lucide-react";
import { type Lead, type LeadStatus, leads as initialLeads, timeAgo } from "@/lib/mock-data";

const COLUMNS: { id: LeadStatus; title: string; tone: string; dot: string }[] = [
  { id: "novo", title: "Novo Lead", tone: "border-info/40", dot: "bg-info" },
  { id: "atendimento", title: "Em Atendimento", tone: "border-primary/40", dot: "bg-primary" },
  { id: "aguardando", title: "Aguardando Cliente", tone: "border-warning/40", dot: "bg-warning" },
  { id: "finalizado", title: "Finalizado", tone: "border-success/40", dot: "bg-success" },
];

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function Kanban({ selectedId, onSelect }: Props) {
  const [items, setItems] = useState<Lead[]>(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const grouped = useMemo(() => {
    const g: Record<LeadStatus, Lead[]> = { novo: [], atendimento: [], aguardando: [], finalizado: [] };
    items.forEach((l) => g[l.status].push(l));
    return g;
  }, [items]);

  const activeLead = items.find((l) => l.id === activeId) ?? null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }
  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const overId = e.over?.id as LeadStatus | undefined;
    if (!overId) return;
    setItems((prev) =>
      prev.map((l) => (l.id === e.active.id ? { ...l, status: overId } : l))
    );
  }

  return (
    <div className="glass-panel flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <h2 className="font-display text-sm font-bold tracking-tight">Fila de Atendimento</h2>
          <p className="text-[11px] text-muted-foreground">Arraste os cards entre colunas</p>
        </div>
        <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {items.length} contatos
        </span>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-auto p-3 xl:grid-cols-4">
          {COLUMNS.map((col) => (
            <Column key={col.id} col={col} leads={grouped[col.id]} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeLead ? <LeadCard lead={activeLead} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function Column({
  col,
  leads,
  selectedId,
  onSelect,
}: {
  col: (typeof COLUMNS)[number];
  leads: Lead[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border bg-surface/40 transition-colors ${
        isOver ? `${col.tone} bg-surface-elevated` : "border-border/50"
      }`}
    >
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${col.dot}`} />
          <h3 className="text-xs font-semibold tracking-tight">{col.title}</h3>
        </div>
        <span className="rounded-md bg-surface-elevated px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
          {leads.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-auto p-2">
        {leads.map((l) => (
          <DraggableCard key={l.id} lead={l} selected={l.id === selectedId} onClick={() => onSelect(l.id)} />
        ))}
        {leads.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/40 py-6 text-[11px] text-muted-foreground">
            Vazio
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableCard({
  lead,
  selected,
  onClick,
}: {
  lead: Lead;
  selected: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });
  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className={`group cursor-pointer ${selected ? "" : ""}`}
    >
      <LeadCard lead={lead} selected={selected} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

function LeadCard({
  lead,
  selected,
  dragging,
  dragHandleProps,
}: {
  lead: Lead;
  selected?: boolean;
  dragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
}) {
  const priorityRing =
    lead.priority === "high"
      ? "border-destructive/50"
      : lead.priority === "medium"
        ? "border-warning/40"
        : "border-border/60";

  return (
    <div
      className={`relative rounded-xl border bg-card p-3 transition-all ${priorityRing} ${
        selected ? "ring-2 ring-primary/60 border-primary/40" : "hover:border-border"
      } ${dragging ? "shadow-[var(--shadow-elevated)] rotate-1" : ""}`}
    >
      {lead.priority === "high" && (
        <div className="absolute -left-1 top-3 bottom-3 w-1 rounded-full bg-destructive" />
      )}

      <div className="flex items-start gap-2.5">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-accent text-[11px] font-bold">
          {lead.avatar}
          <span
            className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-card ${
              lead.channel === "whatsapp" ? "bg-whatsapp text-background" : "bg-instagram text-background"
            }`}
          >
            {lead.channel === "whatsapp" ? (
              <MessageCircle className="h-2.5 w-2.5" strokeWidth={3} />
            ) : (
              <Instagram className="h-2.5 w-2.5" strokeWidth={3} />
            )}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">{lead.name}</p>
            <button
              {...dragHandleProps}
              className="opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
              aria-label="Arrastar"
            >
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-muted-foreground">
            {lead.lastMessage}
          </p>

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {lead.priority === "high" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-destructive/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-destructive">
                  <Flame className="h-2.5 w-2.5" /> Urgente
                </span>
              )}
              {lead.tag && (
                <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-primary">
                  {lead.tag}
                </span>
              )}
            </div>
            <span
              className={`flex items-center gap-1 text-[10px] font-medium ${
                lead.priority === "high" ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {lead.priority === "high" && <AlertCircle className="h-3 w-3" />}
              {timeAgo(lead.lastMessageAt)}
            </span>
          </div>
        </div>
      </div>

      {lead.unread > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground shadow-[0_4px_12px_-2px_var(--color-primary)]">
          {lead.unread}
        </span>
      )}
    </div>
  );
}
