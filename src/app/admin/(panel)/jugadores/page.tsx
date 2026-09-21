import { upsertJugadorAction } from "@/app/admin/actions";
import { VencimientoBadge } from "@/components/admin/vencimiento-badge";
import { createClient } from "@/lib/supabase/server";
import type { Jugador } from "@/lib/types";

export default async function JugadoresPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string }>;
}) {
  const { error, q } = await searchParams;
  const supabase = await createClient();
  const term = (q ?? "").replace(/[%_,]/g, "").trim();
  let query = supabase.from("jugadores").select("*").order("nombre");
  if (term) {
    query = query.or(
      `nombre.ilike.%${term}%,cedula.ilike.%${term}%,numero_liga.ilike.%${term}%`,
    );
  }
  const { data } = await query;
  const jugadores = (data ?? []) as Jugador[];

  return (
    <div>
      <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/60">
        Padrón
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-[0.08em]">Jugadores</h1>
      <p className="mt-3 text-sm text-white/70">
        Consultá vencimientos de carnet y ficha médica.
      </p>

      {error ? (
        <p className="mt-6 border border-white/40 px-3 py-2 text-sm">{error}</p>
      ) : null}

      <form className="mt-8 flex gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, cédula o número de liga"
          className="flex-1 border border-white/30 bg-transparent px-3 py-3 text-sm outline-none focus:border-white"
        />
        <button
          type="submit"
          className="border border-white px-4 text-[0.7rem] uppercase tracking-[0.18em]"
        >
          Buscar
        </button>
      </form>

      <div className="mt-8 overflow-x-auto border border-white/20">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/20 text-[0.65rem] uppercase tracking-[0.16em] text-white/55">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Cédula</th>
              <th className="px-4 py-3">Nº liga</th>
              <th className="px-4 py-3">Carnet</th>
              <th className="px-4 py-3">Ficha médica</th>
              <th className="px-4 py-3">Plantel actual</th>
            </tr>
          </thead>
          <tbody>
            {jugadores.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-white/60" colSpan={6}>
                  No hay jugadores cargados.
                </td>
              </tr>
            ) : (
              jugadores.map((jugador) => (
                <tr key={jugador.id} className="border-t border-white/10">
                  <td className="px-4 py-4">
                    <p>{jugador.nombre}</p>
                    <p className="text-xs text-white/50">{jugador.email ?? "—"}</p>
                  </td>
                  <td className="px-4 py-4">{jugador.cedula}</td>
                  <td className="px-4 py-4">{jugador.numero_liga ?? "—"}</td>
                  <td className="px-4 py-4">
                    <VencimientoBadge value={jugador.vencimiento_carnet} />
                  </td>
                  <td className="px-4 py-4">
                    <VencimientoBadge value={jugador.vencimiento_ficha_medica} />
                  </td>
                  <td className="px-4 py-4">
                    {jugador.en_plantel_corriente ? "Sí" : "No"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="mt-14 border border-white/20 p-6">
        <h2 className="font-display text-2xl tracking-[0.1em]">
          Nuevo jugador
        </h2>
        <form action={upsertJugadorAction} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field name="nombre" label="Nombre" required />
          <Field name="cedula" label="Cédula" required />
          <Field name="numero_liga" label="Número de jugador en la Liga" />
          <Field name="email" label="Mail" type="email" />
          <Field name="fecha_nacimiento" label="Fecha de nacimiento" type="date" />
          <Field name="vencimiento_carnet" label="Vencimiento del carnet" type="date" />
          <Field
            name="vencimiento_ficha_medica"
            label="Vencimiento de ficha médica"
            type="date"
          />
          <label className="flex items-center gap-3 text-sm sm:col-span-2">
            <input type="checkbox" name="en_plantel_corriente" className="h-4 w-4" />
            Pertenece al plantel del año corriente
          </label>
          <button
            type="submit"
            className="border border-white bg-white px-4 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-bordo sm:col-span-2"
          >
            Guardar jugador
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-[0.65rem] uppercase tracking-[0.16em] text-white/60">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border border-white/30 bg-transparent px-3 py-3 text-sm text-white outline-none focus:border-white"
      />
    </label>
  );
}
