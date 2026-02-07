import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth, useAuthFetch } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, Inbox as InboxIcon, CheckCircle2, Clock, ArrowLeft, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface Message {
  id: string;
  fromUserId: string | null;
  toUserId: string | null;
  subject: string;
  body: string;
  isAnnouncement: boolean;
  isRead: boolean;
  createdAt: string;
}

export default function InboxPage() {
  const { user, isLoading, isAuthenticated, session } = useAuth();
  const authFetch = useAuthFetch();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showSupport, setShowSupport] = useState(false);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportBody, setSupportBody] = useState("");

  const { data: messages = [], isLoading: msgsLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    queryFn: async () => {
      const res = await authFetch("/api/messages");
      if (!res.ok) throw new Error("Failed to load messages");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await authFetch(`/api/messages/${id}/read`, { method: "PATCH" });
    },
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
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Message sent! We'll get back to you soon." });
      setSupportSubject("");
      setSupportBody("");
      setShowSupport(false);
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  const openMessage = (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.isRead) markRead.mutate(msg.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-sage/5">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-sage/5">
        <Navbar />
        <div className="max-w-md mx-auto pt-32 px-6 text-center">
          <GlassCard className="p-8">
            <InboxIcon size={40} className="mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-serif text-primary mb-2">Sign in to view your inbox</h2>
            <Link href="/login">
              <button className="mt-4 h-10 px-6 rounded-full bg-primary text-primary-foreground text-sm font-medium cursor-pointer" data-testid="button-inbox-login">
                Sign In
              </button>
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-sage/5">
      <Navbar />
      <div className="max-w-3xl mx-auto pt-24 pb-16 px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-primary" data-testid="text-inbox-title">Inbox</h1>
            <p className="text-sm text-muted-foreground mt-1">Announcements & support messages</p>
          </div>
          <button
            onClick={() => setShowSupport(!showSupport)}
            className="h-9 px-4 rounded-full bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            data-testid="button-contact-support"
          >
            <MessageSquare size={14} />
            Contact Support
          </button>
        </div>

        <AnimatePresence mode="wait">
          {showSupport && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-serif text-primary mb-4">Send a Message</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (supportSubject.trim() && supportBody.trim()) sendSupport.mutate();
                  }}
                  className="space-y-3"
                  data-testid="form-support"
                >
                  <input
                    type="text"
                    placeholder="Subject"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    className="w-full h-10 px-4 rounded-xl border border-white/40 bg-white/60 backdrop-blur-sm text-sm text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                    required
                    data-testid="input-support-subject"
                  />
                  <textarea
                    placeholder="How can we help?"
                    value={supportBody}
                    onChange={(e) => setSupportBody(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/60 backdrop-blur-sm text-sm text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                    required
                    data-testid="input-support-body"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSupport(false)}
                      className="h-9 px-4 rounded-full text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendSupport.isPending}
                      className="h-9 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                      data-testid="button-send-support"
                    >
                      <Send size={13} />
                      {sendSupport.isPending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedMessage ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <button
              onClick={() => setSelectedMessage(null)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 cursor-pointer"
              data-testid="button-back-inbox"
            >
              <ArrowLeft size={14} />
              Back to inbox
            </button>
            <GlassCard className="p-6 md:p-8">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${selectedMessage.isAnnouncement ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                  {selectedMessage.isAnnouncement ? <Mail size={14} /> : <MessageSquare size={14} />}
                </div>
                <div>
                  <h2 className="text-lg font-serif text-primary" data-testid="text-message-subject">{selectedMessage.subject}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedMessage.isAnnouncement ? "Announcement" : "Message"} · {new Date(selectedMessage.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap" data-testid="text-message-body">
                {selectedMessage.body}
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {msgsLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <InboxIcon size={40} className="mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Announcements and updates will appear here</p>
              </GlassCard>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.005 }}
                >
                  <GlassCard
                    className={`p-4 cursor-pointer transition-all hover:border-accent/30 ${!msg.isRead ? "border-l-2 border-l-accent bg-accent/[0.02]" : ""}`}
                    onClick={() => openMessage(msg)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isAnnouncement ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                        {msg.isAnnouncement ? <Mail size={14} /> : <MessageSquare size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm truncate ${!msg.isRead ? "font-semibold text-primary" : "text-foreground/70"}`} data-testid={`text-message-subject-${msg.id}`}>
                            {msg.subject}
                          </h3>
                          {!msg.isRead && (
                            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {msg.body.slice(0, 80)}{msg.body.length > 80 ? "..." : ""}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground/60 shrink-0">
                        {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
