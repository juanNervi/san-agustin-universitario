export function formatDate(value: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export type VencimientoEstado =
  | "ok"
  | "proximo"
  | "vencido"
  | "sin-dato"
  | "recibido";

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

/**
 * Último examen: habilitado si la fecha es >= 31/10 del (año actual - 2).
 * Si el jugador está recibido, el requisito de estudio ya está cumplido.
 */
export function fechaCorteExamen(today = new Date()) {
  return new Date(today.getFullYear() - 2, 9, 31);
}

export function estadoUltimoExamen(
  value: string | null,
  recibido = false,
  today = new Date(),
): VencimientoEstado {
  if (recibido) return "recibido";
  if (!value) return "sin-dato";
  const fecha = new Date(`${value}T00:00:00`);
  const corte = fechaCorteExamen(today);
  corte.setHours(0, 0, 0, 0);
  if (fecha < corte) return "vencido";
  return "ok";
}

export function etiquetaVencimiento(estado: VencimientoEstado) {
  if (estado === "vencido") return "Vencido";
  if (estado === "proximo") return "Por vencer";
  if (estado === "ok") return "Al día";
  if (estado === "recibido") return "Recibido";
  return "Sin dato";
}
