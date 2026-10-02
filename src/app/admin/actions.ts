"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseJugadoresImport } from "@/lib/import-jugadores";
import { createClient } from "@/lib/supabase/server";

function emptyToNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

function redirectJugadores(params: Record<string, string>) {
  const query = new URLSearchParams(params);
  redirect(`/admin/jugadores?${query.toString()}`);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function upsertJugadorAction(formData: FormData) {
  const supabase = await createClient();
  const id = emptyToNull(formData.get("id"));
  const plantelId = emptyToNull(formData.get("plantel_id"));
  const payload: Record<string, string | boolean | null> = {
    nombre: String(formData.get("nombre") ?? "").trim(),
    cedula: String(formData.get("cedula") ?? "").trim(),
    numero_liga: emptyToNull(formData.get("numero_liga")),
    fecha_nacimiento: emptyToNull(formData.get("fecha_nacimiento")),
    email: emptyToNull(formData.get("email")),
    fecha_ultimo_examen: emptyToNull(formData.get("fecha_ultimo_examen")),
    vencimiento_carnet: emptyToNull(formData.get("vencimiento_carnet")),
    vencimiento_ficha_medica: emptyToNull(formData.get("vencimiento_ficha_medica")),
    recibido: formData.get("recibido") === "on",
  };

  if (!payload.nombre || !payload.cedula) {
    redirectJugadores({ error: "Nombre y cédula son obligatorios." });
  }

  if (id) {
    const { error } = await supabase.from("jugadores").update(payload).eq("id", id);
    if (error) {
      redirectJugadores({ error: error.message });
    }

    if (plantelId) {
      const { error: linkError } = await supabase.from("plantel_jugadores").upsert(
        { plantel_id: plantelId, jugador_id: id },
        { onConflict: "plantel_id,jugador_id" },
      );
      if (linkError) {
        redirectJugadores({ error: linkError.message });
      }
    }

    revalidatePath(`/admin/jugadores/${id}`);
  } else {
    const { data, error } = await supabase
      .from("jugadores")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) {
      redirectJugadores({ error: error?.message ?? "No se pudo crear el jugador." });
    }

    const jugadorId = data!.id;

    if (plantelId) {
      const { error: linkError } = await supabase.from("plantel_jugadores").insert({
        plantel_id: plantelId,
        jugador_id: jugadorId,
      });
      if (linkError) {
        redirectJugadores({ error: linkError.message });
      }
    }
  }

  revalidatePath("/admin/jugadores");
  revalidatePath("/admin/planteles");
  revalidatePath("/admin");

  const returnTo = emptyToNull(formData.get("returnTo"));
  if (returnTo?.startsWith("/admin/jugadores")) {
    redirect(returnTo);
  }
  redirect("/admin/jugadores");
}

export async function importJugadoresAction(formData: FormData) {
  const raw = String(formData.get("csv") ?? "");
  const { rows, errors: parseErrors } = parseJugadoresImport(raw);

  if (!rows.length) {
    redirectJugadores({
      error: parseErrors[0] ?? "No se pudo importar ningún jugador.",
    });
  }

  const supabase = await createClient();
  const cedulas = rows.map((row) => row.cedula);
  const { data: existing, error: existingError } = await supabase
    .from("jugadores")
    .select("cedula")
    .in("cedula", cedulas);

  if (existingError) {
    redirectJugadores({ error: existingError.message });
  }

  const existingSet = new Set((existing ?? []).map((row) => row.cedula));
  const created = rows.filter((row) => !existingSet.has(row.cedula)).length;
  const updated = rows.length - created;

  const { error } = await supabase.from("jugadores").upsert(rows, {
    onConflict: "cedula",
  });

  if (error) {
    redirectJugadores({ error: error.message });
  }

  revalidatePath("/admin/jugadores");
  revalidatePath("/admin");

  const params: Record<string, string> = {
    imported: String(rows.length),
    created: String(created),
    updated: String(updated),
  };
  if (parseErrors.length) {
    params.warnings = String(parseErrors.length);
  }
  redirectJugadores(params);
}

export async function createPlantelAction(formData: FormData) {
  const supabase = await createClient();
  const payload = {
    nombre: String(formData.get("nombre") ?? "").trim(),
    categoria: String(formData.get("categoria") ?? "").trim(),
    anio: Number(formData.get("anio")),
  };

  if (!payload.nombre || !payload.categoria || !payload.anio) {
    redirect("/admin/planteles?error=Complet%C3%A1%20nombre,%20categor%C3%ADa%20y%20a%C3%B1o.");
  }

  const { error } = await supabase.from("planteles").insert(payload);
  if (error) {
    redirect(`/admin/planteles?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/planteles");
  revalidatePath("/admin");
  redirect("/admin/planteles");
}

export async function addJugadorToPlantelAction(formData: FormData) {
  const supabase = await createClient();
  const plantelId = String(formData.get("plantel_id") ?? "");
  const jugadorId = String(formData.get("jugador_id") ?? "");

  const { error } = await supabase.from("plantel_jugadores").insert({
    plantel_id: plantelId,
    jugador_id: jugadorId,
  });

  if (error) {
    redirect(
      `/admin/planteles/${plantelId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/admin/planteles/${plantelId}`);
  revalidatePath("/admin/planteles");
  redirect(`/admin/planteles/${plantelId}`);
}

export async function removeJugadorFromPlantelAction(formData: FormData) {
  const supabase = await createClient();
  const plantelId = String(formData.get("plantel_id") ?? "");
  const jugadorId = String(formData.get("jugador_id") ?? "");

  await supabase
    .from("plantel_jugadores")
    .delete()
    .eq("plantel_id", plantelId)
    .eq("jugador_id", jugadorId);

  revalidatePath(`/admin/planteles/${plantelId}`);
  revalidatePath("/admin/planteles");
  redirect(`/admin/planteles/${plantelId}`);
}
