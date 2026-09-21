export type UserRole = "delegado" | "jugador";

export type Profile = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
};

export type Plantel = {
  id: string;
  nombre: string;
  categoria: string;
  anio: number;
  created_at: string;
};

export type Jugador = {
  id: string;
  nombre: string;
  cedula: string;
  numero_liga: string | null;
  fecha_nacimiento: string | null;
  email: string | null;
  vencimiento_carnet: string | null;
  vencimiento_ficha_medica: string | null;
  en_plantel_corriente: boolean;
  created_at: string;
};

export const categoriasPlantel = [
  { slug: "mayores", name: "Mayores" },
  { slug: "reserva", name: "Reserva" },
  { slug: "sub-20", name: "Sub 20" },
  { slug: "sub-18", name: "Sub 18" },
  { slug: "hockey-femenino", name: "Hockey femenino" },
] as const;
