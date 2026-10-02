"use client";

import Link from "next/link";
import { useState } from "react";
import { club } from "@/lib/club";
import { ClubMark } from "@/components/club-mark";

const nav = [
  { href: "#club", label: "El club" },
  { href: "#disciplinas", label: "Disciplinas" },
  { href: "#categorias", label: "Categorías" },
  { href: "#contacto", label: "Contacto" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-bordo/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="#inicio"
          className="flex min-w-0 items-center gap-3 text-white"
          onClick={() => setOpen(false)}
        >
          <ClubMark className="h-14 w-auto shrink-0 sm:h-16" decorative />
          <span className="font-display text-[0.95rem] leading-[0.95] tracking-[0.08em] sm:text-lg">
            San Agustín
            <span className="block">Universitario</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-white/80 transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/admin"
            className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-white/80 transition hover:text-white"
          >
            Admin
          </Link>
          <a
            href={club.instagram}
            target="_blank"
            rel="noreferrer"
            className="border border-white px-3 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-bordo"
          >
            Instagram
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-white/40 text-white lg:hidden"
          aria-expanded={open}
          aria-controls="menu-movil"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
          <span aria-hidden className="font-display text-lg tracking-widest">
            {open ? "✕" : "☰"}
          </span>
        </button>
      </div>

      {open ? (
        <nav
          id="menu-movil"
          className="border-t border-white/20 px-5 py-4 lg:hidden"
          aria-label="Móvil"
        >
          <div className="flex flex-col gap-4">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-display text-2xl tracking-[0.12em] text-white"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/admin"
              className="font-display text-2xl tracking-[0.12em] text-white"
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
            <a
              href={club.instagram}
              target="_blank"
              rel="noreferrer"
              className="pt-2 text-xs uppercase tracking-[0.22em] text-white/80"
            >
              {club.instagramHandle}
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
