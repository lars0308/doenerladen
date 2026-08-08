"use client";

import { useEffect, useRef } from "react";

export function CategoryNav({ categories }: { categories: { slug: string; title: string; meta?: string }[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(c.slug))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          Object.values(linkRefs.current).forEach((a) => a?.classList.remove("is-active"));
          const link = linkRefs.current[entry.target.id];
          if (!link) return;
          link.classList.add("is-active");

          const scrollBox = scrollRef.current;
          if (scrollBox) {
            const target = link.offsetLeft - (scrollBox.clientWidth - link.offsetWidth) / 2;
            scrollBox.scrollTo({ left: target, behavior: "smooth" });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [categories]);

  return (
    <nav className="cat-nav" aria-label="Kategorien der Speisekarte">
      <div className="cat-nav__scroll" ref={scrollRef}>
        {categories.map((c) => (
          <a
            key={c.slug}
            href={`#${c.slug}`}
            ref={(el) => {
              linkRefs.current[c.slug] = el;
            }}
          >
            {c.title}
          </a>
        ))}
      </div>
    </nav>
  );
}
