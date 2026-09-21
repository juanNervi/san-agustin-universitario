import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addJugadorToPlantelAction,
  removeJugadorFromPlantelAction,
} from "@/app/admin/actions";
import { VencimientoBadge } from "@/components/admin/vencimiento-badge";
import { createClient } from "@/lib/supabase/server";
import type { Jugador, Plantel } from "@/lib/types";

export default async function PlantelDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: plantel } = await supabase
    .from("planteles")
    .select("*")
    .eq("id", id)
    .single();

  if (!plantel) {
    notFound();
  }

  const { data: vinculos } = await supabase
    .from("plantel_jugadores")
    .select("jugador_id")
    .eq("plantel_id", id);

  const ids = (vinculos ?? []).map((item) => item.jugador_id);
  let jugadores: Jugador[] = [];
  if (ids.length) {
    const { data } = await supabase
      .from("jugadores")
      .select("*")
      .in("id", ids)
      .order("nombre");
    jugadores = (data ?? []) as Jugador[];
  }

  const { data: todos } = await supabase
    .from("jugadores")
    .select("id, nombre, cedula")
    .order("nombre");
  const disponibles = (todos ?? []).filter((jugador) => !ids.includes(jugador.id));

  return (
    <div>
      <Link
        href="/admin/planteles"
        className="text-[0.7rem] uppercase tracking-[0.18em] text-white/60 hover:text-white"
      >
        Volver a planteles
      </Link>
      <h1 className="mt-4 font-display text-4xl tracking-[0.08em]">
        {(plantel as Plantel).nombre}
      </h1>
      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/55">
        {(plantel as Plantel).categoria} · {(plantel as Plantel).anio}
      </p>

      {error ? (
        <p className="mt-6 border border-white/40 px-3 py-2 text-sm">{error}</p>
      ) : null}

      <div className="mt-8 overflow-x-auto border border-white/20">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/20 text-[0.65rem] uppercase tracking-[0.16em] text-white/55">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Cédula</th>
              <th className="px-4 py-3">Carnet</th>
              <th className="px-4 py-3">Ficha médica</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {jugadores.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-white/60" colSpan={5}>
                  Este plantel todavía no tiene jugadores.
                </td>
              </tr>
            ) : (
              jugadores.map((jugador) => (
                <tr key={jugador.id} className="border-t border-white/10">
                  <td className="px-4 py-4">{jugador.nombre}</td>
                  <td className="px-4 py-4">{jugador.cedula}</td>
                  <td className="px-4 py-4">
                    <VencimientoBadge value={jugador.vencimiento_carnet} />
                  </td>
                  <td className="px-4 py-4">
                    <VencimientoBadge value={jugador.vencimiento_ficha_medica} />
                  </td>
                  <td className="px-4 py-4">
                    <form action={removeJugadorFromPlantelAction}>
                      <input type="hidden" name="plantel_id" value={id} />
                      <input type="hidden" name="jugador_id" value={jugador.id} />
                      <button
                        type="submit"
                        className="text-[0.65rem] uppercase tracking-[0.16em] text-white/60 hover:text-white"
                      >
                        Sacar
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="mt-12 border border-white/20 p-6">
        <h2 className="font-display text-2xl tracking-[0.1em]">
          Sumar jugador al plantel
        </h2>
        {disponibles.length === 0 ? (
          <p className="mt-4 text-sm text-white/70">
            No hay jugadores fuera de este plantel. Cargalos primero en Jugadores.
          </p>
        ) : (
          <form action={addJugadorToPlantelAction} className="mt-6 flex flex-col gap-4 sm:flex-row">
            <input type="hidden" name="plantel_id" value={id} />
            <select
              name="jugador_id"
              required
              className="flex-1 border border-white/30 bg-bordo px-3 py-3 text-sm"
            >
              {disponibles.map((jugador) => (
                <option key={jugador.id} value={jugador.id}>
                  {jugador.nombre} · {jugador.cedula}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="border border-white bg-white px-4 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-bordo"
            >
              Agregar
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
