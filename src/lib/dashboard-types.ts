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

export interface OrganizationOption {
  readonly id: string;
  readonly name: string;
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
  readonly slug: string;
  readonly status: GateStatus;
}

export interface ContractSummary {
  readonly coverage: number;
  readonly id: string;
  readonly intent: string;
  readonly owner: string;
  readonly projectId: string | null;
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
  readonly gateReasons: readonly string[];
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
  readonly evidence: readonly string[];
  readonly expected: string;
  readonly id: string;
  readonly occurrences: number;
  readonly owner: string;
  readonly project: string;
  readonly reproduction: string;
  readonly severity: Severity;
  readonly status: string;
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
