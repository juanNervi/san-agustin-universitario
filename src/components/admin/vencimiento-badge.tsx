import {
  etiquetaVencimiento,
  estadoUltimoExamen,
  estadoVencimiento,
  formatDate,
  type VencimientoEstado,
} from "@/lib/dates";

export function VencimientoBadge({
  value,
  kind = "vencimiento",
  recibido = false,
}: {
  value: string | null;
  kind?: "vencimiento" | "ultimo-examen";
  recibido?: boolean;
}) {
  const estado: VencimientoEstado =
    kind === "ultimo-examen"
      ? estadoUltimoExamen(value, recibido)
      : estadoVencimiento(value);
  const tone =
    estado === "vencido"
      ? "border-white bg-white text-bordo"
      : estado === "proximo"
        ? "border-white text-white"
        : estado === "recibido"
          ? "border-white text-white"
          : "border-white/25 text-white/70";

  return (
    <span className="flex flex-col items-start gap-1">
      <span className="text-sm">{formatDate(value)}</span>
      <span
        className={`border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] ${tone}`}
      >
        {etiquetaVencimiento(estado)}
      </span>
    </span>
  );
}
