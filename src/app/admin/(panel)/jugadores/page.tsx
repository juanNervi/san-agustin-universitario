import { Suspense } from "react";
import { ImportJugadoresForm } from "@/components/admin/import-jugadores-form";
import { JugadorForm } from "@/components/admin/jugador-form";
import { JugadoresTable } from "@/components/admin/jugadores-table";
import {
  mapJugadorConPlanteles,
  type JugadorQueryRow,
} from "@/lib/jugadores";
import { createClient } from "@/lib/supabase/server";

export default async function JugadoresPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    imported?: string;
    created?: string;
    updated?: string;
    warnings?: string;
  }>;
}) {
  const { error, imported, created, updated, warnings } = await searchParams;
  const supabase = await createClient();

  const [{ data: jugadoresData }, { data: plantelesData }] = await Promise.all([
    supabase
      .from("jugadores")
      .select("*, plantel_jugadores(planteles(id, nombre))")
      .order("nombre"),
    supabase
      .from("planteles")
      .select("id, nombre, anio")
      .order("anio", { ascending: false })
      .order("nombre"),
  ]);

  const jugadores = ((jugadoresData ?? []) as JugadorQueryRow[]).map(
    mapJugadorConPlanteles,
  );

  const planteles = (plantelesData ?? []) as Array<{
    id: string;
    nombre: string;
    anio: number;
  }>;
  const plantelesTabla = planteles.map(({ id, nombre }) => ({ id, nombre }));

  return (
    <div>
      <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/60">
        Padrón
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-[0.08em]">Jugadores</h1>
      <p className="mt-3 text-sm text-white/70">
        Consultá último examen, vencimiento de carnet y ficha médica. Filtrá y
        ordená desde los encabezados. Tocá un nombre para editar.
      </p>

      {error ? (
        <p className="mt-6 border border-white/40 px-3 py-2 text-sm">{error}</p>
      ) : null}

      {imported ? (
        <p className="mt-6 border border-white/40 px-3 py-2 text-sm">
          Importación lista: {imported} procesados
          {created ? ` · ${created} nuevos` : ""}
          {updated ? ` · ${updated} actualizados` : ""}
          {warnings ? ` · ${warnings} advertencias` : ""}.
        </p>
      ) : null}

      <Suspense fallback={<p className="mt-8 text-sm text-white/60">Cargando tabla…</p>}>
        <JugadoresTable jugadores={jugadores} planteles={plantelesTabla} />
      </Suspense>

      <ImportJugadoresForm />

      <section className="mt-14 border border-white/20 p-6">
        <h2 className="font-display text-2xl tracking-[0.1em]">
          Nuevo jugador
        </h2>
        <JugadorForm planteles={planteles} />
      </section>
    </div>
  );
}
