"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function emptyToNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function upsertJugadorAction(formData: FormData) {
  const supabase = await createClient();
  const id = emptyToNull(formData.get("id"));
  const payload = {
    nombre: String(formData.get("nombre") ?? "").trim(),
    cedula: String(formData.get("cedula") ?? "").trim(),
    numero_liga: emptyToNull(formData.get("numero_liga")),
    fecha_nacimiento: emptyToNull(formData.get("fecha_nacimiento")),
    email: emptyToNull(formData.get("email")),
    vencimiento_carnet: emptyToNull(formData.get("vencimiento_carnet")),
    vencimiento_ficha_medica: emptyToNull(formData.get("vencimiento_ficha_medica")),
    en_plantel_corriente: formData.get("en_plantel_corriente") === "on",
  };

  if (!payload.nombre || !payload.cedula) {
    redirect("/admin/jugadores?error=Nombre%20y%20c%C3%A9dula%20son%20obligatorios.");
  }

  const query = id
    ? supabase.from("jugadores").update(payload).eq("id", id)
    : supabase.from("jugadores").insert(payload);

  const { error } = await query;
  if (error) {
    redirect(`/admin/jugadores?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/jugadores");
  revalidatePath("/admin");
  redirect("/admin/jugadores");
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
