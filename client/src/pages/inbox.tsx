import { GlassCard } from "@/components/ui/glass-card";
import { useAuth, useAuthFetch } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Send, Inbox as InboxIcon, ArrowLeft, Search, Pin, Archive,
  MailOpen, Megaphone, Lightbulb, Settings, Image, Headphones,
  X, PenSquare, Bell, Clock, CheckCircle2,
  AlertCircle, MessageSquare,
} from "lucide-react";
import { useState, useMemo, useCallback, useRef } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  MOCK_MESSAGES, CATEGORY_CONFIG,
  type InboxMessage, type MessageCategory, type InboxReply,
} from "@/lib/mock-data/inbox-messages";
import { MODALITY_OPTIONS } from "@/lib/mock-data/tools-library";

function loadInboxState(): { pinned: Set<string>; archived: Set<string>; read: Set<string> } {
  try {
    const raw = localStorage.getItem("cp-inbox-state");
    if (!raw) return { pinned: new Set(), archived: new Set(), read: new Set() };
    const parsed = JSON.parse(raw);
    return { pinned: new Set(parsed.pinned || []), archived: new Set(parsed.archived || []), read: new Set(parsed.read || []) };
  } catch { return { pinned: new Set(), archived: new Set(), read: new Set() }; }
}

function saveInboxState(state: { pinned: Set<string>; archived: Set<string>; read: Set<string> }) {
  localStorage.setItem("cp-inbox-state", JSON.stringify({
    pinned: Array.from(state.pinned), archived: Array.from(state.archived), read: Array.from(state.read),
  }));
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  support: Headphones, announcement: Megaphone, "tool-request": Lightbulb, system: Settings, artifact: Image,
};

const CATEGORY_COLORS: Record<string, { icon: string; bg: string; border: string; text: string }> = {
  support: { icon: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  announcement: { icon: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  "tool-request": { icon: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  system: { icon: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", text: "text-slate-400" },
  artifact: { icon: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
};

function CategoryIcon({ category, size = 14 }: { category: string; size?: number }) {
  const Icon = CATEGORY_ICONS[category] || Mail;
  const colors = CATEGORY_COLORS[category] || { icon: "text-muted-foreground", bg: "bg-secondary" };
  return (
    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border", colors.bg, colors.border)}>
      <Icon size={size} className={colors.icon} />
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const colors = CATEGORY_COLORS[category] || { bg: "bg-secondary", text: "text-muted-foreground", border: "border-border" };
  const label = CATEGORY_CONFIG[category as MessageCategory]?.label || category;
  return (
    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", colors.bg, colors.text, colors.border)}>
      {label}
    </span>
  );
}

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  resolved: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-emerald-500/20" },
  pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/8", border: "border-amber-500/20" },
  open: { icon: AlertCircle, color: "text-blue-400", bg: "bg-blue-500/8", border: "border-blue-500/20" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border", config.color, config.bg, config.border)}>
      <Icon size={9} />
      {status}
    </span>
  );
}

function formatDate(dateStr: string, full = false): string {
  const d = new Date(dateStr);
  if (full) return d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return "Today";
  if (diff < 172800000) return "Yesterday";
  if (diff < 604800000) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDateGroup(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return "Today";
  if (diff < 172800000) return "Yesterday";
  if (diff < 604800000) return "This Week";
  if (diff < 2592000000) return "This Month";
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

type CategoryTab = "all" | MessageCategory;

const inputClass = "w-full px-4 py-2.5 rounded-xl bg-secondary/30 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/40";
const labelClass = "text-xs font-semibold text-foreground/60 uppercase tracking-[0.15em] block mb-1.5";

function ComposeModal({ type, onClose, authFetch }: { type: "support" | "tool-request"; onClose: () => void; authFetch: ReturnType<typeof useAuthFetch> }) {
  const { toast } = useToast();
  const [supportSubject, setSupportSubject] = useState("");
  const [supportBody, setSupportBody] = useState("");
  const [toolReqTitle, setToolReqTitle] = useState("");
  const [toolReqModality, setToolReqModality] = useState("");
  const [toolReqAge, setToolReqAge] = useState("");
  const [toolReqGoal, setToolReqGoal] = useState("");
  const [toolReqNotes, setToolReqNotes] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendSupport = async () => {
    if (!supportSubject.trim() || !supportBody.trim()) return;
    setSending(true);
    try {
      const res = await authFetch("/api/messages/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: supportSubject, body: supportBody }),
      });
      if (!res.ok) throw new Error("Failed to send");
      toast({ title: "Message sent. We'll get back to you soon." });
      onClose();
    } catch {
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleSubmitTool = async () => {
    if (!toolReqTitle.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/tool-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: toolReqTitle,
          description: `Modality: ${toolReqModality}\nAge Range: ${toolReqAge}\nGoal: ${toolReqGoal}\n\n${toolReqNotes}`,
          email: null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Tool request submitted. Thank you for shaping our roadmap." });
      onClose();
    } catch {
      toast({ title: "Failed to submit request", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border/60 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center",
              type === "support" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-amber-500/10 border border-amber-500/20"
            )}>
              {type === "support" ? <Headphones size={16} className="text-emerald-400" /> : <Lightbulb size={16} className="text-amber-400" />}
            </div>
            <div>
              <h3 className="text-lg font-serif text-foreground">
                {type === "support" ? "Contact Support" : "Request a Tool"}
              </h3>
              {type === "tool-request" && (
                <p className="text-xs text-muted-foreground mt-0.5">Help shape what we build next</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {type === "support" ? (
            <>
              <div>
                <label className={labelClass}>Subject</label>
                <input type="text" value={supportSubject} onChange={e => setSupportSubject(e.target.value)} placeholder="What do you need help with?" className={inputClass} data-testid="input-support-subject" />
              </div>
              <div>
                <label className={labelClass}>Message</label>
                <textarea value={supportBody} onChange={e => setSupportBody(e.target.value)} rows={5} placeholder="Describe your issue or question..." className={`${inputClass} resize-none`} data-testid="input-support-body" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={labelClass}>Tool Name *</label>
                <input type="text" value={toolReqTitle} onChange={e => setToolReqTitle(e.target.value)} placeholder="e.g., Emotion Thermometer" className={inputClass} data-testid="input-tool-name" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Primary Modality</label>
                  <select value={toolReqModality} onChange={e => setToolReqModality(e.target.value)} className={`${inputClass} appearance-none cursor-pointer`}>
                    <option value="">Select...</option>
                    {MODALITY_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Age Range</label>
                  <input type="text" value={toolReqAge} onChange={e => setToolReqAge(e.target.value)} placeholder="e.g., Teens, Adults" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Therapeutic Goal</label>
                <input type="text" value={toolReqGoal} onChange={e => setToolReqGoal(e.target.value)} placeholder="What would this tool help clients do?" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Additional Notes</label>
                <textarea value={toolReqNotes} onChange={e => setToolReqNotes(e.target.value)} rows={3} placeholder="Any other details..." className={`${inputClass} resize-none`} />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border/40 bg-secondary/10">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={type === "support" ? handleSendSupport : handleSubmitTool}
            disabled={sending || (type === "support" ? !supportSubject.trim() || !supportBody.trim() : !toolReqTitle.trim())}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all active:scale-[0.97]"
            data-testid="button-send-compose"
          >
            <Send size={13} /> {sending ? "Sending..." : type === "support" ? "Send" : "Submit Request"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function MessageDetail({ message, onBack, onPin, onArchive, onMarkRead }: {
  message: InboxMessage;
  onBack: () => void;
  onPin: (id: string) => void;
  onArchive: (id: string) => void;
  onMarkRead: (id: string) => void;
}) {
  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          data-testid="button-inbox-back"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="hidden md:flex items-center gap-1">
          <button onClick={() => onPin(message.id)} className={cn("p-2 rounded-lg cursor-pointer transition-all", message.isPinned ? "text-primary bg-primary/10" : "text-muted-foreground/40 hover:bg-secondary/50 hover:text-muted-foreground")} data-testid="button-pin-detail">
            <Pin size={14} />
          </button>
          <button onClick={() => onMarkRead(message.id)} className="p-2 rounded-lg text-muted-foreground/40 hover:bg-secondary/50 hover:text-muted-foreground cursor-pointer transition-all" data-testid="button-read-detail">
            {message.isRead ? <Mail size={14} /> : <MailOpen size={14} />}
          </button>
          <button onClick={() => onArchive(message.id)} className="p-2 rounded-lg text-muted-foreground/40 hover:bg-secondary/50 hover:text-muted-foreground cursor-pointer transition-all" data-testid="button-archive-detail">
            <Archive size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <GlassCard className="p-5 md:p-6 mb-5" hoverEffect={false}>
          <div className="flex items-start gap-3.5 mb-4">
            <CategoryIcon category={message.category} size={16} />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-xl font-serif text-foreground leading-snug">{message.subject}</h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs font-medium text-foreground/70">{message.fromName}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span className="text-xs text-muted-foreground">{formatDate(message.createdAt, true)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <CategoryBadge category={message.category} />
                <StatusBadge status={message.status} />
              </div>
            </div>
          </div>

          <div className="border-t border-border/30 pt-4">
            <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {message.body}
            </div>
          </div>
        </GlassCard>

        {message.replies && message.replies.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <MessageSquare size={12} className="text-muted-foreground/40" />
              <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.18em]">
                Conversation ({message.replies.length})
              </p>
              <div className="flex-1 h-px bg-border/20" />
            </div>
            {message.replies.map((reply, idx) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <GlassCard
                  className={cn("p-4", reply.fromRole === "user" ? "ml-6 border-primary/15" : "mr-6")}
                  hoverEffect={false}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                      reply.fromRole === "user" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"
                    )}>
                      {reply.fromName[0]}
                    </div>
                    <span className="text-xs font-semibold text-foreground/70">{reply.fromName}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-[11px] text-muted-foreground">{formatDate(reply.createdAt, true)}</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap pl-8">{reply.body}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        <div className="md:hidden flex gap-2 mt-6 pt-4 border-t border-border/30">
          <button onClick={() => onPin(message.id)} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors border", message.isPinned ? "bg-primary/10 text-primary border-primary/20" : "bg-card text-muted-foreground border-border/30")}>
            <Pin size={13} /> {message.isPinned ? "Unpin" : "Pin"}
          </button>
          <button onClick={() => onArchive(message.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium bg-card text-muted-foreground cursor-pointer transition-colors border border-border/30">
            <Archive size={13} /> Archive
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function InboxPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState<"support" | "tool-request" | null>(null);
  const [inboxState, setInboxState] = useState(loadInboxState);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: apiMessages = [] } = useQuery<any[]>({
    queryKey: ["/api/messages"],
    queryFn: async () => {
      const res = await authFetch("/api/messages");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const markReadApi = useMutation({
    mutationFn: async (id: string) => { await authFetch(`/api/messages/${id}/read`, { method: "PATCH" }); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count"] });
    },
  });

  const allMessages: InboxMessage[] = useMemo(() => {
    const converted: InboxMessage[] = apiMessages.map((m: any) => ({
      id: m.id,
      subject: m.subject,
      body: m.body,
      category: m.isAnnouncement ? "announcement" as const : "support" as const,
      priority: "normal" as const,
      status: "open" as const,
      isRead: m.isRead || inboxState.read.has(m.id),
      isPinned: inboxState.pinned.has(m.id),
      isArchived: inboxState.archived.has(m.id),
      fromName: m.isAnnouncement ? "ClinicalPlay Team" : "Support Team",
      fromRole: m.isAnnouncement ? "admin" as const : "support" as const,
      createdAt: m.createdAt,
    }));
    const mockFiltered = MOCK_MESSAGES.map(m => ({
      ...m,
      isRead: m.isRead || inboxState.read.has(m.id),
      isPinned: inboxState.pinned.has(m.id),
      isArchived: inboxState.archived.has(m.id),
    }));
    return [...converted, ...mockFiltered].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [apiMessages, inboxState]);

  const filteredMessages = useMemo(() => {
    let msgs = allMessages.filter(m => !m.isArchived);
    if (activeCategory !== "all") msgs = msgs.filter(m => m.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      msgs = msgs.filter(m => m.subject.toLowerCase().includes(q) || m.body.toLowerCase().includes(q));
    }
    return msgs;
  }, [allMessages, activeCategory, searchQuery]);

  const unreadCount = useMemo(() => allMessages.filter(m => !m.isRead && !m.isArchived).length, [allMessages]);
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allMessages.filter(m => !m.isArchived).forEach(m => { counts[m.category] = (counts[m.category] || 0) + 1; });
    return counts;
  }, [allMessages]);

  const groupedMessages = useMemo(() => {
    const groups: { label: string; messages: InboxMessage[] }[] = [];
    const pinnedMsgs = filteredMessages.filter(m => m.isPinned);
    const unpinnedMsgs = filteredMessages.filter(m => !m.isPinned);

    if (pinnedMsgs.length > 0) {
      groups.push({ label: "Pinned", messages: pinnedMsgs });
    }

    const dateGroups = new Map<string, InboxMessage[]>();
    unpinnedMsgs.forEach(msg => {
      const group = getDateGroup(msg.createdAt);
      if (!dateGroups.has(group)) dateGroups.set(group, []);
      dateGroups.get(group)!.push(msg);
    });
    dateGroups.forEach((msgs, label) => {
      groups.push({ label, messages: msgs });
    });

    return groups;
  }, [filteredMessages]);

  const updateState = useCallback((fn: (s: typeof inboxState) => typeof inboxState) => {
    setInboxState(prev => { const next = fn(prev); saveInboxState(next); return next; });
  }, []);

  const togglePin = useCallback((id: string) => {
    updateState(s => {
      const pinned = new Set(s.pinned);
      if (pinned.has(id)) pinned.delete(id); else pinned.add(id);
      return { ...s, pinned };
    });
    setSelectedMessage(prev => prev ? { ...prev, isPinned: !prev.isPinned } : null);
  }, [updateState]);

  const toggleArchive = useCallback((id: string) => {
    updateState(s => {
      const archived = new Set(s.archived);
      if (archived.has(id)) archived.delete(id); else archived.add(id);
      return { ...s, archived };
    });
    if (selectedMessage?.id === id) setSelectedMessage(null);
  }, [updateState, selectedMessage]);

  const markRead = useCallback((id: string) => {
    updateState(s => { const read = new Set(s.read); read.add(id); return { ...s, read }; });
    markReadApi.mutate(id);
  }, [updateState, markReadApi]);

  const toggleRead = useCallback((id: string) => {
    updateState(s => {
      const read = new Set(s.read);
      if (read.has(id)) read.delete(id); else read.add(id);
      return { ...s, read };
    });
  }, [updateState]);

  const openMessage = (msg: InboxMessage) => {
    setSelectedMessage(msg);
    if (!msg.isRead) markRead(msg.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20 px-4">
        <GlassCard className="p-8 max-w-sm w-full text-center" hoverEffect={false}>
          <InboxIcon size={40} className="mx-auto text-muted-foreground/20 mb-4" />
          <h2 className="text-xl font-serif text-foreground mb-2">Sign in to view your inbox</h2>
          <Link href="/login">
            <button className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium cursor-pointer" data-testid="button-inbox-login">Sign In</button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const TABS: { key: CategoryTab; label: string; icon?: React.ElementType }[] = [
    { key: "all", label: "All" },
    ...Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({
      key: key as CategoryTab,
      label: cfg.label,
      icon: CATEGORY_ICONS[key],
    })),
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10 pt-16 md:pt-18">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 md:pt-6 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <InboxIcon size={18} className="text-accent" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-serif text-foreground tracking-tight flex items-center gap-2.5" data-testid="text-inbox-title">
                    Inbox
                    {unreadCount > 0 && (
                      <span className="text-[11px] bg-primary/15 text-primary px-2.5 py-0.5 rounded-full font-sans font-bold border border-primary/20">{unreadCount} new</span>
                    )}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">Messages, updates & tool requests</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCompose("tool-request")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-amber-500/8 text-amber-400 hover:bg-amber-500/15 transition-all cursor-pointer border border-amber-500/20 active:scale-95"
                data-testid="button-request-tool"
              >
                <Lightbulb size={13} /> Request Tool
              </button>
              <button
                onClick={() => setShowCompose("support")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-primary/8 text-primary hover:bg-primary/15 transition-all cursor-pointer border border-primary/15 active:scale-95"
                data-testid="button-contact-support"
              >
                <PenSquare size={13} /> Support
              </button>
            </div>
          </div>

          <GlassCard className="p-1.5 mb-5" hoverEffect={false}>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-1 overflow-x-auto flex-1 scrollbar-hide p-0.5">
                {TABS.map(tab => {
                  const count = tab.key === "all"
                    ? allMessages.filter(m => !m.isArchived).length
                    : categoryCounts[tab.key] || 0;
                  const isActive = activeCategory === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveCategory(tab.key)}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-all",
                        isActive
                          ? "bg-primary/12 text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground/80 hover:bg-secondary/40"
                      )}
                      data-testid={`tab-inbox-${tab.key}`}
                    >
                      {tab.icon && <tab.icon size={12} />}
                      {tab.label}
                      {count > 0 && (
                        <span className={cn("text-[10px] min-w-[18px] text-center px-1 py-px rounded-full",
                          isActive ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground/60"
                        )}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="relative w-full sm:w-52">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full h-9 pl-9 pr-8 rounded-lg bg-secondary/30 border border-border/30 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  data-testid="input-inbox-search"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground cursor-pointer">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          </GlassCard>

          <div className="flex gap-0 min-h-[calc(100vh-260px)]">
            <div
              ref={listRef}
              className={cn(
                "w-full md:w-[360px] lg:w-[400px] md:shrink-0 overflow-y-auto",
                selectedMessage && "hidden md:block"
              )}
            >
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                    <InboxIcon size={28} className="text-muted-foreground/20" />
                  </div>
                  {searchQuery ? (
                    <>
                      <p className="text-sm font-medium text-foreground/60">No results for "{searchQuery}"</p>
                      <p className="text-xs text-muted-foreground/50 mt-1">Try different keywords</p>
                    </>
                  ) : activeCategory !== "all" ? (
                    <>
                      <p className="text-sm font-medium text-foreground/60">No {CATEGORY_CONFIG[activeCategory as MessageCategory]?.label.toLowerCase()} messages</p>
                      <p className="text-xs text-muted-foreground/50 mt-1">Nothing here yet</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground/60">All caught up</p>
                      <p className="text-xs text-muted-foreground/50 mt-1 font-serif italic">Go build something beautiful.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {groupedMessages.map((group) => (
                    <div key={group.label}>
                      <div className="flex items-center gap-2 px-3 py-2.5">
                        {group.label === "Pinned" ? (
                          <Pin size={10} className="text-primary/50" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                        )}
                        <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.18em]">
                          {group.label}
                        </p>
                        <div className="flex-1 h-px bg-border/15" />
                      </div>
                      <div className="space-y-1 px-1">
                        {group.messages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.15 }}
                          >
                            <div
                              onClick={() => openMessage(msg)}
                              className={cn(
                                "group relative flex items-start gap-3 px-3 py-3 cursor-pointer transition-all rounded-xl border",
                                selectedMessage?.id === msg.id
                                  ? "bg-primary/8 border-primary/20 shadow-sm"
                                  : "border-transparent hover:bg-card/80 hover:border-border/30",
                                !msg.isRead && selectedMessage?.id !== msg.id && "bg-secondary/20 border-border/10"
                              )}
                              data-testid={`row-message-${msg.id}`}
                            >
                              <CategoryIcon category={msg.category} size={13} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h3 className={cn("text-sm truncate leading-snug", !msg.isRead ? "font-semibold text-foreground" : "text-foreground/70")}>
                                    {msg.subject}
                                  </h3>
                                  {!msg.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 shadow-sm shadow-primary/30" />}
                                  {msg.isPinned && <Pin size={9} className="text-primary shrink-0" />}
                                </div>
                                <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5 leading-snug">
                                  {msg.fromName} — {msg.body.slice(0, 55)}{msg.body.length > 55 ? "..." : ""}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-[10px] text-muted-foreground/40">{formatDate(msg.createdAt)}</span>
                                  {msg.priority === "high" && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold flex items-center gap-0.5">
                                      <Bell size={8} /> Urgent
                                    </span>
                                  )}
                                  {msg.replies && msg.replies.length > 0 && (
                                    <span className="text-[10px] text-muted-foreground/40 flex items-center gap-0.5">
                                      <MessageSquare size={8} /> {msg.replies.length}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="hidden sm:flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                                <button onClick={e => { e.stopPropagation(); togglePin(msg.id); }}
                                  className={cn("p-1.5 rounded-lg cursor-pointer transition-all", msg.isPinned ? "text-primary bg-primary/10" : "text-muted-foreground/30 hover:bg-secondary/50 hover:text-muted-foreground")}>
                                  <Pin size={11} />
                                </button>
                                <button onClick={e => { e.stopPropagation(); toggleArchive(msg.id); }}
                                  className="p-1.5 rounded-lg text-muted-foreground/30 hover:bg-secondary/50 hover:text-muted-foreground cursor-pointer transition-all">
                                  <Archive size={11} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={cn(
              "flex-1 min-w-0 md:pl-5 md:ml-5 md:border-l md:border-border/20",
              !selectedMessage && "hidden md:flex md:items-center md:justify-center"
            )}>
              {selectedMessage ? (
                <MessageDetail
                  message={selectedMessage}
                  onBack={() => setSelectedMessage(null)}
                  onPin={togglePin}
                  onArchive={toggleArchive}
                  onMarkRead={toggleRead}
                />
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-2xl bg-card border border-border/30 flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <MailOpen size={32} className="text-muted-foreground/15" />
                  </div>
                  <p className="text-sm text-foreground/50 font-medium">Select a message to read</p>
                  <p className="text-xs text-muted-foreground/30 mt-1.5">Choose from the list on the left</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showCompose && (
          <ComposeModal type={showCompose} onClose={() => setShowCompose(null)} authFetch={authFetch} />
        )}
      </AnimatePresence>
    </div>
  );
}
