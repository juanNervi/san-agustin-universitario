export function formatDate(value: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export type VencimientoEstado = "ok" | "proximo" | "vencido" | "sin-dato";

export function estadoVencimiento(value: string | null): VencimientoEstado {
  if (!value) return "sin-dato";
  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  if (diff < 0) return "vencido";
  if (diff <= 30) return "proximo";
  return "ok";
}

export function etiquetaVencimiento(estado: VencimientoEstado) {
  if (estado === "vencido") return "Vencido";
  if (estado === "proximo") return "Por vencer";
  if (estado === "ok") return "Al día";
  return "Sin dato";
}
