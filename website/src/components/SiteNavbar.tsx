"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import homeContent from "@/content/page.json";
import type { ButtonAction, Mode } from "@/components/cards/shared-elements";
import type { PageContent } from "@/types/page-content";

const home = homeContent as PageContent;

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/", label: home.buttons.nav_about_us_link.label, actionId: "nav_about_us_link" },
  { href: "/tour-packages", label: home.buttons.nav_packages_link.label, actionId: "nav_packages_link" },
  { href: "/", label: home.buttons.nav_bus_link.label, actionId: "nav_bus_link" },
  { href: "/", label: home.buttons.nav_enquiry_link.label, actionId: "nav_enquiry_link" },
];

type SiteNavbarProps = {
  className?: string;
  currentPath?: string;
  label?: string;
  mode?: Mode;
  onAction?: ButtonAction;
};

export function SiteNavbar({ className = "", currentPath, label = "Site navigation", mode = "desktop", onAction }: SiteNavbarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(".site-navbar")) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  return (
    <nav className={`site-navbar ${className}`.trim()} aria-label={label}>
      <Link href="/" className="site-navbar-brand" aria-label="TripFactory home" onClick={() => setOpen(false)}>
        <Image src="/asset/logo.png" alt="TripFactory" width={180} height={80} priority unoptimized />
      </Link>

      <button
        className="site-navbar-toggle"
        type="button"
        aria-label="Toggle navigation menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Image src="/asset/ic9.png" alt="" width={50} height={45} unoptimized />
      </button>

      <div className={`site-navbar-links${open ? " site-navbar-links--open" : ""}`}>
        {navLinks.map((link) => (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            aria-current={currentPath === link.href && (link.href !== "/" || link.label === "Home") ? "page" : undefined}
            onClick={(event) => {
              setOpen(false);
              if (link.actionId && onAction?.(link.actionId, mode, event)) event.preventDefault();
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
