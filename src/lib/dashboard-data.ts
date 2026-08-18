import "server-only";

export type GateStatus = "blocked" | "passed" | "running";
export type Severity = "critical" | "high" | "medium" | "low";

export interface Viewer {
  readonly email: string;
  readonly initials: string;
  readonly name: string;
  readonly role: "Owner" | "Member";
}

export interface Organization {
  readonly id: string;
  readonly memberCount: number;
  readonly name: string;
  readonly plan: "Founding team";
  readonly slug: string;
}

export interface ProjectSummary {
  readonly activeContracts: number;
  readonly branch: string;
  readonly coverage: number;
  readonly findingCount: number;
  readonly id: string;
  readonly lastVerified: string;
  readonly name: string;
  readonly repository: string;
  readonly risk: number;
  readonly status: GateStatus;
}

export interface ContractSummary {
  readonly coverage: number;
  readonly id: string;
  readonly owner: string;
  readonly requirements: number;
  readonly status: "approved" | "draft";
  readonly title: string;
  readonly updated: string;
  readonly version: string;
}

export interface VerificationRunSummary {
  readonly commit: string;
  readonly completedAt: string;
  readonly duration: string;
  readonly evidence: number;
  readonly id: string;
  readonly project: string;
  readonly risk: number;
  readonly status: GateStatus;
  readonly title: string;
}

export interface FindingSummary {
  readonly actual: string;
  readonly age: string;
  readonly contract: string;
  readonly expected: string;
  readonly id: string;
  readonly owner: string;
  readonly project: string;
  readonly severity: Severity;
  readonly title: string;
}

export interface MemorySummary {
  readonly id: string;
  readonly lastMatched: string;
  readonly regressions: number;
  readonly severity: Severity;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly title: string;
}

export interface CoverageArea {
  readonly color: "coral" | "indigo" | "mint" | "ochre";
  readonly covered: number;
  readonly evidence: number;
  readonly label: string;
  readonly total: number;
}

export interface ActivityItem {
  readonly detail: string;
  readonly id: string;
  readonly status: "attention" | "complete" | "neutral";
  readonly time: string;
  readonly title: string;
}

export interface DashboardSnapshot {
  readonly activity: readonly ActivityItem[];
  readonly contracts: readonly ContractSummary[];
  readonly coverage: readonly CoverageArea[];
  readonly findings: readonly FindingSummary[];
  readonly memory: readonly MemorySummary[];
  readonly organization: Organization;
  readonly projects: readonly ProjectSummary[];
  readonly runs: readonly VerificationRunSummary[];
  readonly viewer: Viewer;
}

const snapshot: DashboardSnapshot = {
  activity: [
    {
      detail: "INV-001 failed on commit 8f2c1a7",
      id: "activity-1",
      status: "attention",
      time: "8 min ago",
      title: "Invoice access blocked release",
    },
    {
      detail: "SUB-004 now has Vitest and Playwright evidence",
      id: "activity-2",
      status: "complete",
      time: "42 min ago",
      title: "Cancellation coverage restored",
    },
    {
      detail: "MEM-0143 matched authorization.ts",
      id: "activity-3",
      status: "neutral",
      time: "2 hr ago",
      title: "Historical risk recalled",
    },
    {
      detail: "Version 4 approved by Kidus M.",
      id: "activity-4",
      status: "complete",
      time: "Yesterday",
      title: "Subscription contract approved",
    },
  ],
  contracts: [
    {
      coverage: 100,
      id: "invoice-access",
      owner: "Platform",
      requirements: 6,
      status: "approved",
      title: "Invoice access",
      updated: "18 Aug 2026",
      version: "v3",
    },
    {
      coverage: 92,
      id: "subscription-management",
      owner: "Billing",
      requirements: 13,
      status: "approved",
      title: "Subscription management",
      updated: "18 Aug 2026",
      version: "v4",
    },
    {
      coverage: 78,
      id: "workspace-membership",
      owner: "Identity",
      requirements: 9,
      status: "approved",
      title: "Workspace membership",
      updated: "17 Aug 2026",
      version: "v2",
    },
    {
      coverage: 40,
      id: "web-foundation",
      owner: "Web",
      requirements: 5,
      status: "draft",
      title: "Web foundation",
      updated: "16 Aug 2026",
      version: "draft",
    },
  ],
  coverage: [
    { color: "indigo", covered: 11, evidence: 28, label: "Billing", total: 13 },
    { color: "mint", covered: 6, evidence: 19, label: "Authorization", total: 6 },
    { color: "ochre", covered: 7, evidence: 14, label: "Workspace", total: 9 },
    { color: "coral", covered: 2, evidence: 5, label: "Web foundation", total: 5 },
  ],
  findings: [
    {
      actual: "A user received another account's invoice payload.",
      age: "8 min",
      contract: "invoice-access#INV-001",
      expected: "Users can only read invoices owned by their account.",
      id: "FIND-0092",
      owner: "Identity",
      project: "maru-web",
      severity: "critical",
      title: "Invoice ownership check can be bypassed",
    },
    {
      actual: "The webhook handler accepted an unsigned retry.",
      age: "36 min",
      contract: "subscription-management#SUB-INV-001",
      expected: "Billing changes require a verified provider webhook.",
      id: "FIND-0088",
      owner: "Billing",
      project: "maru-web",
      severity: "high",
      title: "Webhook signature missing on retry path",
    },
    {
      actual: "No automated evidence references the role downgrade path.",
      age: "1 day",
      contract: "workspace-membership#TEAM-007",
      expected: "Role downgrades preserve one organization owner.",
      id: "FIND-0071",
      owner: "Platform",
      project: "maru-cli",
      severity: "medium",
      title: "Owner downgrade lacks regression evidence",
    },
  ],
  memory: [
    {
      id: "MEM-0143",
      lastMatched: "8 min ago",
      regressions: 3,
      severity: "critical",
      summary: "Cross-account invoice access caused by a missing server-side ownership check.",
      tags: ["authorization", "idor", "invoice"],
      title: "Invoice ownership bypass",
    },
    {
      id: "MEM-0118",
      lastMatched: "3 days ago",
      regressions: 2,
      severity: "high",
      summary: "Provider retries changed subscription state before signature verification.",
      tags: ["billing", "webhook", "signature"],
      title: "Unsigned webhook retry",
    },
    {
      id: "MEM-0097",
      lastMatched: "12 days ago",
      regressions: 1,
      severity: "medium",
      summary: "The final organization owner could downgrade their own role.",
      tags: ["roles", "organization", "integrity"],
      title: "Last-owner downgrade",
    },
  ],
  organization: {
    id: "org_01j5maru",
    memberCount: 4,
    name: "Maru Labs",
    plan: "Founding team",
    slug: "maru-labs",
  },
  projects: [
    {
      activeContracts: 4,
      branch: "main",
      coverage: 86,
      findingCount: 2,
      id: "project-maru-web",
      lastVerified: "8 min ago",
      name: "maru-web",
      repository: "Kidus-M/MaruCheck-Web",
      risk: 92,
      status: "blocked",
    },
    {
      activeContracts: 9,
      branch: "main",
      coverage: 94,
      findingCount: 1,
      id: "project-maru-cli",
      lastVerified: "42 min ago",
      name: "maru-cli",
      repository: "Kidus-M/MaruCheck",
      risk: 41,
      status: "passed",
    },
    {
      activeContracts: 2,
      branch: "release/canary",
      coverage: 72,
      findingCount: 0,
      id: "project-docs",
      lastVerified: "2 hr ago",
      name: "maru-docs",
      repository: "Kidus-M/MaruCheck-Docs",
      risk: 18,
      status: "running",
    },
  ],
  runs: [
    {
      commit: "8f2c1a7",
      completedAt: "8 min ago",
      duration: "1m 42s",
      evidence: 38,
      id: "RUN-1048",
      project: "maru-web",
      risk: 92,
      status: "blocked",
      title: "fix: enforce invoice ownership",
    },
    {
      commit: "45a1d9e",
      completedAt: "42 min ago",
      duration: "2m 08s",
      evidence: 54,
      id: "RUN-1047",
      project: "maru-cli",
      risk: 41,
      status: "passed",
      title: "feat: add pull-request verification",
    },
    {
      commit: "bc9012d",
      completedAt: "2 hr ago",
      duration: "Running",
      evidence: 12,
      id: "RUN-1046",
      project: "maru-docs",
      risk: 18,
      status: "running",
      title: "docs: expand contract examples",
    },
    {
      commit: "1b073ac",
      completedAt: "Yesterday",
      duration: "1m 18s",
      evidence: 47,
      id: "RUN-1045",
      project: "maru-cli",
      risk: 67,
      status: "passed",
      title: "feat: connect historical memory",
    },
  ],
  viewer: {
    email: "kidus@marucheck.dev",
    initials: "KM",
    name: "Kidus M.",
    role: "Owner",
  },
};

/** Vendor-neutral metadata boundary; replace with an authorized PostgreSQL repository later. */
export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  return Promise.resolve(snapshot);
}
