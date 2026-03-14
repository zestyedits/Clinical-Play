import React from "react";
import {
  Users,
  Palette,
  Settings,
  HelpCircle,
  Flame,
  ArrowRight,
  Star,
  Plus,
  Play,
  Copy,
  LogOut,
  Activity,
  Layers,
} from "lucide-react";

export function WarmGrounded() {
  const [activeTab, setActiveTab] = React.useState("all");

  const activeSessions = [
    {
      id: "ses_1",
      patient: "Emma W.",
      tool: "DBT House",
      emoji: "🏡",
      date: "Today, 2:00 PM",
      inviteCode: "EMW-842",
    },
    {
      id: "ses_2",
      patient: "Michael T.",
      tool: "Thought Court",
      emoji: "⚖️",
      date: "Today, 4:30 PM",
      inviteCode: "MCT-193",
    },
  ];

  const tools = [
    {
      name: "DBT House",
      emoji: "🏡",
      desc: "Build a foundation of dialectical behavior therapy skills.",
      fav: true,
    },
    {
      name: "Thought Court",
      emoji: "⚖️",
      desc: "Put cognitive distortions on trial with CBT principles.",
      fav: true,
    },
    {
      name: "Values Compass",
      emoji: "🧭",
      desc: "Navigate life choices aligned with core ACT values.",
      fav: false,
    },
    {
      name: "Inner Council",
      emoji: "⚔️",
      desc: "Meet and harmonize different IFS parts.",
      fav: false,
    },
    {
      name: "Motivation Garden",
      emoji: "🌱",
      desc: "Cultivate change with Motivational Interviewing.",
      fav: true,
    },
    {
      name: "Grounding Grove",
      emoji: "🌳",
      desc: "Somatic exercises to return to the present moment.",
      fav: false,
    },
    {
      name: "Miracle Bridge",
      emoji: "🌉",
      desc: "Cross over to a preferred future using SFBT.",
      fav: false,
    },
    {
      name: "Narrative Quest",
      emoji: "📖",
      desc: "Rewrite limiting life stories into empowering tales.",
      fav: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3C31] p-6 md:p-10 font-sans selection:bg-[#E8A365] selection:text-white relative">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}} />
      
      {/* Subtle background texture gradient */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#C67B3C 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-[#E6D5C3] pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#3A2A1F] mb-3">
              Welcome back, Sarah
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-[#7A6451] text-lg font-medium">Your clinical workspace</span>
              <span className="px-3 py-1 bg-[#F2E3D5] text-[#8C5A35] text-xs font-bold rounded-full tracking-wide uppercase">
                Premium Plan
              </span>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-[#C67B3C] hover:bg-[#A8642D] text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md shadow-[#C67B3C]/20">
            <Plus className="w-5 h-5" />
            Start New Session
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left 2/3) */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Active Sessions */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#F2E3D5] rounded-lg text-[#8C5A35]">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-serif text-[#3A2A1F]">Active Sessions</h2>
                <span className="ml-2 bg-[#E6D5C3] text-[#5C4532] px-2.5 py-0.5 rounded-md text-sm font-semibold">
                  2
                </span>
              </div>

              <div className="grid gap-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="bg-white border border-[#E6D5C3] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm shadow-[#E6D5C3]/30 transition-transform hover:-translate-y-0.5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#FDFBF7] border border-[#E6D5C3] rounded-xl flex items-center justify-center text-3xl shadow-inner">
                        {session.emoji}
                      </div>
                      <div>
                        <h3 className="font-serif text-xl text-[#3A2A1F] mb-1">{session.patient}</h3>
                        <p className="text-[#7A6451] text-sm flex items-center gap-2">
                          <span className="font-medium text-[#8C5A35]">{session.tool}</span>
                          <span>•</span>
                          {session.date}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 bg-[#FDFBF7] border border-[#E6D5C3] text-[#5C4532] px-3 py-2 rounded-lg text-sm font-mono hover:bg-[#F2E3D5] transition-colors">
                        {session.inviteCode}
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button className="flex items-center gap-2 bg-[#3A2A1F] hover:bg-[#2A1F16] text-[#FDFBF7] px-5 py-2 rounded-lg font-medium transition-colors">
                        <Play className="w-4 h-4 fill-current" />
                        Enter
                      </button>
                      <button className="p-2 text-[#A89888] hover:text-[#C65D3C] hover:bg-[#FDFBF7] rounded-lg transition-colors">
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tool Library */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F2E3D5] rounded-lg text-[#8C5A35]">
                    <Palette className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif text-[#3A2A1F]">All Tools</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {tools.map((tool, idx) => (
                  <div key={idx} className="bg-white border border-[#E6D5C3] rounded-2xl p-6 shadow-sm shadow-[#E6D5C3]/30 hover:shadow-md hover:border-[#D4BCA3] transition-all group flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-[#FDFBF7] border border-[#E6D5C3] rounded-xl flex items-center justify-center text-2xl shadow-inner">
                        {tool.emoji}
                      </div>
                      <button className={\`p-2 rounded-full transition-colors \${tool.fav ? 'text-[#C67B3C] bg-[#FDFBF7]' : 'text-[#D4BCA3] hover:text-[#C67B3C] hover:bg-[#FDFBF7]'}\`}>
                        <Star className={\`w-5 h-5 \${tool.fav ? 'fill-current' : ''}\`} />
                      </button>
                    </div>
                    <h3 className="font-serif text-xl text-[#3A2A1F] mb-2">{tool.name}</h3>
                    <p className="text-[#7A6451] text-sm leading-relaxed mb-6 flex-grow">{tool.desc}</p>
                    <button className="w-full py-2.5 px-4 bg-[#FDFBF7] border border-[#E6D5C3] text-[#5C4532] rounded-xl font-medium flex items-center justify-center gap-2 group-hover:bg-[#F2E3D5] group-hover:border-[#D4BCA3] transition-colors">
                      Launch
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar (Right 1/3) */}
          <div className="space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white border border-[#E6D5C3] rounded-2xl p-6 shadow-sm shadow-[#E6D5C3]/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#C67B3C] text-white flex items-center justify-center text-2xl font-serif shadow-md shadow-[#C67B3C]/20">
                  SJ
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#3A2A1F]">Sarah Jenkins</h3>
                  <p className="text-[#7A6451] text-sm">sarah@clinicalplay.com</p>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#FDFBF7] text-[#5C4532] transition-colors font-medium">
                  <Settings className="w-5 h-5 text-[#8C5A35]" />
                  Settings & Profile
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#FDFBF7] text-[#5C4532] transition-colors font-medium">
                  <HelpCircle className="w-5 h-5 text-[#8C5A35]" />
                  Help & Support
                </button>
              </div>
            </div>

            {/* Founding Member Promo */}
            <div className="bg-gradient-to-br from-[#3A2A1F] to-[#2A1F16] rounded-2xl p-6 shadow-lg shadow-[#3A2A1F]/20 text-[#FDFBF7] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Flame className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-5 h-5 text-[#E8A365]" />
                  <span className="text-[#E8A365] font-bold tracking-wide text-sm uppercase">Founding Member</span>
                </div>
                <h3 className="font-serif text-2xl mb-2">$99 Lifetime Access</h3>
                <p className="text-[#D4BCA3] text-sm mb-5 leading-relaxed">
                  Lock in early access pricing forever. Limited to our first 500 clinicians.
                </p>
                
                <div className="mb-5">
                  <div className="flex justify-between text-xs font-medium text-[#D4BCA3] mb-2">
                    <span>82% Claimed</span>
                    <span>89 spots left</span>
                  </div>
                  <div className="h-2 w-full bg-[#1A130C] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#C67B3C] to-[#E8A365] w-[82%] rounded-full"></div>
                  </div>
                </div>

                <button className="w-full py-3 px-4 bg-gradient-to-r from-[#C67B3C] to-[#E8A365] hover:from-[#B56A2B] hover:to-[#D79254] text-white rounded-xl font-bold shadow-md transition-all">
                  Claim Founding Spot
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white border border-[#E6D5C3] rounded-2xl p-6 shadow-sm shadow-[#E6D5C3]/30">
              <h3 className="font-serif text-lg text-[#3A2A1F] mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#FDFBF7] rounded-xl border border-[#E6D5C3]">
                  <div className="flex items-center gap-2 text-[#7A6451] mb-2">
                    <Layers className="w-4 h-4" />
                    <span className="text-sm font-medium">Total</span>
                  </div>
                  <div className="text-2xl font-serif text-[#3A2A1F]">142</div>
                </div>
                <div className="p-4 bg-[#FDFBF7] rounded-xl border border-[#E6D5C3]">
                  <div className="flex items-center gap-2 text-[#8C5A35] mb-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                  <div className="text-2xl font-serif text-[#3A2A1F]">12</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
