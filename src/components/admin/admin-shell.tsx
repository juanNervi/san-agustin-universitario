import type { ReactNode } from "react";
import Link from "next/link";
import { ClubMark } from "@/components/club-mark";
import { logoutAction } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/jugadores", label: "Jugadores" },
  { href: "/admin/planteles", label: "Planteles" },
];

export function AdminShell({
  username,
  children,
}: {
  username: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-full">
      <header className="border-b border-white/20">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <ClubMark className="h-12 w-auto" decorative />
            <span className="font-display text-lg leading-[0.95] tracking-[0.08em]">
              Delegados
              <span className="block text-sm text-white/70">Panel</span>
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <nav className="hidden items-center gap-5 sm:flex" aria-label="Admin">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[0.7rem] uppercase tracking-[0.18em] text-white/75 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <p className="hidden text-xs text-white/60 md:block">{username}</p>
            <form action={logoutAction}>
              <button
                type="submit"
                className="border border-white/40 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.18em] hover:bg-white hover:text-bordo"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
        <nav className="border-t border-white/10 px-5 py-3 sm:hidden" aria-label="Admin móvil">
          <div className="flex gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.7rem] uppercase tracking-[0.18em] text-white/75"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</div>
    </div>
  );
}
