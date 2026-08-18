"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNavigationItems, navigationGroups } from "@/components/dashboard-navigation-data";
import { Icon } from "@/components/icon";

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
      {mobileNavigationItems.map((item) => (
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
