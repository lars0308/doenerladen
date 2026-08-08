"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Startseite" },
  { href: "/speisekarte", label: "Speisekarte" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Header({ shopName }: { shopName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const [first, ...rest] = shopName.split(" ");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close the mobile menu automatically if the viewport grows past the
  // breakpoint where it's shown as an off-canvas panel.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 881px)");
    const handler = () => setOpen(false);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link className="brand" href="/" onClick={() => setOpen(false)}>
          <span className="brand__mark">LD</span>
          <span className="brand__name">
            <b>{first}</b>
            <span>{rest.join(" ")}</span>
          </span>
        </Link>
        <nav className={`nav${open ? " is-open" : ""}`}>
          {NAV_LINKS.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          className="nav-toggle"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
