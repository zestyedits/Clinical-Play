import { motion } from "framer-motion";
import { Cookie, Shield, Settings, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function CookiePolicy() {
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
              <Cookie size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-primary" data-testid="text-cookies-title">Cookie Policy</h1>
              <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-md rounded-3xl border border-border/30 p-8 md:p-12 space-y-10">
            <div className="p-5 rounded-2xl bg-accent/5 border border-accent/20">
              <p className="text-sm text-primary font-medium leading-relaxed">
                ClinicalPlay uses minimal cookies strictly necessary for platform functionality. We do not use cookies for advertising, tracking, or analytics purposes.
              </p>
            </div>

            <Section
              icon={Shield}
              title="Essential Cookies Only"
              content={[
                "ClinicalPlay uses only essential cookies required for the platform to function correctly.",
                "We use a session cookie to maintain your authenticated state after sign-in. This cookie is encrypted and expires when you sign out or after your session ends.",
                "No third-party advertising, analytics, or tracking cookies are placed on your device.",
                "We do not participate in any cross-site tracking or cookie-based profiling.",
              ]}
            />

            <Section
              icon={Settings}
              title="What Our Cookies Do"
              content={[
                "Authentication Session Cookie: Maintains your sign-in state so you don't have to log in on every page. This is a strictly necessary cookie with no opt-out, as it is required for the platform to function.",
                "WebSocket Connection: Temporary connection identifiers are used during active therapy sessions to enable real-time collaboration. These are not stored as cookies and exist only during the active session.",
                "No preference or personalization cookies are used. Your tool and session settings are stored server-side.",
              ]}
            />

            <Section
              icon={Trash2}
              title="Managing Cookies"
              content={[
                "Since ClinicalPlay uses only essential cookies, there are no optional cookies to manage or opt out of.",
                "You can clear your browser cookies at any time through your browser settings. This will sign you out of ClinicalPlay.",
                "Blocking cookies entirely may prevent you from using ClinicalPlay, as the authentication cookie is required for clinician access.",
              ]}
            />

            <div className="border-t border-border/30 pt-8">
              <h3 className="font-serif text-lg text-primary mb-3">Contact</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                If you have questions about our use of cookies, please review our Privacy Policy or contact us.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="text-sm text-accent hover:underline no-underline" data-testid="link-privacy-from-cookies">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-accent hover:underline no-underline" data-testid="link-terms-from-cookies">
                  Terms of Service
                </Link>
              </div>
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary no-underline" data-testid="link-home-from-cookies">
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
