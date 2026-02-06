import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { Plus, Users, Calendar, Video, ArrowRight, MoreHorizontal, Copy, CheckCircle2, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { TherapySession } from "@shared/schema";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Please sign in", description: "Redirecting to login...", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [authLoading, isAuthenticated]);

  const { data: sessions = [], isLoading } = useQuery<TherapySession[]>({
    queryKey: ["/api/therapy-sessions/mine"],
    queryFn: async () => {
      const res = await fetch("/api/therapy-sessions/mine", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const createSession = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/therapy-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: `Session ${new Date().toLocaleDateString()}` }),
      });
      return res.json();
    },
    onSuccess: (session: TherapySession) => {
      queryClient.invalidateQueries({ queryKey: ["/api/therapy-sessions/mine"] });
      navigate(`/playroom/${session.id}`);
    },
  });

  const copyInvite = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-background to-secondary/20">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-muted-foreground font-medium" data-testid="text-loading">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20 pb-24 md:pb-10 pt-24 md:pt-32 px-4 md:px-8">
      <Navbar />
      
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-primary mb-2" data-testid="text-dashboard-title">
              Welcome{user?.firstName ? `, ${user.firstName}` : ""}
            </h1>
            <p className="text-muted-foreground">Create sessions and invite clients to join</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => createSession.mutate()}
              disabled={createSession.isPending}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform cursor-pointer w-full md:w-auto justify-center disabled:opacity-50"
              data-testid="button-new-session"
            >
              <Plus size={18} /> {createSession.isPending ? "Creating..." : "New Session Room"}
            </button>
            <button
              onClick={() => logout()}
              className="p-3 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              data-testid="button-logout"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-medium text-primary flex items-center gap-2">
              <Video size={18} className="text-accent" /> Session Rooms
            </h2>
            
            {isLoading ? (
              <div className="text-center py-16 text-muted-foreground">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <GlassCard className="p-12 text-center" hoverEffect={false}>
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-secondary/50 flex items-center justify-center">
                  <Video size={28} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-serif text-primary mb-2">No sessions yet</h3>
                <p className="text-muted-foreground mb-6">Create your first session room to get started</p>
                <button
                  onClick={() => createSession.mutate()}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-full inline-flex items-center gap-2 shadow-lg cursor-pointer"
                  data-testid="button-new-session-empty"
                >
                  <Plus size={18} /> Create Session
                </button>
              </GlassCard>
            ) : (
              sessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <GlassCard className="p-6 flex flex-col md:flex-row items-center gap-6" hoverEffect={true}>
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Video size={24} className="text-accent" />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-lg font-serif text-primary">{session.name}</h3>
                      <div className="flex items-center justify-center md:justify-start gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${session.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {session.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => copyInvite(session.inviteCode)}
                        className="min-h-[44px] px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/40 text-foreground rounded-2xl text-sm font-medium hover:bg-white transition-colors flex items-center gap-2 cursor-pointer font-mono tracking-wider"
                        data-testid={`button-copy-invite-${session.id}`}
                      >
                        {copied === session.inviteCode ? <CheckCircle2 size={16} className="text-green-600" /> : <Copy size={16} />}
                        {copied === session.inviteCode ? "Copied!" : session.inviteCode}
                      </button>
                      <Link href={`/playroom/${session.id}`} className="flex-1 md:flex-initial no-underline">
                        <button className="w-full min-h-[44px] px-5 py-3 bg-accent text-white rounded-2xl text-sm font-medium shadow-md shadow-accent/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer" data-testid={`button-join-${session.id}`}>
                          Enter <ArrowRight size={16} />
                        </button>
                      </Link>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard className="p-6">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="font-serif text-lg text-primary">Quick Stats</h3>
                 <MoreHorizontal size={20} className="text-muted-foreground cursor-pointer" />
               </div>
               
               <div className="space-y-6">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                     <Users size={20} />
                   </div>
                   <div>
                     <p className="text-2xl font-serif text-primary" data-testid="text-session-count">{sessions.length}</p>
                     <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Sessions</p>
                   </div>
                 </div>
               </div>
            </GlassCard>

            {user && (
              <GlassCard className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-serif text-lg">
                      {user.firstName?.charAt(0) || "C"}
                    </div>
                  )}
                  <div>
                    <p className="font-serif text-primary font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </GlassCard>
            )}

            <div className="p-6 rounded-3xl bg-primary text-primary-foreground relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-serif text-xl mb-2">How It Works</h3>
                <p className="text-primary-foreground/80 text-sm mb-4">
                  1. Create a session room<br/>
                  2. Share the invite code<br/>
                  3. Use the Zen Sandtray together
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl -mr-10 -mt-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
