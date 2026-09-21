import { club } from "@/lib/club";
import { ClubMark } from "@/components/club-mark";

export function SiteFooter() {
  return (
    <footer id="contacto" className="scroll-mt-24 border-t border-white/20">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <ClubMark className="h-16 w-auto" decorative />
            <p className="font-display text-xl leading-[0.95] tracking-[0.08em] sm:text-2xl">
              San Agustín
              <span className="block">Universitario</span>
            </p>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/80">
            {club.origin}. Camiseta {club.shirtColor.toLowerCase()}, letras{" "}
            {club.letterColor.toLowerCase()}.
          </p>
        </div>

        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/60">
            Sede
          </p>
          <p className="mt-3 text-sm leading-7 text-white">
            {club.venue}
            <br />
            {club.neighborhood}
          </p>
        </div>

        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/60">
            Contacto
          </p>
          <a
            href={club.instagram}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-white underline-offset-4 hover:underline"
          >
            {club.instagramHandle}
          </a>
          <p className="mt-3 text-sm leading-7 text-white/80">{club.league}</p>
        </div>
      </div>

      <div className="border-t border-white/15">
        <p className="mx-auto max-w-6xl px-5 py-5 text-[0.7rem] uppercase tracking-[0.18em] text-white/55 sm:px-8">
          {club.name} · Fundado el {club.foundedOn} · {club.country}
        </p>
      </div>
    </footer>
  );
}
