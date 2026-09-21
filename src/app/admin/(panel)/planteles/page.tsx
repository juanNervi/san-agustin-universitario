import Link from "next/link";
import { createPlantelAction } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { categoriasPlantel, type Plantel } from "@/lib/types";

export default async function PlantelesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("planteles")
    .select("*")
    .order("anio", { ascending: false })
    .order("nombre");
  const planteles = (data ?? []) as Plantel[];

  return (
    <div>
      <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/60">
        Histórico
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-[0.08em]">Planteles</h1>
      <p className="mt-3 text-sm text-white/70">
        Entrá a un plantel para ver todos sus jugadores.
      </p>

      {error ? (
        <p className="mt-6 border border-white/40 px-3 py-2 text-sm">{error}</p>
      ) : null}

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {planteles.map((plantel) => (
          <li key={plantel.id}>
            <Link
              href={`/admin/planteles/${plantel.id}`}
              className="block border border-white/25 p-5 hover:border-white"
            >
              <p className="font-display text-2xl tracking-[0.08em]">
                {plantel.nombre}
              </p>
              <p className="mt-2 text-[0.65rem] uppercase tracking-[0.16em] text-white/55">
                {plantel.categoria} · {plantel.anio}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-14 border border-white/20 p-6">
        <h2 className="font-display text-2xl tracking-[0.1em]">Nuevo plantel</h2>
        <form action={createPlantelAction} className="mt-6 grid gap-4 sm:grid-cols-3">
          <label className="block text-[0.65rem] uppercase tracking-[0.16em] text-white/60 sm:col-span-3">
            Nombre
            <input
              name="nombre"
              required
              placeholder="Mayores 2026"
              className="mt-2 w-full border border-white/30 bg-transparent px-3 py-3 text-sm outline-none focus:border-white"
            />
          </label>
          <label className="block text-[0.65rem] uppercase tracking-[0.16em] text-white/60">
            Categoría
            <select
              name="categoria"
              required
              className="mt-2 w-full border border-white/30 bg-bordo px-3 py-3 text-sm outline-none"
            >
              {categoriasPlantel.map((categoria) => (
                <option key={categoria.slug} value={categoria.slug}>
                  {categoria.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[0.65rem] uppercase tracking-[0.16em] text-white/60">
            Año
            <input
              name="anio"
              type="number"
              required
              defaultValue={new Date().getFullYear()}
              className="mt-2 w-full border border-white/30 bg-transparent px-3 py-3 text-sm outline-none focus:border-white"
            />
          </label>
          <button
            type="submit"
            className="self-end border border-white bg-white px-4 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-bordo"
          >
            Crear plantel
          </button>
        </form>
      </section>
    </div>
  );
}
