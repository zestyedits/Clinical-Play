import { motion } from "framer-motion";
import { Shield, Eye, Trash2, Lock, ServerOff, FileText } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20 pb-24 md:pb-10">
      <div className="max-w-3xl mx-auto px-6 pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-primary" data-testid="text-privacy-title">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-white/30 p-8 md:p-12 space-y-10">
            <div className="p-5 rounded-2xl bg-accent/5 border border-accent/20">
              <p className="text-sm text-primary font-medium leading-relaxed">
                ClinicalPlay is designed with a "Privacy-First, No-PHI" architecture. We do not collect, store, or process Protected Health Information (PHI). Our platform is built to be ephemeral — session data exists only during active use.
              </p>
            </div>

            <Section
              icon={Eye}
              title="What We Collect"
              content={[
                "Clinician account information (name, email, professional title) for authentication purposes only.",
                "Session metadata (session name, invite codes, creation timestamps) to facilitate room management.",
                "No client data is ever collected. Clients join sessions anonymously via invite codes with zero personal information required.",
                "Canvas interactions (emoji placements, positions) are stored temporarily during active sessions to enable real-time collaboration.",
              ]}
            />

            <Section
              icon={ServerOff}
              title="No PHI Architecture"
              content={[
                "ClinicalPlay does not function as an Electronic Health Record (EHR) system.",
                "No clinical notes, diagnoses, treatment plans, or patient identifiers are stored on our servers.",
                "Session content (sandtray arrangements, breathing exercises) is not recorded, transcribed, or analyzed.",
                "We do not use session data for machine learning, analytics, or any secondary purpose.",
              ]}
            />

            <Section
              icon={Trash2}
              title="Ephemeral Sessions"
              content={[
                "Session canvas data is designed to be temporary. Clinicians may export a screenshot for their own EHR records, but ClinicalPlay does not retain this data.",
                "When a session room is no longer active, the associated canvas items can be cleared by the clinician.",
                "We do not maintain session recordings, chat logs, or interaction histories.",
              ]}
            />

            <Section
              icon={Lock}
              title="Security Measures"
              content={[
                "All data in transit is encrypted via TLS/SSL (256-bit encryption).",
                "Authentication is handled via industry-standard OAuth providers (Google, GitHub, Apple) through Replit's secure authentication layer.",
                "Session invite codes are randomly generated 6-character alphanumeric strings, providing access control without requiring client accounts.",
                "WebSocket connections are room-scoped — participants only receive data from their own session.",
              ]}
            />

            <Section
              icon={FileText}
              title="Third-Party Services"
              content={[
                "Authentication: Processed through Replit's secure OAuth integration. We do not store passwords.",
                "Hosting: Deployed on Replit's infrastructure with enterprise-grade security.",
                "We do not use third-party analytics, advertising trackers, or data brokers.",
                "No cookies are used for tracking. Session cookies are used solely for authentication state management.",
              ]}
            />

            <div className="border-t border-border/30 pt-8">
              <h3 className="font-serif text-lg text-primary mb-3">Your Rights</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Clinicians may request deletion of their account and all associated session metadata at any time. Since no client data is stored, there is no client data to delete. For questions or requests, contact our privacy team.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Link href="/terms" className="text-sm text-accent hover:underline no-underline" data-testid="link-terms-from-privacy">
                Terms of Service
              </Link>
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary no-underline" data-testid="link-home-from-privacy">
                Back to Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, content }: { icon: React.ElementType; title: string; content: string[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className="text-accent" />
        <h3 className="font-serif text-lg text-primary">{title}</h3>
      </div>
      <ul className="space-y-3">
        {content.map((item, i) => (
          <li key={i} className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-accent/20">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
