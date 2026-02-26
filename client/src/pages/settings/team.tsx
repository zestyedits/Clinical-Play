import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, ChevronRight, Clock, Zap,
  Smartphone, Monitor, Tablet, Mail
} from "lucide-react";
import {
  MOCK_ORG_MEMBERS, ROLE_PERMISSIONS
} from "@/lib/mock-data/billing-data";
import { SettingsLayout } from "./settings-layout";

const labelClass = "text-xs font-semibold text-foreground/60 uppercase tracking-[0.15em] block mb-2";

function RoleBadge({ role }: { role: "owner" | "admin" | "clinician" }) {
  const styles = {
    owner: "bg-accent/10 text-accent border-accent/20",
    admin: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    clinician: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${styles[role]}`}>
      {role}
    </span>
  );
}

export default function TeamSettings() {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "clinician">("clinician");
  const [showInvite, setShowInvite] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const handleInvite = () => {
    if (!inviteEmail.includes("@")) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    toast({ title: "Invitation sent", description: `Invite sent to ${inviteEmail} as ${inviteRole}.` });
    setInviteEmail("");
    setShowInvite(false);
  };

  return (
    <SettingsLayout title="Team" subtitle="Organization members & invitations" icon={Users} iconColor="bg-gradient-to-br from-blue-500/15 to-blue-500/5 text-blue-600">
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center">
              <Users size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-foreground">Team Members</h2>
              <p className="text-xs text-muted-foreground">{MOCK_ORG_MEMBERS.length} members</p>
            </div>
          </div>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-accent hover:bg-accent/10 transition-all cursor-pointer active:scale-95 border border-accent/20"
            data-testid="button-invite-member"
          >
            <UserPlus size={14} /> Invite
          </button>
        </div>

        <AnimatePresence>
          {showInvite && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/15 mb-4 space-y-3">
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@practice.com" className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border border-border/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-muted-foreground/40" data-testid="input-invite-email" />
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <div className="flex gap-2">
                    {(["clinician", "admin"] as const).map(role => (
                      <button
                        key={role}
                        onClick={() => setInviteRole(role)}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer capitalize ${
                          inviteRole === role
                            ? "bg-accent/15 text-accent border border-accent/30"
                            : "bg-secondary/20 text-muted-foreground border border-border/30"
                        }`}
                        data-testid={`button-role-${role}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleInvite} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium bg-primary text-primary-foreground cursor-pointer active:scale-95 transition-all" data-testid="button-send-invite">
                    <Mail size={12} className="inline mr-1" /> Send Invitation
                  </button>
                  <button onClick={() => setShowInvite(false)} className="px-4 py-2.5 rounded-xl text-xs font-medium text-muted-foreground bg-secondary/30 border border-border/30 cursor-pointer active:scale-95 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {MOCK_ORG_MEMBERS.map((member, i) => (
            <motion.div key={member.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <button
                onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
                className="w-full text-left p-3 rounded-xl bg-secondary/10 border border-border/20 hover:bg-secondary/25 transition-all cursor-pointer group"
                data-testid={`card-member-${member.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-sm font-serif font-bold text-foreground">{member.avatarInitial}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{member.name}</span>
                      <RoleBadge role={member.role} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <motion.div animate={{ rotate: expandedMember === member.id ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight size={14} className="text-muted-foreground/40" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {expandedMember === member.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-3 py-2 ml-12 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock size={11} /> Joined {new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap size={11} /> Last active {new Date(member.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Permissions</p>
                        <div className="flex flex-wrap gap-1">
                          {ROLE_PERMISSIONS[member.role]?.map(perm => (
                            <span key={perm} className="px-2 py-0.5 rounded-full text-[10px] bg-primary/5 text-primary/60">{perm}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </SettingsLayout>
  );
}
