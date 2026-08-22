"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function MarketingGsap() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.from("[data-gsap-hero] .hero-word", {
        duration: 1.05,
        ease: "power4.out",
        stagger: 0.09,
        yPercent: 115,
      });
      gsap.from("[data-gsap-hero] .v2-kicker, [data-gsap-hero] .v2-hero__deck", {
        delay: 0.18,
        duration: 0.85,
        ease: "power3.out",
        opacity: 0,
        stagger: 0.12,
        y: 22,
      });
      gsap.from("[data-gsap-hero] .v2-hero__demo", {
        delay: 0.35,
        duration: 1.25,
        ease: "power4.out",
        opacity: 0,
        rotateX: 7,
        scale: 0.94,
        transformPerspective: 1400,
        y: 80,
      });
      gsap.to("[data-gsap-hero] .v2-hero__grid", {
        ease: "none",
        scrollTrigger: {
          end: "bottom top",
          scrub: 0.8,
          start: "top top",
          trigger: "[data-gsap-hero]",
        },
        yPercent: 18,
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap]").forEach((element) => {
        gsap.from(element, {
          duration: 0.9,
          ease: "power3.out",
          opacity: 0,
          scrollTrigger: {
            once: true,
            start: "top 84%",
            trigger: element,
          },
          y: 42,
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap-line]").forEach((element) => {
        gsap.from(element, {
          ease: "power2.out",
          scaleX: 0,
          scrollTrigger: {
            once: true,
            start: "top 88%",
            trigger: element,
          },
          transformOrigin: "left center",
        });
      });
    }, document.body);

    ScrollTrigger.refresh();
    return () => context.revert();
  }, [pathname]);

  return null;
}
