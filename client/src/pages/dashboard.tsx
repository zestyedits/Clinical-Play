import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { Plus, Users, Calendar, Video, ArrowRight, MoreHorizontal, Copy, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@shared/schema";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
    queryFn: async () => {
      const res = await fetch("/api/sessions/clinician/all");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createSession = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Session ${new Date().toLocaleDateString()}` }),
      });
      return res.json();
    },
    onSuccess: (session: Session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      navigate(`/playroom/${session.id}`);
    },
  });

  const copyInvite = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20 pb-24 md:pb-10 pt-24 md:pt-32 px-4 md:px-8">
      <Navbar />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-primary mb-2">Clinician Hub</h1>
            <p className="text-muted-foreground">Create sessions and invite clients to join</p>
          </div>
          <button
            onClick={() => createSession.mutate()}
            disabled={createSession.isPending}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform cursor-pointer w-full md:w-auto justify-center disabled:opacity-50"
            data-testid="button-new-session"
          >
            <Plus size={18} /> {createSession.isPending ? "Creating..." : "New Session Room"}
          </button>
        </div>

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
              sessions.map((session) => (
                <GlassCard key={session.id} className="p-6 flex flex-col md:flex-row items-center gap-6" hoverEffect={true}>
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
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
                      className="px-4 py-2.5 bg-white border border-border text-foreground rounded-xl text-sm font-medium hover:bg-secondary/50 transition-colors flex items-center gap-2 cursor-pointer"
                      data-testid={`button-copy-invite-${session.id}`}
                    >
                      {copied === session.inviteCode ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
                      {copied === session.inviteCode ? "Copied!" : session.inviteCode}
                    </button>
                    <Link href={`/playroom/${session.id}`} className="flex-1 md:flex-initial">
                      <button className="w-full px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium shadow-md shadow-accent/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer" data-testid={`button-join-${session.id}`}>
                        Enter <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                </GlassCard>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
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
          </div>
        </div>
      </div>
    </div>
  );
}
