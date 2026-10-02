import Link from "next/link";
import { notFound } from "next/navigation";
import { JugadorForm } from "@/components/admin/jugador-form";
import { createClient } from "@/lib/supabase/server";
import type { Jugador } from "@/lib/types";

function safeReturnTo(value: string | undefined) {
  if (!value) return "/admin/jugadores";
  if (!value.startsWith("/admin/jugadores")) return "/admin/jugadores";
  return value;
}

export default async function EditarJugadorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; returnTo?: string }>;
}) {
  const { id } = await params;
  const { error, returnTo: returnToRaw } = await searchParams;
  const returnTo = safeReturnTo(returnToRaw);
  const supabase = await createClient();

  const [{ data: jugador }, { data: plantelesData }, { data: vinculos }] =
    await Promise.all([
      supabase.from("jugadores").select("*").eq("id", id).single(),
      supabase
        .from("planteles")
        .select("id, nombre, anio")
        .order("anio", { ascending: false })
        .order("nombre"),
      supabase
        .from("plantel_jugadores")
        .select("plantel_id")
        .eq("jugador_id", id),
    ]);

  if (!jugador) {
    notFound();
  }

  const planteles = (plantelesData ?? []) as Array<{
    id: string;
    nombre: string;
    anio: number;
  }>;
  const plantelActualId = vinculos?.[0]?.plantel_id ?? "";

  return (
    <div>
      <Link
        href={returnTo}
        className="text-[0.7rem] uppercase tracking-[0.18em] text-white/60 hover:text-white"
      >
        Volver a jugadores
      </Link>
      <h1 className="mt-4 font-display text-4xl tracking-[0.08em]">
        Editar jugador
      </h1>
      <p className="mt-3 text-sm text-white/70">
        {(jugador as Jugador).nombre}
      </p>

      {error ? (
        <p className="mt-6 border border-white/40 px-3 py-2 text-sm">{error}</p>
      ) : null}

      <section className="mt-8 border border-white/20 p-6">
        <JugadorForm
          jugador={jugador as Jugador}
          planteles={planteles}
          plantelActualId={plantelActualId}
          returnTo={returnTo}
          submitLabel="Guardar cambios"
        />
      </section>
    </div>
  );
}
