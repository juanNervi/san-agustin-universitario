import { upsertJugadorAction } from "@/app/admin/actions";
import type { Jugador } from "@/lib/types";

type PlantelOption = { id: string; nombre: string };

export function JugadorForm({
  jugador,
  planteles,
  plantelActualId = "",
  returnTo,
  submitLabel = "Guardar jugador",
}: {
  jugador?: Jugador;
  planteles: PlantelOption[];
  plantelActualId?: string;
  returnTo?: string;
  submitLabel?: string;
}) {
  return (
    <form action={upsertJugadorAction} className="mt-6 grid gap-4 sm:grid-cols-2">
      {jugador ? <input type="hidden" name="id" value={jugador.id} /> : null}
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      <Field name="nombre" label="Nombre" required defaultValue={jugador?.nombre} />
      <Field name="cedula" label="Cédula" required defaultValue={jugador?.cedula} />
      <Field
        name="numero_liga"
        label="Número de jugador en la Liga"
        defaultValue={jugador?.numero_liga ?? ""}
      />
      <Field
        name="email"
        label="Mail"
        type="email"
        defaultValue={jugador?.email ?? ""}
      />
      <Field
        name="fecha_nacimiento"
        label="Fecha de nacimiento"
        type="date"
        defaultValue={jugador?.fecha_nacimiento ?? ""}
      />
      <Field
        name="fecha_ultimo_examen"
        label="Último examen / reconocimiento"
        type="date"
        defaultValue={jugador?.fecha_ultimo_examen ?? ""}
      />
      <Field
        name="vencimiento_ficha_medica"
        label="Vencimiento de ficha médica"
        type="date"
        defaultValue={jugador?.vencimiento_ficha_medica ?? ""}
      />
      <Field
        name="vencimiento_carnet"
        label="Vencimiento del carnet"
        type="date"
        defaultValue={jugador?.vencimiento_carnet ?? ""}
      />
      <label className="block text-[0.65rem] uppercase tracking-[0.16em] text-white/60 sm:col-span-2">
        Plantel
        <select
          name="plantel_id"
          defaultValue={plantelActualId}
          className="mt-2 w-full border border-white/30 bg-bordo px-3 py-3 text-sm text-white outline-none focus:border-white"
        >
          <option value="">
            {jugador ? "Sin cambiar plantel" : "Sin plantel"}
          </option>
          {planteles.map((plantel) => (
            <option key={plantel.id} value={plantel.id}>
              {plantel.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-3 text-sm sm:col-span-2">
        <input
          type="checkbox"
          name="recibido"
          className="h-4 w-4"
          defaultChecked={jugador?.recibido ?? false}
        />
        Recibido (requisito de estudio cumplido / notificado a la liga)
      </label>
      <button
        type="submit"
        className="border border-white bg-white px-4 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-bordo sm:col-span-2"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block text-[0.65rem] uppercase tracking-[0.16em] text-white/60">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-2 w-full border border-white/30 bg-transparent px-3 py-3 text-sm text-white outline-none focus:border-white"
      />
    </label>
  );
}
