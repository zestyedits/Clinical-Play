import React, { useState } from "react";
import { 
  Users, Palette, Plus, Star, Settings, LifeBuoy, 
  Flame, Copy, Play, Square, Activity, LayoutGrid 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function CoolPrecise() {
  const [activeSessions] = useState([
    {
      id: "1",
      name: "Adolescent DBT Group",
      date: "Today, 3:00 PM",
      code: "XJ9-K2P",
      emoji: "👥",
      status: "waiting",
    },
    {
      id: "2",
      name: "Sarah M. - Individual",
      date: "Today, 4:30 PM",
      code: "M4T-9RL",
      emoji: "👤",
      status: "active",
    }
  ]);

  const tools = [
    { name: "DBT House", emoji: "🏡", desc: "Build emotional foundation", isNew: false, isFav: true },
    { name: "Thought Court", emoji: "⚖️", desc: "Challenge cognitive distortions", isNew: true, isFav: true },
    { name: "Values Compass", emoji: "🧭", desc: "ACT-based values clarification", isNew: false, isFav: false },
    { name: "Inner Council", emoji: "⚔️", desc: "IFS parts mapping", isNew: false, isFav: false },
    { name: "Motivation Garden", emoji: "🌱", desc: "Motivational interviewing", isNew: true, isFav: false },
    { name: "Grounding Grove", emoji: "🌳", desc: "Somatic regulation", isNew: false, isFav: false },
    { name: "Miracle Bridge", emoji: "🌉", desc: "Solution-focused brief therapy", isNew: false, isFav: false },
    { name: "Narrative Quest", emoji: "📖", desc: "Narrative therapy externalization", isNew: false, isFav: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 md:p-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome back, Dr. Chen</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-slate-500 font-medium">Your clinical workspace</span>
              <Badge variant="outline" className="text-xs font-medium border-slate-300 text-slate-600 bg-white shadow-sm">
                Professional Plan
              </Badge>
            </div>
          </div>
          <Button className="bg-slate-800 hover:bg-slate-700 text-white shadow-sm font-medium rounded-md px-6">
            <Plus className="w-4 h-4 mr-2" />
            Start New Session
          </Button>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Active Sessions */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Active Sessions</h2>
                <Badge className="ml-2 bg-slate-200 text-slate-700 hover:bg-slate-200 rounded-sm px-1.5 py-0 text-xs">
                  {activeSessions.length}
                </Badge>
              </div>

              {activeSessions.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {activeSessions.map(session => (
                    <div key={session.id} className="bg-white border border-slate-200 p-4 rounded-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center text-lg grayscale opacity-80">
                          {session.emoji}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 text-base">{session.name}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">{session.date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-xs text-slate-600 mr-2">
                          {session.code}
                          <Copy className="w-3 h-3 ml-2 text-slate-400 cursor-pointer hover:text-slate-700" />
                        </div>
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white flex-1 sm:flex-none shadow-sm rounded-md">
                          Enter
                        </Button>
                        <Button size="icon" variant="outline" className="border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-md shrink-0">
                          <Square className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-md p-8 text-center shadow-sm flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-2xl mb-3 grayscale opacity-70">
                    🏖️
                  </div>
                  <h3 className="font-medium text-slate-900 mb-1">No active sessions</h3>
                  <p className="text-sm text-slate-500 mb-4">Your workspace is clear. Ready to begin?</p>
                  <Button variant="outline" className="border-slate-300 text-slate-700 font-medium rounded-md">
                    Choose a Tool to Begin
                  </Button>
                </div>
              )}
            </section>

            {/* Tool Library */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-slate-400" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Tool Library</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tools.map((tool, i) => (
                  <div key={i} className="group bg-white border border-slate-200 rounded-md p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-center text-xl grayscale-[0.5] group-hover:grayscale-0 transition-all">
                        {tool.emoji}
                      </div>
                      <div className="flex items-center gap-2">
                        {tool.isNew && (
                          <Badge variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-50 text-[10px] uppercase font-bold tracking-wider rounded-sm px-1.5">
                            New
                          </Badge>
                        )}
                        <button className="text-slate-300 hover:text-amber-400 transition-colors">
                          <Star className={cn("w-4 h-4", tool.isFav && "fill-amber-400 text-amber-400")} />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-slate-900 mb-1">{tool.name}</h3>
                    <p className="text-sm text-slate-500 flex-grow leading-relaxed">{tool.desc}</p>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-medium text-slate-600 group-hover:text-teal-600 transition-colors cursor-pointer">
                      <span>Launch Tool</span>
                      <Play className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
          </div>

          {/* Right Column (1/3) - Sidebar */}
          <div className="space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
              <div className="flex items-center gap-4 mb-5">
                <Avatar className="h-12 w-12 rounded-md border border-slate-200">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold rounded-md">JC</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-slate-900">Dr. Julian Chen</h3>
                  <p className="text-xs text-slate-500">julian@clinicalplay.com</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-md" size="sm">
                  <Settings className="w-4 h-4 mr-2 text-slate-400" />
                  Workspace Settings
                </Button>
                <Button variant="outline" className="w-full justify-start text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-md" size="sm">
                  <LifeBuoy className="w-4 h-4 mr-2 text-slate-400" />
                  Clinical Support
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                Monthly Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Total Sessions</p>
                  <p className="text-2xl font-semibold text-slate-900 tracking-tight">124</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Tools Used</p>
                  <p className="text-2xl font-semibold text-slate-900 tracking-tight">8</p>
                </div>
              </div>
            </div>

            {/* Founding Member Promo */}
            <div className="bg-slate-800 border border-slate-900 rounded-md p-5 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-700 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-teal-400" />
                  <h3 className="font-semibold text-sm tracking-wide uppercase text-slate-200">Founding Member</h3>
                </div>
                
                <p className="text-xl font-medium mb-1 tracking-tight text-white">$99 Lifetime Access</p>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">Secure permanent access to all clinical tools and future updates.</p>
                
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-teal-300">82% Claimed</span>
                    <span className="text-slate-400">18 spots left</span>
                  </div>
                  <Progress value={82} className="h-1.5 bg-slate-700 [&>div]:bg-teal-500" />
                </div>
                
                <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white border-none shadow-sm font-medium rounded-md h-9">
                  Claim Founding Spot
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
