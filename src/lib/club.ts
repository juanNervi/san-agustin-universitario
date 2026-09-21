export const club = {
  name: "San Agustín Universitario",
  shortName: "San Agustín Universitario",
  foundedOn: "1º de marzo de 1991",
  foundedPlace: "Plaza Suiza",
  origin: "Club de exalumnos del Colegio Santa Rita",
  neighborhood: "Punta Gorda, Montevideo",
  venue: "Campo de Deportes Santa Rita",
  league: "Liga Universitaria de Deportes",
  country: "Uruguay",
  instagram: "https://www.instagram.com/sauoficial/",
  instagramHandle: "@sauoficial",
  shirtColor: "Bordó",
  letterColor: "Blanco",
} as const;

export const footballCategories = [
  {
    slug: "mayores",
    name: "Mayores",
    season: "Divisional E · 2026",
    note: "Primera del club en la Copa Pilsen de la Liga.",
  },
  {
    slug: "reserva",
    name: "Reserva",
    season: "Divisional D · Serie 2",
    note: "El puente entre juveniles y Mayores.",
  },
  {
    slug: "sub-20",
    name: "Sub 20",
    season: "Liga Universitaria",
    note: "Formación y competencia universitaria.",
  },
  {
    slug: "sub-18",
    name: "Sub 18",
    season: "Liga Universitaria",
    note: "La cantera que juega en Santa Rita.",
  },
] as const;

export const hockey = {
  slug: "hockey-femenino",
  name: "Hockey femenino",
  season: "Divisional B · Serie B · 2026",
  note: "Misma camiseta, misma institución, otra cancha.",
} as const;

export const disciplines = [
  {
    slug: "futbol",
    name: "Fútbol",
    summary:
      "El corazón del club desde 1991. Hoy competimos en Mayores, Reserva, Sub 20 y Sub 18.",
  },
  {
    slug: "hockey",
    name: "Hockey",
    summary:
      "El hockey femenino representa a San Agustín en la Divisional B de la Liga Universitaria.",
  },
] as const;

export type CategorySlug =
  | (typeof footballCategories)[number]["slug"]
  | typeof hockey.slug;
