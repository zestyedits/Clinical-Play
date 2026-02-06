import { Navbar } from "@/components/layout/navbar";
import { motion } from "framer-motion";
import { Scale, Users, FileCheck, AlertTriangle, CreditCard, Gavel, Crown } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20 pb-24 md:pb-10">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Scale size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-primary" data-testid="text-terms-title">Terms of Service</h1>
              <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-white/30 p-8 md:p-12 space-y-10">
            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-sm text-primary font-medium leading-relaxed">
                ClinicalPlay is a therapeutic engagement platform designed for licensed mental health professionals. By using this service, you agree to the following terms.
              </p>
            </div>

            <Section
              icon={Users}
              title="Intended Use"
              content={[
                "ClinicalPlay is designed exclusively for licensed mental health professionals (LCSWs, LPCs, psychologists, psychiatrists, and equivalent credentials) to use as a supplementary engagement tool during telehealth sessions.",
                "The platform provides interactive therapeutic tools (sandtray, breathing exercises) to enhance clinical sessions. It is not a diagnostic tool, EHR system, or clinical decision-support system.",
                "Clinicians are solely responsible for all clinical decisions, treatment planning, and therapeutic interventions. ClinicalPlay is a tool — not a therapist.",
              ]}
            />

            <Section
              icon={FileCheck}
              title="Clinician Responsibilities"
              content={[
                "You must hold a valid, active license in your jurisdiction to use ClinicalPlay for clinical purposes.",
                "You are responsible for obtaining informed consent from your clients before using ClinicalPlay in a session, in accordance with your professional ethical guidelines.",
                "You are responsible for compliance with HIPAA, state regulations, and your licensing board's telehealth requirements.",
                "You acknowledge that ClinicalPlay's 'No-PHI' architecture means no clinical records are stored on our platform. You must maintain your own session documentation in your EHR system.",
              ]}
            />

            <Section
              icon={AlertTriangle}
              title="Limitations of Liability"
              content={[
                "ClinicalPlay provides tools 'as-is' without warranties of any kind, express or implied, regarding their therapeutic efficacy.",
                "We are not liable for clinical outcomes, therapeutic decisions, or any harm arising from the use of our platform's tools in clinical practice.",
                "Internet connectivity, browser compatibility, and WebSocket reliability may affect real-time collaboration. ClinicalPlay is not responsible for interruptions due to network conditions.",
                "Session data (canvas items, positions) exists temporarily during active sessions. We are not responsible for data loss due to disconnections or browser closures.",
              ]}
            />

            <Section
              icon={CreditCard}
              title="Subscription & Billing"
              content={[
                "ClinicalPlay offers a free tier with limited access. Full access requires an active subscription (Community at $7/month, or Annual at $67/year) or a one-time Founding Member purchase ($99).",
                "Community and Annual subscriptions may be cancelled at any time. Upon cancellation, access continues until the end of the current billing period.",
                "Annual subscriptions are billed once per year. Community subscriptions are billed monthly.",
                "All fees are non-refundable except as required by applicable law.",
                "ClinicalPlay reserves the right to change subscription pricing at any time. Existing subscribers will be notified at least 30 days before any price change takes effect on their account.",
              ]}
            />

            <div className="p-6 rounded-2xl bg-primary/[0.03] border border-primary/15">
              <div className="flex items-center gap-2 mb-4">
                <Crown size={18} className="text-accent" />
                <h3 className="font-serif text-lg text-primary">Founding Member: Lifetime Access Terms</h3>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The "Founding Member" tier grants the purchasing clinician a non-transferable, perpetual license to access all current and future clinical tools within the ClinicalPlay.app platform.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For the purposes of this agreement, <span className="font-medium text-primary">"Lifetime Access"</span> refers to the operational lifespan of the ClinicalPlay.app platform. This license remains active as long as the platform is commercially available and maintained by the developer.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Founding Members are exempt from any future subscription price increases and will never be required to pay a recurring fee. This license is non-transferable — it is bound to the purchasing clinician's account and cannot be sold, gifted, or reassigned.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  In the event that ClinicalPlay is acquired, merged, or discontinued, founding members will receive a minimum of 12 months' notice prior to any change affecting their access.
                </p>
              </div>
            </div>

            <Section
              icon={Gavel}
              title="Intellectual Property"
              content={[
                "All content, design, code, and therapeutic tool frameworks on ClinicalPlay are the intellectual property of ClinicalPlay.",
                "Clinicians retain ownership of any clinical observations, notes, or screenshots they export from the platform for their own records.",
                "You may not reproduce, distribute, or create derivative works based on ClinicalPlay's tools, design, or methodology without written permission.",
              ]}
            />

            <div className="border-t border-border/30 pt-8">
              <h3 className="font-serif text-lg text-primary mb-3">Account Termination</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                We reserve the right to suspend or terminate accounts that violate these terms, engage in abusive behavior, or use the platform for purposes other than its intended clinical use. You may delete your account at any time by contacting our support team.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Link href="/privacy" className="text-sm text-accent hover:underline no-underline" data-testid="link-privacy-from-terms">
                Privacy Policy
              </Link>
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary no-underline" data-testid="link-home-from-terms">
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
