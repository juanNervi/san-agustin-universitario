import Link from "next/link";
import { notFound } from "next/navigation";
import { AddJugadorToPlantelForm } from "@/components/admin/add-jugador-to-plantel-form";
import { JugadoresTable } from "@/components/admin/jugadores-table";
import {
  mapJugadorConPlanteles,
  type JugadorConPlanteles,
  type JugadorQueryRow,
} from "@/lib/jugadores";
import { createClient } from "@/lib/supabase/server";
import type { Plantel } from "@/lib/types";

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

  const [{ data: vinculos }, { data: plantelesData }] = await Promise.all([
    supabase.from("plantel_jugadores").select("jugador_id").eq("plantel_id", id),
    supabase.from("planteles").select("id, nombre").order("nombre"),
  ]);

  const ids = (vinculos ?? []).map((item) => item.jugador_id);
  let jugadores: JugadorConPlanteles[] = [];

  if (ids.length) {
    const { data } = await supabase
      .from("jugadores")
      .select("*, plantel_jugadores(planteles(id, nombre))")
      .in("id", ids)
      .order("nombre");
    jugadores = ((data ?? []) as JugadorQueryRow[]).map(mapJugadorConPlanteles);
  }

  const { data: todos } = await supabase
    .from("jugadores")
    .select("id, nombre, cedula")
    .order("nombre");
  const disponibles = (todos ?? []).filter((jugador) => !ids.includes(jugador.id));
  const planteles = (plantelesData ?? []) as Array<{ id: string; nombre: string }>;

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

      <JugadoresTable
        jugadores={jugadores}
        planteles={planteles}
        emptyMessage="Este plantel todavía no tiene jugadores."
        removeFromPlantelId={id}
      />

      <section className="mt-12 border border-white/20 p-6">
        <h2 className="font-display text-2xl tracking-[0.1em]">
          Sumar jugador al plantel
        </h2>
        {disponibles.length === 0 ? (
          <p className="mt-4 text-sm text-white/70">
            No hay jugadores fuera de este plantel. Cargalos primero en Jugadores.
          </p>
        ) : (
          <AddJugadorToPlantelForm plantelId={id} disponibles={disponibles} />
        )}
      </section>
    </div>
  );
}
