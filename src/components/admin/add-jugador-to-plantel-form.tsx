"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { addJugadorToPlantelAction } from "@/app/admin/actions";

type OpcionJugador = {
  id: string;
  nombre: string;
  cedula: string;
};

export function AddJugadorToPlantelForm({
  plantelId,
  disponibles,
}: {
  plantelId: string;
  disponibles: OpcionJugador[];
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [open, setOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const matches = useMemo(() => {
    const term = deferredQuery.trim().toLowerCase();
    if (!term) return disponibles.slice(0, 20);
    return disponibles
      .filter(
        (jugador) =>
          jugador.nombre.toLowerCase().includes(term) ||
          jugador.cedula.toLowerCase().includes(term),
      )
      .slice(0, 20);
  }, [disponibles, deferredQuery]);

  function choose(jugador: OpcionJugador) {
    setSelectedId(jugador.id);
    setQuery(`${jugador.nombre} · ${jugador.cedula}`);
    setOpen(false);
  }

  return (
    <form action={addJugadorToPlantelAction} className="mt-6 flex flex-col gap-4 sm:flex-row">
      <input type="hidden" name="plantel_id" value={plantelId} />
      <input type="hidden" name="jugador_id" value={selectedId} />

      <div className="relative flex-1">
        <label className="sr-only" htmlFor="buscar-jugador">
          Buscar jugador
        </label>
        <input
          id="buscar-jugador"
          type="text"
          value={query}
          autoComplete="off"
          placeholder="Buscá por nombre o cédula…"
          className="w-full border border-white/30 bg-transparent px-3 py-3 text-sm text-white outline-none focus:border-white"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedId("");
            setOpen(true);
          }}
          onBlur={() => {
            // Delay so option click registers.
            window.setTimeout(() => setOpen(false), 150);
          }}
        />

        {open ? (
          <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto border border-white/30 bg-bordo">
            {matches.length === 0 ? (
              <li className="px-3 py-3 text-sm text-white/55">
                No hay coincidencias.
              </li>
            ) : (
              matches.map((jugador) => (
                <li key={jugador.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2.5 text-left text-sm hover:bg-white/10"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(jugador)}
                  >
                    {jugador.nombre}
                    <span className="ml-2 text-white/50">{jugador.cedula}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={!selectedId}
        className="border border-white bg-white px-4 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-bordo disabled:cursor-not-allowed disabled:opacity-40"
      >
        Agregar
      </button>
    </form>
  );
}
