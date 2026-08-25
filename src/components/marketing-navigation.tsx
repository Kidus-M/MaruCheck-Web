"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { MaruMark } from "@/components/maru-mark";
import { formatStarCount } from "@/lib/github-stars";
import { MARUCHECK_SOURCE_URL } from "@/lib/public-release";

const links = [
  { href: "/product", label: "Product" },
  { href: "/#workflow", label: "How it works" },
  { href: "/docs", label: "Docs" },
  { href: "/open-source", label: "Open source" },
  { href: "/about", label: "About" },
] as const;

type GliderRect = { readonly left: number; readonly width: number };

function isActive(href: string, pathname: string): boolean {
  if (href === "/docs") return pathname.startsWith("/docs");
  if (href.startsWith("/#")) return false;
  return pathname === href;
}

export function MarketingNavigation({ stars = null }: { readonly stars?: number | null }) {
  const pathname = usePathname();
  const lightPage = pathname.startsWith("/docs");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const [glider, setGlider] = useState<GliderRect | null>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 18);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const measure = useCallback((element: HTMLElement | null) => {
    const nav = navRef.current;
    if (!nav || !element) {
      setGlider(null);
      return;
    }
    setGlider({
      left: element.offsetLeft,
      width: element.offsetWidth,
    });
  }, []);

  /** Park the glider on the active link, and keep it parked through resizes. */
  const settle = useCallback(() => {
    measure(navRef.current?.querySelector<HTMLElement>("a.is-active") ?? null);
  }, [measure]);

  useEffect(() => {
    settle();
    window.addEventListener("resize", settle);
    return () => window.removeEventListener("resize", settle);
  }, [settle, pathname]);

  return (
    <header
      className={`marketing-header${scrolled ? " is-scrolled" : ""}${lightPage ? " is-light-context" : ""}${open ? " is-menu-open" : ""}`}
    >
      <div className="marketing-header__inner">
        <MaruMark />
        <nav
          aria-label="Primary navigation"
          className="marketing-nav"
          onMouseLeave={settle}
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
          {links.map((link) => {
            const active = isActive(link.href, pathname);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={active ? "is-active" : ""}
                href={link.href}
                key={link.href}
                onClick={() => setOpen(false)}
                onFocus={(event) => measure(event.currentTarget)}
                onMouseEnter={(event) => measure(event.currentTarget)}
              >
                {link.label}
              </Link>
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
          {links.map((link) => (
            <Link href={link.href} key={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
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
