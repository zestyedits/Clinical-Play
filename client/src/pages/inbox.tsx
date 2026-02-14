import { GlassCard } from "@/components/ui/glass-card";
import { useAuth, useAuthFetch } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Send, Inbox as InboxIcon, ArrowLeft, MessageSquare, Search, Pin, Archive,
  MailOpen, Megaphone, Lightbulb, Settings, Image, Headphones, ChevronRight,
  Filter, X, PenSquare, Check,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  MOCK_MESSAGES, CATEGORY_CONFIG,
  type InboxMessage, type MessageCategory, type InboxReply,
} from "@/lib/mock-data/inbox-messages";
import { MODALITY_OPTIONS } from "@/lib/mock-data/tools-library";

// ── Helpers ──
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

function CategoryIcon({ category, size = 14 }: { category: string; size?: number }) {
  const Icon = CATEGORY_ICONS[category] || Mail;
  const color = CATEGORY_CONFIG[category as MessageCategory]?.color || "#7B8FA1";
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
      <Icon size={size} style={{ color }} />
    </div>
  );
}

function formatDate(dateStr: string, full = false): string {
  const d = new Date(dateStr);
  if (full) return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return "Today";
  if (diff < 172800000) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type CategoryTab = "all" | MessageCategory;

export default function InboxPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // UI state
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState<"support" | "tool-request" | null>(null);
  const [inboxState, setInboxState] = useState(loadInboxState);

  // Compose state
  const [supportSubject, setSupportSubject] = useState("");
  const [supportBody, setSupportBody] = useState("");
  const [toolReqTitle, setToolReqTitle] = useState("");
  const [toolReqModality, setToolReqModality] = useState("");
  const [toolReqAge, setToolReqAge] = useState("");
  const [toolReqGoal, setToolReqGoal] = useState("");
  const [toolReqNotes, setToolReqNotes] = useState("");

  // API integration (for real messages from backend)
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

  const sendSupport = useMutation({
    mutationFn: async () => {
      const res = await authFetch("/api/messages/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: supportSubject, body: supportBody }),
      });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Message sent. We'll get back to you soon." });
      setSupportSubject(""); setSupportBody(""); setShowCompose(null);
    },
    onError: () => { toast({ title: "Failed to send message", variant: "destructive" }); },
  });

  const submitToolRequest = useMutation({
    mutationFn: async () => {
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
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Tool request submitted. Thank you for shaping our roadmap." });
      setToolReqTitle(""); setToolReqModality(""); setToolReqAge(""); setToolReqGoal(""); setToolReqNotes("");
      setShowCompose(null);
    },
    onError: () => { toast({ title: "Failed to submit request", variant: "destructive" }); },
  });

  // Merge mock + API messages, preferring API for matching IDs
  const allMessages: InboxMessage[] = useMemo(() => {
    const apiMsgIds = new Set(apiMessages.map((m: any) => m.id));
    // Convert API messages to our format
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
    // Add mock messages that don't conflict
    const mockFiltered = MOCK_MESSAGES.map(m => ({
      ...m,
      isRead: m.isRead || inboxState.read.has(m.id),
      isPinned: inboxState.pinned.has(m.id),
      isArchived: inboxState.archived.has(m.id),
    }));
    return [...converted, ...mockFiltered].sort((a, b) => {
      // Pinned first, then by date
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

  // Actions
  const updateState = useCallback((fn: (s: typeof inboxState) => typeof inboxState) => {
    setInboxState(prev => { const next = fn(prev); saveInboxState(next); return next; });
  }, []);

  const togglePin = useCallback((id: string) => {
    updateState(s => {
      const pinned = new Set(s.pinned);
      if (pinned.has(id)) pinned.delete(id); else pinned.add(id);
      return { ...s, pinned };
    });
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

  // ── Render ──

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center pt-32">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto pt-32 px-6 text-center">
          <GlassCard className="p-8">
            <InboxIcon size={40} className="mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-serif text-primary mb-2">Sign in to view your inbox</h2>
            <Link href="/login">
              <button className="mt-4 h-10 px-6 rounded-full bg-primary text-primary-foreground text-sm font-medium cursor-pointer">Sign In</button>
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="max-w-4xl mx-auto pt-28 md:pt-36 pb-16 px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-primary transition-colors cursor-pointer">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-primary font-medium">Inbox</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-primary flex items-center gap-3">
              Inbox
              {unreadCount > 0 && (
                <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full font-sans font-bold">{unreadCount}</span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Messages, updates, and tool requests</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCompose("tool-request")}
              className="h-9 px-4 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors flex items-center gap-1.5 cursor-pointer border border-accent/20"
            >
              <Lightbulb size={14} /> Request a Tool
            </button>
            <button
              onClick={() => setShowCompose("support")}
              className="h-9 px-4 rounded-xl bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PenSquare size={14} /> Contact Support
            </button>
          </div>
        </motion.div>

        {/* Compose Forms */}
        <AnimatePresence mode="wait">
          {showCompose === "support" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
              <GlassCard hoverEffect={false} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-serif text-primary">Contact Support</h3>
                  <button onClick={() => setShowCompose(null)} className="p-2 hover:bg-secondary rounded-xl cursor-pointer"><X size={16} className="text-muted-foreground" /></button>
                </div>
                <form onSubmit={e => { e.preventDefault(); if (supportSubject.trim() && supportBody.trim()) sendSupport.mutate(); }} className="space-y-3">
                  <input type="text" placeholder="Subject" value={supportSubject} onChange={e => setSupportSubject(e.target.value)}
                    className="w-full h-10 px-4 rounded-xl border border-white/40 bg-white/60 text-sm text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30" required />
                  <textarea placeholder="How can we help?" value={supportBody} onChange={e => setSupportBody(e.target.value)} rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/60 text-sm text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" required />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowCompose(null)} className="h-9 px-4 rounded-xl text-sm text-muted-foreground cursor-pointer hover:text-primary">Cancel</button>
                    <button type="submit" disabled={sendSupport.isPending}
                      className="h-9 px-5 rounded-xl bg-primary text-white text-sm font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50 hover:bg-primary/90">
                      <Send size={13} /> {sendSupport.isPending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}

          {showCompose === "tool-request" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
              <GlassCard hoverEffect={false} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-serif text-primary">Request a Tool</h3>
                    <p className="text-xs text-muted-foreground mt-1">Help shape what we build next</p>
                  </div>
                  <button onClick={() => setShowCompose(null)} className="p-2 hover:bg-secondary rounded-xl cursor-pointer"><X size={16} className="text-muted-foreground" /></button>
                </div>
                <form onSubmit={e => { e.preventDefault(); if (toolReqTitle.trim()) submitToolRequest.mutate(); }} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-primary block mb-1">Tool Name *</label>
                    <input type="text" value={toolReqTitle} onChange={e => setToolReqTitle(e.target.value)} placeholder="e.g., Emotion Thermometer"
                      className="w-full h-10 px-4 rounded-xl border border-white/40 bg-white/60 text-sm text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-primary block mb-1">Primary Modality</label>
                      <select value={toolReqModality} onChange={e => setToolReqModality(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-white/40 bg-white/60 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer">
                        <option value="">Select...</option>
                        {MODALITY_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-primary block mb-1">Age Range</label>
                      <input type="text" value={toolReqAge} onChange={e => setToolReqAge(e.target.value)} placeholder="e.g., Teens, Adults"
                        className="w-full h-10 px-4 rounded-xl border border-white/40 bg-white/60 text-sm text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-primary block mb-1">Therapeutic Goal</label>
                    <input type="text" value={toolReqGoal} onChange={e => setToolReqGoal(e.target.value)} placeholder="What would this tool help clients do?"
                      className="w-full h-10 px-4 rounded-xl border border-white/40 bg-white/60 text-sm text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-primary block mb-1">Additional Notes</label>
                    <textarea value={toolReqNotes} onChange={e => setToolReqNotes(e.target.value)} rows={3} placeholder="Any other details about how you'd use this tool..."
                      className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/60 text-sm text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowCompose(null)} className="h-9 px-4 rounded-xl text-sm text-muted-foreground cursor-pointer hover:text-primary">Cancel</button>
                    <button type="submit" disabled={submitToolRequest.isPending || !toolReqTitle.trim()}
                      className="h-9 px-5 rounded-xl bg-gradient-to-r from-[#2E8B57] to-[#236B43] text-white text-sm font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm hover:opacity-90">
                      <Send size={13} /> {submitToolRequest.isPending ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category tabs + search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex gap-1 overflow-x-auto pb-1 flex-1">
            {([
              { key: "all" as const, label: "All", count: allMessages.filter(m => !m.isArchived).length },
              ...Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({ key: key as CategoryTab, label: cfg.label, count: categoryCounts[key] || 0 })),
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-colors",
                  activeCategory === tab.key ? "bg-primary text-white" : "bg-white/60 text-muted-foreground hover:bg-secondary border border-border/20"
                )}
              >
                {tab.label} {tab.count > 0 && <span className="opacity-60">({tab.count})</span>}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/60 border border-border/30 text-xs text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        {/* Message List or Detail */}
        <AnimatePresence mode="wait">
          {selectedMessage ? (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button
                onClick={() => setSelectedMessage(null)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to inbox
              </button>
              <GlassCard hoverEffect={false} className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <CategoryIcon category={selectedMessage.category} />
                    <div>
                      <h2 className="text-lg font-serif text-primary">{selectedMessage.subject}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{selectedMessage.fromName}</span>
                        <span className="text-xs text-muted-foreground/40">·</span>
                        <span className="text-xs text-muted-foreground">{formatDate(selectedMessage.createdAt, true)}</span>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium border", {
                          "bg-green-50 text-green-700 border-green-200": selectedMessage.status === "resolved",
                          "bg-amber-50 text-amber-700 border-amber-200": selectedMessage.status === "pending",
                          "bg-blue-50 text-blue-700 border-blue-200": selectedMessage.status === "open",
                        })}>
                          {selectedMessage.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => togglePin(selectedMessage.id)} className={cn("p-2 rounded-lg cursor-pointer transition-colors", selectedMessage.isPinned ? "text-accent bg-accent/10" : "text-muted-foreground/40 hover:bg-secondary")}>
                      <Pin size={14} />
                    </button>
                    <button onClick={() => toggleArchive(selectedMessage.id)} className="p-2 rounded-lg text-muted-foreground/40 hover:bg-secondary cursor-pointer transition-colors">
                      <Archive size={14} />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap mb-6">
                  {selectedMessage.body}
                </div>

                {/* Thread replies */}
                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div className="border-t border-border/20 pt-4 space-y-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Conversation</p>
                    {selectedMessage.replies.map(reply => (
                      <div key={reply.id} className={cn("p-4 rounded-xl", reply.fromRole === "user" ? "bg-primary/5 ml-4" : "bg-secondary/30 mr-4")}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-primary">{reply.fromName}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(reply.createdAt, true)}</span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{reply.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filteredMessages.length === 0 ? (
                <GlassCard hoverEffect={false} className="p-12 text-center">
                  <InboxIcon size={40} className="mx-auto text-muted-foreground/15 mb-4" />
                  {searchQuery ? (
                    <>
                      <h3 className="font-serif text-lg text-primary mb-1">No messages match your search</h3>
                      <p className="text-sm text-muted-foreground">Try different keywords or clear your search.</p>
                    </>
                  ) : activeCategory !== "all" ? (
                    <>
                      <h3 className="font-serif text-lg text-primary mb-1">No {CATEGORY_CONFIG[activeCategory as MessageCategory]?.label.toLowerCase()} messages</h3>
                      <p className="text-sm text-muted-foreground">Nothing here yet. That's probably a good thing.</p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-serif text-lg text-primary mb-1">Nothing urgent</h3>
                      <p className="text-sm text-muted-foreground italic">Go build something beautiful.</p>
                    </>
                  )}
                </GlassCard>
              ) : (
                <div className="space-y-1.5">
                  {filteredMessages.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <div
                        onClick={() => openMessage(msg)}
                        className={cn(
                          "group relative p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-sm",
                          !msg.isRead ? "bg-white/80 border-accent/20 shadow-sm" : "bg-white/40 border-border/20 hover:bg-white/60",
                          msg.isPinned && "ring-1 ring-accent/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <CategoryIcon category={msg.category} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={cn("text-sm truncate", !msg.isRead ? "font-semibold text-primary" : "text-foreground/70")}>
                                {msg.subject}
                              </h3>
                              {!msg.isRead && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
                              {msg.isPinned && <Pin size={10} className="text-accent shrink-0" />}
                              {msg.priority === "high" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-bold shrink-0">!</span>}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {msg.fromName} · {msg.body.slice(0, 80)}{msg.body.length > 80 ? "..." : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-muted-foreground/60">{formatDate(msg.createdAt)}</span>
                            {/* Quick actions on hover */}
                            <div className="hidden sm:flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={e => { e.stopPropagation(); togglePin(msg.id); }}
                                className={cn("p-1.5 rounded-lg cursor-pointer", msg.isPinned ? "text-accent" : "text-muted-foreground/30 hover:bg-secondary")}>
                                <Pin size={12} />
                              </button>
                              <button onClick={e => { e.stopPropagation(); toggleRead(msg.id); }}
                                className="p-1.5 rounded-lg text-muted-foreground/30 hover:bg-secondary cursor-pointer">
                                {msg.isRead ? <Mail size={12} /> : <MailOpen size={12} />}
                              </button>
                              <button onClick={e => { e.stopPropagation(); toggleArchive(msg.id); }}
                                className="p-1.5 rounded-lg text-muted-foreground/30 hover:bg-secondary cursor-pointer">
                                <Archive size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
