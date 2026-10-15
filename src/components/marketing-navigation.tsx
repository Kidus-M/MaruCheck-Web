"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { MaruMark } from "@/components/maru-mark";
import { formatStarCount } from "@/lib/github-stars";
import { MARUCHECK_SOURCE_URL } from "@/lib/public-release";

type NavLink = { readonly description?: string; readonly href: string; readonly label: string };
type NavGroup = { readonly items: readonly NavLink[]; readonly label: string };
type NavEntry = NavGroup | NavLink;

/**
 * Four top-level entries. Grouped links stay in the server-rendered HTML (the
 * panels are only visually hidden), so crawlers still follow every one of them.
 */
const entries: readonly NavEntry[] = [
  {
    items: [
      {
        description: "The path from a changed line to a release decision",
        href: "/product",
        label: "Overview",
      },
      { description: "Watch one change get challenged", href: "/#workflow", label: "How it works" },
      {
        description: "Releases across the CLI and the web app",
        href: "/changelog",
        label: "What's new",
      },
    ],
    label: "Product",
  },
  {
    items: [
      { description: "Testing and verifying AI-written code", href: "/guides", label: "Guides" },
      { description: "Install, contracts, CI, and MCP", href: "/docs", label: "Docs" },
      { description: "Short answers to common questions", href: "/faq", label: "FAQ" },
    ],
    label: "Resources",
  },
  { href: "/open-source", label: "Open source" },
  { href: "/about", label: "About" },
];

type GliderRect = { readonly left: number; readonly width: number };

function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

function isActive(href: string, pathname: string): boolean {
  if (href === "/docs" || href === "/guides") return pathname.startsWith(href);
  if (href.startsWith("/#")) return false;
  return pathname === href;
}

export function MarketingNavigation({ stars = null }: { readonly stars?: number | null }) {
  const pathname = usePathname();
  const lightPage = pathname.startsWith("/docs") || pathname.startsWith("/guides");
  const [open, setOpen] = useState(false);
  // The open dropdown is remembered with the path it was opened on, so a
  // navigation closes it without an effect.
  const [openState, setOpenState] = useState<{ group: string; path: string } | null>(null);
  const openGroup = openState?.path === pathname ? openState.group : null;
  const setOpenGroup = useCallback(
    (group: string | null) => setOpenState(group ? { group, path: pathname } : null),
    [pathname],
  );
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const [glider, setGlider] = useState<GliderRect | null>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 18);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Close an open dropdown on Escape or a click anywhere else.
  useEffect(() => {
    if (!openGroup) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenGroup(null);
    };
    const onPointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenGroup(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [openGroup, setOpenGroup]);

  const measure = useCallback((element: HTMLElement | null) => {
    const nav = navRef.current;
    if (!nav || !element) {
      setGlider(null);
      return;
    }
    // Measured against the nav rather than offsetParent: dropdown triggers sit
    // inside their own positioned wrapper, so offsetLeft would read as zero.
    const navBox = nav.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    setGlider({
      left: box.left - navBox.left,
      width: box.width,
    });
  }, []);

  /** Park the glider on the active entry, and keep it parked through resizes. */
  const settle = useCallback(() => {
    measure(navRef.current?.querySelector<HTMLElement>("[data-nav-top].is-active") ?? null);
  }, [measure]);

  useEffect(() => {
    settle();
    window.addEventListener("resize", settle);
    return () => window.removeEventListener("resize", settle);
  }, [settle, pathname]);

  return (
    <header
      className={`marketing-header${scrolled ? " is-scrolled" : ""}${lightPage ? " is-light-context" : ""}`}
    >
      <div className="marketing-header__inner">
        <MaruMark />
        <nav
          aria-label="Primary navigation"
          className="marketing-nav"
          onMouseLeave={() => {
            settle();
            setOpenGroup(null);
          }}
          ref={navRef}
        >
          <span
            aria-hidden="true"
            className={`marketing-nav__glider${glider ? " is-visible" : ""}`}
            style={
              glider
                ? { transform: `translateX(${glider.left}px)`, width: `${glider.width}px` }
                : undefined
            }
          />
          {entries.map((entry) => {
            if (!isGroup(entry)) {
              const active = isActive(entry.href, pathname);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={active ? "is-active" : ""}
                  data-nav-top
                  href={entry.href}
                  key={entry.href}
                  onFocus={(event) => {
                    measure(event.currentTarget);
                    setOpenGroup(null);
                  }}
                  onMouseEnter={(event) => {
                    measure(event.currentTarget);
                    setOpenGroup(null);
                  }}
                >
                  {entry.label}
                </Link>
              );
            }

            const groupActive = entry.items.some((item) => isActive(item.href, pathname));
            const expanded = openGroup === entry.label;
            const panelId = `nav-group-${entry.label.toLowerCase()}`;
            return (
              <div
                className={`marketing-nav__group${expanded ? " is-open" : ""}`}
                key={entry.label}
                onMouseEnter={() => setOpenGroup(entry.label)}
              >
                <button
                  aria-controls={panelId}
                  aria-expanded={expanded}
                  className={`marketing-nav__trigger${groupActive ? " is-active" : ""}`}
                  data-nav-top
                  onClick={() => setOpenGroup(expanded ? null : entry.label)}
                  onFocus={(event) => measure(event.currentTarget)}
                  onMouseEnter={(event) => measure(event.currentTarget)}
                  type="button"
                >
                  {entry.label}
                  <svg aria-hidden="true" fill="none" height="10" viewBox="0 0 10 10" width="10">
                    <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </button>
                <div className="marketing-nav__panel" id={panelId}>
                  {entry.items.map((item) => {
                    const active = isActive(item.href, pathname);
                    return (
                      <Link
                        aria-current={active ? "page" : undefined}
                        className={active ? "is-current" : ""}
                        href={item.href}
                        key={item.href}
                        onClick={() => setOpenGroup(null)}
                        onFocus={() => setOpenGroup(entry.label)}
                      >
                        <strong>{item.label}</strong>
                        {item.description ? <span>{item.description}</span> : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="marketing-header__actions">
          <a
            className="nav-source"
            href={MARUCHECK_SOURCE_URL}
            rel="noreferrer"
            target="_blank"
            title="MaruCheck CLI on GitHub"
          >
            <Icon fill="currentColor" name="github" stroke="none" />
            <span>GitHub</span>
            {stars === null ? null : <b>{formatStarCount(stars)}</b>}
          </a>
          <span aria-hidden="true" className="nav-divider" />
          <Link className="nav-sign-in" href="/sign-in">
            Sign in
          </Link>
          <Link className="nav-console-link" href="/docs/getting-started">
            Get started <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <a
          aria-label="MaruCheck CLI on GitHub"
          className="nav-source nav-source--compact"
          href={MARUCHECK_SOURCE_URL}
          rel="noreferrer"
          target="_blank"
        >
          <Icon fill="currentColor" name="github" stroke="none" />
        </a>
        <button
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="marketing-menu-button"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span />
          <span />
        </button>
      </div>
      <div className={`marketing-mobile-panel${open ? " is-open" : ""}`}>
        <nav aria-label="Mobile navigation">
          {entries.map((entry) =>
            isGroup(entry) ? (
              <div className="marketing-mobile-panel__group" key={entry.label}>
                <p>{entry.label}</p>
                {entry.items.map((item) => (
                  <Link href={item.href} key={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link href={entry.href} key={entry.href} onClick={() => setOpen(false)}>
                {entry.label}
              </Link>
            ),
          )}
          <a href={MARUCHECK_SOURCE_URL} rel="noreferrer" target="_blank">
            GitHub
            <span aria-hidden="true">{stars === null ? "↗" : `★ ${formatStarCount(stars)}`}</span>
          </a>
          <Link href="/sign-in" onClick={() => setOpen(false)}>
            Sign in
          </Link>
          <Link
            className="mobile-console-link"
            href="/docs/getting-started"
            onClick={() => setOpen(false)}
          >
            Verify your first change <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
