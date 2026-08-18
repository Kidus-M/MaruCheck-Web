import type { IconName } from "@/components/icon";

export interface NavigationItem {
  readonly href: string;
  readonly icon: IconName;
  readonly label: string;
}

export const navigationGroups: readonly {
  readonly label: string;
  readonly items: readonly NavigationItem[];
}[] = [
  {
    label: "Workspace",
    items: [
      { href: "/", icon: "overview", label: "Overview" },
      { href: "/projects", icon: "projects", label: "Projects" },
    ],
  },
  {
    label: "Proof",
    items: [
      { href: "/contracts", icon: "contracts", label: "Contracts" },
      { href: "/runs", icon: "runs", label: "Runs" },
      { href: "/findings", icon: "findings", label: "Findings" },
      { href: "/coverage", icon: "coverage", label: "Coverage" },
    ],
  },
  {
    label: "Knowledge",
    items: [{ href: "/memory", icon: "memory", label: "QA memory" }],
  },
];

export const mobileNavigationItems = [
  navigationGroups[0]!.items[0]!,
  navigationGroups[0]!.items[1]!,
  navigationGroups[1]!.items[1]!,
  navigationGroups[1]!.items[2]!,
  navigationGroups[2]!.items[0]!,
] as const;
