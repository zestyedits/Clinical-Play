import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import type { TherapySession } from "@shared/schema";

export default function JoinSession() {
  const { code } = useParams();
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "found" | "error">("loading");
  const [session, setSession] = useState<TherapySession | null>(null);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/therapy-sessions/invite/${code}`)
      .then(r => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(s => {
        setSession(s);
        setStatus("found");
      })
      .catch(() => setStatus("error"));
  }, [code]);

  const joinRoom = () => {
    if (session) {
      navigate(`/playroom/${session.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20 flex items-center justify-center px-6 pt-24 pb-12">
      <Navbar />
      <motion.div
        className="max-w-md w-full bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl shadow-lg p-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {status === "loading" && (
          <>
            <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
              <span className="text-2xl">🔗</span>
            </div>
            <h2 className="font-serif text-2xl text-primary mb-2">Joining Session...</h2>
            <p className="text-muted-foreground">Looking up invite code <strong className="font-mono">{code}</strong></p>
          </>
        )}
        {status === "found" && session && (
          <>
            <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-[#2E8B57]/10 flex items-center justify-center">
              <span className="text-2xl text-[#2E8B57]">✓</span>
            </div>
            <h2 className="font-serif text-2xl text-primary mb-2">{session.name}</h2>
            <p className="text-muted-foreground mb-6">You've been invited to a therapy session</p>
            <button
              onClick={joinRoom}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#236B43] text-white font-medium text-lg shadow-lg shadow-[#2E8B57]/20 hover:shadow-xl hover:shadow-[#2E8B57]/30 border border-[#D4AF37]/30 btn-luxury cursor-pointer flex items-center justify-center gap-2"
              data-testid="button-join-session"
            >
              Enter Session Room
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-2xl">✕</span>
            </div>
            <h2 className="font-serif text-2xl text-primary mb-2">Invalid Invite</h2>
            <p className="text-muted-foreground mb-6">This invite code doesn't match any active session.</p>
            <button
              onClick={() => navigate("/")}
              className="w-full py-4 rounded-xl bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-all cursor-pointer"
            >
              Go Home
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
