"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaruMark } from "@/components/maru-mark";

const links = [
  { href: "/product", label: "Product" },
  { href: "/#workflow", label: "Workflow" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
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

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`marketing-header${scrolled ? " is-scrolled" : ""}${lightPage ? " is-light-context" : ""}`}
    >
      <div className="marketing-container marketing-header__inner">
        <MaruMark />
        <nav aria-label="Primary navigation" className="marketing-nav">
          {links.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="marketing-header__actions">
          <Link className="nav-sign-in" href="/sign-in">
            Sign in
          </Link>
          <Link className="nav-console-link" href="/dashboard">
            Open console <span aria-hidden="true">↗</span>
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
          {links.map((link, index) => (
            <Link href={link.href} key={link.href}>
              <span>0{index + 1}</span>
              {link.label}
            </Link>
          ))}
          <Link href="/sign-in">
            <span>06</span>Sign in
          </Link>
          <Link className="mobile-console-link" href="/dashboard">
            Open proof console <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
