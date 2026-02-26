import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface FAQItem {
  question: string;
  answer: string;
}

const faqSections: { title: string; items: FAQItem[] }[] = [
  {
    title: "Getting Started",
    items: [
      {
        question: "What is ClinicalPlay?",
        answer: "ClinicalPlay is a telehealth platform built for professionals who work directly with clients — therapists, psychologists, psychiatrists, SLPs, RBTs, BCBAs, NPs, counselors, social workers, and more. It provides interactive, real-time tools within a shared virtual Playroom session. New tools are added one at a time with clinical depth as the priority.",
      },
      {
        question: "Who is ClinicalPlay designed for?",
        answer: "ClinicalPlay is designed for any professional who conducts sessions with clients and wants to bring interactive, engaging tools into their telehealth practice. Whether you're a psychologist, speech-language pathologist, behavior technician, nurse practitioner, or counselor — if you work with people, ClinicalPlay is built for you. Clients join anonymously via a simple invite code — no accounts or downloads required.",
      },
      {
        question: "How do clients join a session?",
        answer: "Clients receive a 6-character invite code from their provider. They visit the join link, enter a display name, and are instantly connected to the live Playroom. No sign-up, no app downloads, no personal information required.",
      },
      {
        question: "Do I need to install any software?",
        answer: "No. ClinicalPlay runs entirely in the browser. Providers sign in to their dashboard, and clients join via a link. It works on desktops, tablets, and mobile devices.",
      },
    ],
  },
  {
    title: "Tools & Features",
    items: [
      {
        question: "What tools are available?",
        answer: "ClinicalPlay currently features the Volume Mixer — a physics-based mixing board where clients can externalize internal experiences as audio faders. It's useful across many disciplines, from parts work in therapy to self-regulation exercises in speech or behavioral sessions. New tools are being developed one at a time to ensure quality. All tools work in real-time between provider and client.",
      },
      {
        question: "How does the Volume Mixer work?",
        answer: "The Volume Mixer uses a mixing-board metaphor where clients create channels for different internal experiences, thoughts, or feelings and adjust their intensity with physics-based faders. It supports mute, solo, and boost controls with optional audio feedback. All actions sync in real-time across all connected participants.",
      },
      {
        question: "Can I use multiple tools in one session?",
        answer: "Yes. The Playroom has a Tool Selector that allows the provider to switch between available tools during a live session. Switching tools is instant and synced to all participants in real-time. New tools are being added regularly.",
      },
      {
        question: "What are Clinical Insights?",
        answer: "Clinical Insights is a private panel visible only to the provider. It provides contextual prompts, reflection questions, and professional guidance based on which tool is currently active. Clients never see this panel.",
      },
    ],
  },
  {
    title: "Privacy & Security",
    items: [
      {
        question: "Is ClinicalPlay HIPAA compliant?",
        answer: "ClinicalPlay uses a Privacy-First, No-PHI architecture. The platform is designed so that no Protected Health Information (PHI) is ever stored. Clients join anonymously, sessions use random invite codes, and no clinical notes or identifying data are retained. This architecture minimizes HIPAA exposure by design.",
      },
      {
        question: "What data does ClinicalPlay store?",
        answer: "ClinicalPlay stores provider account information (email, name) and session metadata (session names, tool states). Client interactions within sessions are stored only for the duration of the session and are tied to anonymous display names — never to real identities.",
      },
      {
        question: "Can clients see the provider's private notes?",
        answer: "No. The Clinical Insights panel is private to the provider and is never visible to or shared with clients. It exists solely to support the provider's professional process.",
      },
    ],
  },
  {
    title: "Billing & Plans",
    items: [
      {
        question: "How much does ClinicalPlay cost?",
        answer: "ClinicalPlay offers three plans: Community at $7/month, Annual at $67/year (save over 20%), and a limited Founding Member tier at $99 one-time for lifetime access. All plans include the full tool suite, unlimited sessions, and real-time collaboration.",
      },
      {
        question: "What is the Founding Member plan?",
        answer: "The Founding Member plan is a limited, one-time $99 payment that grants lifetime access to ClinicalPlay — including all current tools, future tools, and platform updates. Only a limited number of founding slots are available, and once they're gone, they're gone.",
      },
      {
        question: "Can I cancel my subscription?",
        answer: "Yes. Monthly and Annual subscriptions can be cancelled at any time through the billing portal in your dashboard. Your access continues until the end of your current billing period. Founding Member access never expires.",
      },
      {
        question: "Is there a free trial?",
        answer: "ClinicalPlay does not currently offer a free trial, but the Community plan at $7/month is designed to be an accessible entry point. You can cancel at any time with no long-term commitment.",
      },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border/30 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-1 text-left cursor-pointer group active:scale-[0.99] transition-transform"
        data-testid={`button-faq-${item.question.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`}
      >
        <span className="text-sm md:text-base font-medium text-primary pr-4 group-hover:text-accent transition-colors">
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={18} className="text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatedAnswer isOpen={isOpen} answer={item.answer} />
    </div>
  );
}

function AnimatedAnswer({ isOpen, answer }: { isOpen: boolean; answer: string }) {
  return (
    <motion.div
      initial={false}
      animate={{
        height: isOpen ? "auto" : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <p className="text-sm text-muted-foreground leading-relaxed pb-5 px-1">
        {answer}
      </p>
    </motion.div>
  );
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20 pb-24 md:pb-10 pt-28 md:pt-36 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
            <HelpCircle size={28} className="text-accent" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-primary mb-3" data-testid="text-faq-title">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about ClinicalPlay.
          </p>
        </motion.div>

        <div className="space-y-8">
          {faqSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
            >
              <h2 className="text-lg font-serif text-primary mb-4 flex items-center gap-2">
                {section.title}
              </h2>
              <GlassCard className="p-2 md:p-4" hoverEffect={false}>
                {section.items.map((item, itemIndex) => {
                  const key = `${sectionIndex}-${itemIndex}`;
                  return (
                    <AccordionItem
                      key={key}
                      item={item}
                      isOpen={!!openItems[key]}
                      onToggle={() => toggleItem(key)}
                    />
                  );
                })}
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 btn-warm no-underline"
            data-testid="link-faq-contact"
          >
            Get in Touch
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
