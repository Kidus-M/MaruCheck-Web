"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icon";

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

const mobileItems = [
  navigationGroups[0]!.items[0]!,
  navigationGroups[0]!.items[1]!,
  navigationGroups[1]!.items[1]!,
  navigationGroups[1]!.items[2]!,
  navigationGroups[2]!.items[0]!,
];

function active(pathname: string, href: string): boolean {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNavigation() {
  const pathname = usePathname();

  return (
    <nav className="sidebar__nav" aria-label="Product navigation">
      {navigationGroups.map((group) => (
        <div className="nav-group" key={group.label}>
          <p>{group.label}</p>
          {group.items.map((item) => (
            <Link
              aria-current={active(pathname, item.href) ? "page" : undefined}
              className="nav-link"
              href={item.href}
              key={item.href}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="mobile-dock" aria-label="Mobile navigation">
      {mobileItems.map((item) => (
        <Link
          aria-current={active(pathname, item.href) ? "page" : undefined}
          href={item.href}
          key={item.href}
        >
          <Icon name={item.icon} />
          <span>{item.label === "QA memory" ? "Memory" : item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
