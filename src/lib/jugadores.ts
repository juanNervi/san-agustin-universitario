import type { Jugador } from "@/lib/types";

export type JugadorConPlanteles = Jugador & {
  planteles: Array<{ id: string; nombre: string }>;
};

export type JugadorQueryRow = Jugador & {
  plantel_jugadores?: Array<{
    planteles: { id: string; nombre: string } | null;
  }> | null;
};

export function mapJugadorConPlanteles(row: JugadorQueryRow): JugadorConPlanteles {
  const { plantel_jugadores, ...jugador } = row;
  const planteles = (plantel_jugadores ?? [])
    .map((link) => link.planteles)
    .filter((plantel): plantel is { id: string; nombre: string } => !!plantel)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return { ...jugador, planteles };
}
