import Link from "next/link";
import type { ReactNode } from "react";
import { DashboardNavigation, MobileNavigation } from "@/components/dashboard-nav";
import { navigationGroups } from "@/components/dashboard-navigation-data";
import { Icon } from "@/components/icon";
import { MaruMark } from "@/components/maru-mark";
import type { Organization, Viewer } from "@/lib/dashboard-data";

export function DashboardShell({
  children,
  organization,
  viewer,
}: {
  readonly children: ReactNode;
  readonly organization: Organization;
  readonly viewer: Viewer;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <MaruMark href="/dashboard" />
        </div>

        <button className="organization-switcher" type="button" aria-label="Switch organization">
          <span className="organization-switcher__seal" aria-hidden="true">
            M
          </span>
          <span>
            <strong>{organization.name}</strong>
            <small>{organization.plan}</small>
          </span>
          <Icon name="chevron" />
        </button>

        <DashboardNavigation />

        <div className="sidebar__footer">
          <Link className="nav-link" href="/organization">
            <Icon name="organization" />
            <span>Organization</span>
          </Link>
          <div className="sidebar__proof">
            <span className="proof-mini" aria-hidden="true">
              <span />
            </span>
            <p>
              <strong>Local execution</strong>
              <small>Source stays in your CI</small>
            </p>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar__mobile-brand">
            <MaruMark compact href="/dashboard" />
          </div>
          <button className="command-search" type="button">
            <Icon name="search" />
            <span>Search proof, projects, memory…</span>
            <kbd>
              <Icon name="command" /> K
            </kbd>
          </button>
          <div className="topbar__actions">
            <span className="sync-state">
              <i /> All evidence synced
            </span>
            <Link
              className="avatar"
              href="/organization"
              aria-label={`${viewer.name}, ${viewer.role}`}
            >
              {viewer.initials}
            </Link>
            <details className="mobile-menu">
              <summary aria-label="Open all navigation">All</summary>
              <div>
                {navigationGroups
                  .flatMap((group) => group.items)
                  .map((item) => (
                    <Link href={item.href} key={item.href}>
                      {item.label}
                    </Link>
                  ))}
                <Link href="/organization">Organization</Link>
              </div>
            </details>
          </div>
        </header>
        <main className="page-canvas" id="main-content">
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
