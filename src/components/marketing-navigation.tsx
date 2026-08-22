"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaruMark } from "@/components/maru-mark";

const links = [
  { href: "/product", label: "Product" },
  { href: "/#workflow", label: "How it works" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
] as const;

export function MarketingNavigation() {
  const pathname = usePathname();
  const lightPage = pathname.startsWith("/docs");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 18);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={`marketing-header${scrolled ? " is-scrolled" : ""}${lightPage ? " is-light-context" : ""}`}
    >
      <div className="marketing-header__inner">
        <MaruMark />
        <nav aria-label="Primary navigation" className="marketing-nav">
          {links.map((link) => {
            const active =
              link.href === "/docs"
                ? pathname.startsWith("/docs")
                : link.href !== "/#workflow" && pathname === link.href;
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={active ? "is-active" : ""}
                href={link.href}
                key={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="marketing-header__actions">
          <Link className="nav-sign-in" href="/sign-in">
            Sign in
          </Link>
          <Link className="nav-console-link" href="/docs/getting-started">
            Get started <span aria-hidden="true">↗</span>
          </Link>
        </div>
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
