import {
  etiquetaVencimiento,
  estadoVencimiento,
  formatDate,
} from "@/lib/dates";

export function VencimientoBadge({ value }: { value: string | null }) {
  const estado = estadoVencimiento(value);
  const tone =
    estado === "vencido"
      ? "border-white bg-white text-bordo"
      : estado === "proximo"
        ? "border-white text-white"
        : "border-white/25 text-white/70";

  return (
    <span className="block">
      <span className="text-sm">{formatDate(value)}</span>
      <span
        className={`mt-1 inline-block border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] ${tone}`}
      >
        {etiquetaVencimiento(estado)}
      </span>
    </span>
  );
}
