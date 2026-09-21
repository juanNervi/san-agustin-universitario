import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { estadoVencimiento } from "@/lib/dates";
import type { Jugador, Plantel } from "@/lib/types";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const [{ data: jugadores }, { data: planteles }] = await Promise.all([
    supabase.from("jugadores").select("*"),
    supabase.from("planteles").select("*").order("anio", { ascending: false }),
  ]);

  const lista = (jugadores ?? []) as Jugador[];
  const carnetsVencidos = lista.filter(
    (jugador) => estadoVencimiento(jugador.vencimiento_carnet) === "vencido",
  ).length;
  const fichasVencidas = lista.filter(
    (jugador) =>
      estadoVencimiento(jugador.vencimiento_ficha_medica) === "vencido",
  ).length;
  const enPlantel = lista.filter((jugador) => jugador.en_plantel_corriente).length;

  return (
    <div>
      <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/60">
        Panel
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-[0.08em]">Delegados</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
        Control de jugadores, vencimientos de carnet y ficha médica, y planteles
        por categoría y año.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Jugadores", String(lista.length)],
          ["En plantel corriente", String(enPlantel)],
          ["Carnets vencidos", String(carnetsVencidos)],
          ["Fichas médicas vencidas", String(fichasVencidas)],
        ].map(([label, value]) => (
          <article key={label} className="border border-white/25 p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/55">
              {label}
            </p>
            <p className="mt-3 font-display text-4xl tracking-[0.08em]">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/admin/jugadores"
          className="border border-white bg-white px-4 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-bordo"
        >
          Ver jugadores
        </Link>
        <Link
          href="/admin/planteles"
          className="border border-white px-4 py-3 text-[0.7rem] uppercase tracking-[0.18em]"
        >
          Ver planteles
        </Link>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl tracking-[0.1em]">Planteles</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {((planteles ?? []) as Plantel[]).map((plantel) => (
            <li key={plantel.id}>
              <Link
                href={`/admin/planteles/${plantel.id}`}
                className="block border border-white/25 p-4 hover:border-white"
              >
                <p className="font-display text-xl tracking-[0.08em]">
                  {plantel.nombre}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/55">
                  {plantel.categoria} · {plantel.anio}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
