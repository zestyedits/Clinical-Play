/**
 * ClinicalPlay Inbox Messages — Seed Dataset
 *
 * Categories: "support" | "announcement" | "tool-request" | "system" | "artifact"
 * To add messages: push to MOCK_MESSAGES array.
 *
 * In production, these come from the messages DB table.
 * This file provides realistic seed data for development.
 */

export type MessageCategory = "support" | "announcement" | "tool-request" | "system" | "artifact";
export type MessagePriority = "normal" | "low" | "high";
export type MessageStatus = "open" | "resolved" | "pending" | "archived";

export interface InboxMessage {
  id: string;
  subject: string;
  body: string;
  category: MessageCategory;
  priority: MessagePriority;
  status: MessageStatus;
  isRead: boolean;
  isPinned: boolean;
  isArchived: boolean;
  fromName: string;
  fromRole: "system" | "admin" | "support" | "user";
  createdAt: string;
  replies?: InboxReply[];
}

export interface InboxReply {
  id: string;
  body: string;
  fromName: string;
  fromRole: "admin" | "support" | "user";
  createdAt: string;
}

export const CATEGORY_CONFIG: Record<MessageCategory, { label: string; color: string; icon: string }> = {
  support: { label: "Support", color: "hsl(var(--primary))", icon: "headphones" },
  announcement: { label: "Announcements", color: "hsl(var(--primary))", icon: "megaphone" },
  "tool-request": { label: "Tool Requests", color: "hsl(var(--accent))", icon: "lightbulb" },
  system: { label: "System", color: "#7B8FA1", icon: "settings" },
  artifact: { label: "Artifacts", color: "#9B59B6", icon: "image" },
};

export const MOCK_MESSAGES: InboxMessage[] = [
  // ── ANNOUNCEMENTS ──
  {
    id: "msg-001",
    subject: "Welcome to ClinicalPlay",
    body: "Thank you for joining the ClinicalPlay community. We built this platform because we believe clinicians deserve tools that are as thoughtful as the work they do.\n\nHere's what's available right now:\n\n• Zen Sandtray — expressive world-building\n• Calm Breathing — synchronized group breathwork\n• Feeling Wheel — three-tier emotional identification\n• Narrative Timeline — life story mapping\n• Values Card Sort — interactive prioritization\n\nEach tool was designed with clinical intention. Explore the Library to learn more about modalities, adaptations, and best practices.\n\nWe're a small team building something meaningful. Your feedback shapes every feature.\n\n— The ClinicalPlay Team",
    category: "announcement",
    priority: "normal",
    status: "open",
    isRead: false,
    isPinned: true,
    isArchived: false,
    fromName: "ClinicalPlay Team",
    fromRole: "admin",
    createdAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "msg-002",
    subject: "Narrative Timeline is now live",
    body: "The Narrative Timeline tool is now available for Pro members.\n\nClients place symbolic 'stones' along a flowing river to map significant life events. Each stone holds a label, description, and color. It's designed for life review, meaning-making, and identifying patterns — without feeling like a worksheet.\n\nBest paired with: Calm Breathing (before), Feeling Wheel (after).\n\nTry it in your next session or take it for a spin in demo mode.",
    category: "announcement",
    priority: "normal",
    status: "open",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "ClinicalPlay Team",
    fromRole: "admin",
    createdAt: "2026-01-22T10:00:00Z",
  },
  {
    id: "msg-003",
    subject: "Values Card Sort — now with audio feedback",
    body: "We've added subtle audio feedback to the Values Card Sort. Each placement makes a soft sound that reinforces the action without being distracting.\n\nSound can be toggled off in Account → Preferences.\n\nSmall details matter when your clients are doing hard work.",
    category: "announcement",
    priority: "low",
    status: "open",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "ClinicalPlay Team",
    fromRole: "admin",
    createdAt: "2026-01-28T14:00:00Z",
  },
  {
    id: "msg-004",
    subject: "February roadmap preview",
    body: "Here's what we're working on this month:\n\n• The DBT House — room-by-room skill mapping (in development)\n• Emotion Thermometer — quick intensity check-ins (design phase)\n• Enhanced session artifacts — exportable summaries\n• Mobile experience improvements\n\nFounding members get early access to all new tools.\n\nAs always, your tool requests directly influence what we build next.",
    category: "announcement",
    priority: "normal",
    status: "open",
    isRead: false,
    isPinned: false,
    isArchived: false,
    fromName: "ClinicalPlay Team",
    fromRole: "admin",
    createdAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "msg-005",
    subject: "Founding member pricing ends soon",
    body: "We're approaching our founding member cap. Once we reach capacity, the $99 lifetime access offer closes permanently.\n\nFounding members receive:\n• Lifetime access to all current and future tools\n• Priority feature requests\n• Founding member badge\n• Our genuine gratitude\n\nIf you've been considering it, now's the time.",
    category: "announcement",
    priority: "high",
    status: "open",
    isRead: false,
    isPinned: false,
    isArchived: false,
    fromName: "ClinicalPlay Team",
    fromRole: "admin",
    createdAt: "2026-02-05T08:00:00Z",
  },

  // ── SUPPORT ──
  {
    id: "msg-006",
    subject: "Re: Issue with invite code not working",
    body: "Thanks for reaching out. We looked into this and found that the invite code was being generated correctly, but the link format wasn't copying the full URL on Safari.\n\nThis has been fixed in today's update. Please try again and let us know if the issue persists.\n\nApologies for the friction — we know seamless client joining is critical for telehealth flow.",
    category: "support",
    priority: "normal",
    status: "resolved",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "Support Team",
    fromRole: "support",
    createdAt: "2026-01-20T15:30:00Z",
    replies: [
      {
        id: "reply-001",
        body: "The invite link is working now. Thank you for the quick fix! My client was able to join without issues.",
        fromName: "You",
        fromRole: "user",
        createdAt: "2026-01-20T16:45:00Z",
      },
      {
        id: "reply-002",
        body: "Great to hear. We've also added a 'copy confirmation' animation so you always know the link was captured. Thanks for flagging this.",
        fromName: "Support Team",
        fromRole: "support",
        createdAt: "2026-01-20T17:00:00Z",
      },
    ],
  },
  {
    id: "msg-007",
    subject: "Re: Can clients see my cursor?",
    body: "Great question. Yes, when both clinician and client are on the Zen Sandtray, each participant can see the other's cursor position in real-time. Cursor labels show display names (or 'Anonymous' in anonymous mode).\n\nIf you'd prefer clients not see your cursor, you can enable Zen Mode, which hides the UI overlay.",
    category: "support",
    priority: "normal",
    status: "resolved",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "Support Team",
    fromRole: "support",
    createdAt: "2026-01-25T11:00:00Z",
  },
  {
    id: "msg-008",
    subject: "Re: Billing question about founding membership",
    body: "The founding membership is a one-time payment of $99 that grants lifetime access to all tools — current and future. There are no recurring charges.\n\nYour payment is processed securely through Stripe. You can view your receipt anytime in Account → Billing.\n\nLet us know if you have any other questions.",
    category: "support",
    priority: "normal",
    status: "resolved",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "Support Team",
    fromRole: "support",
    createdAt: "2026-01-30T09:00:00Z",
  },
  {
    id: "msg-009",
    subject: "Session disconnected mid-way",
    body: "We're sorry about the interruption. We've identified that brief WebSocket disconnections can occur if either participant switches WiFi networks mid-session.\n\nWe've improved the reconnection logic in today's update — the system now automatically reconnects within 3 seconds rather than requiring a page refresh.\n\nIf disconnections continue, please let us know your browser and network setup so we can investigate further.",
    category: "support",
    priority: "high",
    status: "open",
    isRead: false,
    isPinned: false,
    isArchived: false,
    fromName: "Support Team",
    fromRole: "support",
    createdAt: "2026-02-03T14:00:00Z",
  },
  {
    id: "msg-010",
    subject: "Re: Feature request — timer for sessions",
    body: "Thank you for this suggestion. A session timer is on our consideration list. Several clinicians have requested either a visible timer or a gentle notification at the 5-minute mark.\n\nWe want to make sure it doesn't feel clinical or pressuring for clients, so we're exploring 'ambient' time awareness rather than a countdown.\n\nWe'll keep you posted on progress.",
    category: "support",
    priority: "normal",
    status: "pending",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "Support Team",
    fromRole: "support",
    createdAt: "2026-02-06T10:00:00Z",
  },

  // ── TOOL REQUESTS ──
  {
    id: "msg-011",
    subject: "Tool Request: Emotion Charades",
    body: "I'd love to see a tool where clients draw or act out emotions and others guess. Similar to charades but adapted for telehealth. Could work well for group therapy with teens and social skills groups.\n\nModality: Play Therapy, Social Skills\nAge Range: Tweens, Teens\nGoal: Emotional expression and social connection",
    category: "tool-request",
    priority: "normal",
    status: "pending",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "You",
    fromRole: "user",
    createdAt: "2026-01-18T13:00:00Z",
    replies: [
      {
        id: "reply-003",
        body: "This is a wonderful idea. We're adding it to our consideration queue. Group-oriented tools are definitely in our future — this is a creative take on interpersonal skills building. Thank you for the detailed description.",
        fromName: "ClinicalPlay Team",
        fromRole: "admin",
        createdAt: "2026-01-19T09:00:00Z",
      },
    ],
  },
  {
    id: "msg-012",
    subject: "Tool Request: Mindfulness Sound Mixer",
    body: "A tool where clients create their own ambient soundscape by mixing nature sounds, instruments, and textures. Could be used for grounding, session transitions, or building a personalized 'calm space.'\n\nModality: Mindfulness, Somatic\nAge Range: All ages\nGoal: Regulation and personalized grounding",
    category: "tool-request",
    priority: "normal",
    status: "pending",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "You",
    fromRole: "user",
    createdAt: "2026-01-24T15:30:00Z",
  },
  {
    id: "msg-013",
    subject: "Tool Request: Couples Communication Cards",
    body: "Would love a structured communication exercise for couples. Something like: draw a prompt card, each partner responds, then discuss. Prompts could range from light ('What's your favorite memory together?') to deep ('When did you last feel truly heard?').\n\nModality: Attachment, Family Systems\nAge Range: Adults\nGoal: Communication and connection",
    category: "tool-request",
    priority: "normal",
    status: "pending",
    isRead: false,
    isPinned: false,
    isArchived: false,
    fromName: "You",
    fromRole: "user",
    createdAt: "2026-02-02T11:00:00Z",
  },

  // ── SYSTEM ──
  {
    id: "msg-014",
    subject: "Email verified successfully",
    body: "Your email address has been verified. You now have full access to your ClinicalPlay account.\n\nNext steps:\n• Complete your profile (credentials, specialties)\n• Explore the tool library\n• Create your first session or try the demo\n\nWelcome aboard.",
    category: "system",
    priority: "normal",
    status: "resolved",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "System",
    fromRole: "system",
    createdAt: "2026-01-15T09:05:00Z",
  },
  {
    id: "msg-015",
    subject: "Subscription activated: Founding Member",
    body: "Your founding membership is now active. You have lifetime access to all current and future ClinicalPlay tools.\n\nReceipt #INV-2026-0042\nAmount: $99.00 (one-time)\nPayment method: •••• 4242\n\nThank you for believing in what we're building.",
    category: "system",
    priority: "normal",
    status: "resolved",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "System",
    fromRole: "system",
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "msg-016",
    subject: "Session exported: Zen Sandtray — Feb 5",
    body: "Your session snapshot has been exported successfully.\n\nSession: Exploratory Session\nTool: Zen Sandtray\nDate: February 5, 2026\nFormat: PNG (2x resolution)\n\nReminder: Session exports don't contain PHI unless you added identifying labels. Store exports according to your practice's data policies.",
    category: "system",
    priority: "low",
    status: "resolved",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "System",
    fromRole: "system",
    createdAt: "2026-02-05T15:00:00Z",
  },
  {
    id: "msg-017",
    subject: "Weekly activity summary — Feb 3-9",
    body: "Your ClinicalPlay activity this week:\n\n• Sessions created: 3\n• Total session time: ~2.4 hours\n• Tools used: Zen Sandtray, Feeling Wheel, Calm Breathing\n• Most used tool: Zen Sandtray (used in 3 sessions)\n\nClients joined 7 times across your sessions. Peak day: Wednesday.\n\nKeep building. Your clients are engaging.",
    category: "system",
    priority: "low",
    status: "open",
    isRead: false,
    isPinned: false,
    isArchived: false,
    fromName: "System",
    fromRole: "system",
    createdAt: "2026-02-09T06:00:00Z",
  },

  // ── ARTIFACTS ──
  {
    id: "msg-018",
    subject: "Session artifact saved: Feeling Wheel selections",
    body: "Feeling Wheel selections from your session on Feb 7 have been captured.\n\nSelections recorded: 4\nPrimary emotions identified: Joy, Sadness, Fear\nGolden threads traced: 2\n\nYou can view this artifact in your profile's saved artifacts section.",
    category: "artifact",
    priority: "low",
    status: "open",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "System",
    fromRole: "system",
    createdAt: "2026-02-07T16:30:00Z",
  },
  {
    id: "msg-019",
    subject: "Session artifact saved: Narrative Timeline — 8 stones",
    body: "Your Narrative Timeline session from Feb 5 has been saved with 8 event stones.\n\nStones placed: 8\nColors used: Navy, Sage, Gold, Rose\nTimeline span: Past → Present\n\nThis artifact can be revisited in future sessions for continuity.",
    category: "artifact",
    priority: "low",
    status: "open",
    isRead: false,
    isPinned: false,
    isArchived: false,
    fromName: "System",
    fromRole: "system",
    createdAt: "2026-02-05T15:30:00Z",
  },
  {
    id: "msg-020",
    subject: "Session artifact saved: Values Card Sort — complete sort",
    body: "The Values Card Sort from your session on Feb 6 recorded a complete sort.\n\nCards sorted: 24/24\nVery Important: 6 values\nImportant: 10 values\nNot Important: 8 values\n\nTop values identified: Family, Compassion, Honesty, Health, Connection, Creativity.",
    category: "artifact",
    priority: "low",
    status: "open",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "System",
    fromRole: "system",
    createdAt: "2026-02-06T12:00:00Z",
  },

  // ── MORE ANNOUNCEMENTS ──
  {
    id: "msg-021",
    subject: "Clinical integrity: our design philosophy",
    body: "We wanted to share something that guides every decision we make.\n\nClinicalPlay will never:\n• Deliver therapy or act as a chatbot\n• Force protocols or tell you how to practice\n• Gamify suffering\n• Store PHI by default\n\nClinicalPlay will always:\n• Respect your clinical judgment\n• Give you control over every setting\n• Build tools with modality fidelity\n• Treat your clients' experiences with gravity\n\nThis isn't a mission statement. It's a promise.",
    category: "announcement",
    priority: "normal",
    status: "open",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "ClinicalPlay Team",
    fromRole: "admin",
    createdAt: "2026-01-17T08:00:00Z",
  },
  {
    id: "msg-022",
    subject: "New: Zen Mode for the Sandtray",
    body: "Zen Mode is now available in the Sandtray tool. It hides all UI controls, leaving only the canvas.\n\nWhy? Because sometimes the most therapeutic thing is an empty, quiet space. No buttons competing for attention. Just the work.\n\nActivate it from the moderator bar (clinician only). Press Escape to exit.",
    category: "announcement",
    priority: "normal",
    status: "open",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "ClinicalPlay Team",
    fromRole: "admin",
    createdAt: "2026-02-04T09:00:00Z",
  },

  // ── MORE SYSTEM ──
  {
    id: "msg-023",
    subject: "Profile updated successfully",
    body: "Your profile changes have been saved.\n\nUpdated fields: Professional Title, Clinical Specialty, First Name\n\nYour profile is visible to session participants as your display name.",
    category: "system",
    priority: "low",
    status: "resolved",
    isRead: true,
    isPinned: false,
    isArchived: true,
    fromName: "System",
    fromRole: "system",
    createdAt: "2026-01-16T11:00:00Z",
  },
  {
    id: "msg-024",
    subject: "Security notice: new device login",
    body: "A new login to your account was detected.\n\nDevice: Chrome on macOS\nLocation: Portland, OR (approximate)\nTime: February 8, 2026 at 9:14 AM PST\n\nIf this was you, no action is needed. If not, change your password immediately and contact support.",
    category: "system",
    priority: "high",
    status: "open",
    isRead: false,
    isPinned: false,
    isArchived: false,
    fromName: "System",
    fromRole: "system",
    createdAt: "2026-02-08T17:14:00Z",
  },
  {
    id: "msg-025",
    subject: "Maintenance complete",
    body: "Scheduled maintenance has been completed. All services are operating normally.\n\nDowntime duration: 12 minutes\nAffected: WebSocket connections (active sessions)\n\nAny sessions that were active during maintenance should have automatically reconnected. If you experience issues, a page refresh will restore your session.",
    category: "system",
    priority: "normal",
    status: "resolved",
    isRead: true,
    isPinned: false,
    isArchived: false,
    fromName: "System",
    fromRole: "system",
    createdAt: "2026-02-07T03:00:00Z",
  },
];

/**
 * Helper: get unread count
 */
export function getUnreadCount(messages: InboxMessage[]): number {
  return messages.filter(m => !m.isRead && !m.isArchived).length;
}

/**
 * Helper: get messages by category
 */
export function getMessagesByCategory(messages: InboxMessage[], category: MessageCategory): InboxMessage[] {
  return messages.filter(m => m.category === category && !m.isArchived);
}
