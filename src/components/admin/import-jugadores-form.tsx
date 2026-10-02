"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import * as XLSX from "xlsx";
import { importJugadoresAction } from "@/app/admin/actions";
import { parseJugadoresImport } from "@/lib/import-jugadores";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="border border-white bg-white px-4 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-bordo disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending ? "Importando…" : "Importar jugadores"}
    </button>
  );
}

function excelFileToTsv(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
    raw: false,
  });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  // Fechas salen con el formato visible del Excel (DD/MM/YYYY).
  return XLSX.utils.sheet_to_csv(firstSheet, {
    FS: "\t",
    RS: "\n",
    blankrows: false,
  });
}

function isExcelFile(file: File) {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".xlsx") ||
    name.endsWith(".xls") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel"
  );
}

export function ImportJugadoresForm() {
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const preview = csv.trim() ? parseJugadoresImport(csv) : null;

  async function onFileChange(file: File | null) {
    setFileError(null);
    if (!file) {
      setFileName(null);
      return;
    }

    setFileName(file.name);

    try {
      if (isExcelFile(file)) {
        const buffer = await file.arrayBuffer();
        setCsv(excelFileToTsv(buffer));
        return;
      }

      setCsv(await file.text());
    } catch {
      setFileError("No se pudo leer el archivo. Probá con .xlsx o .csv.");
      setCsv("");
    }
  }

  return (
    <section className="mt-14 border border-white/20 p-6">
      <h2 className="font-display text-2xl tracking-[0.1em]">
        Carga masiva
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-white/70">
        Subí el Excel de la Liga (`.xlsx`) o un CSV. Reconoce columnas como{" "}
        <span className="text-white/90">F. Últ. Ex/Rec</span> y{" "}
        <span className="text-white/90">F. Venc. F._M</span>. Se actualiza por
        cédula.
      </p>

      <form action={importJugadoresAction} className="mt-6 space-y-4">
        <label className="block text-[0.65rem] uppercase tracking-[0.16em] text-white/60">
          Archivo Excel / CSV
          <input
            type="file"
            accept=".xlsx,.xls,.csv,.tsv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/tab-separated-values"
            className="mt-2 block w-full text-sm text-white file:mr-4 file:border file:border-white/40 file:bg-transparent file:px-3 file:py-2 file:text-[0.65rem] file:uppercase file:tracking-[0.16em] file:text-white hover:file:bg-white hover:file:text-bordo"
            onChange={(event) => {
              void onFileChange(event.target.files?.[0] ?? null);
            }}
          />
          {fileName ? (
            <span className="mt-2 block normal-case tracking-normal text-white/50">
              {fileName}
            </span>
          ) : null}
        </label>

        {fileError ? (
          <p className="border border-white/40 px-3 py-2 text-sm">{fileError}</p>
        ) : null}

        <label className="block text-[0.65rem] uppercase tracking-[0.16em] text-white/60">
          O pegá el contenido
          <textarea
            name="csv"
            value={csv}
            onChange={(event) => {
              setCsv(event.target.value);
              setFileName(null);
              setFileError(null);
            }}
            rows={8}
            placeholder={
              "Carné\tDocumento\tApellidos/No\t...\tF. Últ. Ex/Rec\tF. Venc. F._M\tF. Venc. Carr"
            }
            className="mt-2 w-full border border-white/30 bg-transparent px-3 py-3 font-mono text-xs text-white outline-none focus:border-white"
            required
          />
        </label>

        {preview ? (
          <div className="border border-white/15 px-4 py-3 text-sm text-white/75">
            <p>
              {preview.rows.length} jugador
              {preview.rows.length === 1 ? "" : "es"} listo
              {preview.rows.length === 1 ? "" : "s"} para importar
              {preview.errors.length
                ? ` · ${preview.errors.length} advertencia${preview.errors.length === 1 ? "" : "s"}`
                : ""}
            </p>
            {preview.rows[0] ? (
              <p className="mt-2 text-xs text-white/55">
                Ejemplo: {preview.rows[0].nombre} · último examen{" "}
                {preview.rows[0].fecha_ultimo_examen ?? "—"} · ficha médica{" "}
                {preview.rows[0].vencimiento_ficha_medica ?? "—"}
              </p>
            ) : null}
            {preview.errors.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-white/55">
                {preview.errors.slice(0, 5).map((error) => (
                  <li key={error}>{error}</li>
                ))}
                {preview.errors.length > 5 ? (
                  <li>…y {preview.errors.length - 5} más</li>
                ) : null}
              </ul>
            ) : null}
          </div>
        ) : null}

        <SubmitButton disabled={!preview?.rows.length} />
      </form>
    </section>
  );
}
