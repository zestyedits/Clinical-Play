import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { Plus, Users, Calendar, Video, ArrowRight, MoreHorizontal } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Dashboard() {
  const sessions = [
    { id: 1, client: "Alex M.", time: "10:00 AM", type: "Child Therapy", status: "Active" },
    { id: 2, client: "Sarah J.", time: "2:30 PM", type: "CBT Session", status: "Scheduled" },
    { id: 3, client: "Marcus T.", time: "4:00 PM", type: "Family Systems", status: "Scheduled" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20 pb-24 md:pb-10 pt-24 md:pt-32 px-4 md:px-8">
      <Navbar />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-primary mb-2">Clinician Hub</h1>
            <p className="text-muted-foreground">Welcome back, Dr. Thompson</p>
          </div>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform cursor-pointer w-full md:w-auto justify-center">
            <Plus size={18} /> New Session Room
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Active Sessions */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-medium text-primary flex items-center gap-2">
              <Video size={18} className="text-accent" /> Upcoming Sessions
            </h2>
            
            {sessions.map((session, i) => (
              <GlassCard key={session.id} className="p-6 flex flex-col md:flex-row items-center gap-6" hoverEffect={true}>
                <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary font-serif text-xl">
                  {session.client.charAt(0)}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-serif text-primary">{session.client}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {session.time}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{session.type}</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  {session.status === "Active" ? (
                    <Link href={`/playroom/${session.id}`} className="w-full md:w-auto">
                      <button className="w-full md:w-auto px-6 py-3 bg-accent text-white rounded-xl font-medium shadow-md shadow-accent/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer">
                        Join Room <ArrowRight size={16} />
                      </button>
                    </Link>
                  ) : (
                    <button className="w-full md:w-auto px-6 py-3 bg-white border border-border text-foreground rounded-xl font-medium hover:bg-secondary/50 transition-colors cursor-pointer">
                      Details
                    </button>
                  )}
                </div>
              </GlassCard>
            ))}
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
                     <p className="text-2xl font-serif text-primary">24</p>
                     <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Clients</p>
                   </div>
                 </div>
                 <div className="h-px bg-border/50" />
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                     <Calendar size={20} />
                   </div>
                   <div>
                     <p className="text-2xl font-serif text-primary">12</p>
                     <p className="text-xs text-muted-foreground uppercase tracking-wider">Sessions This Week</p>
                   </div>
                 </div>
               </div>
            </GlassCard>

            <div className="p-6 rounded-3xl bg-primary text-primary-foreground relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-serif text-xl mb-2">Pro Tip</h3>
                <p className="text-primary-foreground/80 text-sm mb-4">Use the "Thought Bridge" tool to visualize cognitive reframing in today's sessions.</p>
                <button className="text-xs font-bold uppercase tracking-widest border-b border-primary-foreground/30 pb-1">Learn More</button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl -mr-10 -mt-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
