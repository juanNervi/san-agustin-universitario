"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { removeJugadorFromPlantelAction } from "@/app/admin/actions";
import { VencimientoBadge } from "@/components/admin/vencimiento-badge";
import {
  estadoUltimoExamen,
  estadoVencimiento,
  type VencimientoEstado,
} from "@/lib/dates";
import type { JugadorConPlanteles } from "@/lib/jugadores";

type PageSize = 10 | 20;

type SortKey =
  | "nombre"
  | "cedula"
  | "numero_liga"
  | "fecha_ultimo_examen"
  | "vencimiento_ficha_medica"
  | "vencimiento_carnet"
  | "planteles";

type SortDir = "asc" | "desc";

type Filters = {
  nombre: string;
  cedula: string;
  numero_liga: string;
  examen: VencimientoEstado | "";
  ficha: VencimientoEstado | "";
  carnet: VencimientoEstado | "";
  plantel: string;
};

const emptyFilters: Filters = {
  nombre: "",
  cedula: "",
  numero_liga: "",
  examen: "",
  ficha: "",
  carnet: "",
  plantel: "",
};

const SORT_KEYS: SortKey[] = [
  "nombre",
  "cedula",
  "numero_liga",
  "fecha_ultimo_examen",
  "vencimiento_ficha_medica",
  "vencimiento_carnet",
  "planteles",
];

function parseFilters(params: URLSearchParams): Filters {
  return {
    nombre: params.get("fn") ?? "",
    cedula: params.get("fc") ?? "",
    numero_liga: params.get("fl") ?? "",
    examen: (params.get("fe") as Filters["examen"]) ?? "",
    ficha: (params.get("ff") as Filters["ficha"]) ?? "",
    carnet: (params.get("fk") as Filters["carnet"]) ?? "",
    plantel: params.get("fp") ?? "",
  };
}

function buildTableParams(input: {
  filters: Filters;
  sortKey: SortKey;
  sortDir: SortDir;
  page: number;
  pageSize: PageSize;
}) {
  const params = new URLSearchParams();
  if (input.filters.nombre) params.set("fn", input.filters.nombre);
  if (input.filters.cedula) params.set("fc", input.filters.cedula);
  if (input.filters.numero_liga) params.set("fl", input.filters.numero_liga);
  if (input.filters.examen) params.set("fe", input.filters.examen);
  if (input.filters.ficha) params.set("ff", input.filters.ficha);
  if (input.filters.carnet) params.set("fk", input.filters.carnet);
  if (input.filters.plantel) params.set("fp", input.filters.plantel);
  if (input.sortKey !== "nombre") params.set("sort", input.sortKey);
  if (input.sortDir !== "asc") params.set("dir", input.sortDir);
  if (input.page > 1) params.set("page", String(input.page));
  if (input.pageSize !== 20) params.set("size", String(input.pageSize));
  return params;
}

const vencimientoOptions: { value: "" | VencimientoEstado; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "ok", label: "Al día" },
  { value: "proximo", label: "Por vencer" },
  { value: "vencido", label: "Vencido" },
  { value: "sin-dato", label: "Sin dato" },
];

const examenOptions: { value: "" | VencimientoEstado; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "ok", label: "Al día" },
  { value: "recibido", label: "Recibido" },
  { value: "vencido", label: "Vencido" },
  { value: "sin-dato", label: "Sin dato" },
];

function includesText(value: string | null | undefined, filter: string) {
  if (!filter.trim()) return true;
  return String(value ?? "")
    .toLowerCase()
    .includes(filter.trim().toLowerCase());
}

function plantelesLabel(planteles: Array<{ nombre: string }>) {
  if (!planteles.length) return "";
  return planteles.map((plantel) => plantel.nombre).join(", ");
}

function compareNullable(
  a: string | number | boolean | null | undefined,
  b: string | number | boolean | null | undefined,
) {
  if (a == null && b == null) return 0;
  if (a == null || a === "") return 1;
  if (b == null || b === "") return -1;
  if (typeof a === "boolean" && typeof b === "boolean") {
    return Number(a) - Number(b);
  }
  return String(a).localeCompare(String(b), "es", { numeric: true });
}

export function JugadoresTable({
  jugadores,
  planteles,
  emptyMessage = "No hay jugadores cargados.",
  removeFromPlantelId,
}: {
  jugadores: JugadorConPlanteles[];
  planteles: Array<{ id: string; nombre: string }>;
  emptyMessage?: string;
  removeFromPlantelId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const persistInUrl = !removeFromPlantelId;

  const initialFromUrl = persistInUrl ? parseFilters(searchParams) : emptyFilters;
  const initialSort = SORT_KEYS.includes(searchParams.get("sort") as SortKey)
    ? (searchParams.get("sort") as SortKey)
    : "nombre";
  const initialDir = searchParams.get("dir") === "desc" ? "desc" : "asc";
  const initialPage = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const initialSize =
    searchParams.get("size") === "10" ? 10 : (20 as PageSize);

  const [filters, setFilters] = useState<Filters>(
    persistInUrl ? initialFromUrl : emptyFilters,
  );
  const [sortKey, setSortKey] = useState<SortKey>(
    persistInUrl ? initialSort : "nombre",
  );
  const [sortDir, setSortDir] = useState<SortDir>(
    persistInUrl ? initialDir : "asc",
  );
  const [page, setPage] = useState(persistInUrl ? initialPage : 1);
  const [pageSize, setPageSize] = useState<PageSize>(
    persistInUrl ? initialSize : 20,
  );
  const deferredFilters = useDeferredValue(filters);
  const showPlantelColumn = !removeFromPlantelId;
  const columnCount = 6 + (showPlantelColumn ? 1 : 0) + (removeFromPlantelId ? 1 : 0);

  const listQuery = useMemo(() => {
    if (!persistInUrl) return "";
    return buildTableParams({
      filters,
      sortKey,
      sortDir,
      page,
      pageSize,
    }).toString();
  }, [persistInUrl, filters, sortKey, sortDir, page, pageSize]);

  useEffect(() => {
    if (!persistInUrl) return;
    const next = listQuery ? `${pathname}?${listQuery}` : pathname;
    const current = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    if (next !== current) {
      router.replace(next, { scroll: false });
    }
  }, [persistInUrl, listQuery, pathname, router, searchParams]);

  const skipPageReset = useRef(true);
  useEffect(() => {
    if (skipPageReset.current) {
      skipPageReset.current = false;
      return;
    }
    setPage(1);
  }, [deferredFilters, sortKey, sortDir, pageSize]);

  const plantelFilterOptions = useMemo(
    () => [
      { value: "", label: "Todos" },
      { value: "__none__", label: "Sin plantel" },
      ...planteles.map((plantel) => ({
        value: plantel.id,
        label: plantel.nombre,
      })),
    ],
    [planteles],
  );

  const filtered = useMemo(() => {
    const rows = jugadores.filter((jugador) => {
      if (!includesText(jugador.nombre, deferredFilters.nombre)) return false;
      if (!includesText(jugador.cedula, deferredFilters.cedula)) return false;
      if (!includesText(jugador.numero_liga, deferredFilters.numero_liga)) {
        return false;
      }
      if (
        deferredFilters.examen &&
        estadoUltimoExamen(
          jugador.fecha_ultimo_examen,
          jugador.recibido ?? false,
        ) !== deferredFilters.examen
      ) {
        return false;
      }
      if (
        deferredFilters.ficha &&
        estadoVencimiento(jugador.vencimiento_ficha_medica) !==
          deferredFilters.ficha
      ) {
        return false;
      }
      if (
        deferredFilters.carnet &&
        estadoVencimiento(jugador.vencimiento_carnet) !== deferredFilters.carnet
      ) {
        return false;
      }
      if (deferredFilters.plantel === "__none__") {
        if (jugador.planteles.length > 0) return false;
      } else if (deferredFilters.plantel) {
        if (
          !jugador.planteles.some(
            (plantel) => plantel.id === deferredFilters.plantel,
          )
        ) {
          return false;
        }
      }
      return true;
    });

    rows.sort((a, b) => {
      const left =
        sortKey === "planteles" ? plantelesLabel(a.planteles) : a[sortKey];
      const right =
        sortKey === "planteles" ? plantelesLabel(b.planteles) : b[sortKey];
      const result = compareNullable(left, right);
      return sortDir === "asc" ? result : -result;
    });

    return rows;
  }, [jugadores, deferredFilters, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [deferredFilters, sortKey, sortDir, pageSize]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function editHref(jugadorId: string) {
    if (!persistInUrl || !listQuery) return `/admin/jugadores/${jugadorId}`;
    const returnTo = `/admin/jugadores?${listQuery}`;
    return `/admin/jugadores/${jugadorId}?returnTo=${encodeURIComponent(returnTo)}`;
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filtered.length);

  return (
    <div className="mt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-white/60">
        <p>
          {filtered.length} de {jugadores.length} jugador
          {jugadores.length === 1 ? "" : "es"}
          {filtered.length > 0
            ? ` · mostrando ${rangeStart}–${rangeEnd}`
            : ""}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.16em]">
            Por página
            <select
              value={pageSize}
              onChange={(event) =>
                setPageSize(Number(event.target.value) as PageSize)
              }
              className="border border-white/20 bg-transparent px-2 py-1.5 text-xs normal-case tracking-normal text-white outline-none focus:border-white"
            >
              <option value={10} className="bg-bordo text-white">
                10
              </option>
              <option value={20} className="bg-bordo text-white">
                20
              </option>
            </select>
          </label>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => setFilters(emptyFilters)}
              className="text-[0.65rem] uppercase tracking-[0.16em] text-white/70 hover:text-white"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto border border-white/20">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/20 text-[0.65rem] uppercase tracking-[0.16em] text-white/55">
            <tr>
              <SortHeader
                label="Nombre"
                active={sortKey === "nombre"}
                dir={sortDir}
                onClick={() => toggleSort("nombre")}
              />
              <SortHeader
                label="Cédula"
                active={sortKey === "cedula"}
                dir={sortDir}
                onClick={() => toggleSort("cedula")}
              />
              <SortHeader
                label="Nº liga"
                active={sortKey === "numero_liga"}
                dir={sortDir}
                onClick={() => toggleSort("numero_liga")}
              />
              <SortHeader
                label="Últ. examen"
                active={sortKey === "fecha_ultimo_examen"}
                dir={sortDir}
                onClick={() => toggleSort("fecha_ultimo_examen")}
              />
              <SortHeader
                label="Ficha médica"
                active={sortKey === "vencimiento_ficha_medica"}
                dir={sortDir}
                onClick={() => toggleSort("vencimiento_ficha_medica")}
              />
              <SortHeader
                label="Carnet"
                active={sortKey === "vencimiento_carnet"}
                dir={sortDir}
                onClick={() => toggleSort("vencimiento_carnet")}
              />
              {showPlantelColumn ? (
                <SortHeader
                  label="Plantel"
                  active={sortKey === "planteles"}
                  dir={sortDir}
                  onClick={() => toggleSort("planteles")}
                />
              ) : null}
              {removeFromPlantelId ? <th className="px-4 py-3" /> : null}
            </tr>
            <tr className="border-t border-white/10 normal-case tracking-normal">
              <th className="px-4 py-2 font-normal">
                <FilterInput
                  value={filters.nombre}
                  onChange={(value) => updateFilter("nombre", value)}
                  placeholder="Filtrar"
                />
              </th>
              <th className="px-4 py-2 font-normal">
                <FilterInput
                  value={filters.cedula}
                  onChange={(value) => updateFilter("cedula", value)}
                  placeholder="Filtrar"
                />
              </th>
              <th className="px-4 py-2 font-normal">
                <FilterInput
                  value={filters.numero_liga}
                  onChange={(value) => updateFilter("numero_liga", value)}
                  placeholder="Filtrar"
                />
              </th>
              <th className="px-4 py-2 font-normal">
                <FilterSelect
                  value={filters.examen}
                  onChange={(value) =>
                    updateFilter("examen", value as Filters["examen"])
                  }
                  options={examenOptions}
                />
              </th>
              <th className="px-4 py-2 font-normal">
                <FilterSelect
                  value={filters.ficha}
                  onChange={(value) =>
                    updateFilter("ficha", value as Filters["ficha"])
                  }
                  options={vencimientoOptions}
                />
              </th>
              <th className="px-4 py-2 font-normal">
                <FilterSelect
                  value={filters.carnet}
                  onChange={(value) =>
                    updateFilter("carnet", value as Filters["carnet"])
                  }
                  options={vencimientoOptions}
                />
              </th>
              {showPlantelColumn ? (
                <th className="px-4 py-2 font-normal">
                  <FilterSelect
                    value={filters.plantel}
                    onChange={(value) => updateFilter("plantel", value)}
                    options={plantelFilterOptions}
                  />
                </th>
              ) : null}
              {removeFromPlantelId ? <th className="px-4 py-2" /> : null}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-white/60" colSpan={columnCount}>
                  {jugadores.length === 0
                    ? emptyMessage
                    : "Ningún jugador coincide con los filtros."}
                </td>
              </tr>
            ) : (
              pageRows.map((jugador) => (
                <tr key={jugador.id} className="border-t border-white/10">
                  <td className="px-4 py-4">
                    <Link
                      href={editHref(jugador.id)}
                      className="hover:underline"
                    >
                      {jugador.nombre}
                    </Link>
                    {jugador.email ? (
                      <p className="text-xs text-white/50">{jugador.email}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">{jugador.cedula}</td>
                  <td className="px-4 py-4">{jugador.numero_liga ?? "—"}</td>
                  <td className="px-4 py-4">
                    <VencimientoBadge
                      value={jugador.fecha_ultimo_examen}
                      kind="ultimo-examen"
                      recibido={jugador.recibido ?? false}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <VencimientoBadge value={jugador.vencimiento_ficha_medica} />
                  </td>
                  <td className="px-4 py-4">
                    <VencimientoBadge value={jugador.vencimiento_carnet} />
                  </td>
                  {showPlantelColumn ? (
                    <td className="px-4 py-4">
                      {jugador.planteles.length
                        ? plantelesLabel(jugador.planteles)
                        : "—"}
                    </td>
                  ) : null}
                  {removeFromPlantelId ? (
                    <td className="px-4 py-4">
                      <form action={removeJugadorFromPlantelAction}>
                        <input
                          type="hidden"
                          name="plantel_id"
                          value={removeFromPlantelId}
                        />
                        <input
                          type="hidden"
                          name="jugador_id"
                          value={jugador.id}
                        />
                        <button
                          type="submit"
                          className="text-[0.65rem] uppercase tracking-[0.16em] text-white/60 hover:text-white"
                        >
                          Sacar
                        </button>
                      </form>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-white/60">
          <p className="text-[0.65rem] uppercase tracking-[0.16em]">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border border-white/30 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.16em] hover:border-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="border border-white/30 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.16em] hover:border-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-3">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 uppercase tracking-[0.16em] hover:text-white ${
          active ? "text-white" : "text-white/55"
        }`}
      >
        {label}
        <span className="text-[0.55rem]">{active ? (dir === "asc" ? "↑" : "↓") : "↕"}</span>
      </button>
    </th>
  );
}

function FilterInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full min-w-[6rem] border border-white/20 bg-transparent px-2 py-1.5 text-xs text-white outline-none placeholder:text-white/30 focus:border-white"
    />
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full min-w-[6.5rem] border border-white/20 bg-transparent px-2 py-1.5 text-xs text-white outline-none focus:border-white"
    >
      {options.map((option) => (
        <option
          key={option.value || "all"}
          value={option.value}
          className="bg-bordo text-white"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
