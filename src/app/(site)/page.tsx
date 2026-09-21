import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { club, disciplines, footballCategories, hockey } from "@/lib/club";

export default function Home() {
  return (
    <>
      <main id="inicio">
        <section className="relative min-h-[calc(100vh-4.5rem)] overflow-hidden border-b border-white/20">
          <Image
            src="/media/hero.jpg"
            alt="Jugador de San Agustín Universitario de espaldas, con la camiseta bordó y la leyenda El santo es inmortal"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[68%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bordo via-bordo/55 to-bordo/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-bordo/55 via-transparent to-bordo/25" />

          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-6xl items-center px-5 py-16 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-[0.7rem] uppercase tracking-[0.28em] text-white/70">
                {club.league} · {club.country}
              </p>
              <h1 className="mt-6 font-display text-[3.4rem] leading-[0.88] tracking-[0.04em] text-white sm:text-7xl lg:text-[6.4rem]">
                San Agustín
                <span className="mt-1 block">Universitario</span>
              </h1>
              <p className="mt-8 max-w-xl text-base leading-8 text-white/90 sm:text-lg">
                Fundado el {club.foundedOn} en la {club.foundedPlace}. {club.origin}.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href="#club"
                  className="border border-white bg-white px-5 py-3 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-bordo transition hover:bg-transparent hover:text-white"
                >
                  Conocer el club
                </a>
                <a
                  href="#categorias"
                  className="border border-white px-5 py-3 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-bordo"
                >
                  Ver categorías
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="club" className="scroll-mt-24 border-b border-white/20">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/60">
                La institución
              </p>
              <h2 className="mt-3 font-display text-4xl tracking-[0.08em] sm:text-5xl">
                El club
              </h2>
              <p className="mt-6 text-base leading-8 text-white/85">
                San Agustín Universitario nace el {club.foundedOn} en la{" "}
                {club.foundedPlace}, como el club de quienes se formaron en el
                Colegio Santa Rita. Desde Punta Gorda competimos en la Liga
                Universitaria con la misma camiseta bordó y las mismas letras
                blancas.
              </p>
              <p className="mt-4 text-base leading-8 text-white/85">
                Somos fútbol y hockey. Mayores, Reserva y juveniles en la cancha
                de Santa Rita; hockey femenino en la Divisional B. Una
                institución de barrio, de exalumnos y de gente que elige seguir
                jugando de santo.
              </p>
            </div>

            <ol className="grid content-start gap-px bg-white/20 sm:grid-cols-2">
              {[
                ["1991", "Fundación en la Plaza Suiza y afiliación a la Liga."],
                ["Santa Rita", "Casa de origen y cancha de local."],
                ["Punta Gorda", "El barrio que nos nombra y nos junta."],
                ["Liga Universitaria", "Fútbol y hockey en el deporte universitario."],
              ].map(([title, text]) => (
                <li key={title} className="bg-bordo p-6">
                  <p className="font-display text-2xl tracking-[0.1em]">{title}</p>
                  <p className="mt-3 text-sm leading-6 text-white/80">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="disciplinas" className="scroll-mt-24 border-b border-white/20 bg-bordo-deep">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/60">
              Lo que jugamos
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-[0.08em] sm:text-5xl">
              Disciplinas
            </h2>
            <div className="mt-12 grid gap-px bg-white/20 md:grid-cols-2">
              {disciplines.map((discipline) => (
                <article key={discipline.slug} className="bg-bordo-deep p-8 sm:p-10">
                  <p className="font-display text-5xl tracking-[0.1em] text-white">
                    {discipline.name}
                  </p>
                  <p className="mt-5 max-w-md text-base leading-8 text-white/80">
                    {discipline.summary}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="categorias" className="scroll-mt-24">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/60">
              Temporada 2026
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-[0.08em] sm:text-5xl">
              Categorías
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80">
              Estas son las categorías con las que el club está en cancha hoy:
              fútbol de Mayores a Sub 18, y hockey femenino.
            </p>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {footballCategories.map((category, index) => (
                <article
                  key={category.slug}
                  className="border border-white/30 p-6 sm:p-7"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-3xl tracking-[0.1em]">
                      {category.name}
                    </h3>
                    <span className="font-display text-xl text-white/45">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-3 text-[0.7rem] uppercase tracking-[0.18em] text-white/65">
                    {category.season}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-white/80">
                    {category.note}
                  </p>
                </article>
              ))}
              <article className="border border-white bg-white p-6 text-bordo sm:col-span-2 sm:p-7">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-3xl tracking-[0.1em]">
                    {hockey.name}
                  </h3>
                  <span className="font-display text-xl text-bordo/40">05</span>
                </div>
                <p className="mt-3 text-[0.7rem] uppercase tracking-[0.18em] text-bordo/70">
                  {hockey.season}
                </p>
                <p className="mt-4 text-sm leading-6 text-bordo/80">{hockey.note}</p>
              </article>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
