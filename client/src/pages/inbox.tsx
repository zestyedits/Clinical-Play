import { GlassCard } from "@/components/ui/glass-card";
import { useAuth, useAuthFetch } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Send, Inbox as InboxIcon, ArrowLeft, Search, Pin, Archive,
  MailOpen, Megaphone, Lightbulb, Settings, Image, Headphones,
  X, PenSquare, Check, ChevronDown,
} from "lucide-react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
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

const CATEGORY_COLORS: Record<string, string> = {
  support: "text-emerald-600 bg-emerald-500/10",
  announcement: "text-blue-600 bg-blue-500/10",
  "tool-request": "text-amber-600 bg-amber-500/10",
  system: "text-slate-500 bg-slate-500/10",
  artifact: "text-purple-600 bg-purple-500/10",
};

function CategoryIcon({ category, size = 14 }: { category: string; size?: number }) {
  const Icon = CATEGORY_ICONS[category] || Mail;
  const colorClass = CATEGORY_COLORS[category] || "text-muted-foreground bg-secondary";
  return (
    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
      <Icon size={size} />
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const colorClass = CATEGORY_COLORS[category] || "text-muted-foreground bg-secondary";
  const label = CATEGORY_CONFIG[category as MessageCategory]?.label || category;
  return (
    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", colorClass)}>
      {label}
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
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div>
            <h3 className="text-lg font-serif text-foreground">
              {type === "support" ? "Contact Support" : "Request a Tool"}
            </h3>
            {type === "tool-request" && (
              <p className="text-xs text-muted-foreground mt-0.5">Help shape what we build next</p>
            )}
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
      <div className="flex items-center gap-2 mb-4 md:mb-5">
        <button
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          data-testid="button-inbox-back"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="hidden md:flex items-center gap-1">
          <button onClick={() => onPin(message.id)} className={cn("p-2 rounded-lg cursor-pointer transition-colors", message.isPinned ? "text-primary bg-primary/10" : "text-muted-foreground/40 hover:bg-secondary")} data-testid="button-pin-detail">
            <Pin size={14} />
          </button>
          <button onClick={() => onMarkRead(message.id)} className="p-2 rounded-lg text-muted-foreground/40 hover:bg-secondary cursor-pointer transition-colors" data-testid="button-read-detail">
            {message.isRead ? <Mail size={14} /> : <MailOpen size={14} />}
          </button>
          <button onClick={() => onArchive(message.id)} className="p-2 rounded-lg text-muted-foreground/40 hover:bg-secondary cursor-pointer transition-colors" data-testid="button-archive-detail">
            <Archive size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex items-start gap-3 mb-5">
          <CategoryIcon category={message.category} size={16} />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-serif text-foreground leading-snug">{message.subject}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs font-medium text-foreground/70">{message.fromName}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="text-xs text-muted-foreground">{formatDate(message.createdAt, true)}</span>
              <CategoryBadge category={message.category} />
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium border", {
                "bg-emerald-500/8 text-emerald-600 border-emerald-500/20": message.status === "resolved",
                "bg-amber-500/8 text-amber-600 border-amber-500/20": message.status === "pending",
                "bg-blue-500/8 text-blue-600 border-blue-500/20": message.status === "open",
              })}>
                {message.status}
              </span>
            </div>
          </div>
        </div>

        <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap mb-6 pl-11">
          {message.body}
        </div>

        {message.replies && message.replies.length > 0 && (
          <div className="border-t border-border/30 pt-5 pl-11 space-y-4">
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.18em]">Conversation</p>
            {message.replies.map(reply => (
              <div key={reply.id} className={cn("p-4 rounded-xl border", reply.fromRole === "user" ? "bg-primary/4 border-primary/10 ml-4" : "bg-secondary/20 border-border/20 mr-4")}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-foreground/70">{reply.fromName}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-[11px] text-muted-foreground">{formatDate(reply.createdAt, true)}</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{reply.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Mobile action buttons */}
        <div className="md:hidden flex gap-2 mt-6 pt-4 border-t border-border/30">
          <button onClick={() => onPin(message.id)} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors", message.isPinned ? "bg-primary/10 text-primary" : "bg-secondary/30 text-muted-foreground")}>
            <Pin size={13} /> {message.isPinned ? "Unpin" : "Pin"}
          </button>
          <button onClick={() => onArchive(message.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium bg-secondary/30 text-muted-foreground cursor-pointer transition-colors">
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-4 md:pt-6 pb-5">
            <div>
              <h1 className="text-xl md:text-2xl font-serif text-foreground tracking-tight flex items-center gap-3" data-testid="text-inbox-title">
                Inbox
                {unreadCount > 0 && (
                  <span className="text-[11px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-sans font-bold">{unreadCount}</span>
                )}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Messages, updates & tool requests</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCompose("tool-request")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-600 hover:bg-amber-500/10 transition-all cursor-pointer border border-amber-500/20 active:scale-95"
                data-testid="button-request-tool"
              >
                <Lightbulb size={13} /> Request Tool
              </button>
              <button
                onClick={() => setShowCompose("support")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-primary hover:bg-primary/8 transition-all cursor-pointer border border-primary/15 active:scale-95"
                data-testid="button-contact-support"
              >
                <PenSquare size={13} /> Support
              </button>
            </div>
          </div>

          {/* Category tabs + search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex gap-1 overflow-x-auto pb-1 flex-1 scrollbar-hide">
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
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-all",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-card text-muted-foreground hover:bg-secondary border border-border/30"
                    )}
                    data-testid={`tab-inbox-${tab.key}`}
                  >
                    {tab.icon && <tab.icon size={12} />}
                    {tab.label}
                    {count > 0 && <span className={cn("text-[10px]", isActive ? "text-primary/60" : "text-muted-foreground/50")}>{count}</span>}
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
                className="w-full h-9 pl-9 pr-8 rounded-xl bg-card border border-border/40 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                data-testid="input-inbox-search"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground cursor-pointer">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Two-panel layout */}
          <div className="flex gap-0 md:gap-0 min-h-[calc(100vh-220px)]">
            {/* Message list panel */}
            <div
              ref={listRef}
              className={cn(
                "w-full md:w-[340px] lg:w-[380px] md:shrink-0 md:border-r md:border-border/30 md:pr-0 overflow-y-auto",
                selectedMessage && "hidden md:block"
              )}
            >
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <InboxIcon size={36} className="text-muted-foreground/15 mb-3" />
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
                      <p className="text-xs text-muted-foreground/50 mt-1 italic">Go build something beautiful.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-0">
                  {groupedMessages.map((group) => (
                    <div key={group.label}>
                      <div className="px-3 py-2 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                        <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.18em]">
                          {group.label === "Pinned" && <Pin size={9} className="inline mr-1 -mt-0.5" />}
                          {group.label}
                        </p>
                      </div>
                      {group.messages.map((msg) => (
                        <div
                          key={msg.id}
                          onClick={() => openMessage(msg)}
                          className={cn(
                            "group relative flex items-start gap-3 px-3 py-3 cursor-pointer transition-all border-b border-border/15",
                            selectedMessage?.id === msg.id
                              ? "bg-primary/6 md:border-l-2 md:border-l-primary"
                              : "hover:bg-secondary/30",
                            !msg.isRead && "bg-primary/3"
                          )}
                          data-testid={`row-message-${msg.id}`}
                        >
                          <CategoryIcon category={msg.category} size={13} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className={cn("text-sm truncate leading-snug", !msg.isRead ? "font-semibold text-foreground" : "text-foreground/70")}>
                                {msg.subject}
                              </h3>
                              {!msg.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                              {msg.isPinned && <Pin size={9} className="text-primary shrink-0" />}
                            </div>
                            <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5 leading-snug">
                              {msg.fromName} — {msg.body.slice(0, 60)}{msg.body.length > 60 ? "..." : ""}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-muted-foreground/40">{formatDate(msg.createdAt)}</span>
                              {msg.priority === "high" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">Urgent</span>}
                              {msg.replies && msg.replies.length > 0 && <span className="text-[10px] text-muted-foreground/40">{msg.replies.length} replies</span>}
                            </div>
                          </div>

                          {/* Quick actions on hover */}
                          <div className="hidden sm:flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                            <button onClick={e => { e.stopPropagation(); togglePin(msg.id); }}
                              className={cn("p-1 rounded-md cursor-pointer transition-colors", msg.isPinned ? "text-primary" : "text-muted-foreground/30 hover:bg-secondary")}>
                              <Pin size={11} />
                            </button>
                            <button onClick={e => { e.stopPropagation(); toggleArchive(msg.id); }}
                              className="p-1 rounded-md text-muted-foreground/30 hover:bg-secondary cursor-pointer transition-colors">
                              <Archive size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detail panel */}
            <div className={cn(
              "flex-1 min-w-0 md:pl-6",
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
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                    <MailOpen size={28} className="text-muted-foreground/20" />
                  </div>
                  <p className="text-sm text-muted-foreground/50 font-medium">Select a message to read</p>
                  <p className="text-xs text-muted-foreground/30 mt-1">Choose from the list on the left</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Compose modal */}
      <AnimatePresence>
        {showCompose && (
          <ComposeModal type={showCompose} onClose={() => setShowCompose(null)} authFetch={authFetch} />
        )}
      </AnimatePresence>
    </div>
  );
}
