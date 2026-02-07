import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth, useAuthFetch } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Users, Mail, Trash2, Shield, ShieldCheck, Crown, Clock, Send, ChevronDown, ChevronUp, UserX, ListChecks } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface UserRecord {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  isPro: boolean;
  subscriptionType: string | null;
  createdAt: string;
}

interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export default function AdminPanel() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const authFetch = useAuthFetch();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"users" | "waitlist" | "announce">("users");
  const [announcementSubject, setAnnouncementSubject] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const { data: adminCheck } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check"],
    queryFn: async () => {
      const res = await authFetch("/api/admin/check");
      if (!res.ok) return { isAdmin: false };
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery<UserRecord[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await authFetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: adminCheck?.isAdmin === true,
  });

  const { data: waitlist = [], isLoading: waitlistLoading } = useQuery<WaitlistEntry[]>({
    queryKey: ["/api/admin/waitlist"],
    queryFn: async () => {
      const res = await authFetch("/api/admin/waitlist");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: adminCheck?.isAdmin === true,
  });

  const upgradeUser = useMutation({
    mutationFn: async ({ id, isPro }: { id: string; isPro: boolean }) => {
      const res = await authFetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPro, subscriptionType: isPro ? "pro" : "free" }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated" });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User removed" });
    },
  });

  const removeWaitlistEntry = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`/api/admin/waitlist/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/waitlist"] });
      toast({ title: "Waitlist entry removed" });
    },
  });

  const sendAnnouncement = useMutation({
    mutationFn: async () => {
      const res = await authFetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: announcementSubject, body: announcementBody, sendEmail }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Announcement sent!" });
      setAnnouncementSubject("");
      setAnnouncementBody("");
      setSendEmail(false);
    },
    onError: () => {
      toast({ title: "Failed to send", variant: "destructive" });
    },
  });

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

  if (!isAuthenticated || !adminCheck?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-sage/5">
        <Navbar />
        <div className="max-w-md mx-auto pt-32 px-6 text-center">
          <GlassCard className="p-8">
            <Shield size={40} className="mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-serif text-primary mb-2">Access Restricted</h2>
            <p className="text-sm text-muted-foreground">This page is only available to administrators.</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "users" as const, label: "Users", icon: Users, count: allUsers.length },
    { id: "waitlist" as const, label: "Waitlist", icon: ListChecks, count: waitlist.length },
    { id: "announce" as const, label: "Announce", icon: Send },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-sage/5">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-24 pb-16 px-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-serif text-primary" data-testid="text-admin-title">Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage users, waitlist, and announcements</p>
        </div>

        <div className="flex gap-1 mb-6 bg-white/30 backdrop-blur-sm rounded-full p-1 border border-white/40 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-9 px-4 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
              data-testid={`button-admin-tab-${tab.id}`}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs ${activeTab === tab.id ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "users" && (
          <div className="space-y-2">
            {usersLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : allUsers.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <Users size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm">No users yet</p>
              </GlassCard>
            ) : (
              allUsers.map((u) => (
                <motion.div key={u.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${u.isPro ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"}`}>
                        {u.isPro ? <Crown size={16} /> : <Users size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-primary truncate" data-testid={`text-user-email-${u.id}`}>
                            {u.email || "No email"}
                          </span>
                          {u.isPro && (
                            <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Pro
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {u.firstName || ""} {u.lastName || ""} · Joined {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <button
                        onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {expandedUser === u.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                    {expandedUser === u.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 pt-3 border-t border-white/30 flex flex-wrap gap-2"
                      >
                        <button
                          onClick={() => upgradeUser.mutate({ id: u.id, isPro: !u.isPro })}
                          disabled={upgradeUser.isPending}
                          className={`h-8 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                            u.isPro
                              ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                          data-testid={`button-toggle-pro-${u.id}`}
                        >
                          {u.isPro ? <Shield size={12} /> : <ShieldCheck size={12} />}
                          {u.isPro ? "Remove Pro" : "Upgrade to Pro"}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${u.email}? This cannot be undone.`)) {
                              deleteUser.mutate(u.id);
                            }
                          }}
                          disabled={deleteUser.isPending}
                          className="h-8 px-3 rounded-full text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1.5 transition-all cursor-pointer"
                          data-testid={`button-delete-user-${u.id}`}
                        >
                          <UserX size={12} />
                          Remove Account
                        </button>
                      </motion.div>
                    )}
                  </GlassCard>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === "waitlist" && (
          <div className="space-y-2">
            {waitlistLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : waitlist.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <Mail size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm">No waitlist signups yet</p>
              </GlassCard>
            ) : (
              waitlist.map((entry) => (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Mail size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-primary" data-testid={`text-waitlist-email-${entry.id}`}>{entry.email}</span>
                        <p className="text-xs text-muted-foreground">
                          {entry.name || "No name"} · {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <button
                        onClick={() => removeWaitlistEntry.mutate(entry.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                        data-testid={`button-remove-waitlist-${entry.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === "announce" && (
          <GlassCard className="p-6 md:p-8">
            <h3 className="text-lg font-serif text-primary mb-1">Send Announcement</h3>
            <p className="text-xs text-muted-foreground mb-5">This will appear in all users' inboxes. Optionally send via email too.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (announcementSubject.trim() && announcementBody.trim()) {
                  sendAnnouncement.mutate();
                }
              }}
              className="space-y-4"
              data-testid="form-announcement"
            >
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject</label>
                <input
                  type="text"
                  value={announcementSubject}
                  onChange={(e) => setAnnouncementSubject(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl border border-white/40 bg-white/60 backdrop-blur-sm text-sm text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                  placeholder="Announcement subject"
                  required
                  data-testid="input-announcement-subject"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Message</label>
                <textarea
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/60 backdrop-blur-sm text-sm text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                  placeholder="Write your announcement..."
                  required
                  data-testid="input-announcement-body"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary"
                  data-testid="checkbox-send-email"
                />
                <span className="text-sm text-foreground/70">Also send via email to all users</span>
              </label>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sendAnnouncement.isPending}
                  className="h-10 px-6 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  data-testid="button-send-announcement"
                >
                  <Send size={14} />
                  {sendAnnouncement.isPending ? "Sending..." : "Send Announcement"}
                </button>
              </div>
            </form>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
