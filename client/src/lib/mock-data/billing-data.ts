/**
 * ClinicalPlay Billing & Account — Mock Data
 *
 * Mock data for billing history, invoices, org settings, and devices.
 * Replace with real API calls when backend is ready.
 */

export interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  receiptUrl: string | null;
}

export interface PaymentMethod {
  id: string;
  type: "card";
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "clinician";
  joinedAt: string;
  lastActive: string;
  avatarInitial: string;
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "INV-2026-0042",
    date: "2026-01-16T10:00:00Z",
    description: "Founding Member — Lifetime Access",
    amount: "$99.00",
    status: "paid",
    receiptUrl: "#",
  },
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm-001",
    type: "card",
    brand: "Visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2028,
    isDefault: true,
  },
];

export const MOCK_ORG_MEMBERS: OrgMember[] = [
  {
    id: "org-001",
    name: "Dr. Sarah Chen",
    email: "sarah@privatepractice.com",
    role: "owner",
    joinedAt: "2026-01-15T09:00:00Z",
    lastActive: "2026-02-10T08:00:00Z",
    avatarInitial: "S",
  },
  {
    id: "org-002",
    name: "James Okafor, LMSW",
    email: "james@privatepractice.com",
    role: "clinician",
    joinedAt: "2026-01-20T09:00:00Z",
    lastActive: "2026-02-09T14:00:00Z",
    avatarInitial: "J",
  },
  {
    id: "org-003",
    name: "Maria Santos, LMFT",
    email: "maria@privatepractice.com",
    role: "clinician",
    joinedAt: "2026-02-01T09:00:00Z",
    lastActive: "2026-02-08T16:00:00Z",
    avatarInitial: "M",
  },
];

export const MOCK_DEVICES: DeviceSession[] = [
  {
    id: "dev-001",
    deviceName: "MacBook Pro",
    browser: "Chrome 121",
    location: "Portland, OR",
    lastActive: "2026-02-10T08:00:00Z",
    isCurrent: true,
  },
  {
    id: "dev-002",
    deviceName: "iPhone 15",
    browser: "Safari",
    location: "Portland, OR",
    lastActive: "2026-02-09T18:30:00Z",
    isCurrent: false,
  },
  {
    id: "dev-003",
    deviceName: "iPad Air",
    browser: "Safari",
    location: "Portland, OR",
    lastActive: "2026-02-04T09:00:00Z",
    isCurrent: false,
  },
];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ["Create sessions", "Manage tools", "Invite members", "Manage billing", "View all sessions", "Remove members"],
  admin: ["Create sessions", "Manage tools", "Invite members", "View all sessions"],
  clinician: ["Create sessions", "Use tools", "View own sessions"],
};
