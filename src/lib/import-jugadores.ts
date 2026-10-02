export type JugadorImportRow = {
  nombre: string;
  cedula: string;
  numero_liga?: string | null;
  fecha_nacimiento?: string | null;
  sexo?: string | null;
  fecha_fichaje?: string | null;
  calidad?: string | null;
  instituto?: string | null;
  carrera?: string | null;
  fecha_ingreso?: string | null;
  fecha_ultimo_examen?: string | null;
  vencimiento_carnet?: string | null;
  vencimiento_ficha_medica?: string | null;
};

export type ImportParseResult = {
  rows: JugadorImportRow[];
  errors: string[];
};

type FieldKey = keyof JugadorImportRow;

const HEADER_ALIASES: Record<string, FieldKey | "skip"> = {
  carne: "numero_liga",
  carnet: "numero_liga",
  "numero liga": "numero_liga",
  "n liga": "numero_liga",
  documento: "cedula",
  cedula: "cedula",
  "apellidos no": "nombre",
  "apellidos nombres": "nombre",
  "apellidos nombre": "nombre",
  nombre: "nombre",
  sexo: "sexo",
  "f fichaje": "fecha_fichaje",
  "fecha fichaje": "fecha_fichaje",
  calidad: "calidad",
  instituto: "instituto",
  carrera: "carrera",
  edad: "skip",
  inact: "skip",
  inactivo: "skip",
  "f nacim": "fecha_nacimiento",
  "f nacimiento": "fecha_nacimiento",
  "fecha nacimiento": "fecha_nacimiento",
  "f ingreso": "fecha_ingreso",
  "fecha ingreso": "fecha_ingreso",
  "f ult ex rec": "fecha_ultimo_examen",
  "f ultimo ex rec": "fecha_ultimo_examen",
  "f ultimo examen": "fecha_ultimo_examen",
  "fecha ultimo examen": "fecha_ultimo_examen",
  "ult ex rec": "fecha_ultimo_examen",
  "ultimo examen": "fecha_ultimo_examen",
  // Encabezados exactos del Excel de la liga
  "f venc f m": "vencimiento_ficha_medica",
  "f venc f  m": "vencimiento_ficha_medica",
  "f venc fm": "vencimiento_ficha_medica",
  "f vencimiento f m": "vencimiento_ficha_medica",
  "f venc f med": "vencimiento_ficha_medica",
  "f vto f m": "vencimiento_ficha_medica",
  "f vto fm": "vencimiento_ficha_medica",
  "venc f m": "vencimiento_ficha_medica",
  "venc fm": "vencimiento_ficha_medica",
  "vto f m": "vencimiento_ficha_medica",
  "vencimiento ficha medica": "vencimiento_ficha_medica",
  "vencimiento f m": "vencimiento_ficha_medica",
  "ficha medica": "vencimiento_ficha_medica",
  "f venc carr": "vencimiento_carnet",
  "f venc carne": "vencimiento_carnet",
  "f venc carnet": "vencimiento_carnet",
  "vencimiento carnet": "vencimiento_carnet",
  "vencimiento carne": "vencimiento_carnet",
};

/** Orden típico del Excel de Liga Universitaria (columnas A…). */
const LIGA_COLUMN_ORDER: Array<FieldKey | "skip"> = [
  "numero_liga",
  "cedula",
  "nombre",
  "sexo",
  "fecha_fichaje",
  "calidad",
  "instituto",
  "carrera",
  "skip", // Edad
  "fecha_nacimiento",
  "fecha_ingreso",
  "fecha_ultimo_examen",
  "vencimiento_ficha_medica",
  "vencimiento_carnet",
  "skip", // Inact.
];

const DATE_FIELDS = new Set<FieldKey>([
  "fecha_nacimiento",
  "fecha_fichaje",
  "fecha_ingreso",
  "fecha_ultimo_examen",
  "vencimiento_carnet",
  "vencimiento_ficha_medica",
]);

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveHeader(header: string): FieldKey | "skip" | null {
  if (!header) return "skip";

  const exact = HEADER_ALIASES[header];
  if (exact) return exact;

  if (
    /\bult\b/.test(header) &&
    (/\bex\b/.test(header) || /\brec\b/.test(header) || header.includes("examen"))
  ) {
    return "fecha_ultimo_examen";
  }

  if (
    (header.includes("venc") || header.includes("vto")) &&
    (header.includes("ficha") ||
      header.includes("medica") ||
      header.includes("med") ||
      /\bf\s*m\b/.test(header) ||
      /\bfm\b/.test(header))
  ) {
    return "vencimiento_ficha_medica";
  }

  if (
    (header.includes("venc") || header.includes("vto")) &&
    (header.includes("carr") || header.includes("carnet") || header.includes("carne"))
  ) {
    return "vencimiento_carnet";
  }

  if (header.includes("fichaje")) return "fecha_fichaje";
  if (header.includes("nacim") || header.includes("nacimiento")) {
    return "fecha_nacimiento";
  }
  if (header.includes("ingreso")) return "fecha_ingreso";
  if (header === "fm" || header === "f m") return "vencimiento_ficha_medica";

  return null;
}

function detectDelimiter(headerLine: string) {
  if (headerLine.includes("\t")) return "\t";
  const commas = (headerLine.match(/,/g) ?? []).length;
  const semis = (headerLine.match(/;/g) ?? []).length;
  return semis > commas ? ";" : ",";
}

/** Parte el texto en filas respetando comillas (permite saltos de línea dentro de celdas). */
function splitRecords(text: string): string[] {
  const records: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
        current += char;
      }
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      if (current.trim().length) records.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim().length) records.push(current);
  return records;
}

function splitLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current.replace(/\s+/g, " ").trim());
      current = "";
      continue;
    }

    current += char === "\n" || char === "\r" ? " " : char;
  }

  cells.push(current.replace(/\s+/g, " ").trim());
  return cells;
}

/** Convierte DD/MM/YYYY (u otras variantes comunes) a YYYY-MM-DD. */
export function parseLigaDate(value: string | null | undefined): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const dmy = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (dmy) {
    const day = dmy[1].padStart(2, "0");
    const month = dmy[2].padStart(2, "0");
    let year = dmy[3];
    if (year.length === 2) {
      year = Number(year) > 50 ? `19${year}` : `20${year}`;
    }
    return `${year}-${month}-${day}`;
  }

  // Serial de Excel (días desde 1899-12-30).
  if (/^\d+(\.\d+)?$/.test(raw)) {
    const serial = Number(raw);
    if (serial > 20000 && serial < 80000) {
      const utc = Date.UTC(1899, 11, 30) + Math.floor(serial) * 86_400_000;
      const date = new Date(utc);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }

  return null;
}

function emptyToNull(value: string | null | undefined) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

export function parseJugadoresImport(raw: string): ImportParseResult {
  const text = raw.replace(/^\uFEFF/, "").trim();
  if (!text) {
    return { rows: [], errors: ["No hay datos para importar."] };
  }

  const lines = splitRecords(text);

  if (lines.length < 2) {
    return {
      rows: [],
      errors: ["Falta la fila de encabezados o no hay jugadores."],
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const rawHeaders = splitLine(lines[0], delimiter);
  const headers = rawHeaders.map(normalizeHeader);
  const fieldByIndex: Array<FieldKey | "skip" | null> = headers.map(resolveHeader);

  // Si parece el Excel de la liga y faltan columnas clave, completar por posición.
  const looksLikeLiga =
    fieldByIndex.includes("cedula") &&
    fieldByIndex.includes("nombre") &&
    rawHeaders.length >= 13;
  if (looksLikeLiga) {
    const mapped = new Set(
      fieldByIndex.filter((field): field is FieldKey => !!field && field !== "skip"),
    );
    LIGA_COLUMN_ORDER.forEach((field, index) => {
      if (index >= fieldByIndex.length) return;
      if (field === "skip") {
        if (fieldByIndex[index] == null) fieldByIndex[index] = "skip";
        return;
      }
      if (mapped.has(field)) return;
      if (fieldByIndex[index] == null || fieldByIndex[index] === "skip") {
        fieldByIndex[index] = field;
        mapped.add(field);
      }
    });
  }

  if (!fieldByIndex.includes("cedula") || !fieldByIndex.includes("nombre")) {
    return {
      rows: [],
      errors: [
        "No se reconocieron las columnas Documento/Cédula y Apellidos/Nombre. Revisá el encabezado del archivo.",
      ],
    };
  }

  const rows: JugadorImportRow[] = [];
  const errors: string[] = [];
  const seenCedulas = new Map<string, number>();

  const unrecognized = rawHeaders.filter((_, index) => {
    const field = fieldByIndex[index];
    return field == null && headers[index].length > 0;
  });
  if (unrecognized.length) {
    errors.push(
      `Columnas sin mapear (se ignoran): ${unrecognized.join(", ")}.`,
    );
  }

  for (const field of [
    "fecha_ultimo_examen",
    "vencimiento_ficha_medica",
  ] as FieldKey[]) {
    if (!fieldByIndex.includes(field)) {
      errors.push(`No se encontró la columna para ${field} en el encabezado.`);
    }
  }

  const mappedFields = new Set(
    fieldByIndex.filter((field): field is FieldKey => !!field && field !== "skip"),
  );

  for (let i = 1; i < lines.length; i += 1) {
    const lineNumber = i + 1;
    const cells = splitLine(lines[i], delimiter);
    const draft: Partial<Record<FieldKey, string | null>> = {};

    fieldByIndex.forEach((field, index) => {
      if (!field || field === "skip") return;
      const cell = cells[index] ?? "";
      if (DATE_FIELDS.has(field)) {
        const parsed = parseLigaDate(cell);
        if (cell.trim() && !parsed) {
          errors.push(`Fila ${lineNumber}: fecha inválida en ${field} (${cell}).`);
          return;
        }
        draft[field] = parsed;
        return;
      }
      draft[field] = emptyToNull(cell);
    });

    const nombre = String(draft.nombre ?? "").trim();
    const cedula = String(draft.cedula ?? "").trim();

    if (!nombre && !cedula) continue;

    if (!nombre || !cedula) {
      errors.push(`Fila ${lineNumber}: nombre y cédula son obligatorios.`);
      continue;
    }

    const payload: JugadorImportRow = { nombre, cedula };
    for (const field of mappedFields) {
      if (field === "nombre" || field === "cedula") continue;
      payload[field] = draft[field] ?? null;
    }

    const previousIndex = seenCedulas.get(cedula);
    if (previousIndex !== undefined) {
      rows[previousIndex] = payload;
      errors.push(
        `Fila ${lineNumber}: cédula duplicada en el archivo; se usa la última aparición.`,
      );
    } else {
      seenCedulas.set(cedula, rows.length);
      rows.push(payload);
    }
  }

  if (!rows.length && !errors.length) {
    errors.push("No se encontró ninguna fila válida.");
  }

  return { rows, errors };
}
